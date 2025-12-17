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
        municipality: schoolInfo?.municipality || 'Município não definido', // MUDADO: region → municipality
        className: classInfo?.name || 'Turma não encontrada'
      };
    });
  }) || [];

  // Estatísticas gerais de problemas
  const problemStats = {
    total: allReports.length,
    resolved: allReports.filter(r => r.resolved).length,
    pending: allReports.filter(r => !r.resolved).length,
    kitsWithProblems: kitRequests?.filter(k => k.reports && k.reports.length > 0).length || 0,
    resolutionRate: allReports.length > 0 ? (allReports.filter(r => r.resolved).length / allReports.length) * 100 : 0
  };

  // Problemas por tipo
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

  // Problemas por município
  const problemsByMunicipality = Object.entries( // MUDADO
    allReports.reduce((acc, report) => {
      acc[report.municipality] = (acc[report.municipality] || 0) + 1; // MUDADO
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
    
    return Math.round(totalTime / resolvedReports.length / (1000 * 60 * 60 * 24));
  };

  const avgResolutionTime = calculateAvgResolutionTime();

  // Se não há dados de problemas
  if (allReports.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="p-6 sm:p-8 text-center">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Sem Problemas Reportados</h3>
          <p className="text-muted-foreground text-sm sm:text-base">
            Não foram encontrados problemas reportados nos kits.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Cards de Resumo - RESPONSIVOS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4 text-center">
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-xl font-bold">{problemStats.total}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Problemas Reportados</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-xl font-bold">{problemStats.resolved}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Resolvidos</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-xl font-bold">{problemStats.pending}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Pendentes</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-xl font-bold">{problemStats.kitsWithProblems}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Kits com Problemas</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Problemas por Tipo - RESPONSIVO */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold break-words">Problemas por Tipo</h3>
          </div>
          <div className="w-full overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <ResponsiveContainer width="100%" minHeight={250} height={300} className="text-xs">
              <BarChart data={problemsByType} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  interval={0}
                  fontSize={11}
                />
                <YAxis fontSize={11} />
                <Tooltip formatter={(value) => [`${value} problemas`, 'Quantidade']} />
                <Bar dataKey="value" name="Problemas" fill="#f59e0b">
                  {problemsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Taxa de Resolução - RESPONSIVO */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold break-words">Status de Resolução</h3>
          </div>
          <div className="flex items-center justify-center h-40 sm:h-48">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[hsl(76,49%,52%)] mb-1 sm:mb-2">
                {problemStats.resolutionRate.toFixed(1)}%
              </div>
              <div className="text-sm sm:text-lg text-muted-foreground">Taxa de Resolução</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                {problemStats.resolved} de {problemStats.total} problemas resolvidos
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
            <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-[hsl(76,49%,52%)]">{problemStats.resolved}</div>
              <div className="text-xs sm:text-sm text-green-700">Resolvidos</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-[hsl(327,83%,50%)]">{problemStats.pending}</div>
              <div className="text-xs sm:text-sm text-red-700">Pendentes</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Evolução Temporal - RESPONSIVO */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold break-words">Evolução de Problemas</h3>
        </div>
        <div className="w-full overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <ResponsiveContainer width="100%" minHeight={250} height={300} className="text-xs">
            <AreaChart data={timelineData} margin={{ top: 20, right: 10, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={50}
                interval={0}
                fontSize={11}
              />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend 
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '10px'
                }}
              />
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
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Escolas com Mais Problemas - RESPONSIVO */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold break-words">Escolas com Mais Problemas</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {schoolsWithProblems.map((school, index) => (
              <div key={school.name} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 text-[hsl(327,83%,50%)] rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="font-medium text-sm sm:text-base truncate max-w-full">{school.name}</div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-bold text-base sm:text-lg text-[hsl(327,83%,50%)]">{school.value}</div>
                  <div className="text-xs text-muted-foreground">problemas</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Métricas de Performance - RESPONSIVO */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold break-words">Métricas de Resolução</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center p-3 sm:p-4 border rounded-lg">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-xl font-bold">{avgResolutionTime} dias</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Tempo Médio de Resolução</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                <div className="text-base sm:text-lg font-bold text-[hsl(283,45%,33%)]">
                  {kitRequests?.length > 0 ? ((problemStats.kitsWithProblems / kitRequests.length) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs sm:text-sm text-blue-700">Kits com Problemas</div>
              </div>
              
              <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                <div className="text-base sm:text-lg font-bold text-[hsl(76,49%,52%)]">
                  {problemStats.resolutionRate.toFixed(1)}%
                </div>
                <div className="text-xs sm:text-sm text-green-700">Eficiência</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}