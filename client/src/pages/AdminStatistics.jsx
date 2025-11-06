import { useState, useEffect } from "react";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { StatisticsTabs } from "../components/ui/StatisticsTabs";
import { OverviewStats } from "./stats/OverviewStats";
import { GeographyStats } from "./stats/GeographyStats";
import { KitsStats } from "./stats/KitsStats";
import { SchoolsStats } from "./stats/SchoolsStats";
import { ProblemsStats } from "./stats/ProblemsStats";

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
          fetch("http://localhost:4000/api/auth/schools"),
          fetch("http://localhost:4000/api/auth/teachers"),
          fetch("http://localhost:4000/api/classes"),
          fetch("http://localhost:4000/api/kits/requests")
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

  if (loading) return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar estatísticas...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Estatísticas do Projeto</h1>
          <div className="text-sm text-muted-foreground">
            Dados atualizados em tempo real
          </div>
        </div>

        {/* Navegação por Tabs */}
        <StatisticsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Conteúdo da Tab Ativa */}
        <div className="min-h-[600px]">
          {activeTab === 'overview' && <OverviewStats {...statsData} />}
          {activeTab === 'geography' && <GeographyStats {...statsData} />}
          {activeTab === 'kits' && <KitsStats {...statsData} />}
          {activeTab === 'schools' && <SchoolsStats {...statsData} />}
          {activeTab === 'problems' && <ProblemsStats {...statsData} />}
        </div>

      </div>
    </div>
  );
}
