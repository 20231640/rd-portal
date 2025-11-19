import { Card } from "../../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  School, Users, Package, Award, MapPin, TrendingUp, Star
} from "lucide-react";

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
      region: school.region || "Não Definido",
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

  // Escolas por região (top 5)
  const regionsData = Object.entries(
    topSchools.reduce((acc, school) => {
      acc[school.region] = (acc[school.region] || 0) + 1;
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

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <School className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{schoolMetrics.totalSchools}</div>
          <div className="text-sm text-muted-foreground">Escolas</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{schoolMetrics.totalTeachers}</div>
          <div className="text-sm text-muted-foreground">Professores</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Package className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{schoolMetrics.totalKits}</div>
          <div className="text-sm text-muted-foreground">Kits Totais</div>
        </Card>
        
        <Card className="p-4 text-center">
          <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{schoolMetrics.totalStudents}</div>
          <div className="text-sm text-muted-foreground">Alunos</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Escolas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Top 10 Escolas por Kits</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {topSchools.map((school, index) => (
              <div key={school.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-[hsl(26,90%,57%)]' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-[hsl(189,68%,64%)]' :
                    'bg-blue-100 text-[hsl(283,45%,33%)]'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{school.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {school.region}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{school.kits}</div>
                  <div className="text-xs text-muted-foreground">
                    {school.kitsDelivered} entregues
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Distribuição por Região */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold">Top Escolas por Região</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {regionsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 70}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} escolas`, 'Quantidade']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      {/* Distribuição por Número de Turmas */}
        <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
            <School className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Distribuição por Número de Turmas</h3>
        </div>
        <div className="text-sm text-muted-foreground mb-4">
            Mostra quantas escolas têm determinado número de turmas no projeto
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sizeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip 
                formatter={(value) => [`${value} escolas`, 'Quantidade']}
                labelFormatter={(label) => `Faixa: ${label}`}
            />
            <Bar dataKey="count" name="Número de Escolas" fill="#10b981">
                {sizeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 60%)`} />
                ))}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
        </Card>

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <School className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-lg font-bold">{schoolMetrics.avgClassesPerSchool}</div>
          <div className="text-sm text-muted-foreground">Turmas por Escola</div>
          <div className="text-xs text-muted-foreground mt-1">Média</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-lg font-bold">{schoolMetrics.avgStudentsPerSchool}</div>
          <div className="text-sm text-muted-foreground">Alunos por Escola</div>
          <div className="text-xs text-muted-foreground mt-1">Média</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-lg font-bold">
            {schoolMetrics.totalSchools > 0 ? (schoolMetrics.totalKits / schoolMetrics.totalSchools).toFixed(1) : 0}
          </div>
          <div className="text-sm text-muted-foreground">Kits por Escola</div>
          <div className="text-xs text-muted-foreground mt-1">Média</div>
        </Card>
      </div>
    </div>
  );
}