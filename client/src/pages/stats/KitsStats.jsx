import { Card } from "../../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { 
  Package, Truck, CheckCircle, Clock, AlertCircle, TrendingUp,
  Calendar, Zap, BarChart3
} from "lucide-react";

export function KitsStats({ kitRequests, classes, metrics }) {
  
  // Estatísticas detalhadas dos kits
  const kitStats = {
    total: kitRequests.length,
    delivered: kitRequests.filter(k => k.status === 'delivered').length,
    shipped: kitRequests.filter(k => k.status === 'shipped').length,
    approved: kitRequests.filter(k => k.status === 'approved').length,
    pending: kitRequests.filter(k => k.status === 'pending').length,
    withProblems: kitRequests.filter(k => k.reports && k.reports.length > 0).length
  };

  // Kits por tipo
  const kitTypeData = Object.entries(
    kitRequests.reduce((acc, kit) => {
      const type = kit.kitType?.charAt(0).toUpperCase() + kit.kitType?.slice(1) || 'Não especificado';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Status detalhado para gráfico
  const statusData = [
    { status: 'Entregues', value: kitStats.delivered, color: '#10b981' },
    { status: 'Enviados', value: kitStats.shipped, color: '#3b82f6' },
    { status: 'Aprovados', value: kitStats.approved, color: '#f59e0b' },
    { status: 'Pendentes', value: kitStats.pending, color: '#ef4444' }
  ];

  // Evolução temporal (últimos 6 meses)
  const last6Months = kitRequests.reduce((acc, kit) => {
    const date = new Date(kit.requestedAt);
    const monthKey = date.toLocaleString('pt-PT', { month: 'short', year: '2-digit' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { 
        month: monthKey, 
        requested: 0, 
        delivered: 0,
        timestamp: date
      };
    }
    
    acc[monthKey].requested += 1;
    if (kit.status === 'delivered') {
      acc[monthKey].delivered += 1;
    }
    
    return acc;
  }, {});

  const timelineData = Object.values(last6Months)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-6); // Últimos 6 meses

  // Tempos médios
  const calculateAverageTime = (status) => {
    const kits = kitRequests.filter(k => k.status === status && k.deliveredAt && k.requestedAt);
    if (kits.length === 0) return 0;
    
    const totalTime = kits.reduce((sum, kit) => {
      const requested = new Date(kit.requestedAt);
      const delivered = new Date(kit.deliveredAt);
      return sum + (delivered - requested);
    }, 0);
    
    return Math.round(totalTime / kits.length / (1000 * 60 * 60 * 24)); // Dias
  };

  const avgDeliveryTime = calculateAverageTime('delivered');

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Package className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{kitStats.total}</div>
          <div className="text-sm text-muted-foreground">Total de Kits</div>
        </Card>
        
        <Card className="p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{kitStats.delivered}</div>
          <div className="text-sm text-muted-foreground">Entregues</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Truck className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{kitStats.shipped + kitStats.approved}</div>
          <div className="text-sm text-muted-foreground">Em Processamento</div>
        </Card>
        
        <Card className="p-4 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{kitStats.withProblems}</div>
          <div className="text-sm text-muted-foreground">Com Problemas</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Tipo */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Kits por Tipo</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kitTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} kits`, 'Quantidade']} />
              <Bar dataKey="value" name="Kits" fill="#8b5cf6">
                {kitTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Detalhado */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Status dos Kits</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} kits`, 'Quantidade']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Timeline de Pedidos */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Evolução de Pedidos</h3>
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
              dataKey="requested" 
              name="Kits Pedidos" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3}
            />
            <Area 
              type="monotone" 
              dataKey="delivered" 
              name="Kits Entregues" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{avgDeliveryTime}</div>
          <div className="text-sm text-muted-foreground">Dias para Entrega</div>
          <div className="text-xs text-muted-foreground mt-1">Tempo médio</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Zap className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-xl font-bold">
            {kitStats.total > 0 ? `${((kitStats.delivered / kitStats.total) * 100).toFixed(1)}%` : '0%'}
          </div>
          <div className="text-sm text-muted-foreground">Taxa de Entrega</div>
          <div className="text-xs text-muted-foreground mt-1">
            {kitStats.delivered}/{kitStats.total} kits
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <AlertCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-xl font-bold">
            {kitStats.total > 0 ? `${((kitStats.withProblems / kitStats.total) * 100).toFixed(1)}%` : '0%'}
          </div>
          <div className="text-sm text-muted-foreground">Taxa de Problemas</div>
          <div className="text-xs text-muted-foreground mt-1">
            {kitStats.withProblems} kits reportados
          </div>
        </Card>
      </div>
    </div>
  );
}