import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Trash2, Edit3, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Sidebar } from "../components/ui/sidebar";

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

        // Buscar turmas do professor
        const classesRes = await fetch(`http://localhost:4000/api/classes?teacherId=${found.id}`);
        if (!classesRes.ok) throw new Error("Erro ao buscar turmas.");
        const classesData = await classesRes.json();
        setClasses(classesData);
        setFilteredClasses(classesData);
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados do professor ou turmas.");
      }
    }

    loadTeacher();
  }, [navigate]);

  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm, filterCycle]);

  const filterClasses = () => {
    let filtered = classes;

    if (searchTerm) {
      filtered = filtered.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.cycle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCycle) {
      filtered = filtered.filter(cls => cls.cycle === filterCycle);
    }

    setFilteredClasses(filtered);
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClass.name || !newClass.students || !newClass.cycle || !newClass.year) {
      alert("Preencha todos os campos");
      return;
    }

    const assignedKit = kits[newClass.cycle] || "Kit Padrão";

    try {
      const res = await fetch("http://localhost:4000/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClass.name,
          students: parseInt(newClass.students),
          cycle: newClass.cycle,
          year: newClass.year,
          teacherId: teacher.id,
          kit: assignedKit,
          status: STATUS_FLOW[0]
        })
      });
      if (!res.ok) throw new Error("Erro ao criar turma");
      const created = await res.json();
      setClasses([...classes, created]);
      setFilteredClasses([...filteredClasses, created]);
      setNewClass({ name: "", students: "", cycle: "", year: "" });
      setShowAddClass(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar turma no servidor.");
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:4000/api/classes/${editingClass.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingClass.name,
          students: parseInt(editingClass.students),
          cycle: editingClass.cycle,
          year: editingClass.year
        })
      });
      if (!res.ok) throw new Error("Erro ao atualizar turma");
      const updated = await res.json();
      const updatedClasses = classes.map(c => c.id === updated.id ? updated : c);
      setClasses(updatedClasses);
      setFilteredClasses(updatedClasses);
      setEditingClass(null);
      setShowAddClass(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar turma no servidor.");
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm("Tem a certeza que quer apagar esta turma?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/classes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao apagar turma");
      const updated = classes.filter(c => c.id !== id);
      setClasses(updated);
      setFilteredClasses(updated);
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar turma no servidor.");
    }
  };

  const handleAdvanceStatus = async (id) => {
    const classToUpdate = classes.find(c => c.id === id);
    if (!classToUpdate) return;
    const currentIndex = STATUS_FLOW.indexOf(classToUpdate.status);
    if (currentIndex >= STATUS_FLOW.length - 1) return;

    const newStatus = STATUS_FLOW[currentIndex + 1];
    try {
      const res = await fetch(`http://localhost:4000/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");
      const updated = await res.json();
      const updatedClasses = classes.map(c => c.id === id ? updated : c);
      setClasses(updatedClasses);
      setFilteredClasses(updatedClasses);
    } catch (err) {
      console.error(err);
      alert("Erro ao avançar status no servidor.");
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Turmas</h1>
            <p className="text-muted-foreground mt-2">Gerir e acompanhar as suas turmas</p>
          </div>
          <Button onClick={() => setShowAddClass(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nova Turma
          </Button>
        </div>

        <Card className="p-6 mb-8">
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
              className="px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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

        {filteredClasses.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {classes.length === 0 
                ? "Comece por adicionar a sua primeira turma."
                : "Tente ajustar os filtros de pesquisa."
              }
            </p>
            {classes.length === 0 && (
              <Button onClick={() => setShowAddClass(true)}>
                <Plus className="w-4 h-4 mr-2" /> Criar Primeira Turma
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map(classItem => (
              <Card key={classItem.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kit:</span>
                    <span className="font-medium">{classItem.kit}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge variant={classItem.status === "Reports received" ? "success" : classItem.status === "Implementation done" ? "success" : "info"}>
                      {classItem.status}
                    </Badge>
                    {STATUS_FLOW.indexOf(classItem.status) < STATUS_FLOW.length - 1 && (
                      <Button size="sm" onClick={() => handleAdvanceStatus(classItem.id)}>Avançar</Button>
                    )}
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${((STATUS_FLOW.indexOf(classItem.status)+1)/STATUS_FLOW.length)*100}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Passo {STATUS_FLOW.indexOf(classItem.status)+1} de {STATUS_FLOW.length}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {(showAddClass || editingClass) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 w-full max-w-md">
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

                <div className="grid grid-cols-2 gap-4">
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

                {editingClass && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Kit Atribuído</label>
                    <p className="px-3 py-2 bg-muted rounded-lg">{kits[editingClass.cycle] || "Kit Padrão"}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
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
