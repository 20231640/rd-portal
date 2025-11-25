import { 
  Users, 
  GraduationCap, 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Package,
  Menu
} from "lucide-react";
import { Button } from "./button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: "perfil", path: "/teacher-dashboard", label: "Meu Perfil", icon: User },
    { id: "formacoes", path: "/trainings", label: "Formações", icon: GraduationCap },
    { id: "turmas", path: "/classes", label: "Turmas", icon: Users },
    { id: "kits", path: "/kits", label: "Kits Pedagógicos", icon: Package },
    { id: "feedback", path: "/feedback", label: "Feedback & Relatórios", icon: FileText },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fechar sidebar mobile ao clicar em um item
  useEffect(() => {
    if (isMobileOpen) {
      const handleClickOutside = () => {
        setIsMobileOpen(false);
      };
      
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileOpen]);

  const getActivePage = () => {
    const currentPath = location.pathname;
    const item = menuItems.find(item => item.path === currentPath);
    return item ? item.id : "perfil";
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInTeacher");
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false); // Fecha sidebar mobile após navegação
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative h-screen flex flex-col z-50
        bg-card border-r border-border
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-foreground">Professor</h1>
          )}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="hidden lg:flex"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = getActivePage() === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
                  onClick={() => handleNavigation(item.path)}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="w-4 h-4" />
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Footer com tema e logout */}
        <div className="p-2 border-t border-border space-y-1">
          {/* Toggle do Tema */}
          <Button
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
            onClick={toggleTheme}
            title={isCollapsed ? (theme === "dark" ? "Modo Claro" : "Modo Escuro") : ''}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            {!isCollapsed && (
              <span className="ml-3">
                {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
              </span>
            )}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            className={`w-full justify-start text-destructive hover:text-destructive ${isCollapsed ? 'px-2' : 'px-3'}`}
            onClick={handleLogout}
            title={isCollapsed ? "Terminar Sessão" : ''}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="ml-3">Terminar Sessão</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-card border border-border"
      >
        <Menu className="w-5 h-5" />
      </Button>
    </>
  );
}