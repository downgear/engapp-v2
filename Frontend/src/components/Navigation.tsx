import { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, X, Bell, Check } from "lucide-react";
import lingriserLogo from "@/assets/lingriser-logo.svg";
import flagVn from "@/assets/flag-vn.png";
import flagUk from "@/assets/flag-uk.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/services/api";
import type { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface DropdownItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: DropdownItem[];
}

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build nav items based on user role
  const buildNavItems = (): NavItem[] => {
    const items: NavItem[] = [
      { label: t("nav.home"), href: "/" },
      { label: t("nav.allPrograms"), href: "/inaugural-program" },
    ];

    const userRole = user?.role;

    // Students: Show "Dành Cho Học Sinh", hide "Dành Cho Phụ Huynh"
    // Parents: Show "Dành Cho Phụ Huynh", hide "Dành Cho Học Sinh"
    // Teachers: Hide both
    // Not logged in: Show both (for demo purposes)

    if (!isAuthenticated || userRole === 'student') {
      // Students can see student section
      items.push({
        label: t("nav.forStudents"),
        children: [
          { label: t("nav.aiPractice"), href: "/ai-practice" },
          { label: t("nav.booking"), href: "/booking" },
        ],
      });
    }

    if (!isAuthenticated || userRole === 'parent') {
      // Parents can see parent section
      items.push({
        label: t("nav.forParents"),
        children: [
          { label: t("nav.parentDashboard"), href: "/parent-dashboard" },
        ],
      });
    }

    // Teachers see neither student nor parent sections (only home and program)

    return items;
  };

  const navItems = buildNavItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated || !user?.id) return;
      try {
        const [notifs, countResult] = await Promise.all([
          api.getNotifications(user.id),
          api.getUnreadNotificationCount(user.id),
        ]);
        setNotifications(notifs);
        setUnreadCount(countResult.count);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await api.markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleMobileDropdownToggle = (label: string) => {
    setMobileDropdown(mobileDropdown === label ? null : label);
  };

  const handleMobileLinkClick = () => {
    setMobileOpen(false);
    setMobileDropdown(null);
  };

  // Redirect to appropriate dashboard based on role
  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case 'student':
        return "/student-dashboard";
      case 'parent':
        return "/parent-dashboard";
      case 'teacher':
        return "/teacher-dashboard";
      default:
        return "/dashboard";
    }
  };
  const dashboardHref = getDashboardHref();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-sm border-b border-border/50"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <img 
              src={lingriserLogo} 
              alt="Lingriser" 
              className="h-12 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6" ref={dropdownRef}>
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <>
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-2"
                    >
                      {item.label}
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`} 
                      />
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 py-2 bg-background border border-border/50 rounded-lg shadow-lg min-w-[180px]">
                        {item.children.map((child) => (
                          <a
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setLanguage("en")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                  language === "en"
                    ? "border-primary/30 bg-primary/10 hover:bg-primary/20"
                    : "border-border/50 hover:bg-muted/50"
                }`}
              >
                <img src={flagUk} alt="English" className="w-5 h-3.5 object-cover rounded-sm" />
                <span className={`text-sm font-medium ${language === "en" ? "text-primary" : "text-foreground/70"}`}>EN</span>
              </button>
              <button
                onClick={() => setLanguage("vi")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                  language === "vi"
                    ? "border-primary/30 bg-primary/10 hover:bg-primary/20"
                    : "border-border/50 hover:bg-muted/50"
                }`}
              >
                <img src={flagVn} alt="Tiếng Việt" className="w-5 h-3.5 object-cover rounded-sm" />
                <span className={`text-sm font-medium ${language === "vi" ? "text-primary" : "text-foreground/70"}`}>VI</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              {isLoading ? null : isAuthenticated ? (
                <>
                  {/* Notification Bell */}
                  <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-sm min-w-[18px] h-[18px] flex items-center justify-center px-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                        <h4 className="font-semibold">{language === "vi" ? "Thông báo" : "Notifications"}</h4>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={handleMarkAllAsRead}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {language === "vi" ? "Đọc tất cả" : "Read all"}
                          </Button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            {language === "vi" ? "Không có thông báo nào" : "No notifications"}
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`px-4 py-3 border-b border-border/30 hover:bg-muted/50 cursor-pointer ${
                                !notif.isRead ? "bg-primary/5" : ""
                              }`}
                              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                            >
                              <div className="flex items-start gap-2">
                                {!notif.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                                )}
                                <div className={!notif.isRead ? "" : "pl-4"}>
                                  <p className="font-medium text-sm">{notif.title}</p>
                                  <p className="text-sm text-muted-foreground mt-0.5">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(notif.createdAt), {
                                      addSuffix: true,
                                      locale: vi,
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button variant="ghost" asChild>
                    <a href={dashboardHref}>
                      {user?.fullName || t("nav.parentDashboard")}
                    </a>
                  </Button>
                  <Button variant="outline" onClick={logout}>
                    {language === "vi" ? "Đăng xuất" : "Log Out"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <a href="/login">{t("nav.login")}</a>
                  </Button>
                  <Button asChild>
                    <a href="/register">{t("nav.register")}</a>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile: Language + Menu */}
          <div className="flex items-center gap-2">
            {/* Mobile Language Toggle */}
            <div className="flex sm:hidden items-center gap-1">
              <button
                onClick={() => setLanguage("en")}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-colors ${
                  language === "en"
                    ? "border-primary/30 bg-primary/10"
                    : "border-border/50 hover:bg-muted/50"
                }`}
              >
                <img src={flagUk} alt="EN" className="w-4 h-3 object-cover rounded-sm" />
                <span className={language === "en" ? "text-primary font-medium" : "text-foreground/70"}>EN</span>
              </button>
              <button
                onClick={() => setLanguage("vi")}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-colors ${
                  language === "vi"
                    ? "border-primary/30 bg-primary/10"
                    : "border-border/50 hover:bg-muted/50"
                }`}
              >
                <img src={flagVn} alt="VI" className="w-4 h-3 object-cover rounded-sm" />
                <span className={language === "vi" ? "text-primary font-medium" : "text-foreground/70"}>VI</span>
              </button>
            </div>
            {/* Mobile Menu Button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <img src={lingriserLogo} alt="Lingriser" className="h-10 w-auto" />
                  </div>

                  {/* Mobile Nav Items */}
                  <div className="flex-1 overflow-y-auto py-4">
                    {navItems.map((item) => (
                      <div key={item.label}>
                        {item.children ? (
                          <Collapsible
                            open={mobileDropdown === item.label}
                            onOpenChange={() => handleMobileDropdownToggle(item.label)}
                          >
                            <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-3 text-base font-medium text-foreground hover:bg-muted/50 transition-colors">
                              {item.label}
                              <ChevronDown 
                                className={`w-5 h-5 transition-transform ${
                                  mobileDropdown === item.label ? "rotate-180" : ""
                                }`} 
                              />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="bg-muted/30">
                                {item.children.map((child) => (
                                  <a
                                    key={child.href}
                                    href={child.href}
                                    onClick={handleMobileLinkClick}
                                    className="block px-10 py-3 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
                                  >
                                    {child.label}
                                  </a>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <a
                            href={item.href}
                            onClick={handleMobileLinkClick}
                            className="block px-6 py-3 text-base font-medium text-foreground hover:bg-muted/50 transition-colors"
                          >
                            {item.label}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border/50 p-4 space-y-3">
                    {isLoading ? null : isAuthenticated ? (
                      <>
                        {/* Mobile Notifications */}
                        {notifications.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                {language === "vi" ? "Thông báo" : "Notifications"}
                                {unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs font-bold rounded-sm min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                    {unreadCount}
                                  </span>
                                )}
                              </span>
                              {unreadCount > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-6"
                                  onClick={handleMarkAllAsRead}
                                >
                                  Đọc tất cả
                                </Button>
                              )}
                            </div>
                            <div className="bg-muted/30 rounded-lg max-h-[150px] overflow-y-auto">
                              {notifications.slice(0, 3).map((notif) => (
                                <div
                                  key={notif.id}
                                  className={`p-2 text-sm ${!notif.isRead ? "bg-primary/5" : ""}`}
                                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                >
                                  <p className="font-medium text-xs">{notif.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <Button variant="outline" className="w-full" asChild>
                          <a href={dashboardHref} onClick={handleMobileLinkClick}>
                            {user?.fullName || t("nav.parentDashboard")}
                          </a>
                        </Button>
                        <Button
                          className="w-full"
                          variant="destructive"
                          onClick={() => {
                            logout();
                            handleMobileLinkClick();
                          }}
                        >
                          {language === "vi" ? "Đăng xuất" : "Log Out"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full" asChild>
                          <a href="/login" onClick={handleMobileLinkClick}>
                            {t("nav.login")}
                          </a>
                        </Button>
                        <Button className="w-full" asChild>
                          <a href="/register" onClick={handleMobileLinkClick}>
                            {t("nav.register")}
                          </a>
                        </Button>
                      </>
                    )}
                  </div>

                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};