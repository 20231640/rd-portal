import express from "express";
import { PrismaClient } from "@prisma/client";
import { generateCertificate } from '../services/certificateService.js';


const router = express.Router();
const prisma = new PrismaClient();

/* ============================================
   🔹 CRIAR SESSÃO INDIVIDUAL para um professor
   ============================================ */
router.post("/", async (req, res) => {
  const { title, description, date, zoomLink, teacherId, groupId, cycle } = req.body;

  if (!title || !date || !zoomLink || !teacherId) {
    return res.status(400).json({ 
      message: "Title, date, Zoom link e teacherId são obrigatórios." 
    });
  }

  try {
    const training = await prisma.trainingSession.create({
      data: {
        title,
        description,
        date: new Date(date),
        zoomLink,
        teacherId: parseInt(teacherId),
        completed: false,
        groupId: groupId || null,
        cycle: cycle || null
      },
      include: {
        teacher: {
          include: {
            school: true
          }
        }
      }
    });
    res.status(201).json(training);
  } catch (err) {
    console.error("Erro ao criar formação:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 LISTAR TODAS AS SESSÕES (Admin)
   ============================================ */
router.get("/", async (req, res) => {
  try {
    const trainings = await prisma.trainingSession.findMany({
      include: {
        teacher: {
          include: {
            school: true
          }
        }
      },
      orderBy: { date: "asc" },
    });
    res.json(trainings);
  } catch (err) {
    console.error("Erro ao listar formações:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 LISTAR SESSÕES DE UM PROFESSOR
   ============================================ */
router.get("/teacher/:teacherId", async (req, res) => {
  const teacherId = parseInt(req.params.teacherId);

  try {
    const trainings = await prisma.trainingSession.findMany({
      where: {
        teacherId: teacherId
      },
      include: {
        teacher: true
      },
      orderBy: { date: "asc" },
    });
    res.json(trainings);
  } catch (err) {
    console.error("Erro ao listar formações do professor:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ============================================
   🔹 ELIMINAR SESSÃO
   ============================================ */
router.delete("/:id", async (req, res) => {
  try {
    await prisma.trainingSession.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Sessão eliminada com sucesso" });
  } catch (err) {
    console.error("Erro ao eliminar formação:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 MARCAR SESSÃO COMO CONCLUÍDA COM AVALIAÇÃO
   ============================================ */
router.put("/:id/complete", async (req, res) => {
  const trainingId = parseInt(req.params.id);
  const { adminRating, feedback } = req.body;

  console.log('📝 Completando sessão:', trainingId, 'Rating:', adminRating);

  // Validar rating
  if (!adminRating || adminRating < 1 || adminRating > 5) {
    return res.status(400).json({ 
      message: "Avaliação de 1-5 estrelas é obrigatória" 
    });
  }

  try {
    // Buscar sessão com dados do professor
    const training = await prisma.trainingSession.findUnique({
      where: { id: trainingId },
      include: {
        teacher: true
      }
    });

    if (!training) {
      return res.status(404).json({ message: "Sessão não encontrada" });
    }

    if (training.completed) {
      return res.status(400).json({ message: "Sessão já está concluída" });
    }

    // Generate certificate
    console.log('📄 A gerar certificado...');
    const certificateUrl = await generateCertificate(training, training.teacher);
    console.log('✅ Certificado gerado:', certificateUrl);

    // ⭐⭐ ATUALIZAÇÃO CRÍTICA: Marcar professor como formado ⭐⭐
    console.log('👨‍🏫 Atualizando estado do professor...');
    
    // Usar transaction para garantir que ambas as operações são bem sucedidas
    const [updatedTraining] = await prisma.$transaction([
      // 1. Update training session
      prisma.trainingSession.update({
        where: { id: trainingId },
        data: {
          completed: true,
          adminRating: parseInt(adminRating),
          feedback: feedback,
          certificateUrl: certificateUrl,
          certificateGeneratedAt: new Date()
        },
        include: {
          teacher: {
            include: {
              school: true
            }
          }
        }
      }),
      
      // 2. Update teacher - MARCA COMO FORMADO!
      prisma.teacher.update({
        where: { id: training.teacherId },
        data: {
          hasCompletedTraining: true,
          certificateUrl: certificateUrl // Também atualiza no professor
        }
      })
    ]);

    console.log('🎉 Sessão concluída e professor marcado como formado!');
    res.json(updatedTraining);

  } catch (err) {
    console.error("❌ Erro ao completar formação:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
