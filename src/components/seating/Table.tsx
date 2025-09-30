import React, { useCallback, useRef, useState } from "react";
import { TableData } from "./SeatingChart";
import { Badge } from "@/components/ui/badge";

interface TableComponentProps {
  table: TableData;
  isEditMode: boolean;
  onPositionChange: (tableId: string, x: number, y: number) => void;
  onSeatClick: (seatNumber: number) => void;
  onSeatHover: (seatNumber: number, guest: Guest | null, x: number, y: number) => void;
  onSeatLeave: () => void;
  onTableNumberEdit: (tableId: string) => void;
  onTableNumberUpdate: (tableId: string, number: number) => void;
  isEditingNumber: boolean;
}

export const TableComponent = ({ 
  table, 
  isEditMode, 
  onPositionChange, 
  onSeatClick, 
  onSeatHover,
  onSeatLeave,
  onTableNumberEdit,
  onTableNumberUpdate,
  isEditingNumber 
}: TableComponentProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempNumber, setTempNumber] = useState(table.number);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !tableRef.current) return;
    
    const rect = tableRef.current.getBoundingClientRect();
    const parentRect = tableRef.current.parentElement?.getBoundingClientRect();
    
    if (parentRect) {
      setDragOffset({
        x: e.clientX - parentRect.left - table.x,
        y: e.clientY - parentRect.top - table.y,
      });
    }
    
    setIsDragging(true);
    e.preventDefault();
  }, [isEditMode, table.x, table.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !tableRef.current?.parentElement) return;
    
    const parentRect = tableRef.current.parentElement.getBoundingClientRect();
    const newX = e.clientX - parentRect.left - dragOffset.x;
    const newY = e.clientY - parentRect.top - dragOffset.y;
    
    onPositionChange(table.id, Math.max(0, newX), Math.max(0, newY));
  }, [isDragging, dragOffset, onPositionChange, table.id]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for mouse movement
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const renderSeats = () => {
    const seats = [];
    const seatSize = 24;
    const tableWidth = table.type === "round" ? 120 : 160;
    const tableHeight = table.type === "round" ? 120 : 80;
    
    for (let i = 1; i <= table.seats; i++) {
      let seatX, seatY;
      
      if (table.type === "round") {
        // Arrange seats in a circle
        const angle = (2 * Math.PI * (i - 1)) / table.seats;
        const radius = tableWidth / 2 + 20;
        seatX = tableWidth / 2 + Math.cos(angle) * radius - seatSize / 2;
        seatY = tableHeight / 2 + Math.sin(angle) * radius - seatSize / 2;
      } else {
        // Rectangle table: 1 seat centered on each short side, remaining on long sides
        const longSideSeats = Math.max(0, table.seats - 2);
        const seatsPerLongSide = Math.floor(longSideSeats / 2);
        const extraSeats = longSideSeats % 2;
        
        if (i === 1) {
          // Top short side - centered
          seatX = tableWidth / 2 - seatSize / 2;
          seatY = -seatSize - 5;
        } else if (i === 2) {
          // Bottom short side - centered
          seatX = tableWidth / 2 - seatSize / 2;
          seatY = tableHeight + 5;
        } else {
          // Remaining seats on long sides
          const sideIndex = i - 3;
          const topSideSeats = seatsPerLongSide + extraSeats;
          
          if (sideIndex < topSideSeats) {
            // Right side
            const spacing = tableHeight / (topSideSeats + 1);
            seatX = tableWidth + 5;
            seatY = spacing * (sideIndex + 1) - seatSize / 2;
          } else {
            // Left side
            const leftIndex = sideIndex - topSideSeats;
            const spacing = tableHeight / (seatsPerLongSide + 1);
            seatX = -seatSize - 5;
            seatY = tableHeight - spacing * (leftIndex + 1) - seatSize / 2;
          }
        }
      }
      
      const guest = table.guests[i];
      const hasGuest = !!guest;
      
      seats.push(
        <div
          key={i}
          className={`absolute w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-xs font-medium ${
            hasGuest 
              ? 'bg-sage border-sage text-white hover:scale-110' 
              : 'bg-background border-border hover:border-primary hover:scale-110'
          } ${isEditMode ? 'cursor-pointer' : 'cursor-default'}`}
          style={{
            left: seatX,
            top: seatY,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isEditMode) onSeatClick(i);
          }}
          onMouseEnter={(e) => {
            if (!isEditMode && hasGuest) {
              const rect = e.currentTarget.getBoundingClientRect();
              const parentRect = tableRef.current?.getBoundingClientRect();
              if (parentRect) {
                const relativeX = rect.left - parentRect.left + rect.width / 2;
                const relativeY = rect.top - parentRect.top;
                onSeatHover(i, guest, relativeX, relativeY);
              }
            }
          }}
          onMouseLeave={() => {
            if (!isEditMode) {
              onSeatLeave();
            }
          }}
          title={hasGuest && !isEditMode ? `${guest.firstName} ${guest.lastName}` : `Seat ${i}`}
        >
          {i}
        </div>
      );
    }
    
    return seats;
  };

  return (
    <div
      ref={tableRef}
      className={`absolute select-none animate-table-drop ${
        isDragging ? 'z-10 scale-105' : 'z-0'
      } ${isEditMode ? 'cursor-move' : 'cursor-default'}`}
      style={{
        left: table.x,
        top: table.y,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Table */}
      <div
        className={`bg-card border-2 border-border shadow-table transition-all duration-200 ${
          table.type === "round" 
            ? "rounded-full w-30 h-30" 
            : "rounded-lg w-40 h-20"
        } ${isDragging ? 'shadow-elegant' : ''}`}
        style={{
          width: table.type === "round" ? "120px" : "160px",
          height: table.type === "round" ? "120px" : "80px",
        }}
      >
        <div className="flex flex-col items-center justify-center h-full p-1">
          {isEditingNumber ? (
            <input
              type="number"
              value={tempNumber}
              onChange={(e) => setTempNumber(Number(e.target.value))}
              onBlur={() => onTableNumberUpdate(table.id, tempNumber)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onTableNumberUpdate(table.id, tempNumber);
                if (e.key === 'Escape') {
                  setTempNumber(table.number);
                  onTableNumberUpdate(table.id, table.number);
                }
              }}
              className="w-12 text-xs text-center border rounded bg-background"
              autoFocus
            />
          ) : (
            <Badge 
              variant="outline" 
              className={`font-semibold text-xs ${isEditMode ? 'cursor-pointer' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isEditMode) onTableNumberEdit(table.id);
              }}
            >
              Table {table.number}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Seats */}
      {renderSeats()}
    </div>
  );
};