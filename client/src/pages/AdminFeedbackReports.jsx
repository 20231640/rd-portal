import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { Folder, Plus, ExternalLink, Users, Trash2, Search, Calendar, Menu } from "lucide-react";
import { API_URL } from "../config/api";

export default function AdminFeedbackReports() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
        fetch(`${API_URL}/api/auth/teachers`),
        fetch(`${API_URL}/api/report-folders`)
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
      const res = await fetch(`${API_URL}/api/report-folders`, {
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
    if (!confirm("Tem a certeza que pretende eliminar esta pasta?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/report-folders/${id}`, {
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
            <h1 className="text-xl font-bold">Relatórios</h1>
            <div className="w-10"></div>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
            <p className="text-muted-foreground text-sm sm:text-base">A carregar dados...</p>
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
          <h1 className="text-xl font-bold">Relatórios</h1>
          <div className="w-10"></div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Relatórios</h1>
            <p className="text-muted-foreground">Criar e gerir pastas no Google Drive para os professores</p>
          </div>
          <div className="w-full sm:w-auto">
            <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova Pasta
            </Button>
          </div>
        </div>

        {/* Mobile Create Button */}
        <div className="sm:hidden mb-6">
          <Button onClick={() => setShowCreateForm(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Nova Pasta
          </Button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-6">
          <div className="relative w-full sm:w-80">
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

        {/* Formulário Criar Pasta - RESPONSIVO */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-4 sm:p-6 w-full max-w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Criar Nova Pasta</h2>
              <form onSubmit={createFolder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    value={newFolder.title}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded border border-input px-3 py-2 text-sm sm:text-base"
                    placeholder="Exemplo: Relatórios do Professor João"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Link Google Drive *</label>
                  <input
                    value={newFolder.driveLink}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, driveLink: e.target.value }))}
                    className="w-full rounded border border-input px-3 py-2 text-sm sm:text-base"
                    placeholder="https://drive.google.com/drive/folders/..."
                    required
                  />
                </div>
                
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">Professor *</label>
                  <select
                    value={newFolder.teacherId}
                    onChange={(e) => setNewFolder(prev => ({ ...prev, teacherId: e.target.value }))}
                    className="w-full rounded border border-input px-3 py-2 text-sm sm:text-base"
                    required
                  >
                    <option value="">Selecionar professor</option>
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
                    className="w-full rounded border border-input px-3 py-2 text-sm sm:text-base"
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

                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)} 
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    Criar Pasta
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Lista de Pastas - RESPONSIVO */}
        <div className="space-y-3 sm:space-y-4">
          {filteredFolders.map(folder => (
            <Card key={folder.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg break-words">{folder.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-xs sm:text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{folder.teacher.name} - {folder.teacher.school.name}</span>
                      </span>
                      {folder.class && (
                        <span className="truncate">Turma: {folder.class.name}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs w-fit ${
                        folder.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {folder.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 self-end sm:self-auto">
                  <Button variant="ghost" size="sm" asChild className="w-9 h-9 sm:w-10 sm:h-10">
                    <a href={folder.driveLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteFolder(folder.id)}
                    className="w-9 h-9 sm:w-10 sm:h-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <a 
                  href={folder.driveLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline break-all text-xs sm:text-sm"
                >
                  {folder.driveLink}
                </a>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  {new Date(folder.createdAt).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {filteredFolders.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <Folder className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">Não foram encontradas pastas</p>
            <Button onClick={() => setShowCreateForm(true)} size="sm" className="sm:size-default">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Pasta
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}