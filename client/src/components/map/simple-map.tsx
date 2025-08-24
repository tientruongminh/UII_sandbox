import { useState } from "react";
import { Plus, Minus, Navigation, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParkingLot } from "@shared/schema";

interface SimpleMapProps {
  parkingLots: ParkingLot[];
  onParkingLotClick: (lot: ParkingLot) => void;
}

export default function SimpleMap({ parkingLots, onParkingLotClick }: SimpleMapProps) {
  const [zoom, setZoom] = useState(1);

  const getStatusColor = (lot: ParkingLot) => {
    const hasAvailableSpots = lot.currentMotorcycleSpots > 0 || lot.currentCarSpots > 0;
    return hasAvailableSpots ? "bg-success" : "bg-danger";
  };

  return (
    <div className="relative w-full h-full bg-cover bg-center" 
         style={{
           backgroundImage: "url('https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800')"
         }}
         data-testid="parking-map">
      
      {/* Map Overlay */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-20"></div>
      
      {/* Current Location */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" data-testid="current-location">
        <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
          <Navigation className="w-3 h-3 fill-current" />
        </div>
      </div>

      {/* Parking Lot Markers */}
      {parkingLots.map((lot, index) => {
        // Position markers based on their index for demo purposes
        const positions = [
          { top: "25%", left: "33%" },
          { top: "50%", left: "66%" },
          { top: "75%", left: "50%" },
          { top: "40%", left: "25%" },
          { top: "60%", left: "75%" },
        ];
        const position = positions[index % positions.length];

        return (
          <div
            key={lot.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ top: position.top, left: position.left }}
            data-testid={`marker-${lot.id}`}
          >
            <button
              onClick={() => onParkingLotClick(lot)}
              className={`${getStatusColor(lot)} text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold shadow-lg cursor-pointer transform hover:scale-110 transition-transform`}
              data-testid={`marker-button-${lot.id}`}
            >
              <MapPin className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap">
              {lot.name}
            </div>
          </div>
        );
      })}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2" data-testid="map-controls">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom(Math.min(zoom + 0.5, 3))}
          className="bg-white shadow-lg"
          data-testid="zoom-in"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom(Math.max(zoom - 0.5, 0.5))}
          className="bg-white shadow-lg"
          data-testid="zoom-out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-white shadow-lg"
          data-testid="center-location"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
