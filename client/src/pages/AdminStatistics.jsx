import { useState, useEffect } from "react";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { StatisticsTabs } from "../components/ui/StatisticsTabs";
import { OverviewStats } from "./stats/OverviewStats";
import { GeographyStats } from "./stats/GeographyStats";
import { KitsStats } from "./stats/KitsStats";
import { SchoolsStats } from "./stats/SchoolsStats";
import { ProblemsStats } from "./stats/ProblemsStats";
import { API_URL } from "../config/api";
import { Menu } from "lucide-react";
import { Button } from "../components/ui/button";

export default function AdminStatistics() {
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [kitRequests, setKitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMunicipality, setSelectedMunicipality] = useState(""); // MUDADO: district → municipality
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsRes, teachersRes, classesRes, kitsRes] = await Promise.all([
          fetch(`${API_URL}/api/auth/schools`),
          fetch(`${API_URL}/api/auth/teachers`),
          fetch(`${API_URL}/api/classes`),
          fetch(`${API_URL}/api/kits/requests`)
        ]);
        
        const schoolsData = await schoolsRes.json();
        const teachersData = await teachersRes.json();
        const classesData = await classesRes.json();
        const kitsData = await kitsRes.json();
        
        setSchools(schoolsData);
        setTeachers(teachersData);
        setClasses(classesData);
        setKitRequests(kitsData);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ========== CÁLCULOS ==========
  
  // Dados reais para evolução mensal
  const monthlyData = kitRequests.reduce((acc, kit) => {
    const date = new Date(kit.requestedAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthLabel = date.toLocaleString('pt-PT', { month: 'short', year: '2-digit' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { 
        month: monthLabel, 
        kits: 0, 
        schools: new Set(),
        timestamp: date
      };
    }
    
    acc[monthKey].kits += 1;
    const schoolId = classes.find(c => c.id === kit.classId)?.schoolId;
    if (schoolId) acc[monthKey].schools.add(schoolId);
    
    return acc;
  }, {});

  // Ordenar por data e converter para array
  const monthlyChartData = Object.values(monthlyData)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(item => ({
      month: item.month,
      kits: item.kits,
      schools: item.schools.size
    }));

  // Métricas gerais
  const totalMetrics = {
    schools: schools.length,
    teachers: teachers.length,
    classes: classes.length,
    students: classes.reduce((sum, cls) => sum + cls.students, 0),
    kitsRequested: kitRequests.length,
    kitsDelivered: kitRequests.filter(k => k.status === 'delivered').length,
    kitsPending: kitRequests.filter(k => ['pending', 'approved', 'shipped'].includes(k.status)).length,
    problemRate: kitRequests.filter(k => k.reports && k.reports.length > 0).length
  };

  // Dados para passar para os componentes
  const statsData = {
    metrics: totalMetrics,
    monthlyData: monthlyChartData,
    kitRequests,
    classes,
    schools,
    teachers,
    selectedMunicipality, // MUDADO
    municipalities: [...new Set(schools.map(s => s.municipality || "Não Definido"))].sort(), // MUDADO: districts → municipalities
    onMunicipalityChange: setSelectedMunicipality // MUDADO
  };

  // Renderização segura das tabs: evita página em branco se um componente filho lançar
  const renderActiveTab = () => {
    try {
      if (activeTab === 'overview') return <OverviewStats {...statsData} />;
      if (activeTab === 'geography') return <GeographyStats {...statsData} />;
      if (activeTab === 'kits') return <KitsStats {...statsData} />;
      if (activeTab === 'schools') return <SchoolsStats {...statsData} />;
      if (activeTab === 'problems') return <ProblemsStats {...statsData} />;
      return <div>Tab não encontrada</div>;
    } catch (err) {
      console.error("Erro ao renderizar tab de estatísticas:", err);
      return (
        <div className="p-4 sm:p-6 text-center text-destructive text-sm sm:text-base">
          Ocorreu um erro ao carregar as estatísticas. Verifique a consola para detalhes.
        </div>
      );
    }
  };
 
  if (loading) return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden sm:block">
        <AdminSidebar />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-transform duration-300
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:hidden
      `}>
        <AdminSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full flex items-center justify-center">
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-6 sm:hidden absolute top-4 left-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Estatísticas</h1>
          <div className="w-10"></div>
        </div>

        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">A carregar estatísticas...</p>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden sm:block">
        <AdminSidebar />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-transform duration-300
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:hidden
      `}>
        <AdminSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
        {/* Mobile Header */}
        <div className="flex justify-between items-center sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Estatísticas</h1>
          <div className="w-10"></div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Estatísticas do Projeto</h1>
          <div className="text-sm text-muted-foreground">
            Dados atualizados em tempo real
          </div>
        </div>

        {/* Mobile Subtitle */}
        <div className="sm:hidden text-xs text-muted-foreground text-center">
          Dados atualizados em tempo real
        </div>

        {/* Navegação por Tabs - OTIMIZADO PARA MOBILE */} 
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <StatisticsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Conteúdo da Tab Ativa - ALTURA RESPONSIVA */} 
        <div className="min-h-[400px] sm:min-h-[600px]">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}