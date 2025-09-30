import React, { useCallback, useRef, useState } from "react";
import { TableData } from "./SeatingChart";
import { Badge } from "@/components/ui/badge";

interface TableComponentProps {
  table: TableData;
  onPositionChange: (tableId: string, x: number, y: number) => void;
  onSeatClick: (seatNumber: number) => void;
}

export const TableComponent = ({ table, onPositionChange, onSeatClick }: TableComponentProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const tableRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!tableRef.current) return;
    
    const rect = tableRef.current.getBoundingClientRect();
    const parentRect = tableRef.current.parentElement?.getBoundingClientRect();
    
    if (parentRect) {
      setDragOffset({
        x: e.clientX - rect.left - parentRect.left,
        y: e.clientY - rect.top - parentRect.top,
      });
    }
    
    setIsDragging(true);
    e.preventDefault();
  }, []);

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
        // Arrange seats around rectangle perimeter
        const perimeter = 2 * (tableWidth + tableHeight);
        const seatSpacing = perimeter / table.seats;
        const position = (i - 1) * seatSpacing;
        
        if (position <= tableWidth) {
          // Top edge
          seatX = position - seatSize / 2;
          seatY = -seatSize - 5;
        } else if (position <= tableWidth + tableHeight) {
          // Right edge
          seatX = tableWidth + 5;
          seatY = (position - tableWidth) - seatSize / 2;
        } else if (position <= tableWidth * 2 + tableHeight) {
          // Bottom edge
          seatX = tableWidth - (position - tableWidth - tableHeight) - seatSize / 2;
          seatY = tableHeight + 5;
        } else {
          // Left edge
          seatX = -seatSize - 5;
          seatY = tableHeight - (position - tableWidth * 2 - tableHeight) - seatSize / 2;
        }
      }
      
      const guest = table.guests[i];
      const hasGuest = !!guest;
      
      seats.push(
        <div
          key={i}
          className={`absolute w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium ${
            hasGuest 
              ? 'bg-primary border-primary text-primary-foreground hover:scale-110' 
              : 'bg-background border-border hover:border-primary hover:scale-110'
          }`}
          style={{
            left: seatX,
            top: seatY,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSeatClick(i);
          }}
          title={hasGuest ? `${guest.firstName} ${guest.lastName}` : `Seat ${i}`}
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
      className={`absolute cursor-move select-none animate-table-drop ${
        isDragging ? 'z-10 scale-105' : 'z-0'
      }`}
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
        <div className="flex items-center justify-center h-full">
          <Badge variant="outline" className="font-semibold">
            Table {table.number}
          </Badge>
        </div>
      </div>
      
      {/* Seats */}
      {renderSeats()}
    </div>
  );
};