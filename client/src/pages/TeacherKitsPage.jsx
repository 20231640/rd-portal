// TeacherKitsPage.jsx - VERSÃO FINAL COMPLETA
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../components/ui/sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { KitJourney } from "../components/ui/kits/kit-journey";
import { 
  Package, Plus, CheckCircle, AlertCircle, 
  RefreshCw, Users, BookOpen, Calendar,
  MapPin, School, Clock, Truck, Home
} from "lucide-react";
import { API_URL } from "../config/api";

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

      // Filtrar turmas do professor
      const teacherClasses = allClasses.filter(cls => cls.teacherId === currentTeacher.id);
      detectChanges(teacherKits);

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

  // Detectar mudanças nos pedidos
  const detectChanges = (newRequests) => {
    if (previousRequestsRef.current.length === 0) {
      previousRequestsRef.current = newRequests;
      return;
    }
    previousRequestsRef.current = newRequests;
  };

  // Verificar se uma turma já tem pedido
  const classHasRequest = (classId) => {
    return kitRequests.some(request => 
      request.classId === classId && 
      request.status !== 'rejected' && 
      request.status !== 'cancelled'
    );
  };

  // Efeito para carregamento inicial
  useEffect(() => {
    fetchData();
  }, []);

  // Componente RequestCard separado para melhor organização
  const RequestCard = ({ request }) => {
    const classInfo = classes.find(c => c.id === request.classId);
    
    return (
      <Card className="p-8 hover:shadow-2xl transition-all duration-500 border-l-8 border-l-[hsl(76,49%,52%)] rounded-3xl bg-gradient-to-r from-white to-blue-50/30 border shadow-lg">
        {/* Header do Pedido */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">
                  {classInfo ? classInfo.name : "Turma não encontrada"}
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    - {classInfo?.cycle} {classInfo?.year} | Kit Padrão
                  </span>
                </h4>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm">
                    <Users className="w-4 h-4 text-[hsl(283,45%,33%)]" />
                    <span className="font-medium">{classInfo?.students} alunos</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm">
                    <BookOpen className="w-4 h-4 text-[hsl(26,90%,57%)]" />
                    <span className="font-medium">{classInfo?.cycle}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm">
                    <Calendar className="w-4 h-4 text-[hsl(189,68%,64%)]" />
                    <span className="font-medium">
                      Pedido: {new Date(request.requestedAt).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`px-4 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all duration-300 ${
              request.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
              request.status === 'approved' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
              request.status === 'shipped' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' :
              'bg-gradient-to-r from-green-400 to-emerald-600 text-white'
            }`}>
              {getStatusText(request.status)}
            </span>
          </div>
        </div>

        {/* Timeline Visual */}
        <KitJourney request={request} showDetails={true} />

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {/* Notas do Admin */}
          {request.adminNotes && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-[hsl(283,45%,33%)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-[hsl(283,45%,33%)] rounded-full animate-pulse"></div>
                <p className="font-semibold text-[hsl(283,45%,33%)] text-sm">📝 NOTA DO ADMINISTRADOR</p>
              </div>
              <p className="text-[hsl(283,45%,33%)] text-sm leading-relaxed">
                {request.adminNotes}
              </p>
            </div>
          )}

          {/* Problemas Reportados */}
          {request.reports && request.reports.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-[hsl(327,83%,50%)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-[hsl(327,83%,50%)]"></div>
                <p className="font-semibold text-[hsl(327,83%,50%)] text-sm">⚠️ PROBLEMA REPORTADO</p>
              </div>
              <p className="text-[hsl(327,83%,50%)] text-sm leading-relaxed mb-2">
                {request.reports[request.reports.length - 1].message}
              </p>
              <div className="flex justify-between items-center text-xs text-[hsl(327,83%,50%)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(request.reports[request.reports.length - 1].createdAt).toLocaleDateString('pt-PT')}
                </span>
                {request.reports[request.reports.length - 1].resolved && (
                  <span className="bg-[hsl(76,49%,52%)] text-[hsl(76,49%,52%)] px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Resolvido
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions e Footer */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 pt-6 mt-6 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <div className="bg-gray-100 px-3 py-2 rounded-lg border shadow-sm">
              <span className="font-mono font-bold text-gray-700">ID: #{request.id}</span>
            </div>
            {request.approvedAt && (
              <div className="flex items-center gap-2 bg-[hsl(76,49%,52%)] px-3 py-2 rounded-lg border border-[hsl(76,49%,52%)]">
                <CheckCircle className="w-4 h-4 text-[hsl(76,49%,52%)]" />
                <span className="text-[hsl(76,49%,52%)]">Aprovado: {new Date(request.approvedAt).toLocaleDateString('pt-PT')}</span>
              </div>
            )}
            {request.shippedAt && (
              <div className="flex items-center gap-2 bg-[hsl(189,68%,64%)] px-3 py-2 rounded-lg border border-[hsl(189,68%,64%)]">
                <Truck className="w-4 h-4 text-[hsl(189,68%,64%)]" />
                <span className="text-[hsl(189,68%,64%)]">Enviado: {new Date(request.shippedAt).toLocaleDateString('pt-PT')}</span>
              </div>
            )}
            {request.deliveredAt && (
              <div className="flex items-center gap-2 bg-[hsl(26,90%,57%)] px-3 py-2 rounded-lg border border-[hsl(26,90%,57%)]">
                <Home className="w-4 h-4 text-[hsl(26,90%,57%)]" />
                <span className="text-[hsl(26,90%,57%)]">Entregue: {new Date(request.deliveredAt).toLocaleDateString('pt-PT')}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {request.status === "shipped" && (
              <Button
                onClick={() => handleMarkAsDelivered(request.id)}
                className="bg-gradient-to-r from-[hsl(76,49%,52%)] to-[hsl(76,49%,52%)] hover:from-[hsl(76,49%,52%)] hover:to-[hsl(76,49%,52%)] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirmar Receção
              </Button>
            )}
            
            {request.status === "delivered" && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequestForReport(request);
                  setShowReportForm(true);
                }}
                className="border-2 border-[hsl(327,83%,50%)] text-[hsl(327,83%,50%)] hover:bg-[hsl(327,83%,50%)] hover:border-[hsl(327,83%,50%)] px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <AlertCircle className="w-5 h-5 mr-2" />
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
    <div className="border border-border rounded-2xl p-6 animate-pulse bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-gray-300 rounded-full mt-1"></div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-56 rounded-lg" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72 rounded" />
            <div className="space-y-3 mt-6">
              <Skeleton className="h-3 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );

  // Empty State
  const EmptyState = () => {
    const availableClasses = classes.filter(cls => !classHasRequest(cls.id));
    
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-3xl">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Package className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhum pedido de kit</h3>
        <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">
          {availableClasses.length === 0 && classes.length > 0 
            ? "🎉 Excelente! Já fez pedidos para todas as suas turmas disponíveis."
            : "📚 Comece por pedir o seu primeiro kit educativo para as suas turmas."
          }
        </p>
        <Button 
          onClick={() => setShowRequestForm(true)} 
          disabled={availableClasses.length === 0}
          className="bg-gradient-to-r from-[hsl(283,45%,33%)] to-[hsl(283,45%,33%)] hover:from-[hsl(283,45%,33%)] hover:to-[hsl(283,45%,33%)] text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-3" />
          {availableClasses.length === 0 ? "Todas as Turmas com Pedido" : "Fazer Primeiro Pedido"}
        </Button>
      </Card>
    );
  };

  // Função auxiliar para status
  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Pendente";
      case "approved": return "Aprovado";
      case "shipped": return "Enviado";
      case "delivered": return "Entregue";
      default: return status;
    }
  };

  // Turmas disponíveis para pedido
  const availableClasses = classes.filter(cls => !classHasRequest(cls.id));

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <Card className="p-8 text-center max-w-md mx-auto mt-20 bg-white rounded-3xl shadow-xl border-0">
            <div className="w-20 h-20 bg-[hsl(327,83%,50%)] rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-[hsl(327,83%,50%)]" />
            </div>
            <h2 className="text-2xl font-bold text-[hsl(327,83%,50%)] mb-3">Erro ao Carregar</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-[hsl(327,83%,50%)] to-[hsl(327,83%,50%)] hover:from-[hsl(327,83%,50%)] hover:to-[hsl(327,83%,50%)] text-white px-6 py-3 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Página
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gestão de Kits
                </h1>
                <p className="text-gray-600 text-lg mt-1">Pedir e acompanhar kits para as suas turmas</p>
              </div>
            </div>
            
            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border shadow-sm">
                <Clock className="w-4 h-4" />
                <span>Última atualização: {lastUpdate.toLocaleTimeString('pt-PT')}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={fetchData}
              disabled={loading}
              className="rounded-xl border-2 shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            {!loading && (
              <Button 
                onClick={() => setShowRequestForm(true)} 
                disabled={availableClasses.length === 0}
                className="bg-gradient-to-r from-[hsl(283,45%,33%)] to-[hsl(283,45%,33%)] hover:from-[hsl(283,45%,33%)] hover:to-[hsl(283,45%,33%)] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Pedir Kit
                {availableClasses.length > 0 && (
                  <span className="ml-2 bg-white text-[hsl(283,45%,33%)] px-2 py-1 rounded-full text-sm font-bold min-w-6">
                    {availableClasses.length}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Avisos */}
        {!loading && availableClasses.length === 0 && classes.length > 0 && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-[hsl(76,49%,52%)] rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[hsl(76,49%,52%)] rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[hsl(76,49%,52%)]" />
              </div>
              <div>
                <h3 className="font-bold text-[hsl(76,49%,52%)] text-lg">Todos os pedidos realizados</h3>
                <p className="text-[hsl(76,49%,52%)]">
                  Já fez pedidos para todas as suas turmas disponíveis.
                </p>
              </div>
            </div>
          </Card>
        )}

        {!loading && classes.length === 0 && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-[hsl(189,68%,64%)] rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[hsl(189,68%,64%)] rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[hsl(189,68%,64%)]" />
              </div>
              <div>
                <h3 className="font-bold text-[hsl(189,68%,64%)] text-lg">Sem turmas disponíveis</h3>
                <p className="text-[hsl(189,68%,64%)]">
                  Precisa de criar turmas antes de poder pedir kits.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Formulário de Pedido */}
        {showRequestForm && (
          <Card className="p-8 mb-8 rounded-3xl shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[hsl(283,45%,33%)] rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-[hsl(283,45%,33%)]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Novo Pedido de Kit</h3>
            </div>
            
            <form onSubmit={handleRequestKit} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Selecionar Turma</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-[hsl(283,45%,33%)] focus:border-[hsl(283,45%,33%)] transition-all duration-300 shadow-sm"
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
                  <p className="text-gray-500 mt-3 text-lg text-center py-4 bg-gray-50 rounded-xl border">
                    Não tem turmas disponíveis para pedido
                  </p>
                ) : (
                  <p className="text-[hsl(283,45%,33%)] mt-3 font-semibold text-center">
                    🎯 {availableClasses.length} turma(s) disponível(is)
                  </p>
                )}
              </div>

              {selectedClass && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-[hsl(76,49%,52%)] rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-[hsl(76,49%,52%)]" />
                      <div>
                        <h4 className="font-bold text-[hsl(76,49%,52%)]">Informações da Turma</h4>
                        <div className="space-y-2 text-sm text-[hsl(76,49%,52%)] mt-2">
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

                  <Card className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-[hsl(283,45%,33%)] rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-[hsl(283,45%,33%)]" />
                      <div>
                        <h4 className="font-bold text-[hsl(283,45%,33%)]">Kit Padrão Inclui</h4>
                        <div className="text-sm text-[hsl(283,45%,33%)] mt-2 space-y-1">
                          <div>• Material educativo completo</div>
                          <div>• Recursos para {classes.find(c => c.id === parseInt(selectedClass))?.students} alunos</div>
                          <div>• Guias do professor</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={!selectedClass}
                  className="bg-gradient-to-r from-[hsl(76,49%,52%)] to-[hsl(76,49%,52%)] hover:from-[hsl(76,49%,52%)] hover:to-[hsl(76,49%,52%)] text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex-1"
                >
                  <Package className="w-5 h-5 mr-3" />
                  Confirmar Pedido de Kit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRequestForm(false)}
                  className="px-8 py-4 rounded-2xl text-lg border-2 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Modal de Reportar Problema */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="p-8 w-full max-w-2xl rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-white to-[hsl(327,83%,50%)] animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[hsl(327,83%,50%)] rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-[hsl(327,83%,50%)]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Reportar Problema</h3>
                  <p className="text-gray-600 mt-1">
                    Descreva o problema encontrado com o kit recebido.
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleReportProblem} className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Descrição do Problema
                  </label>
                  <textarea
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-4 focus:outline-none focus:ring-4 focus:ring-[hsl(327,83%,50%)] focus:border-[hsl(327,83%,50%)] transition-all duration-300 shadow-sm resize-none"
                    rows="5"
                    placeholder="Ex: Material em falta, material danificado, quantidade incorreta, problemas com a qualidade..."
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-[hsl(327,83%,50%)] to-[hsl(327,83%,50%)] hover:from-[hsl(327,83%,50%)] hover:to-[hsl(327,83%,50%)] text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex-1"
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Reportar Problema
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowReportForm(false);
                      setSelectedRequestForReport(null);
                      setReportMessage("");
                    }}
                    className="px-8 py-4 rounded-2xl text-lg border-2 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Lista de Pedidos */}
        <Card className="p-8 rounded-3xl shadow-lg border-0 bg-white">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Meus Pedidos de Kits</h3>
              <p className="text-gray-600 mt-2">Acompanhe o estado dos seus pedidos em tempo real</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-[hsl(283,45%,33%)] rounded-2xl border border-[hsl(283,45%,33%)]">
              <Package className="w-5 h-5 text-[hsl(283,45%,33%)]" />
              <span className="font-semibold text-[hsl(283,45%,33%)]">{kitRequests.length} pedido(s)</span>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <RequestSkeleton key={i} />
              ))}
            </div>
          ) : kitRequests.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-8">
              {kitRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}