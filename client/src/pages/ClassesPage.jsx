import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Trash2, Edit3, Search, BookOpen, UsersRound, GraduationCap, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Sidebar } from "../components/ui/sidebar";
import { API_URL } from "../config/api";

export default function ClassesPage() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCycle, setFilterCycle] = useState("");
  const [showAddClass, setShowAddClass] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [newClass, setNewClass] = useState({ name: "", students: "", cycle: "", year: "" });
  const [showTrainingAlert, setShowTrainingAlert] = useState(false);

  const cycles = {
    "Pré-Escolar": ["3 anos", "4 anos", "5 anos"],
    "1º Ciclo": ["1º ano", "2º ano", "3º ano", "4º ano"],
    "2º Ciclo": ["5º ano", "6º ano"],
    "3º Ciclo": ["7º ano", "8º ano", "9º ano"],
    "Secundário": ["10º ano", "11º ano", "12º ano"]
  };

  // Estados simples para as turmas - SÓ ATIVA E CONCLUÍDA
  const classStates = {
    ACTIVE: { label: "Ativa", color: "success", icon: UsersRound },
    COMPLETED: { label: "Concluída", color: "secondary", icon: BookOpen }
  };

  // Buscar dados do professor
  useEffect(() => {
    const teacherDataStr = localStorage.getItem("teacherData");
    const loggedInTeacher = localStorage.getItem("loggedInTeacher");

    if (!teacherDataStr || !loggedInTeacher) {
      navigate("/login");
      return;
    }

    async function loadTeacherAndClasses() {
      try {
        const teacherData = JSON.parse(teacherDataStr);
        console.log('✅ A carregar o professor do localStorage:', teacherData);
        setTeacher(teacherData);

        await refreshTeacherData();

        console.log('🔄 A buscar turmas...');
        try {
          const classesRes = await fetch(`${API_URL}/api/classes`);
          if (classesRes.ok) {
            const allClasses = await classesRes.json();
            console.log('📊 Todas as turmas:', allClasses);
            
            const teacherClasses = allClasses.filter(cls => cls.teacherId === teacherData.id);
            console.log('✅ Turmas do professor:', teacherClasses);
            
            setClasses(teacherClasses);
            setFilteredClasses(teacherClasses);
          } else {
            console.error('❌ Erro ao buscar turmas:', classesRes.status);
            setClasses([]);
            setFilteredClasses([]);
          }
        } catch (classesError) {
          console.error('❌ Erro ao buscar turmas:', classesError);
          setClasses([]);
          setFilteredClasses([]);
        }

      } catch (err) {
        console.error("❌ Erro ao carregar dados:", err);
        alert("Erro ao carregar dados. Tente fazer login novamente.");
        localStorage.removeItem("teacherData");
        localStorage.removeItem("loggedInTeacher");
        navigate("/login");
      }
    }

    loadTeacherAndClasses();
  }, [navigate]);

  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm, filterCycle]);

  // Nova função: Atualizar dados do professor no localStorage
  const refreshTeacherData = async () => {
    try {
      console.log('🔄 A atualizar os dados do professor...');
      
      const teacherDataStr = localStorage.getItem("teacherData");
      if (!teacherDataStr) return;

      const currentTeacher = JSON.parse(teacherDataStr);
      
      const response = await fetch(`${API_URL}/api/auth/teachers/${currentTeacher.id}`);
      if (response.ok) {
        const updatedTeacher = await response.json();
        console.log('✅ Professor atualizado:', updatedTeacher);
        
        localStorage.setItem("teacherData", JSON.stringify(updatedTeacher));
        setTeacher(updatedTeacher);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar os dados do professor:', error);
    }
  };

  // Verificar se pode criar turma
  const canCreateClass = () => {
    return teacher?.hasCompletedTraining || teacher?.certificateUrl;
  };

  const handleAddClassClick = () => {
    console.log("📊 Estado do professor:", {
      hasCompletedTraining: teacher?.hasCompletedTraining,
      certificateUrl: teacher?.certificateUrl,
      canCreate: canCreateClass()
    });
    
    if (!canCreateClass()) {
      setShowTrainingAlert(true);
      return;
    }
    setShowAddClass(true);
  };

  const filterClasses = () => {
    let filtered = classes;

    if (searchTerm) {
      filtered = filtered.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.cycle && cls.cycle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterCycle) {
      filtered = filtered.filter(cls => cls.cycle === filterCycle);
    }

    setFilteredClasses(filtered);
  };

  // Função de adicionar turma com melhor tratamento
  const handleAddClass = async (e) => {
    e.preventDefault();
    
    if (!canCreateClass()) {
      setShowTrainingAlert(true);
      return;
    }

    if (!newClass.name || !newClass.students || !newClass.cycle || !newClass.year) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      console.log('🔄 A criar nova turma...', {
        ...newClass,
        teacherId: teacher.id,
        schoolId: teacher.schoolId
      });

      const res = await fetch(`${API_URL}/api/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClass.name,
          students: parseInt(newClass.students),
          cycle: newClass.cycle,
          year: newClass.year,
          teacherId: teacher.id,
          schoolId: teacher.schoolId,
          state: "ACTIVE"
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Erro do servidor:', errorData);
        alert(errorData.message || "Erro ao criar turma");
        return;
      }
      
      const created = await res.json();
      console.log('✅ Turma criada:', created);
      
      setClasses([...classes, created]);
      setFilteredClasses([...filteredClasses, created]);
      setNewClass({ name: "", students: "", cycle: "", year: "" });
      setShowAddClass(false);
      
      alert("Turma criada com sucesso!");
      
    } catch (err) {
      console.error("❌ Erro detalhado:", err);
      alert(err.message || "Erro ao criar turma no servidor.");
    }
  };

  // Função de editar turma
  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 A editar a turma...', editingClass);
      
      const res = await fetch(`${API_URL}/api/classes/${editingClass.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingClass.name,
          students: parseInt(editingClass.students),
          cycle: editingClass.cycle,
          year: editingClass.year
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar turma");
      }
      
      const updated = await res.json();
      console.log('✅ Turma atualizada:', updated);
      
      const updatedClasses = classes.map(c => c.id === updated.id ? updated : c);
      setClasses(updatedClasses);
      setFilteredClasses(updatedClasses);
      setEditingClass(null);
      setShowAddClass(false);
      
      alert("Turma atualizada com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao editar turma:", err);
      alert(err.message || "Erro ao atualizar turma no servidor.");
    }
  };

  // Função de deletar turma
  const handleDeleteClass = async (id) => {
    if (!window.confirm("Tem a certeza que pretende eliminar esta turma?")) return;
    try {
      console.log('🔄 A eliminar turma...', id);
      
      const res = await fetch(`${API_URL}/api/classes/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao eliminar turma");
      }
      
      const updated = classes.filter(c => c.id !== id);
      setClasses(updated);
      setFilteredClasses(updated);
      
      alert("Turma eliminada com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao eliminar turma:", err);
      alert(err.message || "Erro ao eliminar turma no servidor.");
    }
  };

  // Função de mudar estado
  const handleChangeState = async (id, newState) => {
    try {
      console.log('🔄 A alterar estado da turma...', { id, newState });
      
      const res = await fetch(`${API_URL}/api/classes/${id}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newState })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar estado");
      }
      
      const updated = await res.json();
      console.log('✅ Estado atualizado:', updated);
      
      const updatedClasses = classes.map(c => c.id === id ? updated : c);
      setClasses(updatedClasses);
      setFilteredClasses(updatedClasses);
      
    } catch (err) {
      console.error("❌ Erro ao alterar estado:", err);
      alert(err.message || "Erro ao alterar estado da turma.");
    }
  };

  const resetForm = () => {
    setNewClass({ name: "", students: "", cycle: "", year: "" });
    setEditingClass(null);
  };

  const startEdit = (classItem) => {
    setEditingClass({ ...classItem });
    setShowAddClass(true);
  };

  if (!teacher) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Alerta de formação necessária - Modal */}
        {showTrainingAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <h3 className="text-xl font-bold">Formação Necessária</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Para criar turmas, é necessário completar a sessão de formação e obter o certificado.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowTrainingAlert(false)} className="flex-1">
                  Fechar
                </Button>
              </div>
            </Card>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Turmas</h1>
            <p className="text-muted-foreground mt-2">Gerir e acompanhar as suas turmas</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Badge de certificado */}
            {teacher.certificateUrl && (
              <Badge variant="success" className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                Certificado
              </Badge>
            )}
            <Button 
              onClick={handleAddClassClick} 
              disabled={!canCreateClass()}
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Turma
            </Button>
          </div>
        </div>

        {/* Mensagem simplificada para professores sem certificado */}
        {!canCreateClass() && (
          <Card className="p-6 mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800">Ação Necessária</h3>
                <p className="text-amber-700 text-sm">
                  Complete a sessão de formação para poder criar turmas.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar turmas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
               value={filterCycle}
               onChange={(e) => setFilterCycle(e.target.value)}
               className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
             >
               <option value="">Todos os ciclos</option>
               {Object.keys(cycles).map(cycle => (
                 <option key={cycle} value={cycle}>{cycle}</option>
               ))}
            </select>
            <div className="text-right">
              <Badge variant="outline">{filteredClasses.length} turmas</Badge>
            </div>
          </div>
        </Card>

        {filteredClasses.length === 0 && classes.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {canCreateClass() 
                ? "Comece por adicionar a sua primeira turma."
                : "Complete a formação para criar a sua primeira turma."
              }
            </p>
            {canCreateClass() && (
              <Button onClick={handleAddClassClick}>
                <Plus className="w-4 h-4 mr-2" /> Criar Primeira Turma
              </Button>
            )}
          </Card>
        ) : filteredClasses.length === 0 && classes.length > 0 ? (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros de pesquisa.
            </p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterCycle(''); }}>
              Limpar Filtros
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map(classItem => {
              const stateConfig = classStates[classItem.state] || classStates.ACTIVE;
              const StateIcon = stateConfig.icon;
              
              return (
                <Card key={classItem.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <StateIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{classItem.name}</h3>
                        <p className="text-sm text-muted-foreground">{classItem.students} alunos</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(classItem)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClass(classItem.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ciclo:</span>
                      <span className="font-medium">{classItem.cycle}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ano:</span>
                      <span className="font-medium">{classItem.year}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Badge variant={stateConfig.color}>
                      {stateConfig.label}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant={classItem.state === "COMPLETED" ? "default" : "outline"}
                      onClick={() => handleChangeState(
                        classItem.id, 
                        classItem.state === "ACTIVE" ? "COMPLETED" : "ACTIVE"
                      )}
                    >
                      {classItem.state === "ACTIVE" ? "Marcar Concluída" : "Marcar Ativa"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {(showAddClass || editingClass) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-4 sm:p-6 w-full max-w-full sm:max-w-md">
               <h3 className="text-xl font-bold mb-4">{editingClass ? "Editar Turma" : "Adicionar Nova Turma"}</h3>
               <form onSubmit={editingClass ? handleEditClass : handleAddClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Turma</label>
                  <input
                    type="text"
                    value={editingClass ? editingClass.name : newClass.name}
                    onChange={e => editingClass ? setEditingClass({ ...editingClass, name: e.target.value }) : setNewClass({ ...newClass, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número de Alunos</label>
                  <input
                    type="number"
                    value={editingClass ? editingClass.students : newClass.students}
                    onChange={e => editingClass ? setEditingClass({ ...editingClass, students: e.target.value }) : setNewClass({ ...newClass, students: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    min="1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ciclo</label>
                    <select
                      value={editingClass ? editingClass.cycle : newClass.cycle}
                      onChange={e => {
                        const update = { cycle: e.target.value, year: "" };
                        editingClass ? setEditingClass({ ...editingClass, ...update }) : setNewClass({ ...newClass, ...update });
                      }}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Selecionar</option>
                      {Object.keys(cycles).map(cycle => (
                        <option key={cycle} value={cycle}>{cycle}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ano</label>
                    <select
                      value={editingClass ? editingClass.year : newClass.year}
                      onChange={e => editingClass ? setEditingClass({ ...editingClass, year: e.target.value }) : setNewClass({ ...newClass, year: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={!(editingClass ? editingClass.cycle : newClass.cycle)}
                    >
                      <option value="">Selecionar</option>
                      {(editingClass ? editingClass.cycle : newClass.cycle) &&
                        cycles[editingClass ? editingClass.cycle : newClass.cycle].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                   <Button type="submit" className="flex-1">{editingClass ? "Guardar Alterações" : "Adicionar Turma"}</Button>
                   <Button type="button" variant="outline" onClick={() => { setShowAddClass(false); setEditingClass(null); resetForm(); }}>Cancelar</Button>
                 </div>
               </form>
             </Card>
           </div>
         )}
      </div>
    </div>
  );
}