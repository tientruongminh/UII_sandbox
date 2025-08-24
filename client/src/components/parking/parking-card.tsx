import { MapPin, Star, Car, Bike, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ParkingLot } from "@shared/schema";

interface ParkingCardProps {
  lot: ParkingLot;
  onClick: () => void;
}

export default function ParkingCard({ lot, onClick }: ParkingCardProps) {
  const hasAvailableSpots = lot.currentMotorcycleSpots > 0 || lot.currentCarSpots > 0;
  const statusColor = hasAvailableSpots ? "text-success" : "text-danger";
  const statusText = hasAvailableSpots ? "Còn chỗ" : "Hết chỗ";
  
  return (
    <Card 
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors" 
      onClick={onClick}
      data-testid={`parking-card-${lot.id}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 ${hasAvailableSpots ? "bg-success" : "bg-danger"} rounded-lg flex items-center justify-center text-white`}>
            <Car className="h-6 w-6" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate" data-testid={`lot-name-${lot.id}`}>
              {lot.name}
            </h3>
            <span className={`text-xs font-medium ${statusColor}`} data-testid={`lot-status-${lot.id}`}>
              {statusText}
            </span>
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate" data-testid={`lot-address-${lot.id}`}>{lot.address}</span>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              {lot.motorcycleCapacity > 0 && (
                <div className="flex items-center space-x-1">
                  <Bike className="h-3 w-3" />
                  <span data-testid={`motorcycle-price-${lot.id}`}>{lot.motorcyclePrice.toLocaleString()} VNĐ/giờ</span>
                </div>
              )}
              {lot.carCapacity > 0 && (
                <div className="flex items-center space-x-1">
                  <Car className="h-3 w-3" />
                  <span data-testid={`car-price-${lot.id}`}>{lot.carPrice.toLocaleString()} VNĐ/giờ</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <MapPin className="h-3 w-3" />
              <span data-testid={`lot-distance-${lot.id}`}>150m</span>
            </div>
          </div>
          
          {lot.rating && parseFloat(lot.rating) > 0 && (
            <div className="flex items-center mt-2">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-warning fill-current" />
                <span className="text-xs text-gray-600" data-testid={`lot-rating-${lot.id}`}>
                  {parseFloat(lot.rating).toFixed(1)} ({lot.totalReviews} đánh giá)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
