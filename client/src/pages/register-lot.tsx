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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CloudUpload } from "lucide-react";
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

export default function RegisterLot() {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: "Không thể đăng ký bãi xe. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

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
                        <Textarea 
                          placeholder="Số nhà, tên đường, phường/xã, quận/huyện, TP.HCM"
                          rows={2}
                          {...field}
                          data-testid="address-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          data-testid="description-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Photos Upload Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nhấp để tải lên hình ảnh bãi xe</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
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
