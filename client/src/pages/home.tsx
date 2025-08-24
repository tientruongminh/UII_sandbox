import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Car, Bike, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimpleMap from "@/components/map/simple-map";
import ParkingCard from "@/components/parking/parking-card";
import ParkingDetailModal from "@/components/parking/parking-detail-modal";
import type { ParkingLot } from "@shared/schema";

export default function Home() {
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(["nearby"]));

  const { data: parkingLots = [], isLoading } = useQuery({
    queryKey: ["/api/parking-lots"],
    staleTime: 30 * 1000, // 30 seconds
  });

  const filteredLots = (parkingLots as ParkingLot[]).filter((lot: ParkingLot) => {
    if (searchQuery) {
      return lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             lot.address.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    if (activeFilters.has("available")) {
      return lot.currentMotorcycleSpots > 0 || lot.currentCarSpots > 0;
    }
    
    if (activeFilters.has("motorcycle") && !activeFilters.has("car")) {
      return lot.motorcycleCapacity > 0;
    }
    
    if (activeFilters.has("car") && !activeFilters.has("motorcycle")) {
      return lot.carCapacity > 0;
    }
    
    return true;
  });

  const toggleFilter = (filter: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
  };

  const handleParkingLotClick = (lot: ParkingLot) => {
    setSelectedLot(lot);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải dữ liệu bãi xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" data-testid="home-page">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 p-4" data-testid="search-section">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm địa chỉ hoặc địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3"
              data-testid="search-input"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          
          {/* Quick Filters */}
          <div className="flex items-center space-x-3 mt-3 overflow-x-auto pb-2" data-testid="quick-filters">
            <Button
              variant={activeFilters.has("nearby") ? "default" : "secondary"}
              size="sm"
              onClick={() => toggleFilter("nearby")}
              className="whitespace-nowrap"
              data-testid="filter-nearby"
            >
              <MapPin className="mr-2 h-3 w-3" />
              Gần tôi
            </Button>
            <Button
              variant={activeFilters.has("available") ? "default" : "secondary"}
              size="sm"
              onClick={() => toggleFilter("available")}
              className="whitespace-nowrap"
              data-testid="filter-available"
            >
              <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
              Còn chỗ
            </Button>
            <Button
              variant={activeFilters.has("motorcycle") ? "default" : "secondary"}
              size="sm"
              onClick={() => toggleFilter("motorcycle")}
              className="whitespace-nowrap"
              data-testid="filter-motorcycle"
            >
              <Bike className="mr-2 h-3 w-3" />
              Xe máy
            </Button>
            <Button
              variant={activeFilters.has("car") ? "default" : "secondary"}
              size="sm"
              onClick={() => toggleFilter("car")}
              className="whitespace-nowrap"
              data-testid="filter-car"
            >
              <Car className="mr-2 h-3 w-3" />
              Ô tô
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="whitespace-nowrap"
              data-testid="filter-advanced"
            >
              <SlidersHorizontal className="mr-2 h-3 w-3" />
              Bộ lọc
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Map Area */}
        <div className="relative flex-1 h-64 md:h-auto">
          <SimpleMap 
            parkingLots={filteredLots} 
            onParkingLotClick={handleParkingLotClick}
          />
        </div>

        {/* Parking Lots List */}
        <div className="md:w-80 bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col" data-testid="parking-list">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Bãi xe gần bạn</h2>
            <p className="text-sm text-gray-500" data-testid="results-count">
              Tìm thấy {filteredLots.length} bãi xe trong bán kính 2km
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredLots.length === 0 ? (
              <div className="p-8 text-center text-gray-500" data-testid="no-results">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Không tìm thấy bãi xe nào</p>
                <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredLots.map((lot: ParkingLot) => (
                  <ParkingCard
                    key={lot.id}
                    lot={lot}
                    onClick={() => handleParkingLotClick(lot)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parking Detail Modal */}
      <ParkingDetailModal
        lot={selectedLot}
        open={!!selectedLot}
        onOpenChange={(open) => !open && setSelectedLot(null)}
      />
    </div>
  );
}
