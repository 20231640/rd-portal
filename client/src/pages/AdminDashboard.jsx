import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building, 
  Users, 
  LogOut, 
  Edit3, 
  Save, 
  X, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Plus,
  Search,
  Download,
  Archive,
  RotateCcw
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { API_URL } from "../config/api";


export default function AdminDashboard() {
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [tempEditValue, setTempEditValue] = useState({ name: "", region: "" });
  const [toast, setToast] = useState(null);
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("schools");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedTeacherSchool, setSelectedTeacherSchool] = useState("all");
  const [archivedSchools, setArchivedSchools] = useState([]);
  const [archivedTeachers, setArchivedTeachers] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const districts = [
  "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", 
  "Coimbra", "Évora", "Faro", "Guarda", "Leiria", 
  "Lisboa", "Portalegre", "Porto", "Santarém", "Setúbal", 
  "Viana do Castelo", "Vila Real", "Viseu", "Região Autónoma da Madeira", "Região Autónoma dos Açores"];
  const navigate = useNavigate();

  // Toast helper
  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      console.log('🔄 Buscando dados para admin...');
      
      const [schoolsRes, teachersRes, archivedSchoolsRes, archivedTeachersRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/schools`),
        fetch(`${API_URL}/api/auth/teachers`),
        fetch(`${API_URL}/api/auth/schools?includeArchived=true`),
        fetch(`${API_URL}/api/auth/teachers?includeArchived=true`)
      ]);

      if (!schoolsRes.ok || !teachersRes.ok) {
        throw new Error("Erro ao buscar dados do servidor.");
      }

      const schoolsData = await schoolsRes.json();
      const teachersData = await teachersRes.json();
      const archivedSchoolsData = await archivedSchoolsRes.json();
      const archivedTeachersData = await archivedTeachersRes.json();
      
      console.log('✅ Dados carregados:', {
        escolas: schoolsData.length,
        professores: teachersData.length,
        escolasArquivadas: archivedSchoolsData.filter(s => s.archived).length,
        professoresArquivados: archivedTeachersData.filter(t => t.archived).length
      });

      // Separa ativos de arquivados
      const activeSchools = schoolsData.filter(school => !school.archived);
      const activeTeachers = teachersData.filter(teacher => !teacher.archived);
      const archivedSchools = archivedSchoolsData.filter(school => school.archived);
      const archivedTeachers = archivedTeachersData.filter(teacher => teacher.archived);

      setSchools(activeSchools);
      setTeachers(activeTeachers);
      setArchivedSchools(archivedSchools);
      setArchivedTeachers(archivedTeachers);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados do servidor.");
      setLoading(false);
    }
  }
  // Logout
  function handleLogout() {
    localStorage.removeItem("loggedInAdmin");
    navigate("/");
  }

  // Escolas - Criar
  async function addSchool(e) {
    e.preventDefault();
    if (!newSchool.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/schools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newSchool.trim(), 
          region: newRegion.trim(),
          address: "Morada a definir" // Campo básico
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao criar escola");
      setSchools((prev) => [...prev, data]);
      setNewSchool("");
      setNewRegion("");
      showToast("Escola criada com sucesso!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao criar escola.", "error");
    }
  }

  // Escolas - Aprovar
  async function approveSchool(id) {
    try {
      const res = await fetch(`${API_URL}/api/auth/schools/${id}/approve`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Erro ao aprovar escola.");
      setSchools((prev) =>
        prev.map((s) => (s.id === id ? { ...s, approved: true } : s))
      );
      showToast("Escola aprovada!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao aprovar escola.", "error");
    }
  }

  // Escolas - Rejeitar
  async function rejectSchool(id) {
    if (!window.confirm("Rejeitar esta escola?")) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/schools/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao rejeitar escola");
      setSchools((prev) => prev.filter((s) => s.id !== id));
      showToast("Escola removida.");
    } catch (err) {
      console.error(err);
      showToast("Erro ao rejeitar escola.", "error");
    }
  }

  // Escolas - Editar
  async function saveSchoolEdit(id, { name, region }) {
    try {
      const res = await fetch(`${API_URL}/api/auth/schools/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, region }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar escola.");
      setSchools(prev =>
        prev.map(s => s.id === id ? { ...s, name, region } : s)
      );
      setEditingSchoolId(null);
      showToast("Escola atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao atualizar escola.", "error");
    }
  }

  // Professores - Bloquear/Desbloquear
  async function toggleTeacherBlock(id, currentlyBlocked) {
    try {
      const res = await fetch(`${API_URL}/api/auth/teachers/${id}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !currentlyBlocked }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao atualizar professor.");
      }

      const updatedTeacher = await res.json();
      
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? updatedTeacher : t))
      );
      
      showToast(!currentlyBlocked ? "Professor desbloqueado!" : "Professor bloqueado!");
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  }

  // Professores - Editar
  async function saveTeacherEdit(id, field, value) {
    try {
      const updateData = { [field]: value };
      
      const res = await fetch(`${API_URL}/api/auth/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao atualizar professor.");
      }

      const updatedTeacher = await res.json();
      
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? updatedTeacher : t))
      );
      
      setEditingTeacherId(null);
      showToast("Professor atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  }

  // 🏫 FUNÇÕES PARA ESCOLAS - CORRIGIDAS

  // Arquivar Escola (AGORA COM API)
  async function archiveSchool(id) {
    try {
      console.log('📤 Arquivando escola ID:', id);
      
      const res = await fetch(`${API_URL}/api/auth/schools/${id}/archive`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao arquivar escola");
      }

      const updatedSchool = await res.json();
      console.log('✅ Escola arquivada na BD:', updatedSchool);
      
      // Atualiza o estado local
      setSchools(prev => prev.filter(s => s.id !== id));
      setArchivedSchools(prev => [...prev, updatedSchool]);
      
      showToast("Escola arquivada com sucesso!");
    } catch (err) {
      console.error('❌ Erro ao arquivar escola:', err);
      showToast(err.message, "error");
    }
  }

  // Restaurar Escola (AGORA COM API)
  async function restoreSchool(id) {
    try {
      console.log('📤 Restaurando escola ID:', id);
      
      const res = await fetch(`${API_URL}/api/auth/schools/${id}/restore`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao restaurar escola");
      }

      const restoredSchool = await res.json();
      console.log('✅ Escola restaurada na BD:', restoredSchool);
      
      // Atualiza o estado local
      setArchivedSchools(prev => prev.filter(s => s.id !== id));
      setSchools(prev => [...prev, restoredSchool]);
      
      showToast("Escola restaurada com sucesso!");
    } catch (err) {
      console.error('❌ Erro ao restaurar escola:', err);
      showToast(err.message, "error");
    }
  }


  // Arquivar Professor (AGORA COM API)
  async function archiveTeacher(id) {
    try {
      console.log('📤 Arquivando professor ID:', id);
      
      const res = await fetch(`${API_URL}/api/auth/teachers/${id}/archive`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao arquivar professor");
      }

      const updatedTeacher = await res.json();
      console.log('✅ Professor arquivado na BD:', updatedTeacher);
      
      // Atualiza o estado local
      setTeachers(prev => prev.filter(t => t.id !== id));
      setArchivedTeachers(prev => [...prev, updatedTeacher]);
      
      showToast("Professor arquivado com sucesso!");
    } catch (err) {
      console.error('❌ Erro ao arquivar professor:', err);
      showToast(err.message, "error");
    }
  }

  // Restaurar Professor (AGORA COM API)
  async function restoreTeacher(id) {
    try {
      console.log('📤 Restaurando professor ID:', id);
      
      const res = await fetch(`${API_URL}/api/auth/teachers/${id}/restore`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao restaurar professor");
      }

      const restoredTeacher = await res.json();
      console.log('✅ Professor restaurado na BD:', restoredTeacher);
      
      // Atualiza o estado local
      setArchivedTeachers(prev => prev.filter(t => t.id !== id));
      setTeachers(prev => [...prev, restoredTeacher]);
      
      showToast("Professor restaurado com sucesso!");
    } catch (err) {
      console.error('❌ Erro ao restaurar professor:', err);
      showToast(err.message, "error");
    }
  }

  // Professores - Eliminar (CORRIGIDA)
  async function handleDeleteTeacher(id) {
    if (!window.confirm("Tem a certeza que quer apagar este professor?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/auth/teachers/${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao apagar professor.");
      }

      setTeachers(prev => prev.filter(t => t.id !== id));
      showToast("Professor removido com sucesso!");
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    }
  }

  // Filtros ativos
  const filteredSchools = schools.filter(school =>
    (school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     school.region?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedDistrict === "all" || school.region === selectedDistrict)
  );

  const filteredTeachers = teachers.filter(teacher => {
    const schoolName = schools.find(s => s.id === teacher.schoolId)?.name || "";
    const schoolRegion = schools.find(s => s.id === teacher.schoolId)?.region;
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          schoolName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchoolFilter = selectedTeacherSchool === "all" || String(teacher.schoolId) === String(selectedTeacherSchool);
    const matchesDistrictFilter = selectedDistrict === "all" || schoolRegion === selectedDistrict;
    return matchesSearch && matchesSchoolFilter && matchesDistrictFilter;
  });

  // Filtros arquivados
  const filteredArchivedSchools = archivedSchools.filter(school =>
    (school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     school.region?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedDistrict === "all" || school.region === selectedDistrict)
  );

  const filteredArchivedTeachers = archivedTeachers.filter(teacher => {
    // Para professores arquivados, pode ser que a escola esteja arquivada também
    const allSchools = [...schools, ...archivedSchools];
    const schoolName = allSchools.find(s => s.id === teacher.schoolId)?.name || "";
    const schoolRegion = allSchools.find(s => s.id === teacher.schoolId)?.region;
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          schoolName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchoolFilter = selectedTeacherSchool === "all" || String(teacher.schoolId) === String(selectedTeacherSchool);
    const matchesDistrictFilter = selectedDistrict === "all" || schoolRegion === selectedDistrict;
    return matchesSearch && matchesSchoolFilter && matchesDistrictFilter;
  });

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden sm:block">
          <AdminSidebar />
        </div>
        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">A carregar dados...</p>
          </div>
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
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">Erro</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Tentar novamente
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden sm:block">
        <AdminSidebar />
      </div>
      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel de Administração</h1>
            <p className="text-muted-foreground mt-2">
              Gestão das escolas e dos professores do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar escolas ou professores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {/* Filtro por Distrito escondido em mobile por espaço */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Filtrar por distrito"
            >
              <option value="all">Todos os distritos</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Botão para mostrar arquivados */}
            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              {showArchived ? "Mostrar Ativos" : "Mostrar Arquivados"}
            </Button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`
            fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border
            ${toast.type === "error" 
              ? "bg-destructive text-destructive-foreground border-destructive" 
              : "bg-primary text-primary-foreground border-primary"
            }
            animate-slide-in-right
          `}>
            {toast.message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg mb-6 w-fit">
          <Button
            variant={activeTab === "schools" ? "default" : "ghost"}
            onClick={() => setActiveTab("schools")}
            className="rounded-lg"
          >
            <Building className="w-4 h-4 mr-2" />
            Escolas ({showArchived ? archivedSchools.length : schools.length})
          </Button>
          <Button
            variant={activeTab === "teachers" ? "default" : "ghost"}
            onClick={() => setActiveTab("teachers")}
            className="rounded-lg"
          >
            <Users className="w-4 h-4 mr-2" />
            Professores ({showArchived ? archivedTeachers.length : teachers.length})
          </Button>
        </div>

        {/* Schools Tab */}
        {activeTab === "schools" && (
          <div className="space-y-6">
            {!showArchived ? (
              <>
                {/* Add School Card - só mostra para ativos */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Adicionar Nova Escola
                  </h2>
                  <form onSubmit={addSchool} className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={newSchool}
                      onChange={(e) => setNewSchool(e.target.value)}
                      placeholder="Nome da Escola"
                      required
                      className="flex-1 min-w-0 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <select
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                      required
                      className="flex-1 min-w-0 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Selecionar Distrito</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>

                    <Button type="submit" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar escola
                    </Button>
                  </form>
                </Card>

                {/* Schools List Ativas */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Escolas Ativas</h2>
                  
                  {filteredSchools.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma escola ativa encontrada</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredSchools.map((school) => (
                        <div key={school.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Building className="w-5 h-5 text-primary" />
                              <div>
                                {editingSchoolId === school.id ? (
                                  <div className="flex gap-2 items-center">
                                    {/* Nome */}
                                    <input
                                      value={tempEditValue.name}
                                      onChange={(e) => setTempEditValue(prev => ({ ...prev, name: e.target.value }))}
                                      className="w-64 h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    
                                    {/* Região */}
                                    <select
                                      value={tempEditValue.region}
                                      onChange={(e) => setTempEditValue(prev => ({ ...prev, region: e.target.value }))}
                                      className="h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                      <option value="">Selecionar Distrito</option>
                                      {districts.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                      ))}
                                    </select>

                                    <Button
                                      size="sm"
                                      onClick={() => saveSchoolEdit(school.id, tempEditValue)}
                                    >
                                      <Save className="w-4 h-4 mr-1" />
                                      Guardar
                                    </Button>
                                  </div>
                                ) : (
                                  <h3 
                                    className="font-semibold cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => {
                                      setEditingSchoolId(school.id);
                                      setTempEditValue({ name: school.name, region: school.region || "" });
                                    }}
                                  >
                                    {school.name} {school.region && `📍 ${school.region}`}
                                  </h3>
                                )}
                                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                  <p>{teachers.filter(t => t.schoolId === school.id).length} professores</p>
                                  {school.region && (
                                    <p>📍 {school.region}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              {!school.approved ? (
                                <Button
                                  size="sm"
                                  onClick={() => approveSchool(school.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                              ) : (
                                <span className="flex items-center gap-1 text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  Aprovada
                                </span>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpandedSchool(expandedSchool === school.id ? null : school.id)}
                              >
                                {expandedSchool === school.id ? "Fechar" : "Ver professores"}
                              </Button>
                              
                              {/* Botão de Arquivar - AGORA FUNCIONAL */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => archiveSchool(school.id)}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300"
                              >
                                <Archive className="w-4 h-4 mr-1" />
                                Arquivar
                              </Button>
                              
                              {/* Botão de Eliminar - CINZA CLARO */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectSchool(school.id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Teachers List */}
                          {expandedSchool === school.id && (
                            <div className="mt-4 pl-8 border-l-2 border-border">
                              <h4 className="font-medium mb-2">Professores desta escola:</h4>
                              {teachers.filter(t => t.schoolId === school.id).length > 0 ? (
                                <div className="space-y-2">
                                  {teachers
                                    .filter(t => t.schoolId === school.id)
                                    .map(teacher => (
                                      <div key={teacher.id} className="flex items-center justify-between py-2 px-3 bg-muted rounded">
                                        <div>
                                          <p className="font-medium">{teacher.name}</p>
                                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                        </div>
                                        {teacher.blocked && (
                                          <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                                            BLOQUEADO
                                          </span>
                                        )}
                                      </div>
                                    ))
                                  }
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-sm">Nenhum professor registado.</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            ) : (
              /* Schools Arquivadas */
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Escolas Arquivadas</h2>
                {filteredArchivedSchools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma escola arquivada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredArchivedSchools.map((school) => (
                      <div key={school.id} className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building className="w-5 h-5 text-amber-600" />
                            <div>
                              <h3 className="font-semibold text-amber-800">
                                {school.name} {school.region && `📍 ${school.region}`}
                              </h3>
                              <div className="flex gap-4 text-sm text-amber-600 mt-1">
                                <p>Arquivada em: {new Date(school.archivedAt).toLocaleDateString('pt-PT')}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => restoreSchool(school.id)}
                              className="bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Restaurar
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setArchivedSchools(prev => prev.filter(s => s.id !== school.id));
                                showToast("Escola removida permanentemente.");
                              }}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === "teachers" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {showArchived ? "Professores Arquivados" : "Professores Ativos"}
            </h2>
            {/* Filtrar por Escola: mostra sempre, muda as opções conforme o modo */}
            <div className="flex gap-3 items-center mb-4">
              <label className="text-sm text-muted-foreground">Filtrar por Escola:</label>
              <select
                value={selectedTeacherSchool}
                onChange={(e) => setSelectedTeacherSchool(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas as Escolas</option>
                {(showArchived ? archivedSchools : schools).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            {!showArchived ? (
              filteredTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum professor ativo encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium">Nome</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Telefone</th>
                        <th className="text-left p-3 font-medium">Escola</th>
                        <th className="text-left p-3 font-medium">Estado</th>
                        <th className="text-left p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            {editingTeacherId === `name-${teacher.id}` ? (
                              <input
                                value={tempEditValue}
                                onChange={(e) => setTempEditValue(e.target.value)}
                                onBlur={() => saveTeacherEdit(teacher.id, "name", tempEditValue)}
                                autoFocus
                                className="w-full h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            ) : (
                              <span
                                className="cursor-pointer hover:text-primary transition-colors"
                                onClick={() => {
                                  setEditingTeacherId(`name-${teacher.id}`);
                                  setTempEditValue(teacher.name);
                                }}
                              >
                                {teacher.name}
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            {editingTeacherId === `email-${teacher.id}` ? (
                              <input
                                value={tempEditValue}
                                onChange={(e) => setTempEditValue(e.target.value)}
                                onBlur={() => saveTeacherEdit(teacher.id, "email", tempEditValue)}
                                autoFocus
                                className="w-full h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            ) : (
                              <span
                                className="cursor-pointer hover:text-primary transition-colors"
                                onClick={() => {
                                  setEditingTeacherId(`email-${teacher.id}`);
                                  setTempEditValue(teacher.email);
                                }}
                              >
                                {teacher.email}
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            {editingTeacherId === `phone-${teacher.id}` ? (
                              <input
                                value={tempEditValue}
                                onChange={(e) => setTempEditValue(e.target.value)}
                                onBlur={() => saveTeacherEdit(teacher.id, "phone", tempEditValue)}
                                autoFocus
                                className="w-full h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            ) : (
                              <span
                                className="cursor-pointer hover:text-primary transition-colors"
                                onClick={() => {
                                  setEditingTeacherId(`phone-${teacher.id}`);
                                  setTempEditValue(teacher.phone || "");
                                }}
                              >
                                {teacher.phone || "—"}
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            {schools.find(s => s.id === teacher.schoolId)?.name || "—"}
                          </td>

                          <td className="p-3">
                            <Button
                              variant={teacher.blocked ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleTeacherBlock(teacher.id, teacher.blocked)}
                              className={teacher.blocked ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {teacher.blocked ? "Desbloquear" : "Bloquear"}
                            </Button>
                          </td>

                          <td className="p-3">
                            <div className="flex gap-2">
                              {/* Botão de Arquivar - AGORA FUNCIONAL */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => archiveTeacher(teacher.id)}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300"
                              >
                                <Archive className="w-4 h-4 mr-1" />
                                Arquivar
                              </Button>
                              
                              {/* Botão de Eliminar - CINZA CLARO */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* Professores Arquivados */
              filteredArchivedTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum professor arquivado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-amber-200">
                        <th className="text-left p-3 font-medium">Nome</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Telefone</th>
                        <th className="text-left p-3 font-medium">Escola</th>
                        <th className="text-left p-3 font-medium">Arquivado em</th>
                        <th className="text-left p-3 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArchivedTeachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors">
                          <td className="p-3 text-amber-800 font-medium">{teacher.name}</td>
                          <td className="p-3 text-amber-700">{teacher.email}</td>
                          <td className="p-3 text-amber-700">{teacher.phone || "—"}</td>
                          <td className="p-3 text-amber-700">
                            {schools.find(s => s.id === teacher.schoolId)?.name || "—"}
                          </td>
                          <td className="p-3 text-amber-600 text-sm">
                            {new Date(teacher.archivedAt).toLocaleDateString('pt-PT')}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => restoreTeacher(teacher.id)}
                                className="bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Restaurar
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setArchivedTeachers(prev => prev.filter(t => t.id !== teacher.id));
                                  showToast("Professor removido permanentemente.");
                                }}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </Card>
        )}
      </div>
    </div>
  );
}