import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon, MapPin } from "lucide-react";
import ParkingCard from "@/components/parking/parking-card";
import ParkingDetailModal from "@/components/parking/parking-detail-modal";
import type { ParkingLot } from "@shared/schema";

export default function Search() {
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    distance: "1",
    priceRange: "5000-10000",
    vehicleTypes: [] as string[],
    availability: "all",
    facilities: [] as string[],
    minRating: "0",
  });

  const { data: searchResults = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/parking-lots/search", filters],
    enabled: false, // Only search when user clicks search button
  });

  const handleSearch = () => {
    refetch();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleVehicleTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      vehicleTypes: checked 
        ? [...prev.vehicleTypes, type]
        : prev.vehicleTypes.filter(t => t !== type)
    }));
  };

  const handleFacilityChange = (facility: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      facilities: checked 
        ? [...prev.facilities, facility]
        : prev.facilities.filter(f => f !== facility)
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      distance: "1",
      priceRange: "5000-10000",
      vehicleTypes: [],
      availability: "all",
      facilities: [],
      minRating: "0",
    });
  };

  return (
    <div className="flex-1 bg-white" data-testid="search-page">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tìm kiếm nâng cao</h1>
          <p className="text-gray-600 mt-1">Tìm bãi xe phù hợp với nhu cầu của bạn</p>
        </div>

        {/* Advanced Filters */}
        <Card className="mb-6" data-testid="filters-card">
          <CardHeader>
            <CardTitle>Bộ lọc tìm kiếm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <Input
                  type="text"
                  placeholder="Tên bãi xe hoặc địa chỉ..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  data-testid="search-filter-input"
                />
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng cách
                </label>
                <Select 
                  value={filters.distance} 
                  onValueChange={(value) => handleFilterChange("distance", value)}
                >
                  <SelectTrigger data-testid="distance-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">Trong 500m</SelectItem>
                    <SelectItem value="1">Trong 1km</SelectItem>
                    <SelectItem value="2">Trong 2km</SelectItem>
                    <SelectItem value="5">Trong 5km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá cả (VNĐ/giờ)
                </label>
                <Select 
                  value={filters.priceRange} 
                  onValueChange={(value) => handleFilterChange("priceRange", value)}
                >
                  <SelectTrigger data-testid="price-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-5000">Dưới 5,000</SelectItem>
                    <SelectItem value="5000-10000">5,000 - 10,000</SelectItem>
                    <SelectItem value="10000-20000">10,000 - 20,000</SelectItem>
                    <SelectItem value="20000+">Trên 20,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại xe
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="motorcycle"
                      checked={filters.vehicleTypes.includes("motorcycle")}
                      onCheckedChange={(checked) => handleVehicleTypeChange("motorcycle", !!checked)}
                      data-testid="motorcycle-checkbox"
                    />
                    <label htmlFor="motorcycle" className="text-sm text-gray-700">
                      Xe máy
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="car"
                      checked={filters.vehicleTypes.includes("car")}
                      onCheckedChange={(checked) => handleVehicleTypeChange("car", !!checked)}
                      data-testid="car-checkbox"
                    />
                    <label htmlFor="car" className="text-sm text-gray-700">
                      Ô tô
                    </label>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tình trạng
                </label>
                <Select 
                  value={filters.availability} 
                  onValueChange={(value) => handleFilterChange("availability", value)}
                >
                  <SelectTrigger data-testid="availability-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="available">Còn chỗ</SelectItem>
                    <SelectItem value="almost_full">Sắp hết chỗ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Facilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiện ích
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="covered"
                      checked={filters.facilities.includes("covered")}
                      onCheckedChange={(checked) => handleFacilityChange("covered", !!checked)}
                      data-testid="covered-checkbox"
                    />
                    <label htmlFor="covered" className="text-sm text-gray-700">
                      Có mái che
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="security"
                      checked={filters.facilities.includes("security")}
                      onCheckedChange={(checked) => handleFacilityChange("security", !!checked)}
                      data-testid="security-checkbox"
                    />
                    <label htmlFor="security" className="text-sm text-gray-700">
                      Bảo vệ 24/7
                    </label>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá tối thiểu
                </label>
                <Select 
                  value={filters.minRating} 
                  onValueChange={(value) => handleFilterChange("minRating", value)}
                >
                  <SelectTrigger data-testid="rating-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Bất kỳ</SelectItem>
                    <SelectItem value="3">3 sao trở lên</SelectItem>
                    <SelectItem value="4">4 sao trở lên</SelectItem>
                    <SelectItem value="5">5 sao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <Button onClick={handleSearch} data-testid="search-button">
                <SearchIcon className="mr-2 h-4 w-4" />
                Áp dụng bộ lọc
              </Button>
              <Button variant="outline" onClick={resetFilters} data-testid="reset-button">
                Đặt lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Results List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Kết quả tìm kiếm</h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Đang tìm kiếm...</p>
              </div>
            ) : (searchResults as ParkingLot[]).length > 0 ? (
              <div className="space-y-4" data-testid="search-results">
                {(searchResults as ParkingLot[]).map((lot: ParkingLot) => (
                  <ParkingCard
                    key={lot.id}
                    lot={lot}
                    onClick={() => setSelectedLot(lot)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500" data-testid="no-search-results">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nhập từ khóa và nhấn "Áp dụng bộ lọc" để tìm kiếm bãi xe</p>
              </div>
            )}
          </div>

          {/* Map View Placeholder */}
          <div className="bg-gray-100 rounded-lg p-4 h-96">
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p>Bản đồ sẽ hiển thị kết quả tìm kiếm</p>
              </div>
            </div>
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
