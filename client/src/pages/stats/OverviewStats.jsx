import { Card } from "../../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart
} from "recharts";
import { 
  School, Users, Package, TrendingUp, AlertCircle, CheckCircle 
} from "lucide-react";

export function OverviewStats({ metrics, monthlyData, kitRequests, classes, schools }) {
  
  // --- NOVO: cálculo de retenção / desistência de escolas por mês ---
  const parseDateSafe = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };

  // montar months desde Jan/2025 até último createdAt de classes
  const classDates = classes.map(c => parseDateSafe(c.createdAt)).filter(Boolean);
  const lastDate = classDates.length ? new Date(Math.max(...classDates.map(d => d.getTime()))) : new Date();
  const startDate = new Date(2025, 0, 1);
  const months = [];
  for (let dt = new Date(startDate); dt <= new Date(lastDate.getFullYear(), lastDate.getMonth(), 1); dt.setMonth(dt.getMonth() + 1)) {
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    months.push({ key: `${y}-${String(m).padStart(2,'0')}`, label: `${String(m).padStart(2,'0')}/${y}`, ts: new Date(y, m - 1, 1) });
  }
  
  // Filtrar apenas meses do ano letivo (setembro..junho)
  const isAcademicMonth = (monthNumber) => {
    // monthNumber 1..12
    return monthNumber >= 9 || monthNumber <= 6;
  };
  const academicMonths = months.filter(m => {
    const monthNum = Number(m.label.split('/')[0]);
    return isAcademicMonth(monthNum);
  });

  // map schoolId -> set of monthKeys where it had at least one class created
  const schoolMonths = {};
  classes.forEach(c => {
    const d = parseDateSafe(c.createdAt);
    if (!d || !c.schoolId) return;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    schoolMonths[c.schoolId] = schoolMonths[c.schoolId] || new Set();
    schoolMonths[c.schoolId].add(key);
  });

  // construir série: for each month compute new, continuing, dropped, active
  // usar academicMonths para cálculo (mês anterior = mês académico anterior)
  const schoolRetentionTimeline = academicMonths.map((m, idx) => {
    const prevKey = idx > 0 ? academicMonths[idx-1].key : null;
    const curKey = m.key;
    let newCount = 0;
    let continuing = 0;
    let dropped = 0;
    let active = 0;

    // for each school decide membership
    Object.keys(schoolMonths).forEach(sid => {
      const set = schoolMonths[sid];
      const hasPrev = prevKey ? set.has(prevKey) : false;
      const hasCur = set.has(curKey);
      if (hasCur) active += 1;
      if (hasCur && ![...set].some(k => k < curKey)) {
        // first recorded month for this school is curKey => new
        // Simpler: check if no month in set is strictly before curKey
        const earlier = [...set].some(k => k < curKey);
        if (!earlier) newCount += 1;
      }
      if (hasCur && hasPrev) continuing += 1;
      if (!hasCur && hasPrev) dropped += 1;
    });

    return {
      month: m.label,
      newSchools: newCount,
      continuing,
      dropped,
      active
    };
  });

  // usa schoolMonths (map construído anteriormente: schoolId -> Set(monthKey))
  const monthsToCheck = Math.min(6, academicMonths.length);
  const lastMonths = academicMonths.slice(-monthsToCheck);

  const persistentSchools = schools
    .filter(s => {
      const set = schoolMonths[s.id] || new Set();
      // escola é persistente se tiver pelo menos uma turma em todos os últimos meses académicos
      return lastMonths.every(m => set.has(m.key));
    })
    .map(s => ({ id: s.id, name: s.name }));

  
  // Dados para gráfico de status dos kits
  const kitStatusData = [
    { name: 'Entregues', value: kitRequests.filter(k => k.status === 'delivered').length, color: '#10b981' },
    { name: 'Enviados', value: kitRequests.filter(k => k.status === 'shipped').length, color: '#3b82f6' },
    { name: 'Aprovados', value: kitRequests.filter(k => k.status === 'approved').length, color: '#f59e0b' },
    { name: 'Pendentes', value: kitRequests.filter(k => k.status === 'pending').length, color: '#ef4444' }
  ];

  // Dados para kits por tipo
  const kitTypeData = Object.entries(
    kitRequests.reduce((acc, kit) => {
      const type = kit.kitType || 'Não especificado';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Cards de Métricas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center">
          <School className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{metrics.schools}</div>
          <div className="text-sm text-muted-foreground">Escolas</div>
        </Card>
        
        <Card className="p-6 text-center">
          <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{metrics.teachers}</div>
          <div className="text-sm text-muted-foreground">Professores</div>
        </Card>
        
        <Card className="p-6 text-center">
          <Package className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{metrics.kitsDelivered}</div>
          <div className="text-sm text-muted-foreground">Kits Entregues</div>
        </Card>
        
        <Card className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{metrics.students}</div>
          <div className="text-sm text-muted-foreground">Alunos Impactados</div>
        </Card>
      </div>

      {/* Gráficos Principais removidos (Evolução Mensal e Status dos Kits) conforme solicitado */}
      {/* Novo: Retenção de Escolas — Novas / Continuam / Desistiram por mês */}
      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-500 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Retenção de Escolas — Novas / Continuam / Desistiram</h3>
            <p className="text-sm text-muted-foreground">
              Vê a atividade das escolas no contexto do ano letivo. Definição: <strong>Ano letivo = Setembro → Junho</strong>.
            </p>
            {/* Legenda funcional explicativa */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#8884d8] rounded-sm inline-block" /> 
                Novas: escolas que registaram a sua primeira turma neste mês académico.
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#3b82f6] rounded-sm inline-block" /> 
                Continuam: escolas que tiveram turma no mês académico anterior e também neste mês.
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#ef4444] rounded-sm inline-block" /> 
                Desistiram: escolas que tinham turma no mês académico anterior e não têm neste mês.
              </div>
            </div>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={schoolRetentionTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey="month" />
             <YAxis />
             <Tooltip />
             <Legend />
             <Bar dataKey="newSchools" name="Novas Escolas" barSize={20} fill="#8884d8" />
             <Line type="monotone" dataKey="continuing" name="Continuam" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
             <Line type="monotone" dataKey="dropped" name="Desistiram" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Taxa de Entrega</span>
          </div>
          <div className="text-2xl font-bold">
            {metrics.kitsRequested > 0 
              ? `${((metrics.kitsDelivered / metrics.kitsRequested) * 100).toFixed(1)}%` 
              : '0%'
            }
          </div>
          <div className="text-sm text-muted-foreground">
            {metrics.kitsDelivered} de {metrics.kitsRequested} kits
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium">Kits Pendentes</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">{metrics.kitsPending}</div>
          <div className="text-sm text-muted-foreground">Por entregar</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <School className="w-5 h-5 text-purple-500" />
            <span className="font-medium">Média por Escola</span>
          </div>
          <div className="text-2xl font-bold">
            {metrics.schools > 0 ? (metrics.classes / metrics.schools).toFixed(1) : '0'}
          </div>
          <div className="text-sm text-muted-foreground">Turmas por escola</div>
        </Card>
      </div>

      {/* Tabela de Escolas Persistentes (novo componente adicionado) */}
      <div className="grid grid-cols-1 gap-4">
        <div className="overflow-hidden rounded-lg border">
          <div className="bg-white p-4">
            <h3 className="text-lg font-semibold mb-2">Escolas Persistentes</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Escolas que tiveram atividade contínua ao longo dos meses.
            </p>
            <Card className="p-4">
              {persistentSchools.length === 0 ? (
                <div className="text-muted-foreground">Nenhuma escola persistente encontrada para o período.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-0">
                    <thead>
                      <tr className="text-left border-b mb-2">
                        <th className="pb-2">Escola</th>
                        <th className="pb-2">Persistente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {persistentSchools.map(s => (
                        <tr key={s.id} className="border-b">
                          <td className="py-2">{s.name}</td>
                          <td className="py-2 text-green-600 font-medium">Sim</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}