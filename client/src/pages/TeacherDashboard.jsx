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
        // ✅ CORREÇÃO: Usar a rota CORRETA que existe
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
        
        // ✅ CORREÇÃO: Carregar estatísticas com rotas que EXISTEM
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
        
        // ✅ CORREÇÃO: Buscar turmas do professor
        const classesRes = await fetch(`${API_URL}/api/classes`);
        if (classesRes.ok) {
          const allClasses = await classesRes.json();
          const teacherClasses = allClasses.filter(cls => cls.teacherId === teacherId);
          
          // ✅ CORREÇÃO: Buscar kits do professor  
          const kitsRes = await fetch(`${API_URL}/api/kits`);
          const allKits = await kitsRes.ok ? await kitsRes.json() : [];
          const teacherKits = allKits.filter(kit => kit.teacherId === teacherId);
          
          // Calcular totais
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
        // Não bloqueia a renderização se as estatísticas falharem
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
          <p>A carregar...</p>
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
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2">
              {editing ? "Editar informações pessoais" : "Informações pessoais e estatísticas"}
            </p>
          </div>
          
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "A guardar..." : "Guardar"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna do Perfil */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                {/* Avatar Simples */}
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-primary" />
                </div>
                
                <h2 className="text-xl font-bold">{teacher.name}</h2>
                <p className="text-muted-foreground">{teacher.school?.name || "Escola não definida"}</p>
                
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{teacher.phone || "Não definido"}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Estatísticas Móvel */}
            <Card className="p-6 mt-6 lg:hidden">
              <h3 className="text-lg font-semibold mb-4">As Minhas Estatísticas</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-800">{stats.classes}</p>
                  <p className="text-xs text-blue-700">Turmas</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <Package className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-800">{stats.kits}</p>
                  <p className="text-xs text-green-700">Kits</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-purple-800">{stats.students}</p>
                  <p className="text-xs text-purple-700">Alunos</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Coluna de Conteúdo Principal */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {!editing ? (
                // MODO VISUALIZAÇÃO
                <>
                  <h3 className="text-lg font-semibold mb-6">Informações Pessoais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome Completo</label>
                      <p className="px-3 py-2 bg-muted rounded-lg">{teacher.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <p className="px-3 py-2 bg-muted rounded-lg">{teacher.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Telefone</label>
                      <p className="px-3 py-2 bg-muted rounded-lg">{teacher.phone || "Não definido"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Escola</label>
                      <p className="px-3 py-2 bg-muted rounded-lg">{teacher.school?.name || "Não definida"}</p>
                    </div>
                  </div>

                  {/* Estatísticas Desktop */}
                  <div className="hidden lg:block pt-6 border-t">
                    <h4 className="font-semibold mb-4">Estatísticas do Ano</h4>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-800">{stats.classes}</p>
                        <p className="text-sm text-blue-700">Turmas Ativas</p>
                      </div>
                      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                        <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-800">{stats.kits}</p>
                        <p className="text-sm text-green-700">Kits Pedidos</p>
                      </div>
                      <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                        <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-800">{stats.students}</p>
                        <p className="text-sm text-purple-700">Total de Alunos</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // MODO EDIÇÃO
                <>
                  <h3 className="text-lg font-semibold mb-6">Editar Informações</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <p className="px-3 py-2 bg-muted rounded-lg text-muted-foreground">
                        {teacher.email} (não editável)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Telefone</label>
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
                      <label className="block text-sm font-medium mb-2">Escola</label>
                      <p className="px-3 py-2 bg-muted rounded-lg text-muted-foreground">
                        {teacher.school?.name || "Não definida"} (não editável)
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Dica:</strong> Apenas o nome e telefone podem ser editados. 
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
  );
}