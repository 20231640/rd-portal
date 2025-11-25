import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Plus, Calendar, Video, Trash2, CheckCircle, Users, Filter, Menu } from "lucide-react";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import axios from "axios";
import { CompleteTrainingModal } from "../components/ui/CompleteTrainingModal";
import { API_URL } from "../config/api";

const cycles = {
  "Pré-Escolar": ["3 anos", "4 anos", "5 anos"],
  "1º Ciclo": ["1º ano", "2º ano", "3º ano", "4º ano"],
  "2º Ciclo": ["5º ano", "6º ano"],
  "3º Ciclo": ["7º ano", "8º ano", "9º ano"],
  "Secundário": ["10º ano", "11º ano", "12º ano"]
};

export default function AdminTrainingsPage() {
  const [trainings, setTrainings] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [trainingToComplete, setTrainingToComplete] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Filtros hierárquicos
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    zoomLink: ""
  });

  // Buscar dados
  const fetchData = async () => {
    try {
      const [trainingsRes, teachersRes, classesRes] = await Promise.all([
        axios.get(`${API_URL}/api/trainings`),
        axios.get(`${API_URL}/api/auth/teachers`),
        axios.get(`${API_URL}/api/classes`)
      ]);

      setTrainings(trainingsRes.data);
      setAllTeachers(teachersRes.data);
      setAllClasses(classesRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar escolas baseado no ciclo selecionado
  const getAvailableSchools = () => {
    if (!selectedCycle) return [];
    
    const teacherIdsInCycle = new Set(
      allClasses
        .filter(cls => cls.cycle === selectedCycle)
        .map(cls => cls.teacherId)
    );
    
    const schoolsMap = new Map();
    allTeachers
      .filter(teacher => 
        !teacher.blocked && 
        teacher.schoolApproved &&
        teacherIdsInCycle.has(teacher.id)
      )
      .forEach(teacher => {
        if (teacher.school && !schoolsMap.has(teacher.school.id)) {
          schoolsMap.set(teacher.school.id, teacher.school);
        }
      });
    
    return Array.from(schoolsMap.values());
  };

  // Filtrar professores baseado no ciclo e escolas selecionadas
  const getAvailableTeachers = () => {
    if (!selectedCycle) return [];
    
    const teacherIdsInCycle = new Set(
      allClasses
        .filter(cls => cls.cycle === selectedCycle)
        .map(cls => cls.teacherId)
    );
    
    let filtered = allTeachers.filter(teacher => 
      !teacher.blocked && 
      teacher.schoolApproved &&
      teacherIdsInCycle.has(teacher.id) &&
      (selectedSchools.length === 0 || selectedSchools.includes(teacher.schoolId?.toString()))
    );
    
    const teachersWithTrainings = new Set(
      trainings.map(training => training.teacherId)
    );
    
    return filtered.filter(teacher => !teachersWithTrainings.has(teacher.id));
  };

  // Selecionar/desselecionar todos os professores disponíveis
  const handleSelectAllTeachers = (checked) => {
    if (checked) {
      const availableTeachers = getAvailableTeachers();
      setSelectedTeacherIds(availableTeachers.map(t => t.id.toString()));
    } else {
      setSelectedTeacherIds([]);
    }
  };

  // Selecionar/desselecionar professor individual
  const handleToggleTeacher = (teacherId) => {
    setSelectedTeacherIds(prev => {
      const idStr = teacherId.toString();
      if (prev.includes(idStr)) {
        return prev.filter(id => id !== idStr);
      } else {
        return [...prev, idStr];
      }
    });
  };

  // Selecionar/desselecionar escola
  const handleToggleSchool = (schoolId) => {
    setSelectedSchools(prev => {
      const idStr = schoolId.toString();
      if (prev.includes(idStr)) {
        setSelectedTeacherIds(currentIds => {
          return allTeachers
            .filter(t => currentIds.includes(t.id.toString()))
            .filter(t => t.schoolId?.toString() !== idStr)
            .map(t => t.id.toString());
        });
        return prev.filter(id => id !== idStr);
      } else {
        return [...prev, idStr];
      }
    });
  };

  // Selecionar todas as escolas
  const handleSelectAllSchools = (checked) => {
    if (checked) {
      const availableSchools = getAvailableSchools();
      setSelectedSchools(availableSchools.map(s => s.id.toString()));
    } else {
      setSelectedSchools([]);
    }
  };

  // Resetar seleções
  const resetSelections = () => {
    setSelectedCycle("");
    setSelectedSchools([]);
    setSelectedTeacherIds([]);
  };

  // Criar sessões de grupo
  const handleCreateTraining = async (e) => {
    e.preventDefault();
    
    if (selectedTeacherIds.length === 0) {
      alert("Por favor, selecione pelo menos um professor.");
      return;
    }

    if (!formData.title || !formData.date || !formData.zoomLink) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const promises = selectedTeacherIds.map(teacherId =>
        axios.post(`${API_URL}/api/trainings`, {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          zoomLink: formData.zoomLink,
          teacherId: teacherId,
          groupId: groupId,
          cycle: selectedCycle
        })
      );

      await Promise.all(promises);
      
      setShowForm(false);
      setFormData({ 
        title: "", 
        description: "", 
        date: "", 
        zoomLink: ""
      });
      resetSelections();
      fetchData();
      alert(`Sessão de grupo criada com sucesso para ${selectedTeacherIds.length} professor(es)!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar sessão de grupo");
    }
  };

  // Eliminar sessão
  const handleDeleteTraining = async (id) => {
    if (!confirm("Tem a certeza que pretende eliminar esta sessão?")) return;
    
    try {
      await axios.delete(`${API_URL}/api/trainings/${id}`);
      fetchData();
      alert("Sessão eliminada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao eliminar sessão");
    }
  };

  // Eliminar grupo inteiro
  const handleDeleteGroup = async (groupId) => {
    if (!confirm(`Tem a certeza que pretende eliminar todas as sessões deste grupo?`)) return;
    
    try {
      const groupTrainings = trainings.filter(t => t.groupId === groupId);
      await Promise.all(groupTrainings.map(t => axios.delete(`${API_URL}/api/trainings/${t.id}`)));
      fetchData();
      alert("Grupo eliminado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao eliminar grupo");
    }
  };

  // Concluir sessão com avaliação
  const handleCompleteTraining = async (trainingId, data) => {
    try {
      await axios.put(`${API_URL}/api/trainings/${trainingId}/complete`, data);
      setTrainingToComplete(null);
      fetchData();
      alert("Sessão concluída e certificado gerado!");
    } catch (err) {
      console.error(err);
      alert("Erro ao concluir sessão");
    }
  };

  // Agrupar sessões por groupId ou teacherId
  const groupedTrainings = trainings.reduce((acc, training) => {
    const key = training.groupId || `individual_${training.teacherId}`;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        title: training.title,
        description: training.description,
        date: training.date,
        zoomLink: training.zoomLink,
        completed: training.completed,
        adminRating: training.adminRating,
        certificateUrl: training.certificateUrl,
        cycle: training.cycle,
        groupId: training.groupId,
        isGroup: !!training.groupId,
        trainings: []
      };
    }
    acc[key].trainings.push(training);
    return acc;
  }, {});

  const availableSchools = getAvailableSchools();
  const availableTeachers = getAvailableTeachers();
  const allTeachersSelected = availableTeachers.length > 0 && 
    selectedTeacherIds.length === availableTeachers.length;
  const allSchoolsSelected = availableSchools.length > 0 &&
    selectedSchools.length === availableSchools.length;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden sm:block">
          <AdminSidebar />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={`
          fixed top-0 left-0 h-full z-50 transition-transform duration-300
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:hidden
        `}>
          <AdminSidebar />
        </div>

        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full flex items-center justify-center">
          {/* Mobile Header */}
          <div className="flex justify-between items-center mb-6 sm:hidden absolute top-4 left-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold">Formações</h1>
            <div className="w-10"></div>
          </div>

          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-muted-foreground">A carregar sessões...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden sm:block">
        <AdminSidebar />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-transform duration-300
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:hidden
      `}>
        <AdminSidebar />
      </div>

      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-6 sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Formações</h1>
          <div className="w-10"></div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Sessões de Formação em Grupo</h1>
            <p className="text-muted-foreground mt-2">
              Gerir sessões de formação em grupo por ciclo e escola
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova Sessão de Grupo
            </Button>
          </div>
        </div>

        {/* Mobile Create Button */}
        <div className="sm:hidden mb-6">
          <Button onClick={() => setShowForm(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Nova Sessão de Grupo
          </Button>
        </div>

        {/* Formulário para Criar Sessão de Grupo */}
        {showForm && (
          <Card className="p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Agendar Sessão de Grupo</h2>
            <form onSubmit={handleCreateTraining} className="space-y-6">
              {/* Filtros Hierárquicos - OTIMIZADO PARA MOBILE */}
              <div className="border border-border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 bg-card">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Filter className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Filtros de Seleção</h3>
                </div>

                {/* 1. Seleção de Ciclo */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    1. Ciclo de Ensino *
                  </label>
                  <select
                    required
                    value={selectedCycle}
                    onChange={(e) => {
                      setSelectedCycle(e.target.value);
                      setSelectedSchools([]);
                      setSelectedTeacherIds([]);
                    }}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm sm:text-base"
                  >
                    <option value="">Selecione um ciclo</option>
                    {Object.keys(cycles).map(cycle => (
                      <option key={cycle} value={cycle}>{cycle}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Seleção de Escolas - RESPONSIVO */}
                {selectedCycle && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">
                        2. Escolas (opcional)
                      </label>
                      {availableSchools.length > 0 && (
                        <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allSchoolsSelected}
                            onChange={(e) => handleSelectAllSchools(e.target.checked)}
                            className="rounded"
                          />
                          Selecionar todas
                        </label>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 sm:p-3 border rounded-lg bg-background">
                      {availableSchools.length === 0 ? (
                        <p className="text-sm text-muted-foreground col-span-full text-center py-2">
                          Nenhuma escola encontrada para este ciclo
                        </p>
                      ) : (
                        availableSchools.map(school => {
                          const isSelected = selectedSchools.includes(school.id.toString());
                          return (
                            <label 
                              key={school.id} 
                              className={`flex items-center gap-2 text-xs sm:text-sm cursor-pointer p-2 rounded-lg transition-all ${
                                isSelected
                                  ? "bg-primary/10 border-2 border-primary"
                                  : "hover:bg-muted/50 border-2 border-transparent"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSchool(school.id)}
                                className="rounded"
                              />
                              <span className="flex-1 truncate">{school.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Seleção de Professores - RESPONSIVO */}
                {selectedCycle && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">
                        3. Professores * ({selectedTeacherIds.length} selecionados)
                      </label>
                      {availableTeachers.length > 0 && (
                        <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allTeachersSelected}
                            onChange={(e) => handleSelectAllTeachers(e.target.checked)}
                            className="rounded"
                          />
                          Selecionar todos
                        </label>
                      )}
                    </div>
                    <div className="max-h-48 sm:max-h-60 overflow-y-auto p-2 sm:p-3 border rounded-lg bg-background space-y-2">
                      {availableTeachers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {selectedCycle 
                            ? "Nenhum professor disponível"
                            : "Selecione primeiro um ciclo"}
                        </p>
                      ) : (
                        availableTeachers.map(teacher => {
                          const isSelected = selectedTeacherIds.includes(teacher.id.toString());
                          return (
                            <label
                              key={teacher.id}
                              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-all ${
                                isSelected 
                                  ? "bg-primary/10 border-2 border-primary shadow-sm" 
                                  : "hover:bg-muted/50 border-2 border-transparent"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleTeacher(teacher.id)}
                                className="rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm sm:text-base truncate">{teacher.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {teacher.school?.name || "Escola não definida"}
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                              )}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Informações da Sessão - RESPONSIVO */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm sm:text-base"
                    placeholder="Exemplo: Formação em Grupo - 1º Ciclo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm sm:text-base"
                    rows="3"
                    placeholder="Descrição da sessão de grupo..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Data e Hora *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Link Zoom *</label>
                    <input
                      type="url"
                      required
                      value={formData.zoomLink}
                      onChange={(e) => setFormData({...formData, zoomLink: e.target.value})}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm sm:text-base"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    resetSelections();
                  }}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={selectedTeacherIds.length === 0}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar ({selectedTeacherIds.length})
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Lista de Sessões Agrupadas - RESPONSIVO */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">
            Sessões Agendadas ({Object.keys(groupedTrainings).length})
          </h2>

          {Object.keys(groupedTrainings).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Nenhuma sessão agendada</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowForm(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Sessão
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.values(groupedTrainings).map((group) => (
                <Card key={group.id} className="p-3 sm:p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-base sm:text-lg truncate flex-1 min-w-0">
                            {group.title}
                          </h3>
                          {group.isGroup && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              <Users className="w-3 h-3 mr-1" />
                              {group.trainings.length}
                            </Badge>
                          )}
                          {group.completed && (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        
                        {group.cycle && (
                          <div className="text-xs text-primary font-medium mb-1">
                            {group.cycle}
                          </div>
                        )}

                        {/* Lista de Professores - COMPACTO EM MOBILE */}
                        <div className="space-y-1 mb-2">
                          {group.trainings.slice(0, 2).map((training, idx) => (
                            <p key={idx} className="text-xs sm:text-sm text-muted-foreground truncate">
                              {training.teacher?.name}
                            </p>
                          ))}
                          {group.trainings.length > 2 && (
                            <p className="text-xs text-muted-foreground italic">
                              +{group.trainings.length - 2} mais
                            </p>
                          )}
                        </div>
                        
                        {/* Avaliação se existir */}
                        {group.completed && group.adminRating && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500 text-sm">
                              {'★'.repeat(group.adminRating)}
                              {'☆'.repeat(5 - group.adminRating)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({group.adminRating}/5)
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (group.isGroup) {
                            handleDeleteGroup(group.groupId);
                          } else {
                            handleDeleteTraining(group.trainings[0].id);
                          }
                        }}
                        className="flex-shrink-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    
                    {group.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">
                          {new Date(group.date).toLocaleString('pt-PT')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-primary text-xs sm:text-sm truncate">Link Zoom Disponível</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-3 sm:mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(group.zoomLink, "_blank")}
                      className="w-full text-xs sm:text-sm"
                    >
                      <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Abrir Zoom
                    </Button>
                    
                    {/* Botão para Concluir Sessão (só para grupos) */}
                    {!group.completed && group.isGroup && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setTrainingToComplete(group.trainings[0])}
                        className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Concluir Sessão
                      </Button>
                    )}
                    
                    {/* Link para Certificado */}
                    {group.completed && group.certificateUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`${API_URL}${group.certificateUrl}`, '_blank')}
                        className="w-full text-xs sm:text-sm"
                      >
                        Ver Certificado
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