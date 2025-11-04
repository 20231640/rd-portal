// src/pages/AdminFeedbackReports.jsx
import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { Folder, Plus, ExternalLink, Users, Trash2, Search, Calendar } from "lucide-react";

export default function AdminFeedbackReports() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newFolder, setNewFolder] = useState({
    title: "",
    driveLink: "",
    teacherId: "",
    classId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [teachersRes, foldersRes] = await Promise.all([
        fetch("http://localhost:4000/api/auth/teachers"),
        fetch("http://localhost:4000/api/report-folders")
      ]);
      
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData);
        
        // Extrair todas as classes dos professores
        const allClasses = teachersData.flatMap(teacher => teacher.classes || []);
        setClasses(allClasses);
      }
      
      if (foldersRes.ok) {
        setFolders(await foldersRes.json());
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createFolder(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/report-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFolder)
      });

      if (res.ok) {
        const folder = await res.json();
        setFolders(prev => [...prev, folder]);
        setShowCreateForm(false);
        setNewFolder({ title: "", driveLink: "", teacherId: "", classId: "" });
        alert("Pasta criada com sucesso!");
      } else {
        const errorData = await res.json();
        alert("Erro: " + errorData.error);
      }
    } catch (err) {
      console.error("Erro ao criar pasta:", err);
      alert("Erro ao criar pasta");
    }
  }

  async function deleteFolder(id) {
    if (!confirm("Tem a certeza que quer eliminar esta pasta?")) return;
    
    try {
      const res = await fetch(`http://localhost:4000/api/report-folders/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setFolders(prev => prev.filter(folder => folder.id !== id));
        alert("Pasta eliminada com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao eliminar pasta:", err);
      alert("Erro ao eliminar pasta");
    }
  }

  // Filtrar pastas por pesquisa
  const filteredFolders = folders.filter(folder =>
    folder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (folder.class?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">A carregar dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Relatórios</h1>
            <p className="text-muted-foreground">Criar e gerir pastas no Google Drive para professores</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Pasta
          </Button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-6">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar pastas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Formulário Criar Pasta */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Criar Nova Pasta</h2>
              <form onSubmit={createFolder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    value={newFolder.title}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded border border-input px-3 py-2"
                    placeholder="Ex: Relatórios Professor João"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Link Google Drive *</label>
                  <input
                    value={newFolder.driveLink}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, driveLink: e.target.value }))}
                    className="w-full rounded border border-input px-3 py-2"
                    placeholder="https://drive.google.com/drive/folders/..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Professor *</label>
                  <select
                    value={newFolder.teacherId}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, teacherId: e.target.value }))}
                    className="w-full rounded border border-input px-3 py-2"
                    required
                  >
                    <option value="">Selecionar Professor</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.school.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Turma (Opcional)</label>
                  <select
                    value={newFolder.classId}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full rounded border border-input px-3 py-2"
                  >
                    <option value="">Todas as turmas</option>
                    {classes
                      .filter(classItem => classItem.teacherId == newFolder.teacherId)
                      .map(classItem => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name} - {classItem.year}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Folder className="w-4 h-4 mr-2" />
                    Criar Pasta
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Lista de Pastas */}
        <div className="space-y-4">
          {filteredFolders.map(folder => (
            <Card key={folder.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Folder className="w-10 h-10 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-lg">{folder.title}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {folder.teacher.name} - {folder.teacher.school.name}
                      </span>
                      {folder.class && (
                        <span>Turma: {folder.class.name}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        folder.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {folder.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={folder.driveLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteFolder(folder.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <a 
                  href={folder.driveLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline break-all"
                >
                  {folder.driveLink}
                </a>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(folder.createdAt).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {filteredFolders.length === 0 && !loading && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhuma pasta encontrada</p>
            <Button onClick={() => setShowCreateForm(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Pasta
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}