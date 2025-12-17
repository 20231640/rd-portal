import { useState } from "react";
import { AdminSidebar } from "../components/ui/admin-sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  Download, BarChart3, Package, Users, Database,
  FileSpreadsheet, TrendingUp, Calendar, CheckCircle,
  Menu
} from "lucide-react";
import * as XLSX from 'xlsx';
import { API_URL } from "../config/api";

export default function AdminExport() {
  const [exporting, setExporting] = useState(false);
  const [recentExports, setRecentExports] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  // Exportação para Excel com formatação melhorada
  const exportToExcel = async (data, filename) => {
    const wb = XLSX.utils.book_new();
    
    // Adicionar cada conjunto de dados como uma sheet separada
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      if (sheetData && sheetData.length > 0) {
        const ws = XLSX.utils.json_to_sheet(sheetData);
        
        // Ajustar largura das colunas automaticamente
        const colWidths = [];
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          let maxWidth = 10;
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
            const cell = ws[cellAddress];
            if (cell && cell.v) {
              const cellValue = String(cell.v);
              maxWidth = Math.max(maxWidth, Math.min(cellValue.length + 2, 50));
            }
          }
          colWidths.push({ wch: maxWidth });
        }
        ws['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    });
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Exportação completa do sistema
  const handleFullExport = async () => {
    setExporting(true);
    
    try {
      const [schools, teachers, classes, kitRequests] = await Promise.all([
        fetchData('auth/schools'),
        fetchData('auth/teachers'),
        fetchData('classes'),
        fetchData('kits/requests')
      ]);

      // Preparar dados completos e organizados
      const exportData = {
        'Resumo': [{
          'Total Escolas': schools.length,
          'Total Professores': teachers.length,
          'Total Turmas': classes.length,
          'Total Kits': kitRequests.length,
          'Kits Pendentes': kitRequests.filter(k => k.status === 'pending').length,
          'Kits Aprovados': kitRequests.filter(k => k.status === 'approved').length,
          'Kits Enviados': kitRequests.filter(k => k.status === 'shipped').length,
          'Kits Entregues': kitRequests.filter(k => k.status === 'delivered').length,
          'Total Alunos': classes.reduce((sum, c) => sum + (c.students || 0), 0),
          'Data Exportação': new Date().toLocaleString('pt-PT')
        }],
        
        'Escolas': schools.map(school => ({
          'ID': school.id,
          'Nome': school.name,
          'Município': school.municipality || 'N/A', // MUDADO: district → municipality
          'Endereço': school.address || 'N/A',
          'Telefone': school.phone || 'N/A',
          'Email': school.email || 'N/A',
          'Total Professores': teachers.filter(t => t.schoolId === school.id).length,
          'Total Turmas': classes.filter(c => c.schoolId === school.id).length,
          'Total Alunos': classes
            .filter(c => c.schoolId === school.id)
            .reduce((sum, c) => sum + (c.students || 0), 0)
        })),
        
        'Professores': teachers.map(teacher => ({
          'ID': teacher.id,
          'Nome': teacher.name,
          'Email': teacher.email,
          'Telefone': teacher.phone || 'Não definido',
          'Escola': teacher.school?.name || 'N/A',
          'Escola ID': teacher.schoolId,
          'Município Escola': teacher.school?.municipality || 'N/A', // MUDADO
          'Bloqueado': teacher.blocked ? 'Sim' : 'Não',
          'Aprovado pela Escola': teacher.schoolApproved ? 'Sim' : 'Não',
          'Formação Completa': teacher.hasCompletedTraining ? 'Sim' : 'Não',
          'Email Verificado': teacher.emailVerified ? 'Sim' : 'Não',
          'Total Turmas': classes.filter(c => c.teacherId === teacher.id).length,
          'Total Kits': kitRequests.filter(k => k.teacherId === teacher.id).length,
          'Total Alunos': classes
            .filter(c => c.teacherId === teacher.id)
            .reduce((sum, c) => sum + (c.students || 0), 0)
        })),
        
        'Turmas': classes.map(cls => ({
          'ID': cls.id,
          'Nome': cls.name,
          'Código': cls.code || 'N/A',
          'Número de Alunos': cls.students,
          'Ciclo': cls.cycle,
          'Ano': cls.year,
          'Professor': cls.teacher?.name || 'N/A',
          'Professor Email': cls.teacher?.email || 'N/A',
          'Escola': cls.school?.name || 'N/A',
          'Município': cls.school?.municipality || 'N/A', // MUDADO
          'Estado': cls.state || 'ACTIVE',
          'Data Criação': cls.createdAt ? new Date(cls.createdAt).toLocaleDateString('pt-PT') : 'N/A',
          'Total Kits': kitRequests.filter(k => k.classId === cls.id).length
        })),
        
        'Kits - Todos': kitRequests.map(kit => ({
          'ID': kit.id,
          'Tipo Kit': kit.kitType,
          'Status': kit.status,
          'Professor': kit.teacher?.name || 'N/A',
          'Professor Email': kit.teacher?.email || 'N/A',
          'Professor Telefone': kit.teacher?.phone || 'N/A',
          'Escola': kit.teacher?.school?.name || 'N/A',
          'Município Escola': kit.teacher?.school?.municipality || 'N/A', // MUDADO
          'Turma': kit.class?.name || 'N/A',
          'Turma Código': kit.class?.code || 'N/A',
          'Número Alunos Turma': kit.class?.students || 0,
          'Data Pedido': new Date(kit.requestedAt).toLocaleString('pt-PT'),
          'Data Aprovação': kit.approvedAt ? new Date(kit.approvedAt).toLocaleString('pt-PT') : 'Pendente',
          'Data Envio': kit.shippedAt ? new Date(kit.shippedAt).toLocaleString('pt-PT') : 'Pendente',
          'Data Entrega': kit.deliveredAt ? new Date(kit.deliveredAt).toLocaleString('pt-PT') : 'Pendente',
          'Notas Admin': kit.adminNotes || 'Sem notas',
          'Problemas Reportados': kit.reports?.length || 0
        })),
        
        'Kits Entregues': kitRequests
          .filter(kit => kit.status === 'delivered' || kit.deliveredAt)
          .map(kit => ({
            'ID': kit.id,
            'Tipo Kit': kit.kitType,
            'Professor': kit.teacher?.name || 'N/A',
            'Escola': kit.teacher?.school?.name || 'N/A',
            'Município': kit.teacher?.school?.municipality || 'N/A', // MUDADO
            'Turma': kit.class?.name || 'N/A',
            'Data Pedido': new Date(kit.requestedAt).toLocaleDateString('pt-PT'),
            'Data Entrega': kit.deliveredAt ? new Date(kit.deliveredAt).toLocaleDateString('pt-PT') : 'N/A',
            'Dias para Entrega': kit.deliveredAt && kit.requestedAt 
              ? Math.floor((new Date(kit.deliveredAt) - new Date(kit.requestedAt)) / (1000 * 60 * 60 * 24))
              : 'N/A'
          })),
        
        'Kits Pendentes': kitRequests
          .filter(kit => kit.status === 'pending')
          .map(kit => ({
            'ID': kit.id,
            'Tipo Kit': kit.kitType,
            'Professor': kit.teacher?.name || 'N/A',
            'Escola': kit.teacher?.school?.name || 'N/A',
            'Município': kit.teacher?.school?.municipality || 'N/A', // MUDADO
            'Turma': kit.class?.name || 'N/A',
            'Data Pedido': new Date(kit.requestedAt).toLocaleString('pt-PT'),
            'Dias Pendente': Math.floor((new Date() - new Date(kit.requestedAt)) / (1000 * 60 * 60 * 24))
          }))
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `exportacao_completa_${timestamp}`;
      await exportToExcel(exportData, filename);
      
      const newExport = {
        id: Date.now(),
        format: 'excel',
        filename: `${filename}.xlsx`,
        date: new Date().toLocaleString('pt-PT'),
        size: '~3MB'
      };
      
      setRecentExports(prev => [newExport, ...prev.slice(0, 4)]);
      alert('Exportação completa realizada com sucesso!');
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  // Exportação de Utilizadores
  const handleUsersExport = async () => {
    setExporting(true);
    try {
      const [schools, teachers, classes] = await Promise.all([
        fetchData('auth/schools'),
        fetchData('auth/teachers'),
        fetchData('classes')
      ]);

      const exportData = {
        'Escolas': schools.map(school => ({
          'ID': school.id,
          'Nome': school.name,
          'Município': school.municipality || 'N/A', // MUDADO
          'Endereço': school.address || 'N/A',
          'Telefone': school.phone || 'N/A',
          'Email': school.email || 'N/A',
          'Total Professores': teachers.filter(t => t.schoolId === school.id).length,
          'Total Turmas': classes.filter(c => c.schoolId === school.id).length
        })),
        
        'Professores': teachers.map(teacher => ({
          'ID': teacher.id,
          'Nome': teacher.name,
          'Email': teacher.email,
          'Telefone': teacher.phone || 'Não definido',
          'Escola': teacher.school?.name || 'N/A',
          'Município Escola': teacher.school?.municipality || 'N/A', // MUDADO
          'Bloqueado': teacher.blocked ? 'Sim' : 'Não',
          'Aprovado': teacher.schoolApproved ? 'Sim' : 'Não',
          'Formação Completa': teacher.hasCompletedTraining ? 'Sim' : 'Não',
          'Total Turmas': classes.filter(c => c.teacherId === teacher.id).length
        })),
        
        'Turmas': classes.map(cls => ({
          'ID': cls.id,
          'Nome': cls.name,
          'Código': cls.code || 'N/A',
          'Alunos': cls.students,
          'Ciclo': cls.cycle,
          'Ano': cls.year,
          'Professor': cls.teacher?.name || 'N/A',
          'Escola': cls.school?.name || 'N/A',
          'Município': cls.school?.municipality || 'N/A', // MUDADO
          'Estado': cls.state || 'ACTIVE'
        }))
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `dados_utilizadores_${timestamp}`;
      await exportToExcel(exportData, filename);
      
      const newExport = {
        id: Date.now(),
        format: 'excel',
        filename: `${filename}.xlsx`,
        date: new Date().toLocaleString('pt-PT'),
        size: '~1.5MB'
      };
      setRecentExports(prev => [newExport, ...prev.slice(0, 4)]);
      alert('Dados de utilizadores exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  // Exportação de Kits
  const handleKitsExport = async () => {
    setExporting(true);
    try {
      const kitRequests = await fetchData('kits/requests');

      const exportData = {
        'Todos os Kits': kitRequests.map(kit => ({
          'ID': kit.id,
          'Tipo Kit': kit.kitType,
          'Status': kit.status,
          'Professor': kit.teacher?.name || 'N/A',
          'Email Professor': kit.teacher?.email || 'N/A',
          'Escola': kit.teacher?.school?.name || 'N/A',
          'Município Escola': kit.teacher?.school?.municipality || 'N/A', // MUDADO
          'Turma': kit.class?.name || 'N/A',
          'Alunos': kit.class?.students || 0,
          'Data Pedido': new Date(kit.requestedAt).toLocaleString('pt-PT'),
          'Data Aprovação': kit.approvedAt ? new Date(kit.approvedAt).toLocaleString('pt-PT') : 'Pendente',
          'Data Envio': kit.shippedAt ? new Date(kit.shippedAt).toLocaleString('pt-PT') : 'Pendente',
          'Data Entrega': kit.deliveredAt ? new Date(kit.deliveredAt).toLocaleString('pt-PT') : 'Pendente',
          'Notas': kit.adminNotes || 'Sem notas',
          'Problemas': kit.reports?.length || 0
        })),
        
        'Resumo por Status': [
          {
            'Status': 'Pendentes',
            'Quantidade': kitRequests.filter(k => k.status === 'pending').length
          },
          {
            'Status': 'Aprovados',
            'Quantidade': kitRequests.filter(k => k.status === 'approved').length
          },
          {
            'Status': 'Enviados',
            'Quantidade': kitRequests.filter(k => k.status === 'shipped').length
          },
          {
            'Status': 'Entregues',
            'Quantidade': kitRequests.filter(k => k.status === 'delivered').length
          }
        ]
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `relatorio_kits_${timestamp}`;
      await exportToExcel(exportData, filename);
      
      const newExport = {
        id: Date.now(),
        format: 'excel',
        filename: `${filename}.xlsx`,
        date: new Date().toLocaleString('pt-PT'),
        size: '~1MB'
      };
      setRecentExports(prev => [newExport, ...prev.slice(0, 4)]);
      alert('Relatório de kits exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  // Exportação de Entregas
  const handleDeliveriesExport = async () => {
    setExporting(true);
    try {
      const kitRequests = await fetchData('kits/requests');
      const deliveredKits = kitRequests.filter(kit => kit.status === 'delivered' || kit.deliveredAt);

      const exportData = {
        'Kits Entregues': deliveredKits.map(kit => ({
          'ID': kit.id,
          'Tipo Kit': kit.kitType,
          'Professor': kit.teacher?.name || 'N/A',
          'Email': kit.teacher?.email || 'N/A',
          'Telefone': kit.teacher?.phone || 'N/A',
          'Escola': kit.teacher?.school?.name || 'N/A',
          'Município': kit.teacher?.school?.municipality || 'N/A', // MUDADO
          'Turma': kit.class?.name || 'N/A',
          'Alunos': kit.class?.students || 0,
          'Data Pedido': new Date(kit.requestedAt).toLocaleDateString('pt-PT'),
          'Data Entrega': kit.deliveredAt ? new Date(kit.deliveredAt).toLocaleDateString('pt-PT') : 'N/A',
          'Dias para Entrega': kit.deliveredAt && kit.requestedAt 
            ? Math.floor((new Date(kit.deliveredAt) - new Date(kit.requestedAt)) / (1000 * 60 * 60 * 24))
            : 'N/A'
        })),
        
        'Estatísticas': [{
          'Total Entregues': deliveredKits.length,
          'Média Dias Entrega': deliveredKits.length > 0
            ? Math.round(deliveredKits
                .filter(k => k.deliveredAt && k.requestedAt)
                .reduce((sum, k) => sum + Math.floor((new Date(k.deliveredAt) - new Date(k.requestedAt)) / (1000 * 60 * 60 * 24)), 0) / deliveredKits.length)
            : 0,
          'Data Exportação': new Date().toLocaleString('pt-PT')
        }]
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `resumo_entregas_${timestamp}`;
      await exportToExcel(exportData, filename);
      
      const newExport = {
        id: Date.now(),
        format: 'excel',
        filename: `${filename}.xlsx`,
        date: new Date().toLocaleString('pt-PT'),
        size: '~500KB'
      };
      setRecentExports(prev => [newExport, ...prev.slice(0, 4)]);
      alert('Resumo de entregas exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

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

      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
        {/* Mobile Header */}
        <div className="flex justify-between items-center sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Exportar Dados</h1>
          <div className="w-10"></div>
        </div>

        {/* Header */}
        <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Exportar Dados
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Permite exportar dados completos do sistema para análise em Excel
            </p>
          </div>
        </div>

        {/* Exportação Principal */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
            Exportação Completa do Sistema
          </h2>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
            Exportação dos dados do sistema num único ficheiro Excel com múltiplas folhas organizadas.
          </p>
          
          <div className="bg-muted p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
            <p className="text-sm font-medium mb-2">Inclui:</p>
            <ul className="text-xs sm:text-sm space-y-1 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
              <li>• Resumo estatístico completo</li>
              <li>• Todas as escolas com detalhes</li>
              <li>• Todos os professores com informações</li>
              <li>• Todas as turmas com dados</li>
              <li>• Todos os kits com histórico</li>
              <li>• Kits entregues e pendentes</li>
            </ul>
          </div>

          <Button 
            onClick={handleFullExport}
            disabled={exporting}
            className="w-full text-sm sm:text-base"
            size="lg"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                A exportar dados...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Exportar dados completos
              </>
            )}
          </Button>
        </Card>

        {/* Exportações Específicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Exportação de Utilizadores
            </h3>
            <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
              Exportação de escolas, professores e turmas com todos os detalhes.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-xs sm:text-sm"
                onClick={handleUsersExport}
                disabled={exporting}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Excel - Dados de utilizadores
              </Button>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Exportação de Kits
            </h3>
            <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
              Relatório completo de todos os kits e seus estados.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-xs sm:text-sm"
                onClick={handleKitsExport}
                disabled={exporting}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Excel - Relatório de Kits
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-xs sm:text-sm"
                onClick={handleDeliveriesExport}
                disabled={exporting}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Excel - Resumo de Entregas
              </Button>
            </div>
          </Card>
        </div>

        {/* Histórico de Exportações */}
        {recentExports.length > 0 && (
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">
              Exportações Recentes
            </h3>
            <div className="space-y-2">
              {recentExports.map(exportItem => (
                <div key={exportItem.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{exportItem.filename}</div>
                      <div className="text-xs text-muted-foreground">
                        {exportItem.date} • {exportItem.size}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium flex-shrink-0">
                    Excel
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Informações Técnicas */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-3 sm:mb-4">
            Funcionalidades de Exportação
          </h3>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Excel:</strong> Múltiplas folhas organizadas com dados completos e detalhados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Dados Completos:</strong> Todos os campos disponíveis são exportados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Formatação:</strong> Colunas ajustadas automaticamente para melhor visualização</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Tempo Real:</strong> Dados atualizados diretamente da base de dados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Suporte PT:</strong> Caracteres portugueses totalmente suportados</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}