import { useState, useEffect } from "react";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { Card } from "../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList, Cell, Legend
} from "recharts";

export default function AdminStatistics() {
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsRes, teachersRes] = await Promise.all([
          fetch("http://localhost:4000/api/auth/schools"),
          fetch("http://localhost:4000/api/auth/teachers"),
        ]);
        const schoolsData = await schoolsRes.json();
        const teachersData = await teachersRes.json();
        setSchools(schoolsData);
        setTeachers(teachersData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">A carregar estatísticas...</p>
      </div>
    </div>
  );

  // Lista de distritos únicos
  const districts = [...new Set(schools.map(s => s.region || "Não Definido"))].sort();

  // Contar escolas e professores por distrito
  const districtData = schools.reduce((acc, school) => {
    const region = school.region || "Não Definido";

    // Filtro aplicado
    if (selectedDistrict && region !== selectedDistrict) return acc;

    if (!acc[region]) acc[region] = { region, schools: 0, teachers: 0 };
    acc[region].schools += 1;
    acc[region].teachers += teachers.filter(t => t.schoolId === school.id).length;
    return acc;
  }, {});

  const chartData = Object.values(districtData).sort((a, b) => b.schools - a.schools);

  const colors = { schools: "#3b82f6", teachers: "#10b981" };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Estatísticas por Distrito</h1>

        {/* Filtro de distrito */}
        <Card className="p-4 mb-6">
          <label className="mr-4 font-medium">Filtrar por Distrito:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Escolas vs Professores por Distrito</h2>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-35} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip 
                formatter={(value, name) => [`${value}`, name === "schools" ? "Escolas" : "Professores"]}
                labelFormatter={(label) => `Distrito: ${label}`}
              />
              <Legend 
                formatter={(value) => value === "schools" ? "Escolas" : "Professores"}
                verticalAlign="top" 
                height={36}
              />
              <Bar dataKey="schools" name="schools" fill={colors.schools}>
                {chartData.map((entry, index) => (
                  <Cell key={`school-${index}`} fill={colors.schools} />
                ))}
                <LabelList dataKey="schools" position="top" />
              </Bar>
              <Bar dataKey="teachers" name="teachers" fill={colors.teachers}>
                {chartData.map((entry, index) => (
                  <Cell key={`teacher-${index}`} fill={colors.teachers} />
                ))}
                <LabelList dataKey="teachers" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}


