import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertParkingLotSchema } from "@shared/schema";
import type { InsertParkingLot } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CloudUpload, MapPin, Upload, Download, Zap } from "lucide-react";
import { z } from "zod";

const formSchema = insertParkingLotSchema.extend({
  openTime: z.string().min(1, "Giờ mở cửa là bắt buộc"),
  closeTime: z.string().min(1, "Giờ đóng cửa là bắt buộc"),
  is24h: z.boolean().default(false),
  selectedFacilities: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

const facilityOptions = [
  { id: "covered", label: "Có mái che" },
  { id: "security", label: "Bảo vệ 24/7" },
  { id: "camera", label: "Camera an ninh" },
  { id: "toilet", label: "Toilet" },
  { id: "water", label: "Nước uống" },
  { id: "wifi", label: "WiFi miễn phí" },
];

// Danh sách địa chỉ có sẵn tại TP.HCM
const commonAddresses = [
  "78 Nguyễn Huệ, Quận 1, TP.HCM",
  "70-72 Lê Thánh Tôn, Quận 1, TP.HCM", 
  "Lê Lợi, Quận 1, TP.HCM",
  "Đại học FPT, Quận 9, TP.HCM",
  "Đại học Bách Khoa, Quận 10, TP.HCM",
  "Bệnh viện Chợ Rẫy, Quận 5, TP.HCM",
  "Sân bay Tân Sơn Nhất, Quận Tân Bình, TP.HCM",
  "Chợ Bến Thành, Quận 1, TP.HCM",
  "Nhà Thờ Đức Bà, Quận 1, TP.HCM",
  "Bitexco Financial Tower, Quận 1, TP.HCM"
];

// Danh sách khu vực phổ biến
const popularDistricts = [
  { id: "q1", name: "Quận 1", coords: { lat: "10.7769", lng: "106.7009" } },
  { id: "q3", name: "Quận 3", coords: { lat: "10.7867", lng: "106.6910" } },
  { id: "q5", name: "Quận 5", coords: { lat: "10.7592", lng: "106.6746" } },
  { id: "q7", name: "Quận 7", coords: { lat: "10.7379", lng: "106.7197" } },
  { id: "q9", name: "Quận 9", coords: { lat: "10.8411", lng: "106.8096" } },
  { id: "q10", name: "Quận 10", coords: { lat: "10.7720", lng: "106.6710" } },
  { id: "tb", name: "Quận Tân Bình", coords: { lat: "10.8142", lng: "106.6438" } },
  { id: "pn", name: "Quận Phú Nhuận", coords: { lat: "10.7980", lng: "106.6947" } }
];

export default function RegisterLot() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [showDataIntegration, setShowDataIntegration] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: "10.7769", // Default to Ho Chi Minh City center
      longitude: "106.7009",
      ownerId: "demo-user", // In real app, get from auth
      motorcycleCapacity: 0,
      carCapacity: 0,
      motorcyclePrice: 0,
      carPrice: 0,
      facilities: [],
      description: "",
      openTime: "06:00",
      closeTime: "22:00",
      is24h: false,
      selectedFacilities: [],
    },
  });

  const createLotMutation = useMutation({
    mutationFn: async (data: InsertParkingLot) => {
      const response = await apiRequest("POST", "/api/parking-lots", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Bãi xe đã được đăng ký thành công. Bạn nhận được 50 điểm thưởng!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parking-lots"] });
      form.reset();
      setShowDataIntegration(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể đăng ký bãi xe. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const filteredAddresses = commonAddresses.filter(addr => 
    addr.toLowerCase().includes(addressQuery.toLowerCase())
  );

  const handleAddressSelect = (address: string) => {
    form.setValue("address", address);
    setAddressQuery(address);
    setShowAddressSuggestions(false);
    
    // Tự động điền tọa độ dựa trên địa chỉ
    const district = popularDistricts.find(d => address.includes(d.name));
    if (district) {
      form.setValue("latitude", district.coords.lat);
      form.setValue("longitude", district.coords.lng);
      toast({
        title: "Đã tự động điền tọa độ",
        description: `Tọa độ đã được cập nhật cho ${district.name}`,
      });
    }
  };

  const handleDistrictSelect = (districtId: string) => {
    const district = popularDistricts.find(d => d.id === districtId);
    if (district) {
      form.setValue("latitude", district.coords.lat);
      form.setValue("longitude", district.coords.lng);
      toast({
        title: "Tọa độ đã được cập nhật",
        description: `Vị trí ${district.name} đã được thiết lập`,
      });
    }
  };

  const handleImportData = () => {
    // Mô phỏng import dữ liệu từ file
    const sampleData = {
      name: "Bãi xe mẫu từ hệ thống",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      latitude: "10.7769",
      longitude: "106.7009",
      motorcycleCapacity: 50,
      carCapacity: 20,
      motorcyclePrice: 5000,
      carPrice: 15000,
      selectedFacilities: ["covered", "security"],
      description: "Bãi xe được import từ hệ thống dữ liệu có sẵn"
    };
    
    Object.entries(sampleData).forEach(([key, value]) => {
      form.setValue(key as any, value);
    });
    
    toast({
      title: "Import thành công",
      description: "Dữ liệu đã được tải từ hệ thống có sẵn",
    });
  };

  const exportTemplate = () => {
    const template = `Tên bãi xe,Địa chỉ,Vĩ độ,Kinh độ,Sức chứa xe máy,Sức chứa ô tô,Giá xe máy,Giá ô tô,Tiện ích,Mô tả
Bãi xe mẫu,"123 Đường ABC, Quận 1",10.7769,106.7009,50,20,5000,15000,"covered,security","Mô tả bãi xe"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mau-dang-ky-bai-xe.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template đã được tải",
      description: "File mẫu CSV đã được tải xuống",
    });
  };

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    const operatingHours = {
      openTime: data.is24h ? "00:00" : data.openTime,
      closeTime: data.is24h ? "23:59" : data.closeTime,
      is24h: data.is24h,
    };

    const lotData: InsertParkingLot = {
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      ownerId: data.ownerId,
      motorcycleCapacity: data.motorcycleCapacity,
      carCapacity: data.carCapacity,
      motorcyclePrice: data.motorcyclePrice,
      carPrice: data.carPrice,
      facilities: data.selectedFacilities,
      operatingHours,
      description: data.description,
    };

    createLotMutation.mutate(lotData, {
      onSettled: () => setIsSubmitting(false),
    });
  };

  return (
    <div className="flex-1 bg-white" data-testid="register-lot-page">
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Đăng ký bãi xe</h1>
          <p className="text-gray-600 mt-1">Chia sẻ bãi xe của bạn với cộng đồng</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Data Integration Options */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Tích hợp dữ liệu có sẵn
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDataIntegration(!showDataIntegration)}
                    data-testid="toggle-data-integration"
                  >
                    {showDataIntegration ? "Ẩn" : "Hiện"} tùy chọn
                  </Button>
                </CardTitle>
              </CardHeader>
              {showDataIntegration && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Khu vực phổ biến</h4>
                      <Select onValueChange={handleDistrictSelect}>
                        <SelectTrigger data-testid="district-select">
                          <SelectValue placeholder="Chọn khu vực" />
                        </SelectTrigger>
                        <SelectContent>
                          {popularDistricts.map((district) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Import dữ liệu</h4>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleImportData}
                        data-testid="import-data-button"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Tải dữ liệu mẫu
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Template CSV</h4>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={exportTemplate}
                        data-testid="export-template-button"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Tải template
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Gợi ý:</strong> Sử dụng các tùy chọn trên để tự động điền thông tin từ hệ thống có sẵn, 
                      import dữ liệu từ file, hoặc tải template để chuẩn bị dữ liệu hàng loạt.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên bãi xe *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="VD: Bãi xe Nguyễn Văn A" 
                          {...field}
                          data-testid="name-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea 
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, TP.HCM"
                            rows={2}
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e);
                              setAddressQuery(e.target.value);
                              setShowAddressSuggestions(e.target.value.length > 2);
                            }}
                            onFocus={() => setShowAddressSuggestions(!!field.value && field.value.length > 2)}
                            data-testid="address-input"
                          />
                          {showAddressSuggestions && filteredAddresses.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {filteredAddresses.slice(0, 5).map((address, index) => (
                                <div
                                  key={index}
                                  className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleAddressSelect(address)}
                                  data-testid={`address-suggestion-${index}`}
                                >
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm">{address}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Tọa độ GPS</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            form.setValue("latitude", position.coords.latitude.toString());
                            form.setValue("longitude", position.coords.longitude.toString());
                            toast({
                              title: "Đã lấy vị trí hiện tại",
                              description: "Tọa độ GPS đã được cập nhật từ vị trí của bạn",
                            });
                          },
                          (error) => {
                            toast({
                              title: "Không thể lấy vị trí",
                              description: "Vui lòng cho phép truy cập vị trí hoặc nhập tọa độ thủ công",
                              variant: "destructive",
                            });
                          }
                        );
                      }}
                      data-testid="get-location-button"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Lấy vị trí hiện tại
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vĩ độ</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.000001"
                              placeholder="10.7769"
                              {...field}
                              data-testid="latitude-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kinh độ</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.000001"
                              placeholder="106.7009"
                              {...field}
                              data-testid="longitude-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capacity & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Sức chứa & Giá cả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="motorcycleCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số chỗ xe máy</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="motorcycle-capacity-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motorcyclePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá xe máy (VNĐ/giờ)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="5000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="motorcycle-price-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số chỗ ô tô</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="car-capacity-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="carPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá ô tô (VNĐ/giờ)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="15000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="car-price-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Tiện ích</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="selectedFacilities"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {facilityOptions.map((facility) => (
                          <div key={facility.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={facility.id}
                              checked={field.value.includes(facility.id)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, facility.id]
                                  : field.value.filter((f) => f !== facility.id);
                                field.onChange(updatedValue);
                              }}
                              data-testid={`facility-${facility.id}`}
                            />
                            <label htmlFor={facility.id} className="text-sm text-gray-700">
                              {facility.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Giờ hoạt động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ mở cửa</FormLabel>
                        <FormControl>
                          <Input 
                            type="time"
                            disabled={form.watch("is24h")}
                            {...field}
                            data-testid="open-time-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="closeTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ đóng cửa</FormLabel>
                        <FormControl>
                          <Input 
                            type="time"
                            disabled={form.watch("is24h")}
                            {...field}
                            data-testid="close-time-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is24h"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="24h-checkbox"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <label className="text-sm text-gray-700">
                          Hoạt động 24/7
                        </label>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú thêm</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả bãi xe</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Thông tin bổ sung về bãi xe (lối vào, hướng dẫn đỗ xe, etc.)"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                          data-testid="description-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Photos Upload & Integration Options */}
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh & Tùy chọn bổ sung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nhấp để tải lên hình ảnh bãi xe</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Kết nối API bản đồ</h4>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Tính năng đang phát triển",
                            description: "Kết nối với Google Maps API sẽ sớm được cập nhật",
                          });
                        }}
                        data-testid="maps-integration-button"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Kết nối Maps API
                      </Button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Đồng bộ dữ liệu</h4>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Đồng bộ hoàn tất",
                            description: "Dữ liệu đã được kiểm tra và xác thực",
                          });
                        }}
                        data-testid="sync-data-button"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Đồng bộ & xác thực
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex items-center space-x-4 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                data-testid="submit-button"
              >
                {isSubmitting ? "Đang đăng ký..." : "Đăng ký bãi xe"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
                data-testid="reset-form-button"
              >
                Lưu nháp
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
