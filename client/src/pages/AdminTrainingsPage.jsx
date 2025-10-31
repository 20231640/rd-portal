import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Calendar, Video, Trash2, CheckCircle } from "lucide-react";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import axios from "axios";
import { CompleteTrainingModal } from "../components/ui/CompleteTrainingModal";

export default function AdminTrainingsPage() {
  const [trainings, setTrainings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [trainingToComplete, setTrainingToComplete] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    zoomLink: "",
    teacherId: ""
  });

  // Buscar dados
  const fetchData = async () => {
    try {
      const [trainingsRes, teachersRes] = await Promise.all([
        axios.get("http://localhost:4000/api/trainings"),
        axios.get("http://localhost:4000/api/auth/teachers")
      ]);

      setTrainings(trainingsRes.data);
      setTeachers(teachersRes.data.filter(t => !t.blocked && t.schoolApproved));
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Criar sessão individual
  const handleCreateTraining = async (e) => {
    e.preventDefault();
    
    if (!formData.teacherId) {
      alert("Por favor, selecione um professor.");
      return;
    }

    try {
      await axios.post("http://localhost:4000/api/trainings", {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        zoomLink: formData.zoomLink,
        teacherId: formData.teacherId
      });
      
      setShowForm(false);
      setFormData({ 
        title: "", 
        description: "", 
        date: "", 
        zoomLink: "",
        teacherId: "" 
      });
      fetchData();
      alert("✅ Sessão individual criada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao criar sessão");
    }
  };

  // Eliminar sessão
  const handleDeleteTraining = async (id) => {
    if (!confirm("Tem a certeza que quer eliminar esta sessão?")) return;
    
    try {
      await axios.delete(`http://localhost:4000/api/trainings/${id}`);
      fetchData();
      alert("✅ Sessão eliminada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao eliminar sessão");
    }
  };

  // Concluir sessão com avaliação
  const handleCompleteTraining = async (trainingId, data) => {
    try {
      await axios.put(`http://localhost:4000/api/trainings/${trainingId}/complete`, data);
      setTrainingToComplete(null);
      fetchData();
      alert("✅ Sessão concluída e certificado gerado!");
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao concluir sessão");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p>A carregar sessões...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Sessões de Formação Individuais</h1>
            <p className="text-muted-foreground mt-2">
              Gerir sessões 1-on-1 com professores
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Sessão Individual
          </Button>
        </div>

        {/* Formulário para Criar Sessão INDIVIDUAL */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Agendar Sessão Individual</h2>
            <form onSubmit={handleCreateTraining} className="space-y-4">
              {/* Selecionar Professor */}
              <div>
                <label className="block text-sm font-medium mb-2">Professor *</label>
                <select
                  required
                  value={formData.teacherId}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                >
                  <option value="">Selecionar Professor</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.school?.name || teacher.school}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  placeholder="Ex: Formação Individual - Plataforma RD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  rows="3"
                  placeholder="Descrição da sessão individual..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data e Hora *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Link Zoom *</label>
                  <input
                    type="url"
                    required
                    value={formData.zoomLink}
                    onChange={(e) => setFormData({...formData, zoomLink: e.target.value})}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Sessão
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Lista de Sessões INDIVIDUAIS */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Sessões Agendadas ({trainings.length})
          </h2>

          {trainings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma sessão individual agendada</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Sessão
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainings.map((training) => (
                <Card key={training.id} className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{training.title}</h3>
                          {training.completed && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        {/* Info do Professor */}
                        <p className="text-sm text-muted-foreground">
                          👨‍🏫 {training.teacher?.name}
                          {training.teacher?.school && ` - ${training.teacher.school.name}`}
                        </p>
                        
                        {/* Avaliação se existir */}
                        {training.completed && training.adminRating && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500 text-sm">
                              {'★'.repeat(training.adminRating)}
                              {'☆'.repeat(5 - training.adminRating)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({training.adminRating}/5)
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTraining(training.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    
                    {training.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {training.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(training.date).toLocaleString('pt-PT')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <span className="text-blue-600">Link Zoom Disponível</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(training.zoomLink, "_blank")}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Abrir Zoom
                    </Button>
                    
                    {/* Botão para Concluir Sessão */}
                    {!training.completed && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setTrainingToComplete(training)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Concluir Sessão
                      </Button>
                    )}
                    
                    {/* Link para Certificado */}
                    {training.completed && training.certificateUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`http://localhost:4000${training.certificateUrl}`, '_blank')}
                      >
                        📄 Ver Certificado
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Modal para Concluir Sessão */}
        {trainingToComplete && (
          <CompleteTrainingModal
            training={trainingToComplete}
            onClose={() => setTrainingToComplete(null)}
            onComplete={handleCompleteTraining}
          />
        )}
      </div>
    </div>
  );
}