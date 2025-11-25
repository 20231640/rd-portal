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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Filtros - RESPONSIVOS */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 sm:mb-2">Filtrar por distrito:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                onDistrictChange?.(e.target.value);
              }}
              className="w-full h-9 sm:h-10 rounded-lg border border-input bg-background px-3 py-1 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos os Distritos</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 sm:mb-2">Tipo de Dados:</label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className="w-full h-9 sm:h-10 rounded-lg border border-input bg-background px-3 py-1 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="schools">Escolas</option>
              <option value="teachers">Professores</option>
              <option value="kits">Kits</option>
              <option value="students">Alunos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Gráfico de Barras - OTIMIZADO PARA MOBILE */}
      <Card className="p-3 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold break-words">
            Distribuição por distrito - {dataType}
          </h3>
        </div>
        <div className="w-full overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <ResponsiveContainer width="100%" minHeight={300} height={400} className="text-xs">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 10, left: 0, bottom: 80 }}
            >
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis 
               dataKey="region" 
               angle={-45} 
               textAnchor="end" 
               height={70}
               interval={0}
               fontSize={11}
               tick={{ fontSize: 11 }}
             />
             <YAxis allowDecimals={false} fontSize={11} />
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
             <Legend 
               wrapperStyle={{
                 fontSize: '12px',
                 paddingTop: '10px'
               }}
             />
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

      {/* Resumo por Região - RESPONSIVO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="p-3 text-center">
          <School className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-lg font-bold">
            {Object.values(districtData).reduce((sum, d) => sum + d.schools, 0)}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Escolas</div>
        </Card>
        
        <Card className="p-3 text-center">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-lg font-bold">
            {Object.values(districtData).reduce((sum, d) => sum + d.teachers, 0)}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Professores</div>
        </Card>
        
        <Card className="p-3 text-center">
          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-lg font-bold">
            {Object.values(districtData).reduce((sum, d) => sum + d.kits, 0)}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Kits</div>
        </Card>
        
        <Card className="p-3 text-center">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mx-auto mb-1 sm:mb-2" />
          <div className="text-lg sm:text-lg font-bold">
            {Object.values(districtData).reduce((sum, d) => sum + d.students, 0)}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Alunos</div>
        </Card>
      </div>
    </div>
  );
}