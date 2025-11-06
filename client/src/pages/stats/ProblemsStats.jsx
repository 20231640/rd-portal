import { Card } from "../../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import { 
  AlertCircle, CheckCircle, Clock, TrendingUp, Package, Users,
  Zap, AlertTriangle, Flag
} from "lucide-react";

export function ProblemsStats({ kitRequests, schools, classes, teachers }) {
  
  // DEBUG: Verificar dados recebidos
  console.log("ProblemsStats - Dados recebidos:", {
    kitRequests: kitRequests?.length,
    schools: schools?.length,
    classes: classes?.length,
    teachers: teachers?.length
  });

  // Coletar todos os reports - com verificação de segurança
  const allReports = kitRequests?.flatMap(kit => {
    const kitReports = kit.reports || [];
    return kitReports.map(report => {
      const classInfo = classes?.find(c => c.id === kit.classId);
      const schoolInfo = schools?.find(s => s.id === classInfo?.schoolId);
      
      return {
        ...report,
        kitId: kit.id,
        kitType: kit.kitType || 'Não especificado',
        schoolName: schoolInfo?.name || 'Escola não encontrada',
        region: schoolInfo?.region || 'Região não definida',
        className: classInfo?.name || 'Turma não encontrada'
      };
    });
  }) || [];

  console.log("ProblemsStats - Reports encontrados:", allReports.length);

  // Estatísticas gerais de problemas
  const problemStats = {
    total: allReports.length,
    resolved: allReports.filter(r => r.resolved).length,
    pending: allReports.filter(r => !r.resolved).length,
    kitsWithProblems: kitRequests?.filter(k => k.reports && k.reports.length > 0).length || 0,
    resolutionRate: allReports.length > 0 ? (allReports.filter(r => r.resolved).length / allReports.length) * 100 : 0
  };

  // Problemas por tipo (categorizar pela mensagem)
  const categorizeProblem = (message) => {
    if (!message) return 'Outro';
    
    const msg = message.toLowerCase();
    if (msg.includes('falta') || msg.includes('em falta')) return 'Peças em Falta';
    if (msg.includes('danific') || msg.includes('partido') || msg.includes('quebrado')) return 'Material Danificado';
    if (msg.includes('errado') || msg.includes('incorreto') || msg.includes('errada')) return 'Itens Incorretos';
    if (msg.includes('qualidade') || msg.includes('má qualidade')) return 'Problema de Qualidade';
    if (msg.includes('entrega') || msg.includes('entregue')) return 'Problema de Entrega';
    return 'Outro';
  };

  const problemsByType = Object.entries(
    allReports.reduce((acc, report) => {
      const type = categorizeProblem(report.message);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Problemas por região
  const problemsByRegion = Object.entries(
    allReports.reduce((acc, report) => {
      acc[report.region] = (acc[report.region] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value);

  // Evolução temporal de problemas
  const problemsTimeline = allReports.reduce((acc, report) => {
    try {
      const date = new Date(report.createdAt);
      const monthKey = date.toLocaleString('pt-PT', { month: 'short', year: '2-digit' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { 
          month: monthKey, 
          reported: 0, 
          resolved: 0,
          timestamp: date
        };
      }
      
      acc[monthKey].reported += 1;
      if (report.resolved) {
        acc[monthKey].resolved += 1;
      }
    } catch (error) {
      console.error("Erro ao processar data do report:", error);
    }
    return acc;
  }, {});

  const timelineData = Object.values(problemsTimeline)
    .sort((a, b) => a.timestamp - b.timestamp);

  // Escolas com mais problemas
  const schoolsWithProblems = Object.entries(
    allReports.reduce((acc, report) => {
      acc[report.schoolName] = (acc[report.schoolName] || 0) + 1;
      return acc;
    }, {})
  )
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 8);

  // Calcular tempo médio de resolução
  const calculateAvgResolutionTime = () => {
    const resolvedReports = allReports.filter(r => r.resolved && r.resolvedAt && r.createdAt);
    if (resolvedReports.length === 0) return 0;
    
    const totalTime = resolvedReports.reduce((sum, report) => {
      try {
        const created = new Date(report.createdAt);
        const resolved = new Date(report.resolvedAt);
        return sum + (resolved - created);
      } catch (error) {
        console.error("Erro ao calcular tempo de resolução:", error);
        return sum;
      }
    }, 0);
    
    return Math.round(totalTime / resolvedReports.length / (1000 * 60 * 60 * 24)); // Dias
  };

  const avgResolutionTime = calculateAvgResolutionTime();

  // Se não há dados de problemas
  if (allReports.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Sem Problemas Reportados</h3>
          <p className="text-muted-foreground">
            Não foram encontrados problemas reportados nos kits.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{problemStats.total}</div>
          <div className="text-sm text-muted-foreground">Problemas Reportados</div>
        </Card>
        
        <Card className="p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{problemStats.resolved}</div>
          <div className="text-sm text-muted-foreground">Resolvidos</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{problemStats.pending}</div>
          <div className="text-sm text-muted-foreground">Pendentes</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Package className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{problemStats.kitsWithProblems}</div>
          <div className="text-sm text-muted-foreground">Kits com Problemas</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problemas por Tipo */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Problemas por Tipo</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={problemsByType} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} problemas`, 'Quantidade']} />
              <Bar dataKey="value" name="Problemas" fill="#f59e0b">
                {problemsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Taxa de Resolução */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Status de Resolução</h3>
          </div>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {problemStats.resolutionRate.toFixed(1)}%
              </div>
              <div className="text-lg text-muted-foreground">Taxa de Resolução</div>
              <div className="text-sm text-muted-foreground mt-2">
                {problemStats.resolved} de {problemStats.total} problemas
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{problemStats.resolved}</div>
              <div className="text-sm text-green-700">Resolvidos</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">{problemStats.pending}</div>
              <div className="text-sm text-red-700">Pendentes</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Evolução Temporal */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Evolução de Problemas</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="reported" 
              name="Problemas Reportados" 
              stroke="#ef4444" 
              fill="#ef4444" 
              fillOpacity={0.3}
            />
            <Area 
              type="monotone" 
              dataKey="resolved" 
              name="Problemas Resolvidos" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Escolas com Mais Problemas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold">Escolas com Mais Problemas</h3>
          </div>
          <div className="space-y-3">
            {schoolsWithProblems.map((school, index) => (
              <div key={school.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="font-medium truncate max-w-[200px]">{school.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">{school.value}</div>
                  <div className="text-xs text-muted-foreground">problemas</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Métricas de Performance */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Métricas de Resolução</h3>
          </div>
          <div className="space-y-4">
            <div className="text-center p-4 border rounded-lg">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-xl font-bold">{avgResolutionTime} dias</div>
              <div className="text-sm text-muted-foreground">Tempo Médio de Resolução</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {kitRequests?.length > 0 ? ((problemStats.kitsWithProblems / kitRequests.length) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-blue-700">Kits com Problemas</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {problemStats.resolutionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">Eficiência</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}