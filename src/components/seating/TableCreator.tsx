import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Circle, Square, Plus, X } from "lucide-react";

interface TableCreatorProps {
  onAddTable: (type: "round" | "rectangle", seats: number) => void;
  onCancel: () => void;
}

export const TableCreator = ({ onAddTable, onCancel }: TableCreatorProps) => {
  const [selectedType, setSelectedType] = useState<"round" | "rectangle" | null>(null);
  const [seatCount, setSeatCount] = useState<number>(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType && seatCount > 0) {
      onAddTable(selectedType, seatCount);
    }
  };

  return (
    <Card className="shadow-elegant animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Table
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">Table Shape</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedType("round")}
                className={`p-4 border-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 ${
                  selectedType === "round"
                    ? "border-primary bg-primary/5 shadow-table"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Circle className="h-8 w-8 text-primary" />
                <span className="font-medium">Round</span>
                {selectedType === "round" && (
                  <Badge variant="secondary" className="text-xs">Selected</Badge>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedType("rectangle")}
                className={`p-4 border-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 ${
                  selectedType === "rectangle"
                    ? "border-primary bg-primary/5 shadow-table"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Square className="h-8 w-8 text-primary" />
                <span className="font-medium">Rectangle</span>
                {selectedType === "rectangle" && (
                  <Badge variant="secondary" className="text-xs">Selected</Badge>
                )}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="seatCount" className="text-base font-medium">
              Number of Seats
            </Label>
            <div className="mt-2">
              <Input
                id="seatCount"
                type="number"
                min="2"
                max="20"
                value={seatCount}
                onChange={(e) => setSeatCount(parseInt(e.target.value) || 2)}
                className="text-center text-lg font-semibold"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Recommended: 6-10 seats for optimal conversation
              </p>
            </div>
          </div>

          {selectedType && (
            <div className="p-4 bg-sage-light/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                {selectedType === "round" ? (
                  <Circle className="h-4 w-4 text-sage" />
                ) : (
                  <Square className="h-4 w-4 text-sage" />
                )}
                <span className="font-medium capitalize text-sage">
                  {selectedType} Table Preview
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {seatCount} seats arranged around a {selectedType} table
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-wedding hover:opacity-90"
            disabled={!selectedType || seatCount < 2}
          >
            Add Table
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};