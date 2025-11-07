import { useState } from "react";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  Download, FileText, BarChart3, Package, School, Users,
  Calendar, MapPin, AlertCircle, CheckCircle, Database
} from "lucide-react";

// Importações das bibliotecas de exportação
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { API_URL } from "../config/api";


export default function AdminExport() {
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("excel");
  const [recentExports, setRecentExports] = useState([]);

  const exportOptions = [
    {
      id: "excel",
      name: "Excel (.xlsx)",
      description: "Ideal para análise em Excel ou Google Sheets",
      icon: BarChart3,
      color: "text-green-600",
      extension: "xlsx"
    },
    {
      id: "pdf",
      name: "PDF Report",
      description: "Relatório formatado para apresentações",
      icon: FileText,
      color: "text-red-600",
      extension: "pdf"
    },
    {
      id: "csv",
      name: "CSV",
      description: "Formato simples para importação em outras aplicações",
      icon: Download,
      color: "text-blue-600",
      extension: "csv"
    }
  ];

  // Função para buscar dados da API
  const fetchData = async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}/api/${endpoint}`);
      if (!response.ok) throw new Error('Erro ao buscar dados');
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar ${endpoint}:`, error);
      return [];
    }
  };

  // Exportação para Excel
  const exportToExcel = async (data, filename) => {
    const wb = XLSX.utils.book_new();
    
    // Adicionar cada conjunto de dados como uma sheet separada
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const ws = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Exportação para CSV
  const exportToCSV = (data, filename) => {
    const csvData = Object.entries(data)[0][1]; // Pega o primeiro conjunto de dados
    const ws = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportação para PDF
  const exportToPDF = async (elementId, filename) => {
    const input = document.getElementById(elementId);
    if (!input) {
      alert('Elemento não encontrado para exportação PDF');
      return;
    }

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  };

  // Função principal de exportação
  const handleExport = async () => {
    setExporting(true);
    
    try {
      // Buscar dados da API
      const [schools, teachers, classes, kitRequests] = await Promise.all([
        fetchData('auth/schools'),
        fetchData('auth/teachers'),
        fetchData('classes'),
        fetchData('kits/requests')
      ]);

      // Preparar dados consolidados
      const exportData = {
        Escolas: schools,
        Professores: teachers,
        Turmas: classes,
        Kits: kitRequests.map(kit => ({
          ID: kit.id,
          Professor: kit.teacher?.name,
          Escola: kit.teacher?.school?.name,
          Turma: kit.class?.name,
          Tipo: kit.kitType,
          Status: kit.status,
          'Data Pedido': new Date(kit.requestedAt).toLocaleDateString('pt-PT'),
          'Data Aprovação': kit.approvedAt ? new Date(kit.approvedAt).toLocaleDateString('pt-PT') : '',
          'Data Envio': kit.shippedAt ? new Date(kit.shippedAt).toLocaleDateString('pt-PT') : '',
          'Data Entrega': kit.deliveredAt ? new Date(kit.deliveredAt).toLocaleDateString('pt-PT') : '',
          'Problemas Reportados': kit.reports?.length || 0
        }))
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `dados_rdportal_${timestamp}`;

      // Exportar conforme o formato selecionado
      switch (selectedFormat) {
        case 'excel':
          await exportToExcel(exportData, filename);
          break;
        case 'csv':
          exportToCSV(exportData, filename);
          break;
        case 'pdf':
          // Para PDF, vamos exportar um resumo
          await exportToPDF('export-summary', filename);
          break;
        default:
          throw new Error('Formato não suportado');
      }

      // Adicionar ao histórico
      const newExport = {
        id: Date.now(),
        format: selectedFormat,
        filename: `${filename}.${exportOptions.find(opt => opt.id === selectedFormat)?.extension}`,
        date: new Date().toLocaleString('pt-PT'),
        size: '~2MB' // Simulado
      };
      
      setRecentExports(prev => [newExport, ...prev.slice(0, 4)]); // Manter apenas últimos 5
      
      alert(`✅ Exportação para ${selectedFormat.toUpperCase()} concluída com sucesso!`);

    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('❌ Erro ao exportar dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  // Elemento invisível para exportação PDF
  const ExportSummary = () => (
    <div id="export-summary" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center', color: '#3b82f6', marginBottom: '20px' }}>
          Relatório RD-Portal
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px' }}>
          Exportado em {new Date().toLocaleDateString('pt-PT')}
        </p>
        
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h2 style={{ color: '#374151', marginBottom: '10px' }}>Resumo Estatístico</h2>
          <p>• Total de Escolas: Carregando...</p>
          <p>• Total de Professores: Carregando...</p>
          <p>• Kits Entregues: Carregando...</p>
          <p>• Alunos Impactados: Carregando...</p>
        </div>

        <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
          <h3 style={{ color: '#374151', marginBottom: '10px' }}>Informações do Sistema</h3>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            Este relatório foi gerado automaticamente pelo sistema RD-Portal.
            Dados atualizados em tempo real.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Exportar Dados</h1>
          <div className="text-sm text-muted-foreground">
            Exporte dados para análise externa
          </div>
        </div>

        {/* Elemento invisível para PDF */}
        <ExportSummary />

        {/* Exportação Principal */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            Exportação Completa do Sistema
          </h2>
          <p className="text-muted-foreground mb-4">
            Exporte todos os dados do sistema num único ficheiro
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={option.id}
                  className={`p-4 cursor-pointer border-2 transition-all ${
                    selectedFormat === option.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedFormat(option.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${option.color}`} />
                    <span className="font-medium">{option.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Button 
              onClick={handleExport}
              disabled={exporting}
              className="w-full md:w-auto"
              size="lg"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  A Exportar Dados...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Exportar Dados Completos
                </>
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Inclui: Escolas, Professores, Turmas, Kits e Estatísticas
            </div>
          </div>
        </Card>

        {/* Exportações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Exportação de Utilizadores
            </h3>
            <p className="text-muted-foreground mb-4">
              Lista de escolas, professores e turmas
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={async () => {
                  setSelectedFormat('excel');
                  setTimeout(handleExport, 100);
                }}
              >
                <BarChart3 className="w-4 h-4 mr-2 text-green-600" />
                Excel - Dados de Utilizadores
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={async () => {
                  setSelectedFormat('csv');
                  setTimeout(handleExport, 100);
                }}
              >
                <Download className="w-4 h-4 mr-2 text-blue-600" />
                CSV - Lista de Escolas
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              Exportação de Kits
            </h3>
            <p className="text-muted-foreground mb-4">
              Dados de pedidos e entregas de kits
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={async () => {
                  setSelectedFormat('excel');
                  setTimeout(handleExport, 100);
                }}
              >
                <BarChart3 className="w-4 h-4 mr-2 text-green-600" />
                Excel - Relatório de Kits
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={async () => {
                  setSelectedFormat('pdf');
                  setTimeout(handleExport, 100);
                }}
              >
                <FileText className="w-4 h-4 mr-2 text-red-600" />
                PDF - Resumo de Entregas
              </Button>
            </div>
          </Card>
        </div>

        {/* Histórico de Exportações */}
        {recentExports.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Exportações Recentes</h3>
            <div className="space-y-2">
              {recentExports.map(exportItem => (
                <div key={exportItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium">{exportItem.filename}</div>
                      <div className="text-sm text-muted-foreground">
                        {exportItem.date} • {exportItem.size}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                    {exportItem.format}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Informações Técnicas */}
        <Card className="p-6 bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">🔧 Funcionalidades de Exportação</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Excel:</strong> Múltiplas sheets com dados completos</li>
            <li>• <strong>PDF:</strong> Relatório formatado para apresentações</li>
            <li>• <strong>CSV:</strong> Dados estruturados para importação</li>
            <li>• Dados atualizados em tempo real da base de dados</li>
            <li>• Suporte a caracteres portugueses (ç, ã, õ, etc.)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}