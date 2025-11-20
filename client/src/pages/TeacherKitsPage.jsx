// TeacherKitsPage.jsx - VERSÃO ATUALIZADA COM ESTÉTICA DO ADMIN
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../components/ui/sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { KitJourney } from "../components/ui/kits/kit-journey";
import { API_URL } from "../config/api";
import { 
  Package, Plus, CheckCircle, AlertCircle, 
  RefreshCw, Users, BookOpen, Calendar,
  MapPin, School, Clock, Truck, Home,
  Search
} from "lucide-react";

export default function TeacherKitsPage() {
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [kitRequests, setKitRequests] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedRequestForReport, setSelectedRequestForReport] = useState(null);
  const [reportMessage, setReportMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newUpdates, setNewUpdates] = useState(0);

  // Novos estados para filtros por ciclo e ano
  const [selectedCycle, setSelectedCycle] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  
  const previousRequestsRef = useRef([]);

  // Buscar dados
  const fetchData = async () => {
    try {
      const teacherDataStr = localStorage.getItem("teacherData");
      const loggedInTeacher = localStorage.getItem("loggedInTeacher");
      
      if (!teacherDataStr || !loggedInTeacher) {
        console.log('❌ Não autenticado');
        return;
      }

      const currentTeacher = JSON.parse(teacherDataStr);
      setTeacher(currentTeacher);

      let allClasses = [];
      let teacherKits = [];

      // Buscar turmas
      try {
        const classesRes = await fetch(`${API_URL}/api/classes`);
        if (classesRes.ok) {
          allClasses = await classesRes.json();
        } else {
          throw new Error(`Erro ${classesRes.status} ao carregar turmas`);
        }
      } catch (classesError) {
        throw new Error("Falha ao carregar turmas: " + classesError.message);
      }

      // Buscar kits do professor
      try {
        const kitsRes = await fetch(`${API_URL}/api/kits/teacher/${currentTeacher.id}`);
        if (kitsRes.ok) {
          teacherKits = await kitsRes.json();
        } else if (kitsRes.status === 404) {
          teacherKits = [];
        } else {
          throw new Error(`Erro ${kitsRes.status} ao carregar pedidos`);
        }
      } catch (kitsError) {
        if (kitsError.message.includes('Failed to fetch')) {
          teacherKits = [];
        } else {
          throw new Error("Falha ao carregar pedidos: " + kitsError.message);
        }
      }

      // Detectar mudanças
      detectChanges(teacherKits);

      // Filtrar turmas do professor
      const teacherClasses = allClasses.filter(cls => cls.teacherId === currentTeacher.id);
      
      setClasses(teacherClasses);
      setKitRequests(teacherKits);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error("❌ Erro ao carregar dados:", err);
      setError(err.message);
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
      updated: []
    };

    newRequests.forEach(request => {
      const existing = previousRequestsRef.current.find(r => r.id === request.id);
      
      if (!existing) {
        changes.new.push(request);
      } else {
        // Verificar mudanças de status
        if (existing.status !== request.status) {
          changes.updated.push({ from: existing.status, to: request.status, request });
        }
      }
    });

    // Atualizar contador de novas atualizações
    const totalChanges = changes.new.length + changes.updated.length;
    if (totalChanges > 0) {
      setNewUpdates(prev => prev + totalChanges);
    }

    previousRequestsRef.current = newRequests;
  };

  // Limpar notificações
  const clearNotifications = () => {
    setNewUpdates(0);
  };

  // Função de pedir kit
  const handleRequestKit = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      const res = await fetch(`${API_URL}/api/kits/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.id,
          classId: parseInt(selectedClass)
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await res.text();
        throw new Error("Servidor retornou resposta inválida");
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erro ${res.status} ao criar pedido`);
      }

      const newRequest = await res.json();
      setKitRequests(prev => [newRequest, ...prev]);
      setShowRequestForm(false);
      setSelectedClass("");
      
      setTimeout(() => fetchData(), 1000);
      alert("Pedido de kit criado com sucesso!");
      
    } catch (err) {
      let userMessage = err.message;
      if (err.message.includes("Failed to fetch")) {
        userMessage = "Erro de conexão. Verifique a sua internet.";
      } else if (err.message.includes("resposta inválida")) {
        userMessage = "Erro no servidor. Tente novamente mais tarde.";
      }
      alert("Erro ao fazer pedido: " + userMessage);
    }
  };

  // Função de marcar como entregue
  const handleMarkAsDelivered = async (requestId) => {
    try {
      const res = await fetch(`${API_URL}/api/kits/${requestId}/deliver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Servidor retornou resposta inválida");
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao marcar como entregue");
      }

      const updatedRequest = await res.json();
      setKitRequests(prev =>
        prev.map(req => req.id === requestId ? updatedRequest : req)
      );
      
      setTimeout(() => fetchData(), 1000);
      alert("Receção confirmada com sucesso!");
      
    } catch (err) {
      alert("Erro ao confirmar receção: " + err.message);
    }
  };

  // Função de reportar problema
  const handleReportProblem = async (e) => {
    e.preventDefault();
    if (!reportMessage.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/kits/${selectedRequestForReport.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: reportMessage,
          teacherId: teacher.id,
          teacherName: teacher.name
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Servidor retornou resposta inválida");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao reportar problema");
      }

      await response.json();
      await fetchData();

      alert("Problema reportado com sucesso!");
      setShowReportForm(false);
      setSelectedRequestForReport(null);
      setReportMessage("");

    } catch (err) {
      alert("Erro ao reportar problema: " + err.message);
    }
  };

  // Verificar se uma turma já tem pedido
  const classHasRequest = (classId) => {
    return kitRequests.some(request => 
      request.classId === classId && 
      request.status !== 'rejected' && 
      request.status !== 'cancelled'
    );
  };

  // Estatísticas
  const getStatusCount = (status) => {
    return kitRequests.filter(req => req.status === status).length;
  };

  // Filtros
  const filteredRequests = kitRequests.filter(request => {
    const classInfo = classes.find(c => c.id === request.classId);

    // Se a turma não existir, permite pesquisa por texto normalmente
    const matchesSearch = classInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classInfo?.cycle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.kitType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;

    const matchesCycle = selectedCycle === "all" || classInfo?.cycle === selectedCycle;
    const matchesYear = selectedYear === "all" || String(classInfo?.year) === String(selectedYear);

    return matchesSearch && matchesStatus && matchesCycle && matchesYear;
  });

  // Efeito para carregamento inicial
  useEffect(() => {
    fetchData();
  }, []);

  // Componente RequestCard atualizado - APENAS a parte que muda
  const RequestCard = ({ request }) => {
    const classInfo = classes.find(c => c.id === request.classId);
    
    return (
      <Card key={request.id} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
        {/* Header do Pedido */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-6 h-6 text-primary" />
              <h4 className="text-xl font-bold">
                {classInfo ? classInfo.name : "Turma não encontrada"}
                <span className="text-lg font-normal text-muted-foreground ml-2">
                  - {classInfo?.cycle} {classInfo?.year} | Kit Padrão
                </span>
              </h4>
            </div>
            
            {/* Informações da Turma EM CAIXA CINZA */}
            <Card className="p-3 bg-gray-50 border border-gray-200 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{classInfo?.students || "N/A"} alunos</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{classInfo?.cycle || "N/A"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Pedido: {new Date(request.requestedAt).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>
            </Card>
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

        {/* Problemas Reportados */}
        {request.reports && request.reports.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700 font-medium">
                Problema Reportado
              </p>
            </div>
            <p className="text-sm text-red-600 mb-2">
              {request.reports[request.reports.length - 1].message}
            </p>
            <div className="flex justify-between items-center text-xs text-red-500">
              <span>
                Reportado em: {new Date(request.reports[request.reports.length - 1].createdAt).toLocaleDateString('pt-PT')}
              </span>
              {request.reports[request.reports.length - 1].resolved && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Resolvido
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions - BOTÃO ROSA ATUALIZADO E SEM ID */}
        <div className="flex justify-end items-center pt-4 mt-4 border-t">
          <div className="flex gap-2">
            {request.status === "shipped" && (
              <Button
                size="sm"
                onClick={() => handleMarkAsDelivered(request.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Confirmar Receção
              </Button>
            )}
            
            {request.status === "delivered" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedRequestForReport(request);
                  setShowReportForm(true);
                }}
                className="border-[hsl(327,83%,50%)] text-[hsl(327,83%,50%)] hover:bg-[hsl(327,83%,50%)] hover:text-white transition-all duration-300"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                Reportar Problema
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Loading Skeleton
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
  const EmptyState = () => {
    const availableClasses = classes.filter(cls => !classHasRequest(cls.id));
    
    return (
      <Card className="p-8 text-center border-dashed">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Nenhum pedido de kit</h3>
        <p className="text-muted-foreground mb-4">
          {availableClasses.length === 0 && classes.length > 0 
            ? "🎉 Excelente! Já fez pedidos para todas as suas turmas disponíveis."
            : "📚 Comece por pedir o seu primeiro kit educativo para as suas turmas."
          }
        </p>
        <Button 
          onClick={() => setShowRequestForm(true)} 
          disabled={availableClasses.length === 0}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {availableClasses.length === 0 ? "Todas as Turmas com Pedido" : "Fazer Primeiro Pedido"}
        </Button>
      </Card>
    );
  };

  // Turmas disponíveis para pedido — agora respeita os filtros de ciclo/ano
  const visibleClasses = classes.filter(cls =>
    (selectedCycle === "all" || cls.cycle === selectedCycle) &&
    (selectedYear === "all" || String(cls.year) === String(selectedYear))
  );
  const availableClasses = visibleClasses.filter(cls => !classHasRequest(cls.id));

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full flex items-center justify-center">
          <Card className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">Erro ao Carregar</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Página
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background" onClick={clearNotifications}>
      <div className="hidden sm:block">
        <Sidebar />
      </div>
      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
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
              <p className="text-muted-foreground">Pedir e acompanhar kits para as suas turmas</p>
              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-PT')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            {!loading && (
              <Button 
                onClick={() => setShowRequestForm(true)} 
                disabled={availableClasses.length === 0}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Pedir Kit
                {availableClasses.length > 0 && (
                  <span className="ml-2 bg-white text-primary px-2 py-1 rounded-full text-sm font-bold min-w-6">
                    {availableClasses.length}
                  </span>
                )}
              </Button>
            )}
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

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center border-l-4 border-l-[hsl(26,90%,57%)] hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-[hsl(26,90%,57%)]">{getStatusCount("pending")}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </Card>
          <Card className="p-4 text-center border-l-4 border-l-[hsl(283,45%,33%)] hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-[hsl(283,45%,33%)]">{getStatusCount("approved")}</div>
            <div className="text-sm text-muted-foreground">Aprovados</div>
          </Card>
          <Card className="p-4 text-center border-l-4 border-l-[hsl(189,68%,64%)] hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-[hsl(189,68%,64%)]">{getStatusCount("shipped")}</div>
            <div className="text-sm text-muted-foreground">Enviados</div>
          </Card>
          <Card className="p-4 text-center border-l-4 border-l-[hsl(76,49%,52%)] hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-[hsl(76,49%,52%)]">{getStatusCount("delivered")}</div>
            <div className="text-sm text-muted-foreground">Entregues</div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar por turma, ciclo ou tipo de kit..."
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

            {/* Novo: filtro por Ciclo */}
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os Ciclos</option>
              {Array.from(new Set(classes.map(c => c.cycle))).map(cycle => (
                <option key={cycle} value={cycle}>{cycle}</option>
              ))}
            </select>

            {/* Novo: filtro por Ano */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os Anos</option>
              {Array.from(new Set(classes.map(c => String(c.year)))).sort().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Avisos */}
        {!loading && availableClasses.length === 0 && classes.length > 0 && (
          <Card className="p-4 mb-6 bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Todos os pedidos realizados</h3>
                <p className="text-green-700 text-sm">
                  Já fez pedidos para todas as suas turmas disponíveis.
                </p>
              </div>
            </div>
          </Card>
        )}

        {!loading && classes.length === 0 && (
          <Card className="p-4 mb-6 bg-yellow-50 border border-yellow-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Sem turmas disponíveis</h3>
                <p className="text-yellow-700 text-sm">
                  Precisa de criar turmas antes de poder pedir kits.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Formulário de Pedido */}
        {showRequestForm && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Plus className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">Novo Pedido de Kit</h3>
            </div>
            
            <form onSubmit={handleRequestKit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Selecionar Turma</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={availableClasses.length === 0}
                >
                  <option value="">Selecionar Turma...</option>
                  {availableClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.cycle} {cls.year} ({cls.students} alunos)
                    </option>
                  ))}
                </select>
                
                {availableClasses.length === 0 ? (
                  <p className="text-muted-foreground mt-2 text-sm text-center py-2 bg-muted rounded-lg">
                    Não tem turmas disponíveis para pedido
                  </p>
                ) : (
                  <p className="text-primary mt-2 font-medium text-sm text-center">
                    🎯 {availableClasses.length} turma(s) disponível(is)
                  </p>
                )}
              </div>

              {selectedClass && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-green-50 border border-green-200">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-800">Informações da Turma</h4>
                        <div className="space-y-1 text-sm text-green-700 mt-2">
                          <div className="flex items-center gap-2">
                            <School className="w-4 h-4" />
                            <span>{classes.find(c => c.id === parseInt(selectedClass))?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{classes.find(c => c.id === parseInt(selectedClass))?.students} alunos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{classes.find(c => c.id === parseInt(selectedClass))?.cycle}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Kit Padrão Inclui</h4>
                        <div className="text-sm text-blue-700 mt-2 space-y-1">
                          <div>• Material educativo completo</div>
                          <div>• Recursos para {classes.find(c => c.id === parseInt(selectedClass))?.students} alunos</div>
                          <div>• Guias do professor</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={!selectedClass}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Confirmar Pedido de Kit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRequestForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Modal de Reportar Problema - ATUALIZADO */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="p-6 w-full max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-[hsl(327,83%,50%)]" />
                <h3 className="text-xl font-bold">Reportar Problema</h3>
              </div>
              
              <form onSubmit={handleReportProblem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descrição do Problema
                  </label>
                  <textarea
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(327,83%,50%)] focus:border-[hsl(327,83%,50%)] resize-none"
                    rows="4"
                    placeholder="Ex: Material em falta, material danificado, quantidade incorreta, problemas com a qualidade..."
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="submit"
                    className="bg-[hsl(327,83%,50%)] hover:bg-[hsl(327,83%,50%)] text-white"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Reportar Problema
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowReportForm(false);
                      setSelectedRequestForReport(null);
                      setReportMessage("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
        {/* Lista de Pedidos */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Meus Pedidos de Kits</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>{filteredRequests.length} pedido(s)</span>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <RequestSkeleton key={i} />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
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