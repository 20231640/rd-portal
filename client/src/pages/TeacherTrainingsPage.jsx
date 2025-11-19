import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sidebar } from "../components/ui/sidebar";
import { Calendar, Video, CheckCircle, Clock } from "lucide-react";
import axios from "axios";
import { API_URL } from "../config/api";

export default function TeacherTrainingsPage() {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ CORREÇÃO: Buscar dados do professor logado
  useEffect(() => {
    const teacherDataStr = localStorage.getItem("teacherData");
    const loggedInTeacher = localStorage.getItem("loggedInTeacher");

    if (!teacherDataStr || !loggedInTeacher) {
      navigate("/login");
      return;
    }

    async function loadTeacherAndTrainings() {
      try {
        // ✅ CORREÇÃO: Usar dados do localStorage em vez de fazer fetch
        const teacherData = JSON.parse(teacherDataStr);
        console.log('✅ Carregando professor do localStorage:', teacherData);
        
        setTeacher(teacherData);

        // ✅ CORREÇÃO: Buscar formações usando a rota CORRETA
        console.log('🔄 Buscando formações...');
        
        // Primeiro tentar buscar todas as formações e filtrar
        try {
          const trainingsRes = await axios.get(`${API_URL}/api/trainings`);
          console.log('📊 Todas as formações:', trainingsRes.data);
          
          // Filtrar formações deste professor
          const teacherTrainings = trainingsRes.data.filter(
            training => training.teacherId === teacherData.id
          );
          
          console.log('✅ Formações do professor:', teacherTrainings);
          setTrainings(teacherTrainings);
          
        } catch (trainingsError) {
          console.error('❌ Erro ao buscar formações:', trainingsError);
          // Se não conseguir buscar formações, definir array vazio
          setTrainings([]);
        }

      } catch (err) {
        console.error("❌ Erro ao carregar dados:", err);
        alert("Erro ao carregar dados. Tente fazer login novamente.");
        localStorage.removeItem("teacherData");
        localStorage.removeItem("loggedInTeacher");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    loadTeacherAndTrainings();
  }, [navigate]);

  // ✅ CORREÇÃO: Função para verificar se formação é futura
  const isTrainingFuture = (trainingDate) => {
    try {
      return new Date(trainingDate) > new Date();
    } catch (err) {
      console.error('❌ Erro ao verificar data:', err);
      return false;
    }
  };

  // ✅ CORREÇÃO: Função para abrir certificado
  const handleOpenCertificate = (certificateUrl) => {
    if (!certificateUrl) {
      alert("Certificado não disponível");
      return;
    }

    // Se a URL já é completa
    if (certificateUrl.startsWith('http')) {
      window.open(certificateUrl, '_blank');
    } else {
      // Se é um caminho relativo
      window.open(`${API_URL}${certificateUrl}`, '_blank');
    }
  };

  if (!teacher && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Erro ao carregar dados do professor.</p>
          <Button onClick={() => navigate("/login")} className="mt-4">
            Fazer Login Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>A carregar formações...</p>
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
            <h1 className="text-3xl font-bold">AS Minhas Formações</h1>
            <p className="text-muted-foreground mt-2">
              Sessões de formação agendadas e certificados
            </p>
          </div>
        </div>

        {/* Conteúdo das Formações */}
        {trainings.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma formação agendada</h3>
            <p className="text-muted-foreground mb-4">
              Ainda não tem sessões de formação agendadas.
            </p>
            <p className="text-sm text-muted-foreground">
              O administrador irá contactá-lo para agendar uma sessão individual.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Sessões Agendadas */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Sessões de Formação</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainings.map((training) => (
                  <Card key={training.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {training.completed ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-600">Concluída</span>
                          </>
                        ) : isTrainingFuture(training.date) ? (
                          <>
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">Agendada</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-medium text-orange-600">Por Realizar</span>
                          </>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{training.title}</h3>
                      
                      {training.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {training.description}
                        </p>
                      )}
                      
                      {/* Avaliação do Admin */}
                      {training.completed && training.adminRating && (
                        <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">Avaliação do Formador:</span>
                            <span className="text-yellow-600 text-lg font-semibold">
                              {training.adminRating}/5
                            </span>
                          </div>
                          {training.feedback && (
                            <p className="text-sm text-green-700 mt-2">
                              "{training.feedback}"
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
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
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              Certificado: {new Date(training.certificateGeneratedAt).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(training.zoomLink, "_blank")}
                        disabled={!isTrainingFuture(training.date) && !training.completed}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        {training.completed ? "Sessão Concluída" : 
                         isTrainingFuture(training.date) ? "Entrar no Zoom" : "Link Expirado"}
                      </Button>

                      {/* Certificado */}
                      {training.completed && training.certificateUrl && (
                        <Button 
                          variant="default" 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleOpenCertificate(training.certificateUrl)}
                        >
                          📄 Ver Certificado
                        </Button>
                      )}

                      {/* Sessão por realizar */}
                      {!training.completed && !isTrainingFuture(training.date) && (
                        <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                          <p className="text-xs text-orange-700">
                            ⏰ Aguardando conclusão pelo administrador
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}