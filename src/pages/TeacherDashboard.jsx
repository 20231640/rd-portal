import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Save, X, Mail, Phone, MapPin, Edit3, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Sidebar } from "../components/ui/sidebar";
import ProfilePicture from "../components/ui/profile-picture";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Buscar dados do professor
  useEffect(() => {
    const email = localStorage.getItem("loggedInTeacher");
    if (!email) {
      navigate("/login");
      return;
    }

    async function loadTeacher() {
      try {
        const res = await fetch("http://localhost:4000/api/auth/teachers");
        if (!res.ok) throw new Error("Erro ao buscar professores.");
        const all = await res.json();
        const found = all.find(t => t.email === email);
        if (!found) {
          localStorage.removeItem("loggedInTeacher");
          navigate("/login");
          return;
        }
        setTeacher(found);
        setFormData(found);
      } catch (err) {
        console.error(err);
        // Fallback para localStorage
        const teachersLS = JSON.parse(localStorage.getItem("teachers") || "[]");
        const foundLS = teachersLS.find(t => t.email === email);
        if (!foundLS) {
          localStorage.removeItem("loggedInTeacher");
          navigate("/login");
          return;
        }
        setTeacher(foundLS);
        setFormData(foundLS);
      }
    }

    loadTeacher();
  }, [navigate]);

  // 🔧 ADICIONAR: Função para atualizar a foto
  const handlePhotoUpdate = (newPhoto) => {
    const updatedTeacher = { ...teacher, photo: newPhoto };
    const updatedFormData = { ...formData, photo: newPhoto };
    
    setTeacher(updatedTeacher);
    setFormData(updatedFormData);
    
    // Aqui podes adicionar a lógica para guardar na BD
    console.log('Foto atualizada:', newPhoto);
  };

  function handleLogout() {
    localStorage.removeItem("loggedInTeacher");
    navigate("/login");
  }

  const handleSave = () => {
    setTeacher(formData);
    setEditing(false);
    // Aqui depois fazemos fetch para atualizar na BD
  };

  const handleCancel = () => {
    setFormData({ ...teacher });
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
      {/* 🔧 ALTERAR: Remover a prop onLogout pois agora está dentro do Sidebar */}
      <Sidebar />
      
      {/* Main Content - Só Perfil */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2">Gerir informações pessoais</p>
          </div>
          
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da Foto */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                {/* 🔧 SUBSTITUIR: Todo o container da foto pelo ProfilePicture */}
                <ProfilePicture
                  photo={teacher.photo}
                  onPhotoUpdate={handlePhotoUpdate}
                  className="mx-auto mb-4"
                />
                
                <h2 className="text-xl font-bold">{teacher.name}</h2>
                <p className="text-muted-foreground">{teacher.school?.name || teacher.school}</p>
                
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{teacher.phone || "Não definido"}</span>
                  </div>
                  {teacher.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{teacher.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Coluna de Informações Editáveis */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Informações Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-muted rounded-lg">{teacher.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-muted rounded-lg">{teacher.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-muted rounded-lg">{teacher.phone || "Não definido"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Escola</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.school?.name || formData.school || ""}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-muted rounded-lg">{teacher.school?.name || teacher.school}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Morada</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-muted rounded-lg">{teacher.address || "Não definida"}</p>
                  )}
                </div>
              </div>

              {/* Estatísticas Pessoais */}
              {!editing && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-semibold mb-4">Estatísticas do Ano</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">5</p>
                      <p className="text-sm text-muted-foreground">Turmas</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">3</p>
                      <p className="text-sm text-muted-foreground">Formações</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">125</p>
                      <p className="text-sm text-muted-foreground">Alunos</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">2</p>
                      <p className="text-sm text-muted-foreground">Kits</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
