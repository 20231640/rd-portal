import { useState, useEffect } from "react";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { StatisticsTabs } from "../components/ui/StatisticsTabs";
import { OverviewStats } from "./stats/OverviewStats";
import { GeographyStats } from "./stats/GeographyStats";
import { KitsStats } from "./stats/KitsStats";
import { SchoolsStats } from "./stats/SchoolsStats";
import { ProblemsStats } from "./stats/ProblemsStats";
import { API_URL } from "../config/api";

export default function AdminStatistics() {
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [kitRequests, setKitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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
    selectedDistrict,
    districts: [...new Set(schools.map(s => s.region || "Não Definido"))].sort(),
    onDistrictChange: setSelectedDistrict
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
        <div className="p-6 text-center text-destructive">
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
       <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full flex items-center justify-center">
         <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
           <p className="text-muted-foreground">A carregar estatísticas...</p>
         </div>
       </div>
     </div>
   );
  
    return (
     <div className="flex min-h-screen bg-background">
       <div className="hidden sm:block">
         <AdminSidebar />
       </div>
       <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Estatísticas do Projeto</h1>
            <div className="text-sm text-muted-foreground">
              Dados atualizados em tempo real
            </div>
          </div>
 
         {/* Navegação por Tabs */} 
         <div className="overflow-x-auto">
           <StatisticsTabs activeTab={activeTab} onTabChange={setActiveTab} />
         </div>
 
         {/* Conteúdo da Tab Ativa */} 
         <div className="min-h-[600px]">
           {renderActiveTab()}
         </div>
 
       </div>
     </div>
   );
}