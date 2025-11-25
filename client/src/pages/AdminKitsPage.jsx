// AdminKitsPage.jsx - COMPLETO COM MOBILE RESPONSIVE
import { useState, useEffect, useRef } from "react";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { KitJourney } from "../components/ui/kits/kit-journey";
import { API_URL } from "../config/api";

import { 
  Package, Search, CheckCircle, Truck, X, RefreshCw, 
  Users, School, AlertCircle, BookOpen, Calendar, Filter,
  Menu // ← Adicionar este ícone
} from "lucide-react";

export default function AdminKitsPage() {
  const [kitRequests, setKitRequests] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCycle, setSelectedCycle] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [showArchivedTeachers, setShowArchivedTeachers] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [newUpdates, setNewUpdates] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // ← Estado novo para mobile
  
  const previousRequestsRef = useRef([]);

  // Buscar dados
  const fetchData = async () => {
    try {
      setError("");
      
      const [requestsRes, teachersRes, classesRes] = await Promise.all([
        fetch(`${API_URL}/api/kits/requests`),
        fetch(`${API_URL}/api/auth/teachers`),
        fetch(`${API_URL}/api/classes`)
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

  // Contar pedidos com professores arquivados
  const getArchivedTeachersCount = () => {
    return kitRequests.filter(request => {
      const teacher = teachers.find(t => t.id === request.teacherId);
      return !teacher;
    }).length;
  };

  // Skeleton
  const RequestSkeleton = () => (
    <div className="border border-border rounded-lg p-4 sm:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full mt-1"></div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Skeleton className="h-6 w-32 sm:w-48" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48 sm:w-64" />
            {/* Skeleton da timeline */}
            <div className="space-y-2 mt-3">
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <Card className="p-6 sm:p-8 text-center border-dashed">
      <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
      <h3 className="text-lg font-semibold mb-2">Nenhum pedido de kit</h3>
      <p className="text-muted-foreground mb-4 text-sm sm:text-base">
        Quando os professores pedirem kits, aparecem aqui para que os possa aprovar.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
        <Button variant="outline" onClick={fetchData} size="sm" className="sm:size-default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Verificar Novamente
        </Button>
      </div>
    </Card>
  );

  const handleApprove = async (requestId) => {
    try {
      const res = await fetch(`${API_URL}/api/kits/${requestId}/approve`, {
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
        throw new Error("Erro ao aprovar pedido");
      }
    } catch (err) {
      console.error("Erro ao aprovar pedido:", err);
      alert("Erro ao aprovar pedido: " + err.message);
    }
  };

  const handleShip = async (requestId) => {
    try {
      const res = await fetch(`${API_URL}/api/kits/${requestId}/ship`, {
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
        throw new Error("Erro ao marcar como enviado");
      }
    } catch (err) {
      console.error("Erro ao marcar como enviado:", err);
      alert("Erro ao marcar como enviado: " + err.message);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm("Tem a certeza que pretende rejeitar este pedido?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/kits/${requestId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setKitRequests(prev => prev.filter(req => req.id !== requestId));
        
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
    if (!window.confirm("Tem a certeza que pretende marcar este problema como resolvido?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/kits/${requestId}/reports/${reportId}/resolve`, {
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

    const matchesCycle = selectedCycle === "all" || classInfo?.cycle === selectedCycle;
    const matchesYear = selectedYear === "all" || String(classInfo?.year) === String(selectedYear);
    
    // Novo filtro para professores arquivados
    const teacherExists = !!teacher;
    const matchesArchivedFilter = showArchivedTeachers || teacherExists;
    
    return matchesSearch && matchesStatus && matchesCycle && matchesYear && matchesArchivedFilter;
  });

  const getStatusCount = (status) => {
    return kitRequests.filter(req => req.status === status).length;
  };

  // Componente RequestCard atualizado para mobile
  const RequestCard = ({ request }) => {
    const teacher = teachers.find(t => t.id === request.teacherId);
    const school = teacher?.school;
    const classInfo = classes.find(c => c.id === request.classId);

    const isTeacherArchived = !teacher;

    return (
      <Card key={request.id} className={`p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${
        isTeacherArchived 
          ? 'border-l-red-500 dark:border-l-red-400 bg-red-50 dark:bg-red-950/20' 
          : 'border-l-blue-500 dark:border-l-blue-400'
      } dark:hover:shadow-lg-dark`}>
        {/* Header do Pedido - Adaptado para mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 sm:gap-3 mb-2">
              <Package className={`w-5 h-5 sm:w-6 sm:h-6 mt-0.5 ${isTeacherArchived ? 'text-red-500 dark:text-red-400' : 'text-primary'}`} />
              <div className="flex-1 min-w-0">
                <h4 className="text-lg sm:text-xl font-bold break-words">
                  {teacher?.name || "Professor não encontrado"}
                  <span className="text-base sm:text-lg font-normal text-muted-foreground ml-1 sm:ml-2 block sm:inline">
                    - Kit {request.kitType}
                  </span>
                </h4>
                {isTeacherArchived && (
                  <span className="inline-block bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium mt-1">
                    Professor Arquivado
                  </span>
                )}
              </div>
            </div>
            
            {/* INFORMAÇÕES DA TURMA EM CAIXA - OTIMIZADO PARA MOBILE */}
            <Card className={`p-3 border mb-3 ${
              isTeacherArchived 
                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <School className="w-4 h-4 flex-shrink-0" />
                  <span className={`truncate ${isTeacherArchived ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {school?.name || "Escola não especificada"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className={isTeacherArchived ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}>
                    {classInfo?.name || "N/A"} | {classInfo?.cycle || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className={isTeacherArchived ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}>
                    {classInfo?.students || "N/A"} alunos
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className={isTeacherArchived ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
                    {new Date(request.requestedAt).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex items-center gap-2 self-start">
            <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
              request.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300' :
              request.status === 'approved' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' :
              request.status === 'shipped' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300' :
              'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
            }`}>
              {request.status === 'pending' ? 'Pendente' :
               request.status === 'approved' ? 'Aprovado' :
               request.status === 'shipped' ? 'Enviado' : 'Entregue'}
            </span>
          </div>
        </div>

        {/* Timeline Visual */}
        <div className="mb-4">
          <KitJourney request={request} />
        </div>

        {/* Notas do Admin */}
        {request.adminNotes && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Nota do Administrador:</strong> {request.adminNotes}
            </p>
          </div>
        )}

        {/* PROBLEMAS REPORTADOS */}
        {request.reports && request.reports.filter(r => !r.resolved).length > 0 && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    Problema Reportado
                  </p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 break-words">
                  {request.reports.filter(r => !r.resolved)[0].message}
                </p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {new Date(request.reports.filter(r => !r.resolved)[0].createdAt).toLocaleDateString('pt-PT')}
                  {request.reports.filter(r => !r.resolved)[0].teacherName && (
                    <span className="ml-1">por {request.reports.filter(r => !r.resolved)[0].teacherName}</span>
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResolveReport(request.id, request.reports.filter(r => !r.resolved)[0].id)}
                className="border-pink-600 dark:border-pink-500 text-pink-600 dark:text-pink-500 hover:bg-pink-600 dark:hover:bg-pink-700 hover:text-white transition-all duration-300 whitespace-nowrap mt-2 sm:mt-0"
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Resolver
              </Button>
            </div>
          </div>
        )}

        {/* Problemas já resolvidos */}
        {request.reports && request.reports.filter(r => r.resolved).length > 0 && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300 break-words">
                <strong>Resolvido:</strong> {request.reports.filter(r => r.resolved)[0].message}
              </p>
            </div>
          </div>
        )}

        {/* Actions - OTIMIZADO PARA MOBILE */}
        <div className="flex justify-end items-center pt-3 mt-3 border-t dark:border-gray-700">
          <div className="flex flex-wrap gap-2 justify-end">
            {request.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-xs sm:text-sm"
                >
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(request.id)}
                  className="border-pink-600 dark:border-pink-500 text-pink-600 dark:text-pink-500 hover:bg-pink-600 dark:hover:bg-pink-700 hover:text-white transition-all duration-300 text-xs sm:text-sm"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Rejeitar
                </Button>
              </>
            )}

            {request.status === "approved" && (
              <Button
                size="sm"
                onClick={() => handleShip(request.id)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-xs sm:text-sm"
              >
                <Truck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Enviar
              </Button>
            )}

            {request.status === "shipped" && (
              <span className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium">
                À espera de confirmação
              </span>
            )}

            {request.status === "delivered" && (
              <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                ✅ Entrega confirmada
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading && kitRequests.length === 0) {
    return (
      <div className="flex min-h-screen bg-background" onClick={clearNotifications}>
        <div className="hidden sm:block">
          <AdminSidebar />
        </div>
        
        {/* Overlay para mobile sidebar */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar mobile */}
        <div className={`
          fixed top-0 left-0 h-full z-50 transition-transform duration-300
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:hidden
        `}>
          <AdminSidebar />
        </div>

        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {/* Header mobile */}
          <div className="flex justify-between items-center mb-6 sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold">Kits</h1>
            <div className="w-10"></div>
          </div>

          <div className="hidden sm:flex justify-between items-center mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-3 sm:p-4 text-center">
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mx-auto mb-1 sm:mb-2" />
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mx-auto" />
              </Card>
            ))}
          </div>

          <Card className="p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Skeleton className="h-8 sm:h-10 flex-1" />
              <Skeleton className="h-8 sm:h-10 w-32 sm:w-48" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <Skeleton className="h-6 w-32 sm:w-48 mb-4" />
            <div className="space-y-3 sm:space-y-4">
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
        <div className="hidden sm:block">
          <AdminSidebar />
        </div>
        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full flex items-center justify-center">
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
      <div className="hidden sm:block">
        <AdminSidebar />
      </div>
      
      {/* Overlay para mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar mobile */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-transform duration-300
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:hidden
      `}>
        <AdminSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Header mobile */}
        <div className="flex justify-between items-center mb-6 sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Kits</h1>
          <div className="w-10"></div>
        </div>

        {/* Header desktop */}
        <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
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
              <p className="text-muted-foreground">Aprovar e acompanhar os pedidos de kits</p>
              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-PT')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>A carregar dados...</span>
            </div>
          )}
        </div>

        {/* Estatísticas - RESPONSIVAS PARA MOBILE */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-6">
          <Card className="p-3 sm:p-4 text-center border-l-4 border-l-amber-500 dark:border-l-amber-400 hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{getStatusCount("pending")}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Pendentes</div>
          </Card>
          <Card className="p-3 sm:p-4 text-center border-l-4 border-l-purple-600 dark:border-l-purple-400 hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{getStatusCount("approved")}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Aprovados</div>
          </Card>
          <Card className="p-3 sm:p-4 text-center border-l-4 border-l-cyan-500 dark:border-l-cyan-400 hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">{getStatusCount("shipped")}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Enviados</div>
          </Card>
          <Card className="p-3 sm:p-4 text-center border-l-4 border-l-green-500 dark:border-l-green-400 hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{getStatusCount("delivered")}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Entregues</div>
          </Card>
          <Card className="p-3 sm:p-4 text-center border-l-4 border-l-pink-600 dark:border-l-pink-400 hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl font-bold text-pink-600 dark:text-pink-400">{getUnresolvedReportsCount()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Problemas</div>
          </Card>
          <Card className="p-3 sm:p-4 text-center border-l-4 border-l-red-500 dark:border-l-red-400 hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{getArchivedTeachersCount()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Arquivados</div>
          </Card>
        </div>

        {/* Filtros - COMPLETAMENTE RESPONSIVOS */}
        <Card className="p-3 sm:p-4 mb-6">
          <div className="flex flex-col gap-3">
            {/* Barra de pesquisa */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar por professor, turma, ciclo ou tipo de kit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* Filtros em linha para mobile, grid para desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 sm:h-10 rounded-lg border border-input bg-background px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos Estados</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="shipped">Enviados</option>
                <option value="delivered">Entregues</option>
              </select>

              {/* Filtro por Ciclo */}
              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="h-9 sm:h-10 rounded-lg border border-input bg-background px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos Ciclos</option>
                {Array.from(new Set(classes.map(c => c.cycle).filter(Boolean))).map(cycle => (
                  <option key={cycle} value={cycle}>{cycle}</option>
                ))}
              </select>
              
              {/* Filtro por Ano */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-9 sm:h-10 rounded-lg border border-input bg-background px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos Anos</option>
                {Array.from(new Set(classes.map(c => String(c.year)).filter(Boolean))).sort().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Filtro para Professores Arquivados */}
              <div className="flex items-center gap-2 col-span-2 justify-center sm:col-span-1 sm:justify-start">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <label className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchivedTeachers}
                    onChange={(e) => {
                      if (e.target.checked && getArchivedTeachersCount() === 0) {
                        alert("Não existem professores arquivados para mostrar.");
                        return;
                      }
                      setShowArchivedTeachers(e.target.checked);
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-muted-foreground">Mostrar arquivados</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Lista de Pedidos */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Pedidos de Kits</h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{filteredRequests.length} pedido(s)</span>
              {getUnresolvedReportsCount() > 0 && (
                <span className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-xs">
                  {getUnresolvedReportsCount()} problema(s)
                </span>
              )}
              {getArchivedTeachersCount() > 0 && !showArchivedTeachers && (
                <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-full text-xs">
                  {getArchivedTeachersCount()} arquivado(s)
                </span>
              )}
            </div>
          </div>
          
          {filteredRequests.length === 0 ? (
            searchTerm || statusFilter !== "all" || selectedCycle !== "all" || selectedYear !== "all" || showArchivedTeachers ? (
              <Card className="p-6 sm:p-8 text-center border-dashed">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum resultado</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Tente ajustar os termos de pesquisa ou filtros.
                </p>
              </Card>
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}