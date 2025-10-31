import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para usar __dirname com ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateCertificate(trainingSession, teacher) {
  try {
    console.log('🔨 A gerar certificado para:', teacher.name);
    
    // 1. Criar novo documento PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    
    // 2. Configurar fontes
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const { width, height } = page.getSize();
    
    // 3. Adicionar conteúdo ao certificado
    
    // Título
    page.drawText('CERTIFICADO DE FORMAÇÃO', {
      x: 120,
      y: height - 80,
      size: 20,
      font,
      color: rgb(0, 0.4, 0.6),
    });
    
    // Linha decorativa
    page.drawLine({
      start: { x: 100, y: height - 100 },
      end: { x: 500, y: height - 100 },
      thickness: 2,
      color: rgb(0, 0.4, 0.6),
    });
    
    // Texto principal
    page.drawText('Certificamos que', {
      x: 200,
      y: height - 140,
      size: 14,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    // Nome do professor (destaque)
    page.drawText(teacher.name, {
      x: 150,
      y: height - 170,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });
    
    // Detalhes da formação
    page.drawText(`participou na formação:`, {
      x: 180,
      y: height - 200,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`"${trainingSession.title}"`, {
      x: 150,
      y: height - 220,
      size: 14,
      font,
      color: rgb(0, 0.4, 0.6),
    });
    
    page.drawText(`Realizada em: ${new Date(trainingSession.date).toLocaleDateString('pt-PT')}`, {
      x: 170,
      y: height - 250,
      size: 10,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Avaliação
    if (trainingSession.adminRating) {
      const stars = '★'.repeat(trainingSession.adminRating) + '☆'.repeat(5 - trainingSession.adminRating);
      page.drawText(`Avaliação: ${stars}`, {
        x: 220,
        y: height - 280,
        size: 12,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    }
    
    // Rodapé
    page.drawLine({
      start: { x: 100, y: 60 },
      end: { x: 500, y: 60 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    
    page.drawText('RD-Portal - Programa de Formação Digital', {
      x: 170,
      y: 40,
      size: 10,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    page.drawText('Sistema de Certificação Automática', {
      x: 190,
      y: 25,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // 4. Salvar PDF
    const pdfBytes = await pdfDoc.save();
    
    // Criar diretório se não existir
    const certDir = path.join(__dirname, '../public/certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
      console.log('📁 Diretório de certificados criado:', certDir);
    }
    
    // Nome do ficheiro
    const fileName = `certificate-${trainingSession.id}-${Date.now()}.pdf`;
    const filePath = path.join(certDir, fileName);
    
    // Guardar ficheiro
    fs.writeFileSync(filePath, pdfBytes);
    console.log('✅ Certificado guardado em:', filePath);
    
    // Retornar URL do certificado
    return `/certificates/${fileName}`;
    
  } catch (error) {
    console.error('❌ Erro ao gerar certificado:', error);
    throw error;
  }
}