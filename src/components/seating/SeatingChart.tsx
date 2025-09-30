import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Users, MapPin, Plus, ZoomOut } from "lucide-react";
import { TableComponent } from "./Table";
import { GuestForm } from "./GuestForm";
import { TableCreator } from "./TableCreator";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export interface Guest {
  firstName: string;
  lastName: string;
  entree: string;
  hasAllergy: boolean;
  allergyDetails?: string;
}

export interface TableData {
  id: string;
  number: number;
  type: "round" | "rectangle";
  seats: number;
  x: number;
  y: number;
  guests: { [seatNumber: number]: Guest };
  description?: string;
}

const SeatingChart = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<{
    tableId: string;
    seatNumber: number;
  } | null>(null);
  const [showTableCreator, setShowTableCreator] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [expectedGuestCount, setExpectedGuestCount] = useState(0);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nextTableNumber, setNextTableNumber] = useState(1);

  const addTable = useCallback((type: "round" | "rectangle", seats: number) => {
    const newTable: TableData = {
      id: `table-${Date.now()}`,
      number: nextTableNumber,
      type,
      seats,
      x: 200 + (tables.length * 50),
      y: 200 + (tables.length * 50),
      guests: {},
    };
    setTables(prev => [...prev, newTable]);
    setNextTableNumber(prev => prev + 1);
    setShowTableCreator(false);
    toast.success(`Table ${nextTableNumber} added`);
  }, [nextTableNumber, tables.length]);

  const updateTablePosition = useCallback((tableId: string, x: number, y: number) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, x, y } : table
    ));
  }, []);

  const updateGuest = useCallback((guest: Guest) => {
    if (!selectedSeat) return;
    
    setTables(prev => prev.map(table => {
      if (table.id === selectedSeat.tableId) {
        return {
          ...table,
          guests: {
            ...table.guests,
            [selectedSeat.seatNumber]: guest,
          },
        };
      }
      return table;
    }));
    setSelectedSeat(null);
    toast.success("Guest assigned to seat");
  }, [selectedSeat]);

  const removeGuest = useCallback(() => {
    if (!selectedSeat) return;
    
    setTables(prev => prev.map(table => {
      if (table.id === selectedSeat.tableId) {
        const newGuests = { ...table.guests };
        delete newGuests[selectedSeat.seatNumber];
        return { ...table, guests: newGuests };
      }
      return table;
    }));
    setSelectedSeat(null);
    toast.success("Guest removed from seat");
  }, [selectedSeat]);

  const updateTableNumber = useCallback((tableId: string, newNumber: number) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, number: newNumber } : table
    ));
    setEditingTableId(null);
    toast.success("Table number updated");
  }, []);

  const handleZoomOut = () => {
    setCanvasScale(Math.max(0.5, canvasScale - 0.1));
  };

  const exportToPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement('a');
      link.download = 'seating-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success("Seating chart exported as PNG");
    } catch (error) {
      console.error('Error exporting PNG:', error);
      toast.error("Failed to export PNG");
    }
  }, []);

  const exportToCSV = useCallback(() => {
    const csvData = [];
    csvData.push(['Table Number', 'Seat Number', 'First Name', 'Last Name', 'Entree', 'Allergy Info']);
    
    tables.forEach(table => {
      for (let seatNum = 1; seatNum <= table.seats; seatNum++) {
        const guest = table.guests[seatNum];
        if (guest) {
          csvData.push([
            table.number.toString(),
            seatNum.toString(),
            guest.firstName,
            guest.lastName,
            guest.entree,
            guest.hasAllergy ? guest.allergyDetails || 'Yes' : 'No'
          ]);
        }
      }
    });
    
    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-list.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Guest list exported as CSV");
  }, [tables]);

  // Calculate guest statistics
  const totalSeats = tables.reduce((sum, table) => sum + table.seats, 0);
  const guestsPlaced = tables.reduce((sum, table) => 
    sum + Object.keys(table.guests).length, 0
  );
  const seatsRemaining = totalSeats - guestsPlaced;

  const selectedTable = selectedSeat ? tables.find(t => t.id === selectedSeat.tableId) : null;
  const selectedGuest = selectedTable?.guests[selectedSeat?.seatNumber || 0];

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Wedding Seating Chart
            </h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={exportToPNG} className="gap-2">
                <Download className="h-4 w-4" />
                Export PNG
              </Button>
              <Button variant="outline" onClick={exportToCSV} className="gap-2">
                <FileText className="h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handleZoomOut} className="gap-2">
                <ZoomOut className="h-4 w-4" />
                Zoom Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="font-medium">Expected Guests:</span>
              <input
                type="number"
                value={expectedGuestCount}
                onChange={(e) => setExpectedGuestCount(Number(e.target.value))}
                className="w-16 px-2 py-1 text-sm border rounded bg-background"
                min="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Guests Placed:</span>
              <Badge variant="secondary" className="bg-sage-light">
                {guestsPlaced}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              <span className="font-medium">Seats Remaining:</span>
              <Badge variant="outline">
                {seatsRemaining}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Total Capacity:</span>
              <Badge variant="default" className="bg-primary">
                {totalSeats}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="p-6 shadow-elegant">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold">Venue Layout</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-background rounded-lg border">
                    <span className="text-sm font-medium">
                      {isEditMode ? 'Edit Mode' : 'View Mode'}
                    </span>
                    <button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        isEditMode ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isEditMode ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  <Button 
                    onClick={() => setShowTableCreator(true)}
                    className="gap-2 bg-gradient-wedding hover:opacity-90"
                    disabled={!isEditMode}
                  >
                    <Plus className="h-4 w-4" />
                    Add Table
                  </Button>
                </div>
              </div>
              
              <div className="overflow-auto">
                <div 
                  ref={canvasRef}
                  className="relative bg-background/50 border-2 border-dashed border-border rounded-lg"
                  style={{ 
                    height: "600px", 
                    minHeight: "600px",
                    transform: `scale(${canvasScale})`,
                    transformOrigin: 'top left',
                    width: `${100 / canvasScale}%`,
                  }}
                >
                  {tables.map((table) => (
                    <TableComponent
                      key={table.id}
                      table={table}
                      isEditMode={isEditMode}
                      onPositionChange={updateTablePosition}
                      onSeatClick={(seatNumber) => 
                        isEditMode && setSelectedSeat({ tableId: table.id, seatNumber })
                      }
                      onTableNumberEdit={(tableId) => setEditingTableId(tableId)}
                      onTableNumberUpdate={updateTableNumber}
                      isEditingNumber={editingTableId === table.id}
                    />
                  ))}
                
                {tables.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground mb-2">
                        Start designing your venue
                      </p>
                      <p className="text-muted-foreground mb-4">
                        Add tables to begin creating your seating chart
                      </p>
                      <Button 
                        onClick={() => setShowTableCreator(true)}
                        className="bg-gradient-wedding hover:opacity-90"
                      >
                        Add Your First Table
                      </Button>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {showTableCreator && isEditMode && (
              <TableCreator
                onAddTable={addTable}
                onCancel={() => setShowTableCreator(false)}
              />
            )}
            
            {selectedSeat && isEditMode && (
              <GuestForm
                guest={selectedGuest}
                tableNumber={selectedTable?.number || 0}
                seatNumber={selectedSeat.seatNumber}
                onSave={updateGuest}
                onRemove={selectedGuest ? removeGuest : undefined}
                onCancel={() => setSelectedSeat(null)}
              />
            )}
            
            {!showTableCreator && !selectedSeat && isEditMode && (
              <Card className="p-6">
                <h3 className="text-lg font-serif font-semibold mb-4">
                  Getting Started
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>1. Add tables to your venue layout</p>
                  <p>2. Click on seats to assign guests</p>
                  <p>3. Drag tables to arrange them</p>
                  <p>4. Export when complete</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatingChart;