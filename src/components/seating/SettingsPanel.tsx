import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Settings, Utensils } from "lucide-react";
import { toast } from "sonner";

interface SettingsPanelProps {
  customEntrees: string[];
  onUpdateEntrees: (entrees: string[]) => void;
  onClose: () => void;
}

export const SettingsPanel = ({ customEntrees, onUpdateEntrees, onClose }: SettingsPanelProps) => {
  const [newEntree, setNewEntree] = useState("");

  const handleAddEntree = () => {
    if (!newEntree.trim()) return;
    
    if (customEntrees.includes(newEntree.trim())) {
      toast.error("This entrée already exists");
      return;
    }
    
    onUpdateEntrees([...customEntrees, newEntree.trim()]);
    setNewEntree("");
    toast.success("Entrée added successfully");
  };

  const handleRemoveEntree = (entreeToRemove: string) => {
    onUpdateEntrees(customEntrees.filter(entree => entree !== entreeToRemove));
    toast.success("Entrée removed");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddEntree();
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Wedding Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Utensils className="h-5 w-5 text-accent" />
                Entrée Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="newEntree">Add New Entrée</Label>
                  <Input
                    id="newEntree"
                    value={newEntree}
                    onChange={(e) => setNewEntree(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter entrée name..."
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleAddEntree}
                    className="bg-gradient-wedding hover:opacity-90"
                    disabled={!newEntree.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Current Entrée Options ({customEntrees.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {customEntrees.map((entree, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="flex items-center gap-2 px-3 py-1"
                    >
                      {entree}
                      <button
                        onClick={() => handleRemoveEntree(entree)}
                        className="hover:text-destructive transition-colors"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {customEntrees.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No entrée options added yet. Add some options above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};