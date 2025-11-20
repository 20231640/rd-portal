import { Card } from "../../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { 
  Package, Truck, CheckCircle, Clock, AlertCircle, TrendingUp,
  Calendar, Zap, BarChart3
} from "lucide-react";
import { useState } from "react";

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

  // Kits por ciclo (agrupa pelo cycle da turma relacionada)
  const kitCycleData = Object.entries(
    kitRequests.reduce((acc, kit) => {
      const cls = classes.find(c => c.id === kit.classId);
      const cycle = cls?.cycle || 'Sem Turma';
      acc[cycle] = (acc[cycle] || 0) + 1;
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

  // Evolução temporal: agrupar por mês usando requestedAt (fallback createdAt) e permitir drilldown por dias
  // parse date helper (fallback to createdAt)
  const parseDateSafe = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const getRequested = (kit) => parseDateSafe(kit.requestedAt) || parseDateSafe(kit.createdAt) || null;
  const getApproved = (kit) => parseDateSafe(kit.approvedAt);
  const getShipped = (kit) => parseDateSafe(kit.shippedAt);
  const getDelivered = (kit) => parseDateSafe(kit.deliveredAt);
 
  // --- construir lista de meses (DE JAN/2025 até ao mês mais recente) ---
  const monthsMap = {};
  // determinar mês final: o maior entre a data atual e a última data de pedido presente
  const parseDateSafeForRange = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };
  const allRequestDates = kitRequests.map(k => parseDateSafeForRange(k.requestedAt) || parseDateSafeForRange(k.createdAt)).filter(Boolean);
  const latestDataDate = allRequestDates.length ? new Date(Math.max(...allRequestDates.map(d => d.getTime()))) : new Date();
  const endDate = new Date(Math.max(latestDataDate.getTime(), new Date().getTime()));

  // start from Jan 2025
  const startYear = 2025;
  const startMonth = 1;
  const start = new Date(startYear, startMonth - 1, 1);
  // build months from start..endDate
  for (let dt = new Date(start); dt <= new Date(endDate.getFullYear(), endDate.getMonth(), 1); dt.setMonth(dt.getMonth() + 1)) {
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, '0')}`;
    monthsMap[key] = { key, label: `${String(m).padStart(2,'0')}/${y}`, ts: new Date(y, m - 1, 1) };
  }
  const monthsList = Object.values(monthsMap).sort((a, b) => a.ts - b.ts);

  // estado para mês selecionado ('all' mostra série mensal completa); adicionar filtro de ano
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState('all');
 
  // função que gera dados do gráfico: se selectedMonth === 'all' -> série mensal (todos os meses desde Jan/2025)
  // se selectedYearFilter != 'all' filtra os meses mostrados na dropdown; se selectedMonth != 'all' -> daily buckets desse mês
  const buildTimeline = () => {
    if (selectedMonth === 'all') {
      // gerar mês a mês usando o intervalo já construído (monthsList)
      const monthly = {};
      kitRequests.forEach(kit => {
        const dReq = getRequested(kit);
        const dApp = getApproved(kit);
        const dShip = getShipped(kit);
        const dDel = getDelivered(kit);
        if (dReq) {
          const k = `${dReq.getFullYear()}-${String(dReq.getMonth()+1).padStart(2,'0')}`;
          if (!monthly[k]) monthly[k] = { month: `${String(dReq.getMonth()+1).padStart(2,'0')}/${dReq.getFullYear()}`, requested:0, approved:0, shipped:0, delivered:0, ts: new Date(dReq.getFullYear(), dReq.getMonth(), 1) };
          monthly[k].requested += 1;
        }
        if (dApp) {
          const k = `${dApp.getFullYear()}-${String(dApp.getMonth()+1).padStart(2,'0')}`;
          if (!monthly[k]) monthly[k] = { month: `${String(dApp.getMonth()+1).padStart(2,'0')}/${dApp.getFullYear()}`, requested:0, approved:0, shipped:0, delivered:0, ts: new Date(dApp.getFullYear(), dApp.getMonth(), 1) };
          monthly[k].approved += 1;
        }
        if (dShip) {
          const k = `${dShip.getFullYear()}-${String(dShip.getMonth()+1).padStart(2,'0')}`;
          if (!monthly[k]) monthly[k] = { month: `${String(dShip.getMonth()+1).padStart(2,'0')}/${dShip.getFullYear()}`, requested:0, approved:0, shipped:0, delivered:0, ts: new Date(dShip.getFullYear(), dShip.getMonth(), 1) };
          monthly[k].shipped += 1;
        }
        if (dDel) {
          const k = `${dDel.getFullYear()}-${String(dDel.getMonth()+1).padStart(2,'0')}`;
          if (!monthly[k]) monthly[k] = { month: `${String(dDel.getMonth()+1).padStart(2,'0')}/${dDel.getFullYear()}`, requested:0, approved:0, shipped:0, delivered:0, ts: new Date(dDel.getFullYear(), dDel.getMonth(), 1) };
          monthly[k].delivered += 1;
        }
      });
      // garantir todos os meses (mesesList) presentes mesmo a zero
      monthsList.forEach(m => {
        if (!monthly[m.key]) monthly[m.key] = { month: m.label, requested: 0, approved: 0, shipped: 0, delivered: 0, ts: m.ts };
      });
      const months = Object.values(monthly).sort((a,b) => a.ts - b.ts);
      return months;
    } else {
      // daily view for selected month: contar cada evento no seu dia respectivo
      const [y, m] = selectedMonth.split('-').map(Number);
      if (!y || !m) return [];
      const daysInMonth = new Date(y, m, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dt = new Date(y, m - 1, day);
        return { day, label: `${String(day).padStart(2,'0')}/${String(m).padStart(2,'0')}`, requested: 0, approved: 0, shipped: 0, delivered: 0, ts: dt };
      });
      kitRequests.forEach(kit => {
        const dReq = getRequested(kit);
        const dApp = getApproved(kit);
        const dShip = getShipped(kit);
        const dDel = getDelivered(kit);
        if (dReq && dReq.getFullYear() === y && (dReq.getMonth()+1) === m) days[dReq.getDate()-1].requested += 1;
        if (dApp && dApp.getFullYear() === y && (dApp.getMonth()+1) === m) days[dApp.getDate()-1].approved += 1;
        if (dShip && dShip.getFullYear() === y && (dShip.getMonth()+1) === m) days[dShip.getDate()-1].shipped += 1;
        if (dDel && dDel.getFullYear() === y && (dDel.getMonth()+1) === m) days[dDel.getDate()-1].delivered += 1;
      });
      return days;
    }
   };
 
   const timelineData = buildTimeline();
 
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
            <h3 className="text-lg font-semibold">Kits por Ciclo</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kitCycleData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} kits`, 'Quantidade']} />
              <Bar dataKey="value" name="Kits" fill="#8b5cf6">
                {kitCycleData.map((entry, index) => (
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
          {/* Filtros: Ano + Mês (desde Jan/2025 até ao mês atual) */}
          <div className="ml-auto flex flex-col sm:flex-row gap-2">
             <select
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(e.target.value)}
               className="h-8 rounded border border-input bg-background px-2 py-1 text-sm"
             >
               <option value="all">Últimos 6 meses</option>
               {monthsList.map(m => (
                 <option key={m.key} value={m.key}>{m.label}</option>
               ))}
             </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
             <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedMonth === 'all' ? "month" : "label"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="requested" 
                name="Pedido Recebido" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.20}
              />
              <Area 
                type="monotone" 
                dataKey="approved" 
                name="Aprovado" 
                stroke="#f59e0b" 
                fill="#f59e0b" 
                fillOpacity={0.18}
              />
              <Area 
                type="monotone" 
                dataKey="shipped" 
                name="A Caminho" 
                stroke="#fb923c" 
                fill="#fb923c" 
                fillOpacity={0.16}
              />
              <Area 
                type="monotone" 
                dataKey="delivered" 
                name="Entregue" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.22}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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