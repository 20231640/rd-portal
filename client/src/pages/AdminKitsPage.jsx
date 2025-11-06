// AdminKitsPage.jsx - ATUALIZADO COM TODAS AS FUNCIONALIDADES
import { useState, useEffect, useRef } from "react";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { ProgressCharacter } from "../components/ui/kits/progress-character";
import { KitJourney } from "../components/ui/kits/kit-journey";

import { 
  Package, Search, CheckCircle, Truck, X, Mail, RefreshCw, 
  Users, School, AlertCircle, BookOpen, MessageCircle 
} from "lucide-react";

export default function AdminKitsPage() {
  const [kitRequests, setKitRequests] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [newUpdates, setNewUpdates] = useState(0);
  
  const previousRequestsRef = useRef([]);

  // Buscar dados
  const fetchData = async () => {
    try {
      setError("");
      
      const [requestsRes, teachersRes, classesRes] = await Promise.all([
        fetch("http://localhost:4000/api/kits/requests"),
        fetch("http://localhost:4000/api/auth/teachers"),
        fetch("http://localhost:4000/api/classes")
      ]);

      if (!requestsRes.ok) throw new Error(`Erro kits: ${requestsRes.status}`);
      if (!teachersRes.ok) throw new Error(`Erro teachers: ${teachersRes.status}`);
      if (!classesRes.ok) throw new Error(`Erro classes: ${classesRes.status}`);

      const [requestsData, teachersData, classesData] = await Promise.all([
        requestsRes.json(),
        teachersRes.json(),
        classesRes.json()
      ]);

      // Detectar mudanças para notificações
      detectChanges(requestsData || []);

      setKitRequests(requestsData || []);
      setTeachers(teachersData || []);
      setClasses(classesData || []);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error("❌ Erro ao carregar dados:", err);
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Detectar mudanças nos pedidos
  const detectChanges = (newRequests) => {
    if (previousRequestsRef.current.length === 0) {
      previousRequestsRef.current = newRequests;
      return;
    }

    const changes = {
      new: [],
      updated: [],
      reports: []
    };

    // Encontrar novos pedidos e problemas reportados
    newRequests.forEach(request => {
      const existing = previousRequestsRef.current.find(r => r.id === request.id);
      
      if (!existing) {
        changes.new.push(request);
      } else {
        // Verificar mudanças de status
        if (existing.status !== request.status) {
          changes.updated.push({ from: existing.status, to: request.status, request });
        }
        
        // Verificar novos problemas reportados
        const existingReports = existing.reports?.length || 0;
        const newReports = request.reports?.length || 0;
        
        if (newReports > existingReports) {
          changes.reports.push({
            request,
            newReports: request.reports?.slice(existingReports) || []
          });
        }
      }
    });

    // Atualizar contador de novas atualizações
    const totalChanges = changes.new.length + changes.updated.length + changes.reports.length;
    if (totalChanges > 0) {
      setNewUpdates(prev => prev + totalChanges);
      
      // Mostrar notificações no console
      if (changes.new.length > 0) {
        console.log(`🎉 ${changes.new.length} novo(s) pedido(s) criado(s)`);
      }
      if (changes.updated.length > 0) {
        changes.updated.forEach(change => {
          console.log(`📦 Pedido atualizado: ${change.from} → ${change.to}`);
        });
      }
      if (changes.reports.length > 0) {
        changes.reports.forEach(report => {
          console.log(`🚨 ${report.newReports.length} novo(s) problema(s) reportado(s) no pedido #${report.request.id}`);
        });
      }
    }

    previousRequestsRef.current = newRequests;
  };

  // Efeito inicial
  useEffect(() => {
    fetchData();
  }, []);

  // Limpar notificações quando o utilizador interage
  const clearNotifications = () => {
    setNewUpdates(0);
  };

  // Contar problemas reportados não resolvidos
  const getUnresolvedReportsCount = () => {
    return kitRequests.reduce((count, request) => {
      return count + (request.reports?.filter(r => !r.resolved).length || 0);
    }, 0);
  };

  // Skeleton
  const RequestSkeleton = () => (
    <div className="border border-border rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 bg-gray-300 rounded-full mt-1"></div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64" />
            {/* Skeleton da timeline */}
            <div className="space-y-2 mt-4">
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <Card className="p-8 text-center">
      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-semibold mb-2">Nenhum pedido de kit</h3>
      <p className="text-muted-foreground mb-4">
        Quando os professores pedirem kits, aparecerão aqui para aprovação.
      </p>
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Verificar Novamente
        </Button>
      </div>
    </Card>
  );

  const handleApprove = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/kits/${requestId}/approve`, {
        method: "PUT",
      });

      if (res.ok) {
        const updatedRequest = await res.json();
        setKitRequests(prev =>
          prev.map(req =>
            req.id === requestId ? updatedRequest : req
          )
        );
        
        // Forçar atualização
        setTimeout(() => fetchData(), 1000);
      } else {
        throw new Error("Erro ao aprovar pedido");
      }
    } catch (err) {
      console.error("Erro ao aprovar pedido:", err);
      alert("Erro ao aprovar pedido: " + err.message);
    }
  };

  const handleShip = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/kits/${requestId}/ship`, {
        method: "PUT",
      });

      if (res.ok) {
        const updatedRequest = await res.json();
        setKitRequests(prev =>
          prev.map(req =>
            req.id === requestId ? updatedRequest : req
          )
        );
        
        // Forçar atualização
        setTimeout(() => fetchData(), 1000);
      } else {
        throw new Error("Erro ao marcar como enviado");
      }
    } catch (err) {
      console.error("Erro ao marcar como enviado:", err);
      alert("Erro ao marcar como enviado: " + err.message);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm("Tem a certeza que quer rejeitar este pedido?")) return;
    
    try {
      const res = await fetch(`http://localhost:4000/api/kits/${requestId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setKitRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Forçar atualização
        setTimeout(() => fetchData(), 1000);
      } else {
        throw new Error("Erro ao rejeitar pedido");
      }
    } catch (err) {
      console.error("Erro ao rejeitar pedido:", err);
      alert("Erro ao rejeitar pedido: " + err.message);
    }
  };

  const handleResolveReport = async (requestId, reportId) => {
    if (!window.confirm("Tem a certeza que quer marcar este problema como resolvido?")) return;
    
    try {
      const res = await fetch(`http://localhost:4000/api/kits/${requestId}/reports/${reportId}/resolve`, {
        method: "PUT",
      });

      if (res.ok) {
        const updatedRequest = await res.json();
        setKitRequests(prev =>
          prev.map(req =>
            req.id === requestId ? updatedRequest : req
          )
        );
        
        setTimeout(() => fetchData(), 1000);
      } else {
        throw new Error("Erro ao resolver problema");
      }
    } catch (err) {
      console.error("Erro ao resolver problema:", err);
      alert("Erro ao resolver problema: " + err.message);
    }
  };

  // Filtros
  const filteredRequests = kitRequests.filter(request => {
    const teacher = teachers.find(t => t.id === request.teacherId);
    const classInfo = classes.find(c => c.id === request.classId);
    
    const matchesSearch = teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.kitType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classInfo?.cycle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status) => {
    return kitRequests.filter(req => req.status === status).length;
  };

  if (loading && kitRequests.length === 0) {
    return (
      <div className="flex min-h-screen bg-background" onClick={clearNotifications}>
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4 text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </Card>
            ))}
          </div>

          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
            </div>
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <RequestSkeleton key={i} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-6 text-center">
            <Package className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">Erro</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background" onClick={clearNotifications}>
      <AdminSidebar />
      <div className="flex-1 p-8">
        {/* Header com controles de atualização */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Gestão de Kits</h1>
              {newUpdates > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  {newUpdates} nova(s)
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-muted-foreground">Aprovar e acompanhar pedidos de kits</p>
              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-PT')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* APENAS Botão Manual Refresh - SEM AUTO REFRESH */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Indicador de Estado */}
        <div className="flex items-center gap-4 mb-6">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>A carregar dados...</span>
            </div>
          )}
        </div>

        {/* Estatísticas - ADICIONANDO CONTADOR DE PROBLEMAS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 text-center border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-yellow-600">{getStatusCount("pending")}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </Card>
          <Card className="p-4 text-center border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-blue-600">{getStatusCount("approved")}</div>
            <div className="text-sm text-muted-foreground">Aprovados</div>
          </Card>
          <Card className="p-4 text-center border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-orange-600">{getStatusCount("shipped")}</div>
            <div className="text-sm text-muted-foreground">Enviados</div>
          </Card>
          <Card className="p-4 text-center border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-green-600">{getStatusCount("delivered")}</div>
            <div className="text-sm text-muted-foreground">Entregues</div>
          </Card>
          <Card className="p-4 text-center border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-red-600">{getUnresolvedReportsCount()}</div>
            <div className="text-sm text-muted-foreground">Problemas</div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar por professor, turma, ciclo ou tipo de kit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os Estados</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="shipped">Enviados</option>
              <option value="delivered">Entregues</option>
            </select>
          </div>
        </Card>

        {/* Lista de Pedidos COM JOURNEY VISUAL */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Pedidos de Kits</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{filteredRequests.length} pedido(s)</span>
              {getUnresolvedReportsCount() > 0 && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  {getUnresolvedReportsCount()} problema(s) por resolver
                </span>
              )}
            </div>
          </div>
          
          {filteredRequests.length === 0 ? (
            searchTerm || statusFilter !== "all" ? (
              <Card className="p-8 text-center border-dashed">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os termos de pesquisa ou filtros.
                </p>
              </Card>
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="space-y-6">
              {filteredRequests.map(request => {
                const teacher = teachers.find(t => t.id === request.teacherId);
                const school = teacher?.school;
                const classInfo = classes.find(c => c.id === request.classId);

                return (
                  <Card key={request.id} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                    {/* Header do Pedido */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-6 h-6 text-primary" />
                          <h4 className="text-xl font-bold">
                            {teacher?.name || "Professor não encontrado"}
                            <span className="text-lg font-normal text-muted-foreground ml-2">
                              - Kit {request.kitType}
                            </span>
                          </h4>
                        </div>
                        
                        {/* INFORMAÇÕES DA TURMA */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <School className="w-4 h-4" />
                            <span>{school?.name || "Escola não especificada"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>Turma: {classInfo?.name || "N/A"} | {classInfo?.cycle || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{classInfo?.studentCount || "N/A"} alunos</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          Pedido em {new Date(request.requestedAt).toLocaleDateString('pt-PT')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'shipped' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.status === 'pending' ? 'Pendente' :
                           request.status === 'approved' ? 'Aprovado' :
                           request.status === 'shipped' ? 'Enviado' : 'Entregue'}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Visual */}
                    <KitJourney request={request} />

                    {/* Notas do Admin */}
                    {request.adminNotes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          <strong>📝 Nota do Admin:</strong> {request.adminNotes}
                        </p>
                      </div>
                    )}

                    {/* PROBLEMAS REPORTADOS */}
                    {request.reports && request.reports.filter(r => !r.resolved).length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <p className="text-sm text-red-700 font-medium">
                                Problema Reportado pelo Professor
                              </p>
                            </div>
                            <p className="text-sm text-red-600">
                              {request.reports.filter(r => !r.resolved)[0].message}
                            </p>
                            <p className="text-xs text-red-500 mt-1">
                              Reportado em: {new Date(request.reports.filter(r => !r.resolved)[0].createdAt).toLocaleDateString('pt-PT')}
                              {request.reports.filter(r => !r.resolved)[0].teacherName && (
                                <span className="ml-2">por {request.reports.filter(r => !r.resolved)[0].teacherName}</span>
                              )}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveReport(request.id, request.reports.filter(r => !r.resolved)[0].id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolver
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Problemas já resolvidos */}
                    {request.reports && request.reports.filter(r => r.resolved).length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-green-700">
                            <strong>Problema Resolvido:</strong> {request.reports.filter(r => r.resolved)[0].message}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 mt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        ID: #{request.id}
                        {request.approvedAt && ` • Aprovado: ${new Date(request.approvedAt).toLocaleDateString('pt-PT')}`}
                        {request.shippedAt && ` • Enviado: ${new Date(request.shippedAt).toLocaleDateString('pt-PT')}`}
                        {request.deliveredAt && ` • Entregue: ${new Date(request.deliveredAt).toLocaleDateString('pt-PT')}`}
                      </div>
                      
                      <div className="flex gap-2">
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(request.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}

                        {request.status === "approved" && (
                          <Button
                            size="sm"
                            onClick={() => handleShip(request.id)}
                          >
                            <Truck className="w-4 h-4 mr-1" />
                            Marcar como Enviado
                          </Button>
                        )}

                        {request.status === "shipped" && (
                          <span className="text-sm text-orange-600 font-medium">
                            À espera de confirmação do professor
                          </span>
                        )}

                        {request.status === "delivered" && (
                          <span className="text-sm text-green-600 font-medium">
                            ✅ Entrega confirmada
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}