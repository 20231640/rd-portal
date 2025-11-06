// routes/report-folders.js
import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
//import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET pastas do professor
router.get('/', async (req, res) => {
  try {
    const { teacherEmail } = req.query;
    
    if (teacherEmail) {
      // Buscar pastas específicas do professor
      const teacher = await prisma.teacher.findUnique({
        where: { email: teacherEmail }
      });

      if (!teacher) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }

      const folders = await prisma.reportFolder.findMany({
        where: {
          teacherId: teacher.id,
          isActive: true
        },
        include: {
          class: true,
          teacher: {
            include: {
              school: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json(folders);
    }

    // Buscar todas as pastas (admin)
    const allFolders = await prisma.reportFolder.findMany({
      include: {
        teacher: {
          include: {
            school: true
          }
        },
        class: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(allFolders);
  } catch (err) {
    console.error("Erro ao buscar pastas:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST criar pasta
router.post('/', async (req, res) => {
  try {
    const { title, driveLink, teacherId, classId } = req.body;
    
    // Validar campos obrigatórios
    if (!title || !driveLink || !teacherId) {
      return res.status(400).json({ 
        error: "Título, link do Drive e professor são obrigatórios" 
      });
    }

    const folder = await prisma.reportFolder.create({
      data: {
        title,
        driveLink,
        teacherId: parseInt(teacherId),
        classId: classId ? parseInt(classId) : null
      },
      include: {
        teacher: {
          include: {
            school: true
          }
        },
        class: true
      }
    });
    
    res.status(201).json(folder);
  } catch (err) {
    console.error("Erro ao criar pasta:", err);
    
    if (err.code === 'P2003') {
      return res.status(400).json({ error: "Professor ou turma inválida" });
    }
    
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PUT atualizar pasta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, driveLink, isActive } = req.body;

    const folder = await prisma.reportFolder.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(driveLink && { driveLink }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        teacher: {
          include: {
            school: true
          }
        },
        class: true
      }
    });

    res.json(folder);
  } catch (err) {
    console.error("Erro ao atualizar pasta:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Pasta não encontrada" });
    }
    
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE pasta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.reportFolder.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (err) {
    console.error("Erro ao eliminar pasta:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Pasta não encontrada" });
    }
    
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;