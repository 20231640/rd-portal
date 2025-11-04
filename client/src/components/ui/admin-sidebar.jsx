import { 
  LogOut, 
  Home, 
  Moon, 
  Sun, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  Package,
  FileText,
  BookOpen,
  Download
} from "lucide-react";
import { Button } from "./button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 🔧 MENU ITEMS SIMPLIFICADO - apenas funcionalidades adicionais
  const menuItems = [
    { id: "dashboard", path: "/admin", label: "Dashboard Principal", icon: Home },
    { id: "formacoes", path: "/admin/trainings", label: "Sessões de Formação", icon: BookOpen },
    { id: "kits", path: "/admin/kits", label: "Kits Pedagógicos", icon: Package },
    { id: "feedback", path: "/admin/feedback", label: "Feedback & Relatórios", icon: FileText },
    { id: "estatisticas", path: "/admin/stats", label: "Estatísticas Detalhadas", icon: BarChart3 },
    { id: "exportar", path: "/admin/export", label: "Exportar Dados", icon: Download },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const getActivePage = () => {
    const currentPath = location.pathname;
    const item = menuItems.find(item => item.path === currentPath);
    return item ? item.id : "dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInAdmin");
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`
      relative h-screen flex flex-col
      bg-card border-r border-border
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      
      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-foreground">Administrador</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
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
                onClick={() => navigate(item.path)}
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
    <div className="border-t border-sidebar-border space-y-2"></div>
    </div>
  );
}