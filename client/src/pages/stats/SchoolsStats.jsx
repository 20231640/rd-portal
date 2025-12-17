import { Card } from "../../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import { 
  School, Users, Package, Award, MapPin, TrendingUp, Star
} from "lucide-react";
import { useState } from "react";

export function SchoolsStats({ schools, teachers, classes, kitRequests }) {
  
  // Top escolas por kits
  const topSchools = schools.map(school => {
    const schoolClasses = classes.filter(c => c.schoolId === school.id);
    const schoolKits = kitRequests.filter(k => 
      schoolClasses.some(c => c.id === k.classId)
    );
    const schoolTeachers = teachers.filter(t => t.schoolId === school.id);
    
    return {
      id: school.id,
      name: school.name,
      municipality: school.municipality || "Não Definido",
      classes: schoolClasses.length,
      teachers: schoolTeachers.length,
      students: schoolClasses.reduce((sum, cls) => sum + cls.students, 0),
      kits: schoolKits.length,
      kitsDelivered: schoolKits.filter(k => k.status === 'delivered').length
    };
  })
  .sort((a, b) => b.kits - a.kits)
  .slice(0, 10);

  // Distribuição por tamanho
  const sizeDistribution = [
    { range: "1-5 turmas", count: topSchools.filter(s => s.classes <= 5).length },
    { range: "6-10 turmas", count: topSchools.filter(s => s.classes > 5 && s.classes <= 10).length },
    { range: "11-15 turmas", count: topSchools.filter(s => s.classes > 10 && s.classes <= 15).length },
    { range: "16+ turmas", count: topSchools.filter(s => s.classes > 15).length }
  ];

  // Escolas por município (top 5)
  const municipalitiesData = Object.entries(
    topSchools.reduce((acc, school) => {
      acc[school.municipality] = (acc[school.municipality] || 0) + 1;
      return acc;
    }, {})
  )
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 5);

  // Métricas gerais
  const schoolMetrics = {
    totalSchools: schools.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    totalStudents: classes.reduce((sum, cls) => sum + cls.students, 0),
    totalKits: kitRequests.length,
    avgClassesPerSchool: schools.length > 0 ? (classes.length / schools.length).toFixed(1) : 0,
    avgStudentsPerSchool: schools.length > 0 ? (classes.reduce((sum, cls) => sum + cls.students, 0) / schools.length).toFixed(0) : 0
  };

  // Timeline por municípios
  const parseDateSafe = (d) => d ? (isNaN(new Date(d).getTime()) ? null : new Date(d)) : null;

  const schoolDates = schools.map(s => parseDateSafe(s.createdAt)).filter(Boolean);
  const latestSchoolDate = schoolDates.length ? new Date(Math.max(...schoolDates.map(d => d.getTime()))) : new Date();
  const endDate = new Date(Math.max(latestSchoolDate.getTime(), new Date().getTime()));
  const start = new Date(2025, 0, 1);
  const monthsMap = {};
  for (let dt = new Date(start); dt <= new Date(endDate.getFullYear(), endDate.getMonth(), 1); dt.setMonth(dt.getMonth() + 1)) {
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2,"0")}`;
    monthsMap[key] = { key, label: `${String(m).padStart(2,'0')}/${y}`, ts: new Date(y, m - 1, 1) };
  }
  const monthsList = Object.values(monthsMap).sort((a,b) => a.ts - b.ts);

  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState('all');

  // Contagem total de municípios (para top municípios)
  const allMunicipalityCounts = schools.reduce((acc, s) => {
    const m = s.municipality || "Não Definido";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  
  const topMunicipalities = Object.entries(allMunicipalityCounts)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 4)
    .map(([r]) => r);
  const seriesMunicipalities = [...topMunicipalities, "Outros"];

  const buildSchoolTimeline = () => {
    if (selectedMonth === 'all') {
      const monthly = {};
      schools.forEach(school => {
        const d = parseDateSafe(school.createdAt);
        if (!d) return;
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        if (!monthly[key]) {
          monthly[key] = { month: `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`, ts: new Date(d.getFullYear(), d.getMonth(), 1) };
          seriesMunicipalities.forEach(sr => monthly[key][sr] = 0);
        }
        const municipality = school.municipality || "Não Definido";
        if (topMunicipalities.includes(municipality)) monthly[key][municipality] += 1;
        else monthly[key]["Outros"] += 1;
      });
      monthsList.forEach(m => {
        if (!monthly[m.key]) {
          monthly[m.key] = { month: m.label, ts: m.ts };
          seriesMunicipalities.forEach(sr => monthly[m.key][sr] = 0);
        }
      });
      return Object.values(monthly)
        .sort((a,b) => a.ts - b.ts)
        .filter(m => selectedYearFilter === 'all' ? true : m.month.endsWith(`/${selectedYearFilter}`));
    } else {
      const [y, mm] = selectedMonth.split('-').map(Number);
      if (!y || !mm) return [];
      const daysInMonth = new Date(y, mm, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i+1;
        const dt = new Date(y, mm-1, day);
        const obj = { label: `${String(day).padStart(2,'0')}/${String(mm).padStart(2,'0')}`, ts: dt };
        seriesMunicipalities.forEach(sr => obj[sr] = 0);
        return obj;
      });
      schools.forEach(school => {
        const d = parseDateSafe(school.createdAt);
        if (!d) return;
        if (d.getFullYear() === y && (d.getMonth()+1) === mm) {
          const idx = d.getDate() - 1;
          const municipality = school.municipality || "Não Definido";
          if (topMunicipalities.includes(municipality)) days[idx][municipality] += 1;
          else days[idx]["Outros"] += 1;
        }
      });
      return days;
    }
  };

  const timelineData = buildSchoolTimeline();
 
  const buildMunicipalityCountsForPeriod = () => {
    const counts = {};
    const periodSchools = schools.filter(school => {
      const d = parseDateSafe(school.createdAt);
      if (!d) return false;
      if (selectedMonth === 'all') {
        if (selectedYearFilter === 'all') return true;
        return String(d.getFullYear()) === String(selectedYearFilter);
      } else {
        const [y, m] = selectedMonth.split('-').map(Number);
        return d.getFullYear() === y && (d.getMonth()+1) === m;
      }
    });
    periodSchools.forEach(s => {
      const municipality = s.municipality || "Não Definido";
      counts[municipality] = (counts[municipality] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  };

  const municipalityPeriodCounts = buildMunicipalityCountsForPeriod();

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Cards de Resumo - RESPONSIVOS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4 text-center">
          <School className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-xl font-bold">{schoolMetrics.totalSchools}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Escolas</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-xl font-bold">{schoolMetrics.totalTeachers}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Professores</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-xl font-bold">{schoolMetrics.totalKits}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Kits Totais</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-xl font-bold">{schoolMetrics.totalStudents}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Alunos</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top 10 Escolas - RESPONSIVO */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold break-words">Top 10 Escolas por Kits</h3>
          </div>
          <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
            {topSchools.map((school, index) => (
              <div key={school.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-100 text-[hsl(26,90%,57%)]' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-[hsl(189,68%,64%)]' :
                    'bg-blue-100 text-[hsl(283,45%,33%)]'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base truncate">{school.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{school.municipality}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-bold text-base sm:text-lg">{school.kits}</div>
                  <div className="text-xs text-muted-foreground">
                    {school.kitsDelivered} entregues
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Distribuição por Município - RESPONSIVO */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold break-words">Top Escolas por Município</h3>
          </div>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" minHeight={250} height={300}>
              <PieChart>
                <Pie
                  data={municipalitiesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {municipalitiesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 70}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} escolas`, 'Quantidade']} />
                <Legend 
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingTop: '10px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Distribuição por Municípios - OTIMIZADO PARA MOBILE */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <School className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold break-words">
              Escolas Criadas por Município
            </h3>
          </div>
          
          {/* Filtros - RESPONSIVOS */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
               value={selectedYearFilter}
               onChange={(e) => { setSelectedYearFilter(e.target.value); setSelectedMonth('all'); }}
               className="w-full sm:w-auto h-8 rounded border border-input bg-background px-2 py-1 text-xs sm:text-sm"
             >
               <option value="all">Todos os Anos</option>
               {Array.from(new Set(monthsList.map(m => m.label.split('/')[1]))).map(year => (
                 <option key={year} value={year}>{year}</option>
               ))}
             </select>
 
             <select
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(e.target.value)}
               className="w-full sm:w-auto h-8 rounded border border-input bg-background px-2 py-1 text-xs sm:text-sm"
             >
               <option value="all">{selectedYearFilter === 'all' ? 'Todos os Meses' : `Meses de ${selectedYearFilter}`}</option>
               {monthsList
                 .filter(m => selectedYearFilter === 'all' ? true : m.label.endsWith(`/${selectedYearFilter}`))
                 .map(m => (
                   <option key={m.key} value={m.key}>{m.label}</option>
                 ))
               }
             </select>
           </div>
        </div>

        <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Vê quantas escolas foram criadas por município ao longo do tempo. Seleciona um mês para ver contagens diárias.
        </div>

        <div className="w-full overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <ResponsiveContainer width="100%" minHeight={250} height={340} className="text-xs">
             <AreaChart data={timelineData} margin={{ top: 20, right: 10, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={selectedMonth === 'all' ? "month" : "label"} 
              angle={selectedMonth === 'all' ? -45 : 0}
              textAnchor={selectedMonth === 'all' ? "end" : "middle"}
              height={selectedMonth === 'all' ? 60 : 40}
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
            {seriesMunicipalities.map((municipality, idx) => {
              const colors = ['#3b82f6', '#f59e0b', '#fb923c', '#10b981', '#9ca3af'];
              return (
                <Area
                  key={municipality}
                  type="monotone"
                  dataKey={municipality}
                  name={municipality}
                  stroke={colors[idx % colors.length]}
                  fill={colors[idx % colors.length]}
                  fillOpacity={0.18 - (idx * 0.02)}
                />
              );
            })}
          </AreaChart>
          </ResponsiveContainer>
        </div>
       </Card>
 
       {/* Municípios - RESPONSIVO */}
       <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold break-words">
            Escolas por Município (período seleccionado)
          </h3>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Quantidade de escolas registadas no mês/ano seleccionado por município
        </div>
        <div className="w-full overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <ResponsiveContainer width="100%" minHeight={250} height={300} className="text-xs">
             <BarChart data={municipalityPeriodCounts} margin={{ top: 20, right: 10, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={50}
              interval={0}
              fontSize={11}
            />
            <YAxis fontSize={11} />
            <Tooltip formatter={(value) => [`${value} escolas`, 'Quantidade']} />
            <Bar dataKey="value" name="Escolas" fill="#6366f1">
              {municipalityPeriodCounts.map((entry, index) => <Cell key={`cell-${index}`} fill={`hsl(${index*35}, 70%, 50%)`} />)}
            </Bar>
          </BarChart>
          </ResponsiveContainer>
        </div>
       </Card>

      {/* Métricas Adicionais - RESPONSIVAS */} 
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 text-center">
          <School className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-lg font-bold">{schoolMetrics.avgClassesPerSchool}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Turmas por Escola</div>
          <div className="text-xs text-muted-foreground mt-1">Média</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-lg font-bold">{schoolMetrics.avgStudentsPerSchool}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Alunos por Escola</div>
          <div className="text-xs text-muted-foreground mt-1">Média</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-lg font-bold">
            {schoolMetrics.totalSchools > 0 ? (schoolMetrics.totalKits / schoolMetrics.totalSchools).toFixed(1) : 0}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Kits por Escola</div>
          <div className="text-xs text-muted-foreground mt-1">Média</div>
        </Card>
      </div>
    </div>
  );
}