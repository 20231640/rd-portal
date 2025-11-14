// TeacherKitsPage.jsx - ATUALIZADO E SIMPLIFICADO
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../components/ui/sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { KitJourney } from "../components/ui/kits/kit-journey";
import { 
  Package, Plus, CheckCircle, AlertCircle, 
  RefreshCw, Users, BookOpen
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

  // ✅ CORREÇÃO: Buscar kits com a rota CORRETA
  const fetchData = async () => {
    try {
      const teacherDataStr = localStorage.getItem("teacherData");
      const loggedInTeacher = localStorage.getItem("loggedInTeacher");
      
      if (!teacherDataStr || !loggedInTeacher) {
        console.log('❌ Não autenticado');
        return;
      }

      const currentTeacher = JSON.parse(teacherDataStr);
      console.log('✅ Carregando professor do localStorage:', currentTeacher);
      setTeacher(currentTeacher);

      console.log('🔄 Buscando dados...');
      
      let allClasses = [];
      let teacherKits = [];

      // ✅ CORREÇÃO: Buscar turmas
      try {
        const classesRes = await fetch(`${API_URL}/api/classes`);
        console.log('📡 Status das turmas:', classesRes.status);
        
        if (classesRes.ok) {
          allClasses = await classesRes.json();
          console.log('✅ Turmas carregadas:', allClasses.length);
        } else {
          console.error('❌ Erro ao carregar turmas:', classesRes.status);
          throw new Error(`Erro ${classesRes.status} ao carregar turmas`);
        }
      } catch (classesError) {
        console.error('❌ Erro nas turmas:', classesError);
        throw new Error("Falha ao carregar turmas: " + classesError.message);
      }

      // ✅✅✅ CORREÇÃO CRÍTICA: Buscar kits do professor específico
      try {
        const kitsRes = await fetch(`${API_URL}/api/kits/teacher/${currentTeacher.id}`);
        console.log('📡 Status dos kits:', kitsRes.status);
        
        if (kitsRes.ok) {
          teacherKits = await kitsRes.json();
          console.log('✅ Kits do professor carregados:', teacherKits.length);
        } else {
          console.error('❌ Erro ao carregar kits:', kitsRes.status);
          
          // Se a rota não existir (404), usar array vazio
          if (kitsRes.status === 404) {
            console.warn('⚠️ Rota /api/kits/teacher/:id não encontrada, usando array vazio');
            teacherKits = [];
          } else {
            throw new Error(`Erro ${kitsRes.status} ao carregar pedidos`);
          }
        }
      } catch (kitsError) {
        console.error('❌ Erro nos kits:', kitsError);
        
        // Se for erro de rede, usar array vazio
        if (kitsError.message.includes('Failed to fetch')) {
          console.warn('⚠️ Erro de rede nos kits, usando array vazio');
          teacherKits = [];
        } else {
          throw new Error("Falha ao carregar pedidos: " + kitsError.message);
        }
      }

      console.log('📊 Dados carregados:', { 
        turmas: allClasses.length, 
        kits: teacherKits.length 
      });

      // ✅ CORREÇÃO: Filtrar apenas as turmas do professor
      const teacherClasses = allClasses.filter(cls => cls.teacherId === currentTeacher.id);

      console.log('✅ Dados filtrados:', { 
        teacherClasses: teacherClasses.length, 
        teacherKits: teacherKits.length 
      });

      // Detectar mudanças para notificações
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

  // ✅ CORREÇÃO: Função de pedir kit
  const handleRequestKit = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      console.log('🔄 Criando pedido de kit...', {
        teacherId: teacher.id,
        classId: parseInt(selectedClass),
        kitType: "standard" // Valor padrão
      });

      const res = await fetch(`${API_URL}/api/kits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.id,
          classId: parseInt(selectedClass),
          kitType: "standard"
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Erro do servidor:', errorData);
        throw new Error(errorData.message || "Erro ao criar pedido");
      }

      const newRequest = await res.json();
      console.log('✅ Pedido criado:', newRequest);
      
      setKitRequests(prev => [newRequest, ...prev]);
      setShowRequestForm(false);
      setSelectedClass("");
      
      // Forçar atualização para sincronizar
      setTimeout(() => fetchData(), 1000);
      
      alert("Pedido de kit criado com sucesso!");
      
    } catch (err) {
      console.error("❌ Erro ao pedir kit:", err);
      alert("Erro ao fazer pedido: " + err.message);
    }
  };

  // ✅ CORREÇÃO: Função de marcar como entregue com a rota CORRETA
  const handleMarkAsDelivered = async (requestId) => {
    try {
      console.log('🔄 Marcando como entregue...', requestId);

      // ✅ CORREÇÃO: Usar a rota CORRETA /api/kits/:id/deliver
      const res = await fetch(`${API_URL}/api/kits/${requestId}/deliver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      // ✅ VERIFICAR se a resposta é JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await res.text();
        console.error('❌ Resposta não é JSON:', textResponse.substring(0, 200));
        throw new Error("Servidor retornou resposta inválida");
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao marcar como entregue");
      }

      const updatedRequest = await res.json();
      console.log('✅ Pedido atualizado:', updatedRequest);
      
      setKitRequests(prev =>
        prev.map(req =>
          req.id === requestId ? updatedRequest : req
        )
      );
      
      // Forçar atualização
      setTimeout(() => fetchData(), 1000);
      
      alert("Receção confirmada com sucesso!");
      
    } catch (err) {
      console.error("❌ Erro ao marcar como entregue:", err);
      alert("Erro ao confirmar receção: " + err.message);
    }
  };

  // ✅ CORREÇÃO: Função de reportar problema
  const handleReportProblem = async (e) => {
    e.preventDefault();
    if (!reportMessage.trim()) return;

    try {
      console.log("📤 Enviando report para kit:", selectedRequestForReport.id);

      // ✅ CORREÇÃO: Usar a rota correta para reports
      const response = await fetch(`${API_URL}/api/kits/${selectedRequestForReport.id}/reports`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: reportMessage,
          teacherId: teacher.id,
          teacherName: teacher.name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao reportar problema");
      }

      const result = await response.json();
      console.log("✅ Report criado com sucesso:", result);

      // ✅ CORREÇÃO: Atualizar a lista de kits para refletir o report
      await fetchData(); // Recarregar dados completos

      alert("Problema reportado com sucesso!");
      setShowReportForm(false);
      setSelectedRequestForReport(null);
      setReportMessage("");

    } catch (err) {
      console.error("💥 Erro completo:", err);
      alert("Erro ao reportar problema: " + err.message);
    }
  };

  // ✅ CORREÇÃO: Detectar mudanças nos pedidos (mantida igual)
  const detectChanges = (newRequests) => {
    if (previousRequestsRef.current.length === 0) {
      previousRequestsRef.current = newRequests;
      return;
    }

    const changes = {
      new: [],
      updated: []
    };

    // Encontrar novos pedidos
    newRequests.forEach(request => {
      const existing = previousRequestsRef.current.find(r => r.id === request.id);
      if (!existing) {
        changes.new.push(request);
      } else if (existing.status !== request.status) {
        changes.updated.push({ from: existing.status, to: request.status, request });
      }
    });

    previousRequestsRef.current = newRequests;
  };

  // ✅ CORREÇÃO: Verificar se uma turma já tem pedido (mantida igual)
  const classHasRequest = (classId) => {
    return kitRequests.some(request => 
      request.classId === classId && 
      request.status !== 'rejected' && 
      request.status !== 'cancelled'
    );
  };

  // ✅ CORREÇÃO: Efeito para carregamento inicial
  useEffect(() => {
    fetchData();
  }, []);

  // ✅ CORREÇÃO: Loading Skeleton (mantido igual)
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
        </div>
      </div>
    </div>
  );

  // ✅ CORREÇÃO: Empty State (mantido igual)
  const EmptyState = () => {
    const availableClasses = classes.filter(cls => !classHasRequest(cls.id));
    
    return (
      <Card className="p-8 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Nenhum pedido de kit</h3>
        <p className="text-muted-foreground mb-6">
          {availableClasses.length === 0 && classes.length > 0 
            ? "Já fez pedidos para todas as suas turmas disponíveis."
            : "Ainda não fez nenhum pedido de kit para as suas turmas."
          }
        </p>
        <Button 
          onClick={() => setShowRequestForm(true)} 
          disabled={availableClasses.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          {availableClasses.length === 0 ? "Todas as Turmas com Pedido" : "Fazer Primeiro Pedido"}
        </Button>
      </Card>
    );
  };

  // ✅ CORREÇÃO: Função auxiliar para status (mantida igual)
  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Pendente";
      case "approved": return "Aprovado";
      case "shipped": return "Enviado";
      case "delivered": return "Entregue";
      default: return status;
    }
  };

  // ✅ CORREÇÃO: Turmas disponíveis para pedido (mantida igual)
  const availableClasses = classes.filter(cls => !classHasRequest(cls.id));

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 p-8">
          <Card className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">Erro</h2>
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Gestão de Kits</h1>
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

            {!loading && (
              <Button onClick={() => setShowRequestForm(true)} disabled={availableClasses.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Pedir Kit
                {availableClasses.length > 0 && ` (${availableClasses.length})`}
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

        {/* Aviso se não tem turmas disponíveis */}
        {!loading && availableClasses.length === 0 && classes.length > 0 && (
          <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">Todos os pedidos realizados</h3>
                <p className="text-blue-700 text-sm">
                  Já fez pedidos para todas as suas turmas disponíveis.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Aviso se não tem turmas */}
        {!loading && classes.length === 0 && (
          <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
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

        {/* Formulário de Pedido SIMPLIFICADO */}
        {showRequestForm && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Novo Pedido de Kit</h3>
            <form onSubmit={handleRequestKit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Turma *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={availableClasses.length === 0}
                >
                  <option value="">Selecionar Turma</option>
                  {availableClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.cycle} {cls.year} ({cls.students} alunos)
                    </option>
                  ))}
                </select>
                {availableClasses.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Não tem turmas disponíveis para pedido
                  </p>
                ) : (
                  <p className="text-sm text-green-600 mt-1">
                    {availableClasses.length} turma(s) disponível(is)
                  </p>
                )}
              </div>

              {/* Informação fixa do kit */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-800">Kit Padrão</h4>
                    <p className="text-sm text-blue-700">
                      Material educativo completo para a turma selecionada
                    </p>
                  </div>
                </div>
              </Card>

              {selectedClass && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">Informações da Turma Selecionada</h4>
                      <div className="flex gap-4 text-sm text-green-700 mt-1">
                        <span>📚 {classes.find(c => c.id === parseInt(selectedClass))?.name}</span>
                        <span>👥 {classes.find(c => c.id === parseInt(selectedClass))?.students} alunos</span>
                        <span>🎯 {classes.find(c => c.id === parseInt(selectedClass))?.cycle}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={!selectedClass}>
                  <Package className="w-4 h-4 mr-2" />
                  Pedir Kit
                </Button>
                <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Modal de Reportar Problema */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Reportar Problema</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Descreva o problema encontrado com o kit recebido.
              </p>
              <form onSubmit={handleReportProblem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição do Problema *</label>
                  <textarea
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="4"
                    placeholder="Ex: Material em falta, material danificado, quantidade incorreta..."
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Reportar Problema
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowReportForm(false);
                    setSelectedRequestForReport(null);
                    setReportMessage("");
                  }}>
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
              <span>{kitRequests.length} pedido(s)</span>
            </div>
          </div>
          
          {loading ? (
            // Loading State
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <RequestSkeleton key={i} />
              ))}
            </div>
          ) : kitRequests.length === 0 ? (
            // Empty State
            <EmptyState />
          ) : (
            // Conteúdo Real
            <div className="space-y-6">
              {kitRequests.map(request => {
                const classInfo = classes.find(c => c.id === request.classId);
                return (
                  <Card key={request.id} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                    {/* Header do Pedido */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-6 h-6 text-primary" />
                          <h4 className="text-xl font-bold">
                            {classInfo ? `${classInfo.name}` : "Turma não encontrada"}
                            <span className="text-lg font-normal text-muted-foreground ml-2">
                              - {classInfo?.cycle} {classInfo?.year} | Kit Padrão
                            </span>
                          </h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{classInfo?.students} alunos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{classInfo?.cycle}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
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
                          {getStatusText(request.status)}
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
                        <p className="text-sm text-red-700">
                          <strong>⚠️ Problema Reportado:</strong> {request.reports[request.reports.length - 1].message}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Reportado em: {new Date(request.reports[request.reports.length - 1].createdAt).toLocaleDateString('pt-PT')}
                          {request.reports[request.reports.length - 1].resolved && (
                            <span className="ml-2 text-green-600">✅ Resolvido</span>
                          )}
                        </p>
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
                        {request.status === "shipped" && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsDelivered(request.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirmar Receção
                          </Button>
                        )}
                        
                        {request.status === "delivered" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequestForReport(request);
                              setShowReportForm(true);
                            }}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Reportar Problema
                          </Button>
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