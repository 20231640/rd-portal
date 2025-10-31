/*antigo código do teacher dashboard,*/
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, GraduationCap, Plus, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Sidebar } from "../components/ui/sidebar";
import { StatsCard } from "../components/ui/stats-card";
import { Badge } from "../components/ui/badge";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ name: "", students: "", cycle: "", year: "" });
  const [showAddClass, setShowAddClass] = useState(false);

  const STATUS_FLOW = [
    "Registered",
    "Training completed", 
    "Kit prepared/sent",
    "Presentation sent",
    "Implementation done",
    "Reports received"
  ];

  const cycles = {
    "Pré-Escolar": ["3 anos", "4 anos", "5 anos"],
    "1º Ciclo": ["1º ano", "2º ano", "3º ano", "4º ano"],
    "2º Ciclo": ["5º ano", "6º ano"],
    "3º Ciclo": ["7º ano", "8º ano", "9º ano"],
    "Secundário": ["10º ano", "11º ano", "12º ano"]
  };

  const kits = {
    "Pré-Escolar": "Kit Ilustrado Básico",
    "1º Ciclo": "Kit Livros + Posters", 
    "2º Ciclo": "Kit Intermédio",
    "3º Ciclo": "Kit Avançado",
    "Secundário": "Kit Digital + Atividades"
  };

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

        const classesRes = await fetch(`http://localhost:4000/api/classes?teacherId=${found.id}`);
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData);
        } else {
          const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
          setClasses(allClasses.filter(c => c.teacherEmail === found.email));
        }
      } catch (err) {
        console.error(err);
        const teachersLS = JSON.parse(localStorage.getItem("teachers") || "[]");
        const foundLS = teachersLS.find(t => t.email === localStorage.getItem("loggedInTeacher"));
        if (!foundLS) {
          localStorage.removeItem("loggedInTeacher");
          navigate("/login");
          return;
        }
        setTeacher(foundLS);
        const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        setClasses(allClasses.filter(c => c.teacherEmail === foundLS.email));
      }
    }

    loadTeacher();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("loggedInTeacher");
    navigate("/login");
  }

  function handleAddClass(e) {
    e.preventDefault();

    if (!newClass.name || !newClass.students || !newClass.cycle || !newClass.year) {
      alert("Preencha todos os campos");
      return;
    }

    if (parseInt(newClass.students) < 1) {
      alert("Número de alunos deve ser pelo menos 1");
      return;
    }

    const assignedKit = kits[newClass.cycle] || "Kit Padrão";

    const newEntry = {
      id: Date.now(),
      teacherEmail: teacher.email,
      name: newClass.name,
      students: parseInt(newClass.students),
      cycle: newClass.cycle,
      year: newClass.year,
      kit: assignedKit,
      status: STATUS_FLOW[0]
    };

    const updated = [...classes, newEntry];
    setClasses(updated);

    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    localStorage.setItem("classes", JSON.stringify([...allClasses, newEntry]));

    setNewClass({ name: "", students: "", cycle: "", year: "" });
    setShowAddClass(false);
  }

  function handleAdvanceStatus(id) {
    const updated = classes.map(c => {
      if (c.id === id) {
        const currentIndex = STATUS_FLOW.indexOf(c.status);
        if (currentIndex < STATUS_FLOW.length - 1) {
          return { ...c, status: STATUS_FLOW[currentIndex + 1] };
        }
      }
      return c;
    });
    setClasses(updated);

    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const updatedAll = allClasses.map(c =>
      c.id === id
        ? { ...c, status: updated.find(u => u.id === id).status }
        : c
    );
    localStorage.setItem("classes", JSON.stringify(updatedAll));
  }

  function handleDeleteClass(id) {
    if (!window.confirm("Tem a certeza que quer apagar esta turma?")) return;

    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);

    const allClasses = JSON.parse(localStorage.getItem("classes") || "[]");
    const updatedAll = allClasses.filter(c => c.id !== id);
    localStorage.setItem("classes", JSON.stringify(updatedAll));
  }

  if (!teacher) return null;

  const completedTrainings = classes.filter(c => 
    STATUS_FLOW.indexOf(c.status) >= 1
  ).length;

  const receivedKits = classes.filter(c => 
    STATUS_FLOW.indexOf(c.status) >= 2
  ).length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Visão Geral</h1>
            <p className="text-muted-foreground mt-2">Bem-vindo à plataforma, {teacher.name}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{teacher.name}</p>
            <p className="text-sm text-muted-foreground">{teacher.email}</p>
            <p className="text-sm text-muted-foreground">{teacher.school?.name || teacher.school}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Minhas Turmas"
            value={classes.length}
            icon={<Users className="w-6 h-6 text-primary" />}
            description="Turmas criadas"
          />
          <StatsCard
            title="Kits"
            value={receivedKits}
            icon={<BookOpen className="w-6 h-6 text-primary" />}
            description="Kits recebidos"
          />
          <StatsCard
            title="Formações"
            value={completedTrainings}
            icon={<GraduationCap className="w-6 h-6 text-primary" />}
            description="Sessões completadas"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Welcome Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Bem-vindo à Plataforma</h2>
            <p className="text-muted-foreground mb-4">
              Gerir as suas turmas e acompanhar as formações
            </p>
            <p className="text-sm text-muted-foreground">
              Use o menu lateral para navegar entre as diferentes secções.
            </p>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowAddClass(true)}
                className="w-full justify-start"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Nova Turma
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Kits Pedagógicos
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="w-4 h-4 mr-2" />
                Aceder a Formações
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Classes */}
        {classes.length > 0 && (
          <Card className="p-6 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Turmas Recentes</h2>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
            <div className="space-y-4">
              {classes.slice(0, 3).map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{classItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {classItem.students} alunos • {classItem.cycle}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    classItem.status === "Reports received" ? "success" :
                    classItem.status === "Implementation done" ? "success" :
                    "info"
                  }>
                    {classItem.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Add Class Modal */}
        {showAddClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Adicionar Nova Turma</h3>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Turma</label>
                  <input
                    type="text"
                    placeholder="Ex: 3°A"
                    value={newClass.name}
                    onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Número de Alunos</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newClass.students}
                    onChange={e => setNewClass({ ...newClass, students: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    min="1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ciclo</label>
                    <select
                      value={newClass.cycle}
                      onChange={e => setNewClass({ ...newClass, cycle: e.target.value, year: "" })}
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
                      value={newClass.year}
                      onChange={e => setNewClass({ ...newClass, year: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={!newClass.cycle}
                    >
                      <option value="">Selecionar</option>
                      {newClass.cycle && cycles[newClass.cycle].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Adicionar Turma
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddClass(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


