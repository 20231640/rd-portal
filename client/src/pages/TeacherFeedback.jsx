// src/pages/TeacherFeedback.jsx - VERSÃO CORRIGIDA
import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sidebar } from "../components/ui/sidebar";
import { Folder, Upload, ExternalLink, File, Download, Calendar } from "lucide-react";
import { API_URL } from "../config/api";

export default function TeacherFeedback() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState(null);

  // ✅ CORREÇÃO: Buscar pastas do professor
  useEffect(() => {
    const teacherDataStr = localStorage.getItem("teacherData");
    const loggedInTeacher = localStorage.getItem("loggedInTeacher");

    if (!teacherDataStr || !loggedInTeacher) {
      console.log('❌ Não autenticado');
      return;
    }

    try {
      const teacherData = JSON.parse(teacherDataStr);
      setTeacher(teacherData);
      fetchFolders(teacherData.id);
    } catch (err) {
      console.error('❌ Erro ao carregar dados do professor:', err);
    }
  }, []);

  // ✅ CORREÇÃO: Função para buscar pastas
  async function fetchFolders(teacherId) {
    try {
      setLoading(true);
      console.log('🔄 Buscando pastas para professor:', teacherId);

      // ✅ CORREÇÃO: Buscar todas as pastas e filtrar
      const res = await fetch(`${API_URL}/api/report-folders`);
      
      if (!res.ok) {
        throw new Error("Erro ao carregar pastas");
      }

      const allFolders = await res.json();
      console.log('📊 Todas as pastas:', allFolders);

      // ✅ CORREÇÃO: Filtrar pastas do professor atual
      const teacherFolders = allFolders.filter(folder => folder.teacherId === teacherId);
      console.log('✅ Pastas do professor:', teacherFolders);

      setFolders(teacherFolders);
      
    } catch (err) {
      console.error("❌ Erro ao carregar pastas:", err);
      // Não mostrar alerta para evitar spam
    } finally {
      setLoading(false);
    }
  }

  // ✅ CORREÇÃO: Loading state melhorado
  if (loading) {
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
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-300 rounded"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
              </Card>
            ))}
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

        {/* ✅ CORREÇÃO: Informação de debug (opcional) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
            <strong>Debug:</strong> {folders.length} pasta(s) encontrada(s) para o professor
          </div>
        )}

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
            
            {/* ✅ CORREÇÃO: Botão para recarregar */}
            <Button 
              variant="outline" 
              onClick={() => teacher && fetchFolders(teacher.id)}
              className="mt-4"
            >
              Tentar Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}