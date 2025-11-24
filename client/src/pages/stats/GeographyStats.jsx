import { useState } from "react";
import { Card } from "../../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { MapPin, Users, School, Package } from "lucide-react";

export function GeographyStats({ schools, teachers, classes, kitRequests, districts, selectedDistrict: initialDistrict, onDistrictChange }) {
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict || "");
  const [dataType, setDataType] = useState("schools"); // "schools", "teachers", "kits"

  // Dados por distrito
  const districtData = schools.reduce((acc, school) => {
    const region = school.region || "Não Definido";
    if (selectedDistrict && region !== selectedDistrict) return acc;

    if (!acc[region]) {
      acc[region] = { 
        region, 
        schools: 0, 
        teachers: 0,
        classes: 0,
        students: 0,
        kits: 0
      };
    }
    
    acc[region].schools += 1;
    acc[region].teachers += teachers.filter(t => t.schoolId === school.id).length;
    
    const schoolClasses = classes.filter(c => c.schoolId === school.id);
    acc[region].classes += schoolClasses.length;
    acc[region].students += schoolClasses.reduce((sum, cls) => sum + cls.students, 0);
    
    acc[region].kits += kitRequests.filter(k => 
      schoolClasses.some(c => c.id === k.classId)
    ).length;
    
    return acc;
  }, {});

  const chartData = Object.values(districtData).sort((a, b) => b[dataType] - a[dataType]);

  // Dados para mapa de calor (exemplo simplificado)
  const regionDistribution = Object.entries(districtData).map(([region, data]) => ({
    name: region,
    value: data.kits,
    schools: data.schools,
    students: data.students
  }));

  const colors = {
    schools: "#3b82f6",
    teachers: "#10b981", 
    kits: "#f59e0b",
    students: "#8b5cf6"
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Filtrar por distrito:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                onDistrictChange?.(e.target.value);
              }}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos os Distritos</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Tipo de Dados:</label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="schools">Escolas</option>
              <option value="teachers">Professores</option>
              <option value="kits">Kits</option>
              <option value="students">Alunos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Gráfico de Barras */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Distribuição por distrito - {dataType}</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis 
               dataKey="region" 
               angle={-45} 
               textAnchor="end" 
               height={80}
               interval={0}
             />
             <YAxis allowDecimals={false} />
             <Tooltip 
               formatter={(value, name) => {
                 const labels = {
                   schools: "Escolas",
                   teachers: "Professores", 
                   kits: "Kits",
                   students: "Alunos"
                 };
                 return [value, labels[name] || name];
               }}
             />
             <Legend />
             <Bar 
               dataKey={dataType} 
               name={dataType}
               fill={colors[dataType]}
             >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[dataType]} />
              ))}
             </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        </Card>

      {/* Resumo por Região */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <School className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-lg font-bold">{Object.values(districtData).reduce((sum, d) => sum + d.schools, 0)}</div>
          <div className="text-sm text-muted-foreground">Escolas</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-lg font-bold">{Object.values(districtData).reduce((sum, d) => sum + d.teachers, 0)}</div>
          <div className="text-sm text-muted-foreground">Professores</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Package className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-lg font-bold">{Object.values(districtData).reduce((sum, d) => sum + d.kits, 0)}</div>
          <div className="text-sm text-muted-foreground">Kits</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-lg font-bold">{Object.values(districtData).reduce((sum, d) => sum + d.students, 0)}</div>
          <div className="text-sm text-muted-foreground">Alunos</div>
        </Card>
      </div>
    </div>
  );
}