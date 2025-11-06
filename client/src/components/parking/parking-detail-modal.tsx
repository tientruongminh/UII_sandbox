import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Car, Bike, Navigation, Flag, Share2 } from "lucide-react";
import type { ParkingLot } from "@shared/schema";
import SimpleMap from "@/components/map/simple-map";

type Props = {
  lot: ParkingLot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showMap?: boolean; // <- mới
};

export default function ParkingDetailModal({ lot, open, onOpenChange, showMap = true }: Props) {
  if (!lot) return null;

  const hasAvailableSpots = lot.currentMotorcycleSpots > 0 || lot.currentCarSpots > 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ensure modal is always on top of everything */}
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        data-testid="parking-detail-modal"
        style={{ zIndex: 2147483647 }} // very high inline z-index to override other layers
      >
        <DialogHeader>
          <DialogTitle data-testid="modal-title">{lot.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={hasAvailableSpots ? "default" : "destructive"}
              className={hasAvailableSpots ? "bg-success hover:bg-success" : ""}
              data-testid="status-badge"
            >
              <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
              {hasAvailableSpots ? "Còn chỗ trống" : "Hết chỗ"}
            </Badge>
            <div className="text-sm text-gray-500" data-testid="last-updated">
              Cập nhật 5 phút trước
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-3">
            <MapPin className="text-gray-400 mt-1 h-4 w-4" />
            <div>
              <p className="text-sm font-medium text-gray-900" data-testid="modal-address">{lot.address}</p>
              <p className="text-xs text-gray-500">Cách bạn 150m (2 phút đi bộ)</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-lg p-3" data-testid="pricing-section">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Giá cả</h3>
            <div className="space-y-2">
              {lot.motorcycleCapacity > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <Bike className="text-gray-400 h-4 w-4" />
                    <span>Xe máy</span>
                  </span>
                  <span className="font-medium" data-testid="modal-motorcycle-price">
                    {lot.motorcyclePrice.toLocaleString()} VNĐ/giờ
                  </span>
                </div>
              )}
              {lot.carCapacity > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <Car className="text-gray-400 h-4 w-4" />
                    <span>Ô tô</span>
                  </span>
                  <span className="font-medium" data-testid="modal-car-price">
                    {lot.carPrice.toLocaleString()} VNĐ/giờ
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Capacity */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sức chứa</span>
            <span className="text-sm font-medium" data-testid="modal-capacity">
              {lot.motorcycleCapacity > 0 && `${lot.motorcycleCapacity} xe máy`}
              {lot.motorcycleCapacity > 0 && lot.carCapacity > 0 && ", "}
              {lot.carCapacity > 0 && `${lot.carCapacity} ô tô`}
            </span>
          </div>

          {/* Rating */}
          {lot.rating && parseFloat(lot.rating) > 0 && (
            <div className="flex items-center space-x-2" data-testid="modal-rating">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(parseFloat(lot.rating!))
                        ? "text-warning fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {parseFloat(lot.rating).toFixed(1)} ({lot.totalReviews} đánh giá)
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button className="w-full" data-testid="navigate-button">
              <Navigation className="mr-2 h-4 w-4" />
              Chỉ đường đến bãi xe
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center" data-testid="report-button">
                <Flag className="mr-2 h-4 w-4" />
                Báo cáo
              </Button>
              <Button variant="outline" className="flex items-center" data-testid="share-button">
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
            </div>
          </div>

          {/* Recent Comments */}
          {lot.description && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Mô tả</h3>
              <p className="text-sm text-gray-600" data-testid="lot-description">{lot.description}</p>
            </div>
          )}
        </div>

        {showMap && (
          <div className="h-64">
            {/* Hiển thị bản đồ chỉ khi showMap = true */}
            <SimpleMap parkingLots={lot ? [lot] : []} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
