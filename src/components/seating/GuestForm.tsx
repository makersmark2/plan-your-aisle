import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Utensils, TriangleAlert as AlertTriangle, X } from "lucide-react";
import { Guest } from "./SeatingChart";

interface GuestFormProps {
  guest?: Guest;
  tableNumber: number;
  seatNumber: number;
  onSave: (guest: Guest) => void;
  onRemove?: () => void;
  onCancel: () => void;
}

const entreeOptions = [
  "Beef Tenderloin",
  "Grilled Salmon",
  "Chicken Breast",
  "Vegetarian Pasta",
  "Vegan Buddha Bowl",
  "Custom Option"
];

export const GuestForm = ({ 
  guest, 
  tableNumber, 
  seatNumber, 
  onSave, 
  onRemove,
  onCancel 
}: GuestFormProps) => {
  const [formData, setFormData] = useState<Guest>({
    firstName: "",
    lastName: "",
    entree: "",
    hasAllergy: false,
    allergyDetails: "",
  });

  useEffect(() => {
    if (guest) {
      setFormData(guest);
    }
  }, [guest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return;
    }
    
    onSave(formData);
  };

  const handleInputChange = (field: keyof Guest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="shadow-elegant animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Seat Assignment
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
        <div className="flex gap-2">
          <Badge variant="outline">Table {tableNumber}</Badge>
          <Badge variant="secondary">Seat {seatNumber}</Badge>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Entrée Selection
            </Label>
            <Select 
              value={formData.entree} 
              onValueChange={(value) => handleInputChange("entree", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an entrée" />
              </SelectTrigger>
              <SelectContent>
                {entreeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Food Allergies
              </Label>
              <Switch
                checked={formData.hasAllergy}
                onCheckedChange={(checked) => handleInputChange("hasAllergy", checked)}
              />
            </div>
            
            {formData.hasAllergy && (
              <div>
                <Label htmlFor="allergyDetails">Allergy Details</Label>
                <Textarea
                  id="allergyDetails"
                  value={formData.allergyDetails || ""}
                  onChange={(e) => handleInputChange("allergyDetails", e.target.value)}
                  placeholder="Please specify allergies and dietary restrictions..."
                  rows={3}
                />
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-wedding hover:opacity-90 transition-all"
            disabled={!formData.firstName.trim() || !formData.lastName.trim()}
          >
            {guest ? "Update & Next" : "Assign & Next"}
          </Button>
          
          {onRemove && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={onRemove}
              className="px-4"
            >
              Remove
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};