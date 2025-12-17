// src/pages/TeacherTrainingsPage.jsx - VERSÃO CORRIGIDA COM MENU MOBILE
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sidebar } from "../components/ui/sidebar";
import { Calendar, Video, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import { API_URL } from "../config/api";

export default function TeacherTrainingsPage() {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar dados do professor logado
  useEffect(() => {
    const teacherDataStr = localStorage.getItem("teacherData");
    const loggedInTeacher = localStorage.getItem("loggedInTeacher");

    if (!teacherDataStr || !loggedInTeacher) {
      navigate("/login");
      return;
    }

    async function loadTeacherAndTrainings() {
      try {
        setError(null);
        const teacherData = JSON.parse(teacherDataStr);
        console.log('✅ A carregar professor do localStorage:', teacherData);
        
        setTeacher(teacherData);

        console.log('🔄 A buscar formações...');
        
        try {
          const trainingsRes = await axios.get(`${API_URL}/api/trainings`);
          console.log('📊 Todas as formações:', trainingsRes.data);
          
          const teacherTrainings = trainingsRes.data.filter(
            training => training.teacherId === teacherData.id
          );
          
          console.log('✅ Formações do professor:', teacherTrainings);
          setTrainings(teacherTrainings);
          
        } catch (trainingsError) {
          console.error('❌ Erro ao buscar formações:', trainingsError);
          setError("Erro ao carregar formações. Tente novamente.");
          setTrainings([]);
        }

      } catch (err) {
        console.error("❌ Erro ao carregar dados:", err);
        setError("Erro ao carregar dados. Tente fazer login novamente.");
        localStorage.removeItem("teacherData");
        localStorage.removeItem("loggedInTeacher");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    loadTeacherAndTrainings();
  }, [navigate]);

  // Função para recarregar
  const handleRetry = () => {
    setLoading(true);
    const teacherDataStr = localStorage.getItem("teacherData");
    if (teacherDataStr) {
      const teacherData = JSON.parse(teacherDataStr);
      loadTrainings(teacherData.id);
    }
  };

  // Função separada para carregar formações
  const loadTrainings = async (teacherId) => {
    try {
      setError(null);
      const trainingsRes = await axios.get(`${API_URL}/api/trainings`);
      const teacherTrainings = trainingsRes.data.filter(
        training => training.teacherId === teacherId
      );
      setTrainings(teacherTrainings);
    } catch (err) {
      setError("Erro ao carregar formações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se formação é futura
  const isTrainingFuture = (trainingDate) => {
    try {
      return new Date(trainingDate) > new Date();
    } catch (err) {
      console.error('❌ Erro ao verificar data:', err);
      return false;
    }
  };

  // Função para abrir certificado
  const handleOpenCertificate = (certificateUrl) => {
    if (!certificateUrl) {
      alert("Certificado não disponível");
      return;
    }

    if (certificateUrl.startsWith('http')) {
      window.open(certificateUrl, '_blank');
    } else {
      window.open(`${API_URL}${certificateUrl}`, '_blank');
    }
  };

  // Estatísticas
  const stats = {
    total: trainings.length,
    completed: trainings.filter(t => t.completed).length,
    scheduled: trainings.filter(t => isTrainingFuture(t.date)).length,
    pending: trainings.filter(t => !t.completed && !isTrainingFuture(t.date)).length
  };

  if (!teacher && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">Erro ao carregar</h2>
          <p className="text-muted-foreground mb-4">
            Erro ao carregar os dados do professor.
          </p>
          <Button onClick={() => navigate("/login")} className="w-full">
            Fazer Login Novamente
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <div className="h-8 lg:h-9 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-3 lg:p-4 animate-pulse">
                <div className="h-6 lg:h-8 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 lg:p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="h-5 lg:h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-9 lg:h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-9 lg:h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">As Minhas Formações</h1>
            <p className="text-muted-foreground mt-2 text-sm lg:text-base">
              Sessões de formação agendadas e certificados
            </p>
          </div>
          
          {/* Botão de atualização */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={loading}
            className="w-full lg:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Estado de erro */}
        {error && (
          <Card className="p-4 mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm lg:text-base">
                  Erro ao carregar
                </h3>
                <p className="text-red-700 dark:text-red-400 text-sm mt-1">
                  {error}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
                className="flex-shrink-0"
              >
                Tentar Novamente
              </Button>
            </div>
          </Card>
        )}

        {/* Estatísticas */}
        {trainings.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <Card className="p-3 lg:p-4 text-center border-l-4 border-l-blue-500">
              <div className="text-lg lg:text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Total</div>
            </Card>
            <Card className="p-3 lg:p-4 text-center border-l-4 border-l-green-500">
              <div className="text-lg lg:text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Concluídas</div>
            </Card>
            <Card className="p-3 lg:p-4 text-center border-l-4 border-l-orange-500">
              <div className="text-lg lg:text-2xl font-bold text-orange-600">{stats.scheduled}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Agendadas</div>
            </Card>
            <Card className="p-3 lg:p-4 text-center border-l-4 border-l-yellow-500">
              <div className="text-lg lg:text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs lg:text-sm text-muted-foreground">Por Realizar</div>
            </Card>
          </div>
        )}

        {/* Conteúdo das Formações */}
        {trainings.length === 0 ? (
          <Card className="p-6 lg:p-8 text-center">
            <Calendar className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg lg:text-xl font-semibold mb-2 text-foreground">Nenhuma formação agendada</h3>
            <p className="text-muted-foreground mb-4 text-sm lg:text-base">
              Ainda não tem sessões de formação agendadas.
            </p>
            <p className="text-sm text-muted-foreground">
              O administrador irá contactá-lo para agendar uma sessão individual.
            </p>
            
            {/* Botão de recarregar */}
            <Button 
              variant="outline" 
              onClick={handleRetry}
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar Novamente
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Sessões Agendadas */}
            <div>
              <h2 className="text-xl lg:text-2xl font-semibold mb-4 text-foreground">Sessões de Formação</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {trainings.map((training) => (
                  <Card key={training.id} className="p-4 lg:p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                    <div>
                      {/* Status */}
                      <div className="flex items-center gap-2 mb-3">
                        {training.completed ? (
                          <>
                            <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0" />
                            <span className="text-xs lg:text-sm font-medium text-green-600">Concluída</span>
                          </>
                        ) : isTrainingFuture(training.date) ? (
                          <>
                            <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" />
                            <span className="text-xs lg:text-sm font-medium text-blue-600">Agendada</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600 flex-shrink-0" />
                            <span className="text-xs lg:text-sm font-medium text-orange-600">Por Realizar</span>
                          </>
                        )}
                      </div>
                      
                      {/* Título e Descrição */}
                      <h3 className="font-semibold text-base lg:text-lg mb-2 text-foreground line-clamp-2">
                        {training.title}
                      </h3>
                      
                      {training.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                          {training.description}
                        </p>
                      )}
                      
                      {/* Avaliação do Admin */}
                      {training.completed && training.adminRating && (
                        <div className="mb-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs lg:text-sm font-medium text-green-800 dark:text-green-300">
                              Avaliação do Formador:
                            </span>
                            <span className="text-yellow-600 dark:text-yellow-400 text-sm lg:text-lg font-semibold">
                              {training.adminRating}/5
                            </span>
                          </div>
                          {training.feedback && (
                            <p className="text-xs lg:text-sm text-green-700 dark:text-green-400 mt-2 italic">
                              "{training.feedback}"
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Informações da Data */}
                      <div className="space-y-2 text-xs lg:text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">
                            {new Date(training.date).toLocaleString('pt-PT', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {training.certificateGeneratedAt && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                            <span className="text-xs lg:text-sm">
                              Certificado: {new Date(training.certificateGeneratedAt).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col gap-2 mt-4 lg:mt-6">
                      {/* Botão Zoom */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs lg:text-sm"
                        onClick={() => window.open(training.zoomLink, "_blank")}
                        disabled={!isTrainingFuture(training.date) && !training.completed}
                      >
                        <Video className="w-3 h-3 lg:w-4 lg:h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {training.completed ? "Sessão Concluída" : 
                           isTrainingFuture(training.date) ? "Entrar no Zoom" : "Link Expirado"}
                        </span>
                      </Button>

                      {/* Certificado */}
                      {training.completed && training.certificateUrl && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-xs lg:text-sm"
                          onClick={() => handleOpenCertificate(training.certificateUrl)}
                        >
                          📄 <span className="ml-1">Ver Certificado</span>
                        </Button>
                      )}

                      {/* Sessão por realizar */}
                      {!training.completed && !isTrainingFuture(training.date) && (
                        <div className="text-center p-2 bg-orange-50 dark:bg-orange-900 rounded border border-orange-200 dark:border-orange-700">
                          <p className="text-xs text-orange-700 dark:text-orange-300">
                            ⏰ Aguarda a conclusão pelo administrador
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Resumo */}
            <Card className="p-4 lg:p-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-sm lg:text-base mb-2">
                💡 Informações Importantes
              </h3>
              <ul className="text-xs lg:text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• As sessões de formação são realizadas via Zoom</li>
                <li>• O link estará disponível antes do início da sessão</li>
                <li>• O certificado será disponibilizado após conclusão</li>
                <li>• Em caso de dúvidas, contacte o administrador</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}