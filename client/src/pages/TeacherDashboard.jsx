import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import { Mail, Phone, Edit3, BookOpen, Package, Users, Save, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Sidebar } from "../components/ui/sidebar";
import { API_URL } from "../config/api";
import "react-phone-input-2/lib/style.css";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ classes: 0, kits: 0, students: 0 });

  // Buscar dados do professor
  useEffect(() => {
    const teacherData = localStorage.getItem("teacherData");
    const loggedInTeacher = localStorage.getItem("loggedInTeacher");
    
    console.log('🔍 Verificando autenticação...', {
      teacherData: teacherData ? 'Presente' : 'Ausente',
      loggedInTeacher: loggedInTeacher || 'Ausente'
    });

    if (!teacherData || !loggedInTeacher) {
      console.log('❌ Não autenticado, redirecionando...');
      navigate("/login");
      return;
    }

    async function loadTeacher() {
      try {
        console.log('🔄 Buscando dados do professor...');
        const response = await fetch(`${API_URL}/api/teachers/email/${loggedInTeacher}`);
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
          throw new Error("Professor não encontrado");
        }

        const found = await response.json();
        console.log('✅ Professor encontrado:', found);
        
        setTeacher(found);
        setFormData({ 
          name: found.name, 
          phone: found.phone || "" 
        });
        
        await loadStats(found.id);
        
      } catch (err) {
        console.error("❌ Erro ao carregar perfil:", err);
        alert("Erro ao carregar dados. Tente fazer login novamente.");
        localStorage.removeItem("teacherData");
        localStorage.removeItem("loggedInTeacher");
        navigate("/login");
      }
    }

    async function loadStats(teacherId) {
      try {
        console.log('📊 Carregando estatísticas...');
        
        const classesRes = await fetch(`${API_URL}/api/classes`);
        if (classesRes.ok) {
          const allClasses = await classesRes.json();
          const teacherClasses = allClasses.filter(cls => cls.teacherId === teacherId);
          
          const kitsRes = await fetch(`${API_URL}/api/kits`);
          const allKits = await kitsRes.ok ? await kitsRes.json() : [];
          const teacherKits = allKits.filter(kit => kit.teacherId === teacherId);
          
          const totalStudents = teacherClasses.reduce((sum, cls) => sum + (cls.students || 0), 0);
          
          setStats({
            classes: teacherClasses.length,
            kits: teacherKits.length,
            students: totalStudents
          });
          
          console.log('✅ Estatísticas carregadas:', {
            classes: teacherClasses.length,
            kits: teacherKits.length,
            students: totalStudents
          });
        }
      } catch (err) {
        console.error("❌ Erro ao carregar estatísticas:", err);
      }
    }

    loadTeacher();
  }, [navigate]);

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert("O nome é obrigatório!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/teachers/${teacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone || null
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar perfil");
      }

      const updatedTeacher = await res.json();
      setTeacher(updatedTeacher);
      setEditing(false);
      
      alert("Perfil atualizado com sucesso! ✅");
    } catch (err) {
      console.error("Erro ao guardar:", err);
      alert("Erro ao atualizar perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ 
      name: teacher.name, 
      phone: teacher.phone || "" 
    });
    setEditing(false);
  };

  if (!teacher) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
            <div className="mt-12 lg:mt-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">O Meu Perfil</h1>
              <p className="text-muted-foreground mt-2 text-sm lg:text-base">
                {editing ? "Editar informações pessoais" : "Informações pessoais e estatísticas"}
              </p>
            </div>
            
            {!editing ? (
              <Button onClick={() => setEditing(true)} className="w-full sm:w-auto">
                <Edit3 className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "A guardar..." : "Guardar"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={loading} className="flex-1 sm:flex-none">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Coluna do Perfil */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-4 lg:p-6">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 lg:w-12 lg:h-12 text-primary" />
                  </div>
                  
                  <h2 className="text-lg lg:text-xl font-bold text-foreground">{teacher.name}</h2>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    {teacher.school?.name || "Escola não definida"}
                  </p>
                  
                  <div className="mt-4 lg:mt-6 space-y-2 lg:space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm break-all">{teacher.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{teacher.phone || "Não definido"}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Estatísticas - Sempre visíveis em mobile */}
              <Card className="p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-semibold mb-4 text-foreground">As Minhas Estatísticas</h3>
                <div className="grid grid-cols-3 gap-2 lg:gap-4">
                  <div className="text-center p-3 lg:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                    <p className="text-base lg:text-lg font-bold text-blue-800 dark:text-blue-300">{stats.classes}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">Turmas</p>
                  </div>
                  <div className="text-center p-3 lg:p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                    <p className="text-base lg:text-lg font-bold text-green-800 dark:text-green-300">{stats.kits}</p>
                    <p className="text-xs text-green-700 dark:text-green-400">Kits</p>
                  </div>
                  <div className="text-center p-3 lg:p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                    <p className="text-base lg:text-lg font-bold text-purple-800 dark:text-purple-300">{stats.students}</p>
                    <p className="text-xs text-purple-700 dark:text-purple-400">Alunos</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Coluna de Conteúdo Principal */}
            <div className="lg:col-span-2">
              <Card className="p-4 lg:p-6">
                {!editing ? (
                  // MODO VISUALIZAÇÃO
                  <>
                    <h3 className="text-lg font-semibold mb-4 lg:mb-6 text-foreground">Informações Pessoais</h3>
                    
                    <div className="grid grid-cols-1 gap-4 lg:gap-6 mb-6 lg:mb-8">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Nome Completo</label>
                        <p className="px-3 py-2 bg-muted rounded-lg text-foreground">{teacher.name}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                        <p className="px-3 py-2 bg-muted rounded-lg text-foreground break-all">{teacher.email}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Telefone</label>
                        <p className="px-3 py-2 bg-muted rounded-lg text-foreground">{teacher.phone || "Não definido"}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Escola</label>
                        <p className="px-3 py-2 bg-muted rounded-lg text-foreground">{teacher.school?.name || "Não definida"}</p>
                      </div>
                    </div>

                    {/* Estatísticas Desktop (ocultas em mobile) */}
                    <div className="hidden lg:block pt-6 border-t border-border">
                      <h4 className="font-semibold mb-4 text-foreground">Estatísticas do Ano</h4>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                          <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{stats.classes}</p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">Turmas Ativas</p>
                        </div>
                        <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                          <Package className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-800 dark:text-green-300">{stats.kits}</p>
                          <p className="text-sm text-green-700 dark:text-green-400">Kits Solicitados</p>
                        </div>
                        <div className="text-center p-6 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                          <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">{stats.students}</p>
                          <p className="text-sm text-purple-700 dark:text-purple-400">Total de Alunos</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // MODO EDIÇÃO
                  <>
                    <h3 className="text-lg font-semibold mb-4 lg:mb-6 text-foreground">Editar Informações</h3>
                    
                    <div className="grid grid-cols-1 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Nome Completo *</label>
                        <input
                          type="text"
                          value={formData.name || ""}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          required
                          placeholder="O seu nome completo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                        <p className="px-3 py-2 bg-muted rounded-lg text-muted-foreground break-all">
                          {teacher.email} (não editável)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Telefone</label>
                        <div className="relative">
                          <PhoneInput
                            country={"pt"}
                            value={formData.phone || ""}
                            onChange={(value) => setFormData({ ...formData, phone: value })}
                            containerClass="!w-full phone-input-container"
                            inputClass="!w-full !rounded-lg !py-2 !pl-12 !pr-4 
                                        !bg-background !border !border-input 
                                        !text-foreground placeholder:!text-muted-foreground
                                        focus:!outline-none focus:!ring-2 focus:ring-primary focus:!border-transparent
                                        !transition-all !duration-200"
                            buttonClass="!bg-transparent !border-none !left-1 !rounded-l-lg"
                            dropdownClass="phone-input-dropdown"
                            searchClass="phone-input-search"
                            enableSearch={true}
                            specialLabel=""
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Escola</label>
                        <p className="px-3 py-2 bg-muted rounded-lg text-muted-foreground">
                          {teacher.school?.name || "Não definida"} (não editável)
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>Nota:</strong> Apenas o nome e telefone podem ser editados. 
                        Para alterar outros dados, contacte o administrador.
                      </p>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}