import { Link, useLocation } from "wouter";
import { Home, Search, PlusCircle, Users, Gift } from "lucide-react";
import parkingHubLogo from "@assets/parking-hub-logo.png";

interface SidebarProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    initials: string;
    points: number;
    tier: string;
  };
}

const navItems = [
  { path: "/", label: "Trang chủ", icon: Home },
  { path: "/search", label: "Tìm kiếm", icon: Search },
  { path: "/register-lot", label: "Đăng ký bãi xe", icon: PlusCircle },
  { path: "/community", label: "Cộng đồng", icon: Users },
  { path: "/rewards", label: "Điểm thưởng", icon: Gift },
];

export default function Sidebar({ currentUser }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200" data-testid="sidebar">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src={parkingHubLogo} 
            alt="Parking Hub Logo" 
            className="w-8 h-8" 
            data-testid="logo-icon" 
          />
          <h1 className="text-xl font-bold text-gray-900" data-testid="app-title">Parking Hub</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Tìm bãi giữ xe TP.HCM</p>
      </div>
      
      <nav className="flex-1 p-4" data-testid="sidebar-nav">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-primary text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  data-testid={`nav-${item.path.replace("/", "") || "home"}`}>
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200" data-testid="user-profile">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold" data-testid="user-avatar">
            <span>{currentUser.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate" data-testid="user-name">{currentUser.name}</p>
            <p className="text-xs text-primary" data-testid="user-points">{currentUser.points.toLocaleString()} điểm</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
