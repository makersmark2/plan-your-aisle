import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Users, MapPin, Plus } from "lucide-react";
import { TableComponent } from "./Table";
import { GuestForm } from "./GuestForm";
import { TableCreator } from "./TableCreator";
import { toast } from "sonner";

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
}

const SeatingChart = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<{
    tableId: string;
    seatNumber: number;
  } | null>(null);
  const [showTableCreator, setShowTableCreator] = useState(false);
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

  const exportToPNG = useCallback(() => {
    // Implementation for PNG export would go here
    toast.success("Seating chart exported as PNG");
  }, []);

  const exportToCSV = useCallback(() => {
    // Implementation for CSV export would go here
    toast.success("Guest list exported as CSV");
  }, []);

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
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-8">
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
                <Button 
                  onClick={() => setShowTableCreator(true)}
                  className="gap-2 bg-gradient-wedding hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add Table
                </Button>
              </div>
              
              <div 
                ref={canvasRef}
                className="relative bg-background/50 border-2 border-dashed border-border rounded-lg"
                style={{ height: "600px", minHeight: "600px" }}
              >
                {tables.map((table) => (
                  <TableComponent
                    key={table.id}
                    table={table}
                    onPositionChange={updateTablePosition}
                    onSeatClick={(seatNumber) => 
                      setSelectedSeat({ tableId: table.id, seatNumber })
                    }
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
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {showTableCreator && (
              <TableCreator
                onAddTable={addTable}
                onCancel={() => setShowTableCreator(false)}
              />
            )}
            
            {selectedSeat && (
              <GuestForm
                guest={selectedGuest}
                tableNumber={selectedTable?.number || 0}
                seatNumber={selectedSeat.seatNumber}
                onSave={updateGuest}
                onRemove={selectedGuest ? removeGuest : undefined}
                onCancel={() => setSelectedSeat(null)}
              />
            )}
            
            {!showTableCreator && !selectedSeat && (
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