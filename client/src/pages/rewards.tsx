import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Gift, 
  Star, 
  Plus, 
  Minus, 
  User, 
  Mail, 
  Phone,
  Coffee,
  Car as CarIcon,
  Fuel
} from "lucide-react";
import type { Reward, PointsHistory } from "@shared/schema";

export default function Rewards() {
  const [currentUser] = useState({
    id: "demo-user",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    initials: "NV",
    points: 1250,
    tier: "silver",
    joinDate: "tháng 3/2024",
    vehicleType: "motorcycle"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards = [] } = useQuery({
    queryKey: ["/api/rewards"],
  });

  const { data: pointsHistory = [] } = useQuery({
    queryKey: ["/api/users", currentUser.id, "points-history"],
  });

  const redeemRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const response = await apiRequest("POST", `/api/rewards/${rewardId}/redeem`, {
        userId: currentUser.id
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Đổi thưởng thành công!",
        description: "Voucher đã được gửi về email của bạn.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", currentUser.id, "points-history"] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi đổi thưởng",
        description: error.message || "Không thể đổi thưởng. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const handleRedeemReward = (reward: Reward) => {
    if (currentUser.points < reward.pointsCost) {
      toast({
        title: "Không đủ điểm",
        description: `Bạn cần ${reward.pointsCost - currentUser.points} điểm nữa để đổi phần thưởng này.`,
        variant: "destructive",
      });
      return;
    }
    redeemRewardMutation.mutate(reward.id);
  };

  const getRewardIcon = (category: string) => {
    switch (category) {
      case "transport":
        return <CarIcon className="text-warning text-xl" />;
      case "food":
        return <Coffee className="text-orange-500 text-xl" />;
      case "fuel":
        return <Fuel className="text-blue-500 text-xl" />;
      default:
        return <Gift className="text-primary text-xl" />;
    }
  };

  const getTierProgress = () => {
    if (currentUser.points >= 1500) return { current: "gold", progress: 100, nextTier: null, pointsNeeded: 0 };
    if (currentUser.points >= 500) return { current: "silver", progress: ((currentUser.points - 500) / 1000) * 100, nextTier: "Vàng", pointsNeeded: 1500 - currentUser.points };
    return { current: "bronze", progress: (currentUser.points / 500) * 100, nextTier: "Bạc", pointsNeeded: 500 - currentUser.points };
  };

  const tierInfo = getTierProgress();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    return `${Math.floor(diffInMinutes / 10080)} tuần trước`;
  };

  const mockRecentActivities = [
    { type: "status_update", description: "Cập nhật tình trạng bãi xe", location: "Bãi xe Nguyễn Huệ", points: 10, time: "2 giờ trước" },
    { type: "review", description: "Đánh giá bãi xe", location: "Bãi xe Vincom", points: 5, time: "Hôm qua" },
    { type: "register_lot", description: "Đăng ký bãi xe mới", location: "Bãi xe Cafe ABC", points: 50, time: "3 ngày trước" },
    { type: "reward_redemption", description: "Đổi voucher Grab", location: "", points: -100, time: "1 tuần trước" },
  ];

  return (
    <div className="flex-1 bg-white" data-testid="rewards-page">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Điểm thưởng & Tài khoản</h1>
          <p className="text-gray-600 mt-1">Quản lý điểm thưởng và thông tin cá nhân</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile & Points */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 text-white" data-testid="profile-card">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {currentUser.initials}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold" data-testid="user-name">{currentUser.name}</h2>
                  <p className="opacity-90" data-testid="user-email">{currentUser.email}</p>
                  <p className="text-sm opacity-75">Thành viên từ {currentUser.joinDate}</p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-sm opacity-75">Điểm hiện có</p>
                  <p className="text-2xl font-bold" data-testid="current-points">{currentUser.points.toLocaleString()}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-sm opacity-75">Hạng thành viên</p>
                  <p className="text-lg font-semibold capitalize" data-testid="member-tier">{tierInfo.current}</p>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <Card data-testid="activities-card">
              <CardHeader>
                <CardTitle>Lịch sử đóng góp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0" data-testid={`activity-${index}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.points > 0 ? "bg-success-100" : "bg-danger-100"
                        }`}>
                          {activity.points > 0 ? (
                            <Plus className={`${activity.points > 0 ? "text-success" : "text-danger"} text-xs`} />
                          ) : (
                            <Minus className="text-danger text-xs" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {activity.location ? `${activity.location} - ${activity.time}` : activity.time}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${activity.points > 0 ? "text-success" : "text-danger"}`}>
                        {activity.points > 0 ? "+" : ""}{activity.points}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile */}
            <Card data-testid="profile-form">
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                      <Input 
                        defaultValue={currentUser.name}
                        data-testid="profile-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                      <Input 
                        type="tel"
                        defaultValue={currentUser.phone}
                        data-testid="profile-phone-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input 
                      type="email"
                      defaultValue={currentUser.email}
                      data-testid="profile-email-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phương tiện chính</label>
                    <Select defaultValue={currentUser.vehicleType}>
                      <SelectTrigger data-testid="vehicle-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motorcycle">Xe máy</SelectItem>
                        <SelectItem value="car">Ô tô</SelectItem>
                        <SelectItem value="both">Cả hai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button data-testid="update-profile-button">
                    Cập nhật thông tin
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Rewards Sidebar */}
          <div className="space-y-6">
            {/* Available Rewards */}
            <Card data-testid="rewards-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="mr-2 h-5 w-5" />
                  Đổi điểm thưởng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(rewards as Reward[]).map((reward: Reward) => (
                    <div key={reward.id} className="border border-gray-200 rounded-lg p-3" data-testid={`reward-${reward.id}`}>
                      <div className="flex items-center space-x-3 mb-2">
                        {getRewardIcon(reward.category)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{reward.name}</p>
                          <p className="text-xs text-gray-500">{reward.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">{reward.pointsCost} điểm</span>
                        <Button
                          size="sm"
                          disabled={currentUser.points < reward.pointsCost || redeemRewardMutation.isPending}
                          onClick={() => handleRedeemReward(reward)}
                          data-testid={`redeem-${reward.id}`}
                        >
                          {currentUser.points < reward.pointsCost ? "Chưa đủ điểm" : "Đổi"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Points Guide */}
            <Card data-testid="points-guide">
              <CardHeader>
                <CardTitle>Cách kiếm điểm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cập nhật tình trạng bãi xe</span>
                    <span className="text-success font-medium">+10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Đánh giá bãi xe</span>
                    <span className="text-success font-medium">+5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Đăng ký bãi xe mới</span>
                    <span className="text-success font-medium">+50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Báo cáo chính xác</span>
                    <span className="text-success font-medium">+20</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Tiers */}
            <Card data-testid="member-tiers">
              <CardHeader>
                <CardTitle>Hạng thành viên</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${tierInfo.current === "bronze" ? "bg-gray-50 p-2 rounded" : ""}`}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className={`text-sm ${tierInfo.current === "bronze" ? "font-medium text-gray-900" : "text-gray-600"}`}>Đồng</span>
                    </div>
                    <span className="text-xs text-gray-500">0-499 điểm</span>
                  </div>
                  <div className={`flex items-center justify-between ${tierInfo.current === "silver" ? "bg-gray-50 p-2 rounded" : ""}`}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className={`text-sm ${tierInfo.current === "silver" ? "font-medium text-gray-900" : "text-gray-600"}`}>Bạc</span>
                    </div>
                    <span className="text-xs text-gray-500">500-1499 điểm</span>
                  </div>
                  <div className={`flex items-center justify-between ${tierInfo.current === "gold" ? "bg-gray-50 p-2 rounded" : ""}`}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <span className={`text-sm ${tierInfo.current === "gold" ? "font-medium text-gray-900" : "text-gray-600"}`}>Vàng</span>
                    </div>
                    <span className="text-xs text-gray-500">1500+ điểm</span>
                  </div>
                </div>
                
                {tierInfo.nextTier && (
                  <>
                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${tierInfo.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1" data-testid="tier-progress">
                      {tierInfo.pointsNeeded} điểm nữa để lên hạng {tierInfo.nextTier}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
