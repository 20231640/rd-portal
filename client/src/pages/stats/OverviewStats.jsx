import { Card } from "../../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { 
  School, Users, Package, TrendingUp, AlertCircle, CheckCircle 
} from "lucide-react";

export function OverviewStats({ metrics, monthlyData, kitRequests, classes }) {
  
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
    <div className="space-y-6">
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

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Evolução Mensal</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="kits" 
                name="Kits Pedidos" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="schools" 
                name="Escolas" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Status dos Kits */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Status dos Kits</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={kitStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {kitStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} kits`, 'Quantidade']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

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
    </div>
  );
}