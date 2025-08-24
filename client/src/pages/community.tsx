import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, TrendingUp, Flag, HelpCircle, Plus, Circle } from "lucide-react";
import type { CommunityUpdate, ParkingLot, InsertCommunityUpdate } from "@shared/schema";

export default function Community() {
  const [selectedLotId, setSelectedLotId] = useState<string>("");
  const [updateComment, setUpdateComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: parkingLots = [] } = useQuery({
    queryKey: ["/api/parking-lots"],
  });

  const { data: communityUpdates = [], isLoading } = useQuery({
    queryKey: ["/api/community-updates"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const submitUpdateMutation = useMutation({
    mutationFn: async (data: InsertCommunityUpdate) => {
      const response = await apiRequest("POST", "/api/community-updates", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cảm ơn bạn!",
        description: "Cập nhật đã được gửi thành công. Bạn nhận được 10 điểm thưởng!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/community-updates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parking-lots"] });
      setSelectedLotId("");
      setUpdateComment("");
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể gửi cập nhật. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (status: "available" | "full") => {
    if (!selectedLotId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn bãi xe trước khi cập nhật.",
        variant: "destructive",
      });
      return;
    }

    const updateData: InsertCommunityUpdate = {
      parkingLotId: selectedLotId,
      userId: "demo-user", // In real app, get from auth
      status,
      comment: updateComment.trim() || undefined,
    };

    submitUpdateMutation.mutate(updateData);
  };

  const getUpdateStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-success hover:bg-success text-white">
            <Circle className="w-2 h-2 mr-1 fill-current" />
            Còn chỗ
          </Badge>
        );
      case "full":
        return (
          <Badge variant="destructive">
            <Circle className="w-2 h-2 mr-1 fill-current" />
            Hết chỗ
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Circle className="w-2 h-2 mr-1 fill-current" />
            {status}
          </Badge>
        );
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const mockTopContributors = [
    { name: "Minh Tuấn", points: 450, rank: 1 },
    { name: "Thu Linh", points: 380, rank: 2 },
    { name: "Hải Nam", points: 320, rank: 3 },
  ];

  const mockStats = {
    todayUpdates: (communityUpdates as CommunityUpdate[]).length,
    activeMembers: 1234,
    registeredLots: (parkingLots as ParkingLot[]).length,
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải cập nhật cộng đồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white" data-testid="community-page">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cộng đồng</h1>
          <p className="text-gray-600 mt-1">Cập nhật và chia sẻ thông tin bãi xe với mọi người</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Updates Feed */}
          <div className="lg:col-span-2">
            {/* Quick Update */}
            <Card className="mb-6" data-testid="quick-update-card">
              <CardHeader>
                <CardTitle>Cập nhật nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={selectedLotId} onValueChange={setSelectedLotId}>
                  <SelectTrigger data-testid="lot-select">
                    <SelectValue placeholder="Chọn bãi xe để cập nhật" />
                  </SelectTrigger>
                  <SelectContent>
                    {(parkingLots as ParkingLot[]).map((lot: ParkingLot) => (
                      <SelectItem key={lot.id} value={lot.id}>
                        {lot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleStatusUpdate("available")}
                    className="bg-success hover:bg-success/90 text-white"
                    disabled={submitUpdateMutation.isPending}
                    data-testid="available-button"
                  >
                    <Circle className="mr-2 h-4 w-4 fill-current" />
                    Còn chỗ
                  </Button>
                  <Button 
                    onClick={() => handleStatusUpdate("full")}
                    variant="destructive"
                    disabled={submitUpdateMutation.isPending}
                    data-testid="full-button"
                  >
                    <Circle className="mr-2 h-4 w-4 fill-current" />
                    Hết chỗ
                  </Button>
                </div>
                
                <Textarea 
                  placeholder="Thêm ghi chú (tùy chọn)"
                  rows={2}
                  value={updateComment}
                  onChange={(e) => setUpdateComment(e.target.value)}
                  data-testid="comment-textarea"
                />
                
                <Button 
                  className="w-full" 
                  disabled={!selectedLotId || submitUpdateMutation.isPending}
                  onClick={() => {
                    if (selectedLotId) {
                      handleStatusUpdate("available"); // Default to available, user will click specific button
                    }
                  }}
                  data-testid="submit-update-button"
                >
                  {submitUpdateMutation.isPending ? "Đang gửi..." : "Gửi cập nhật"}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Updates */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Cập nhật gần đây</h2>
              
              {(communityUpdates as CommunityUpdate[]).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Chưa có cập nhật nào từ cộng đồng</p>
                    <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên chia sẻ thông tin!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4" data-testid="updates-feed">
                  {(communityUpdates as CommunityUpdate[]).map((update: CommunityUpdate) => {
                    const lot = (parkingLots as ParkingLot[]).find((l: ParkingLot) => l.id === update.parkingLotId);
                    return (
                      <Card key={update.id} data-testid={`update-${update.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {update.userId.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">Người dùng</span>
                                <span className="text-sm text-gray-500">
                                  {update.createdAt ? formatTimeAgo(new Date(update.createdAt)) : "Vừa xong"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">
                                Cập nhật tình trạng cho <strong>{lot?.name || "Bãi xe"}</strong>
                              </p>
                              <div className="flex items-center space-x-3">
                                {getUpdateStatusBadge(update.status)}
                                <span className="text-xs text-gray-500">
                                  +{update.pointsEarned} điểm
                                </span>
                              </div>
                              {update.comment && (
                                <p className="text-xs text-gray-600 mt-1 italic">
                                  "{update.comment}"
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Contributors */}
            <Card data-testid="top-contributors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Top đóng góp tuần này
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTopContributors.map((contributor) => (
                    <div key={contributor.rank} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                        contributor.rank === 1 ? "bg-warning" : 
                        contributor.rank === 2 ? "bg-gray-400" : "bg-orange-500"
                      }`}>
                        {contributor.rank}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{contributor.name}</p>
                        <p className="text-xs text-gray-500">{contributor.points} điểm</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card data-testid="community-stats">
              <CardHeader>
                <CardTitle>Thống kê cộng đồng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cập nhật hôm nay</span>
                    <span className="text-sm font-medium text-gray-900" data-testid="today-updates">
                      {mockStats.todayUpdates}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Thành viên hoạt động</span>
                    <span className="text-sm font-medium text-gray-900" data-testid="active-members">
                      {mockStats.activeMembers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bãi xe được đăng ký</span>
                    <span className="text-sm font-medium text-gray-900" data-testid="registered-lots">
                      {mockStats.registeredLots}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card data-testid="quick-actions">
              <CardHeader>
                <CardTitle>Hành động nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left p-3 h-auto"
                    onClick={() => window.location.href = "/register-lot"}
                    data-testid="action-register-lot"
                  >
                    <Plus className="mr-2 h-4 w-4 text-primary" />
                    Đăng ký bãi xe mới
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left p-3 h-auto"
                    data-testid="action-report-issue"
                  >
                    <Flag className="mr-2 h-4 w-4 text-warning" />
                    Báo cáo vấn đề
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left p-3 h-auto"
                    data-testid="action-help"
                  >
                    <HelpCircle className="mr-2 h-4 w-4 text-primary" />
                    Hướng dẫn sử dụng
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
