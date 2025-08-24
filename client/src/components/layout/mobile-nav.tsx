import { Link, useLocation } from "wouter";
import { Home, Search, PlusCircle, Users, Gift } from "lucide-react";

const navItems = [
  { path: "/", label: "Trang chủ", icon: Home },
  { path: "/search", label: "Tìm kiếm", icon: Search },
  { path: "/register-lot", label: "Đăng ký", icon: PlusCircle },
  { path: "/community", label: "Cộng đồng", icon: Users },
  { path: "/rewards", label: "Thưởng", icon: Gift },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50" data-testid="mobile-nav">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex flex-col items-center justify-center space-y-1 h-full ${
                isActive ? "text-primary" : "text-gray-400"
              }`}
              data-testid={`mobile-nav-${item.path.replace("/", "") || "home"}`}>
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
