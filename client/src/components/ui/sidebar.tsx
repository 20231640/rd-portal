import { Users, BookOpen, GraduationCap, User, LogOut, Home, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
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

  const menuItems = [
    { id: "perfil", path: "/teacher-dashboard", label: "Meu Perfil", icon: User },
    { id: "visao-geral", path: "/overview", label: "Visão Geral", icon: Home },
    { id: "turmas", path: "/classes", label: "Turmas", icon: Users },
    { id: "formacoes", path: "/trainings", label: "Formações", icon: GraduationCap },
    { id: "kits", path: "/kits", label: "Kits Pedagógicos", icon: BookOpen },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

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
          <h1 className="text-xl font-bold text-foreground">Professor</h1>
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
  );
}