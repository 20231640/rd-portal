// src/pages/TeacherFeedback.jsx
import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sidebar } from "../components/ui/sidebar";
import { Folder, Upload, ExternalLink, File, Download, Calendar } from "lucide-react";

export default function TeacherFeedback() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buscar pastas do professor
  useEffect(() => {
    fetchFolders();
  }, []);

  async function fetchFolders() {
    try {
      setLoading(true);
      const teacherEmail = localStorage.getItem("loggedInTeacher");
      
      if (!teacherEmail) {
        console.error("Email do professor não encontrado");
        return;
      }

      const res = await fetch(`http://localhost:4000/api/report-folders?teacherEmail=${teacherEmail}`);
      
      if (res.ok) {
        const foldersData = await res.json();
        setFolders(foldersData);
      } else {
        console.error("Erro ao carregar pastas");
      }
    } catch (err) {
      console.error("Erro ao carregar pastas:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">A carregar pastas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Feedback & Relatórios</h1>
          <p className="text-muted-foreground">
            Acede às tuas pastas no Google Drive para submeter relatórios, imagens e vídeos das aulas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map(folder => (
            <Card key={folder.id} className="p-6 hover:shadow-lg transition-shadow border-2">
              <div className="flex items-start justify-between mb-4">
                <Folder className="w-12 h-12 text-blue-500" />
                <Button variant="ghost" size="sm" asChild>
                  <a href={folder.driveLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{folder.title}</h3>
              
              {folder.class && (
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Turma:</strong> {folder.class.name}
                </p>
              )}
              
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <a href={folder.driveLink} target="_blank" rel="noopener noreferrer">
                    <Upload className="w-4 h-4 mr-2" />
                    Fazer Upload
                  </a>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <a href={folder.driveLink} target="_blank" rel="noopener noreferrer">
                    <File className="w-4 h-4 mr-2" />
                    Ver Conteúdo
                  </a>
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(folder.createdAt).toLocaleDateString('pt-PT')}
                  </span>
                  <span className={folder.isActive ? "text-green-600" : "text-red-600"}>
                    {folder.isActive ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {folders.length === 0 && !loading && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg mb-2">Nenhuma pasta disponível</p>
            <p className="text-sm text-muted-foreground">
              Contacte o administrador para criar pastas no Google Drive
            </p>
          </div>
        )}
      </div>
    </div>
  );
}