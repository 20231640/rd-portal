// src/pages/TeacherFeedback.jsx - VERSÃO CORRIGIDA COM MENU MOBILE
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sidebar } from "../components/ui/sidebar";
import { Folder, Upload, ExternalLink, File, Download, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { API_URL } from "../config/api";

export default function TeacherFeedback() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const teacherDataStr = localStorage.getItem("teacherData");
    const loggedInTeacher = localStorage.getItem("loggedInTeacher");

    if (!teacherDataStr || !loggedInTeacher) {
      console.log('❌ Não autenticado');
      setError("Não autenticado. Por favor, faça login novamente.");
      return;
    }

    try {
      const teacherData = JSON.parse(teacherDataStr);
      setTeacher(teacherData);
      fetchFolders(teacherData.id);
    } catch (err) {
      console.error('❌ Erro ao carregar dados do professor:', err);
      setError("Erro ao carregar dados do professor.");
    }
  }, []);

  async function fetchFolders(teacherId) {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Buscando pastas para professor:', teacherId);

      const res = await fetch(`${API_URL}/api/report-folders`);
      
      if (!res.ok) {
        throw new Error("Erro ao carregar pastas");
      }

      const allFolders = await res.json();
      console.log('📊 Todas as pastas:', allFolders);

      const teacherFolders = allFolders.filter(folder => folder.teacherId === teacherId);
      console.log('✅ Pastas do professor:', teacherFolders);

      setFolders(teacherFolders);
      
    } catch (err) {
      console.error("❌ Erro ao carregar pastas:", err);
      setError("Erro ao carregar as pastas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const handleRetry = () => {
    if (teacher) {
      fetchFolders(teacher.id);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Feedback & Relatórios</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Aceda às suas pastas no Google Drive para submeter relatórios, imagens e vídeos das aulas
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 lg:p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-5 lg:h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="space-y-2 lg:space-y-3">
                  <div className="h-9 lg:h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-9 lg:h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
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
      
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Feedback & Relatórios</h1>
              <p className="text-muted-foreground text-sm lg:text-base mt-2">
                Aceda às suas pastas no Google Drive para submeter relatórios, imagens e vídeos das aulas
              </p>
            </div>
            
            {/* Botão de atualização */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRetry}
              disabled={loading}
              className="w-full lg:w-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Estado de erro */}
        {error && (
          <Card className="p-4 mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm lg:text-base">
                  Erro ao carregar
                </h3>
                <p className="text-red-700 dark:text-red-400 text-sm mt-1">
                  {error}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
                className="flex-shrink-0"
              >
                Tentar Novamente
              </Button>
            </div>
          </Card>
        )}

        {/* Grid de Pastas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {folders.map(folder => (
            <Card key={folder.id} className="p-4 lg:p-6 hover:shadow-lg transition-all duration-300 border-2 border-border group">
              {/* Header da Pasta */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Folder className="w-8 h-8 lg:w-12 lg:h-12 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base lg:text-lg text-foreground truncate">
                      {folder.title}
                    </h3>
                    {folder.class && (
                      <p className="text-xs lg:text-sm text-muted-foreground truncate">
                        <strong>Turma:</strong> {folder.class.name}
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="flex-shrink-0"
                >
                  <a 
                    href={folder.driveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              
              {/* Descrição (se houver) */}
              {folder.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {folder.description}
                </p>
              )}
              
              {/* Botões de Ação */}
              <div className="space-y-2 lg:space-y-3">
                <Button asChild className="w-full text-sm lg:text-base">
                  <a href={folder.driveLink} target="_blank" rel="noopener noreferrer">
                    <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Fazer Upload</span>
                  </a>
                </Button>
                
                <Button variant="outline" asChild className="w-full text-sm lg:text-base">
                  <a href={folder.driveLink} target="_blank" rel="noopener noreferrer">
                    <File className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Ver Conteúdo</span>
                  </a>
                </Button>
              </div>

              {/* Footer com Metadados */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      Criada em: {new Date(folder.createdAt).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    folder.isActive 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}>
                    {folder.isActive ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Estado Vazio */}
        {folders.length === 0 && !loading && !error && (
          <Card className="p-6 lg:p-12 text-center border-dashed">
            <div className="max-w-md mx-auto">
              <Folder className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2">
                Nenhuma pasta disponível
              </h3>
              <p className="text-muted-foreground text-sm lg:text-base mb-6">
                Contacte o administrador para criar pastas no Google Drive para as suas turmas. Para isso, dirija-se à página <strong>Contactar Administrador</strong>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleRetry}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                {/* Ir para a página Contactar Administrador */}
                <Button 
                  variant="default"
                  onClick={() => navigate('/contact-admin')}
                  className="flex-1 sm:flex-none"
                >
                  Contactar Administrador
                </Button>
              </div>

              {/* Informações adicionais */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">
                  💡 Como funciona?
                </h4>
                <ul className="text-xs lg:text-sm text-blue-700 dark:text-blue-400 space-y-1 text-left">
                  <li>• Cada pasta corresponde a uma turma específica</li>
                  <li>• Faça upload de relatórios, fotos e vídeos das aulas</li>
                  <li>• Os administradores terão acesso ao conteúdo</li>
                  <li>• Mantenha os ficheiros organizados por data</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Contador de Pastas */}
        {folders.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {folders.length} {folders.length === 1 ? 'pasta disponível' : 'pastas disponíveis'}
            </p>
            
            {/* Filtros (pode ser expandido no futuro) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {folders.filter(f => f.isActive).length} ativas
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}