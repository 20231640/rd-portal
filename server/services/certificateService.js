import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateCertificate(trainingSession, teacher) {
  try {
    console.log('🔨 A gerar certificado para:', teacher.name);
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();
    
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
/* ============================================
   🔹 CORES
   ============================================ */
    const green = rgb(0.60, 0.75, 0.27);    
    const purple = rgb(0.45, 0.18, 0.45);   
    const darkGray = rgb(0.27, 0.29, 0.31);
    const lightGray = rgb(0.45, 0.47, 0.49);
    const white = rgb(1, 1, 1);
    
/* ============================================
   🔹 FUNDO VERDE
   ============================================ */
    page.drawRectangle({
      x: 0, y: 0, width, height,
      color: green,
    });
    
/* ============================================
   🔹 CARD CENTRAL
   ============================================ */
    const cardPadding = 60;
    const cardX = cardPadding;
    const cardY = cardPadding;
    const cardWidth = width - (cardPadding * 2);
    const cardHeight = height - (cardPadding * 2);
    
    page.drawRectangle({
      x: cardX, y: cardY,
      width: cardWidth, height: cardHeight,
      color: white,
    });
    
/* ============================================
   🔹 BARRA ROXA
   ============================================ */
    page.drawRectangle({
      x: cardX + 60,
      y: cardY + cardHeight - 40,
      width: 180, height: 8,
      color: purple,
    });
    
/* ============================================
   🔹 TÍTULO
   ============================================ */
    page.drawText('Certificado', {
      x: cardX + 80,
      y: cardY + cardHeight - 130,
      size: 64, font: fontBold,
      color: darkGray,
    });
    
/* ============================================
   🔹 LOGO
   ============================================ */
    let logoCarregado = false;
    const logoPaths = [
      path.join(process.cwd(), '..', 'client', 'src', 'assets', 'logo.png'),
      path.join(__dirname, '..', '..', 'client', 'src', 'assets', 'logo.png'),
    ];

    for (const logoPath of logoPaths) {
      try {
        if (fs.existsSync(logoPath)) {
          const logoImageBytes = fs.readFileSync(logoPath);
          const logoImage = await pdfDoc.embedPng(logoImageBytes);
          const logoDims = logoImage.scale(0.3);
          
          page.drawImage(logoImage, {
            x: cardX + cardWidth - 140,
            y: cardY + cardHeight - 120,
            width: logoDims.width, height: logoDims.height,
          });
          
          logoCarregado = true;
          break;
        }
      } catch (err) {
        console.log('⚠️ Erro no logo:', err.message);
      }
    }

/* ============================================
   🔹 FALLBACK SE LOGO NÃO FUNCIONAR
   ============================================ */
    if (!logoCarregado) {
      page.drawRectangle({
        x: cardX + cardWidth - 140,
        y: cardY + cardHeight - 120,
        width: 80, height: 60,
        color: purple,  // Agora roxo
        borderColor: darkGray, borderWidth: 2,
      });
      
      page.drawText('DRP', {
        x: cardX + cardWidth - 125,
        y: cardY + cardHeight - 90,
        size: 14, font: fontBold, color: white,
      });
    }
    
/* ============================================
   🔹 NOME DO PROFESSOR
   ============================================ */
    const nameY = cardY + cardHeight - 210;
    page.drawText(teacher.name, {
      x: cardX + 80, y: nameY,
      size: 36, font: fontBold, color: darkGray,
    });
    
/* ============================================
   🔹 DESCRIÇÃO
   ============================================ */
    const descY = nameY - 60;
    page.drawText('participou e concluiu com sucesso a sessão de formação', {
      x: cardX + 80, y: descY,
      size: 16, font: fontRegular, color: lightGray,
    });
    
    page.drawText(`realizada no dia ${new Date(trainingSession.date).toLocaleDateString('pt-PT')}.`, {
      x: cardX + 80, y: descY - 25,
      size: 16, font: fontRegular, color: lightGray,
    });

/* ============================================
   🔹 ASSINATURA
   ============================================ */
    const signY = cardY + 100;
    
    page.drawLine({
      start: { x: cardX + 80, y: signY + 40 },
      end: { x: cardX + 200, y: signY + 20 },
      thickness: 2, color: darkGray,
    });
    
    page.drawText('RD Portugal', {
      x: cardX + 80, y: signY - 10,
      size: 14, font: fontBold, color: darkGray,
    });

    page.drawText('Plataforma Educativa', {
      x: cardX + 80, y: signY - 30,
      size: 12, font: fontRegular, color: lightGray,
    });
  
/* ============================================
   🔹 SALVAR PDF
   ============================================ */

    const pdfBytes = await pdfDoc.save();
    
    const certDir = path.join(__dirname, '../public/certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }
    
    const fileName = `certificate-${trainingSession.id}-${Date.now()}.pdf`;
    const filePath = path.join(certDir, fileName);
    
    fs.writeFileSync(filePath, pdfBytes);
    console.log('✅ Certificado guardado:', filePath);
    
    const filePathUrl = `/certificates/${fileName}`;
    
    try {
      console.log('🔄 A atualizar professor com certificado...');
      const response = await fetch(`http://localhost:4000/api/auth/teachers/${teacher.id}/certificate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateUrl: filePathUrl,
          hasCompletedTraining: true
        })
      });
      
      if (response.ok) {
        console.log('✅ Professor atualizado com certificado');
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao atualizar professor:', response.status, errorText);
      }
    } catch (updateError) {
      console.error('⚠️ Erro de conexão ao atualizar professor:', updateError.message);
    }
    
    return filePathUrl;
    
  } catch (error) {
    console.error('❌ Erro ao gerar certificado:', error);
    throw error;
  }
}