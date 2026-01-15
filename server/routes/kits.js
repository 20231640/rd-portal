import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/requests', async (req, res) => {
  try {
    const requests = await prisma.kitRequest.findMany({
      include: {
        teacher: {
          include: {
            school: true
          }
        },
        class: true,
        reports: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: { requestedAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const requests = await prisma.kitRequest.findMany({
      where: { teacherId: parseInt(req.params.teacherId) },
      include: { 
        class: true,
        teacher: {
          include: {
            school: true
          }
        },
        reports: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: { requestedAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/request', async (req, res) => {
  try {
    const { teacherId, classId } = req.body; 
    
    const existingRequest = await prisma.kitRequest.findFirst({
      where: {
        classId: parseInt(classId),
        status: { in: ['pending', 'approved'] }
      }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        error: 'Já existe um pedido pendente ou aprovado para esta turma' 
      });
    }
    
    const newRequest = await prisma.kitRequest.create({
      data: {
        teacherId: parseInt(teacherId),
        classId: parseInt(classId),
        kitType: 'standard', 
        status: 'pending'
      },
      include: {
        class: true,
        teacher: true,
        reports: true
      }
    });
    
    res.json(newRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const updated = await prisma.kitRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        status: 'approved',
        approvedAt: new Date()
      },
      include: {
        class: true,
        teacher: true,
        reports: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/ship', async (req, res) => {
  try {
    const updated = await prisma.kitRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        status: 'shipped',
        shippedAt: new Date()
      },
      include: {
        class: true,
        teacher: true,
        reports: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/deliver', async (req, res) => {
  try {
    const updated = await prisma.kitRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        status: 'delivered',
        deliveredAt: new Date()
      },
      include: {
        class: true,
        teacher: true,
        reports: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.kitRequest.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Pedido eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// NOVAS ROTAS PARA REPORTS DE PROBLEMAS
// ============================================================================

// POST /api/kits/:id/report 
router.post('/:id/report', async (req, res) => {
  console.log("🎯 REPORT ENDPOINT CHAMADO");
  
  try {
    const { id } = req.params;
    const { message, teacherId, teacherName } = req.body;

    console.log("📨 Dados recebidos:", { id, message, teacherId, teacherName });

    if (!message || !teacherId) {
      return res.status(400).json({ 
        error: "Message e teacherId são obrigatórios" 
      });
    }

    const kitId = parseInt(id);
    const teacherIdInt = parseInt(teacherId);

    if (isNaN(kitId) || isNaN(teacherIdInt)) {
      return res.status(400).json({ 
        error: "IDs inválidos" 
      });
    }

    const kitRequest = await prisma.kitRequest.findUnique({
      where: { id: kitId },
      include: { teacher: true }
    });

    if (!kitRequest) {
      return res.status(404).json({ 
        error: "Pedido de kit não encontrado" 
      });
    }

    if (kitRequest.teacherId !== teacherIdInt) {
      return res.status(403).json({ 
        error: "Não tem permissão para reportar problemas neste kit" 
      });
    }

    if (kitRequest.status !== 'delivered') {
      return res.status(400).json({ 
        error: "Só pode reportar problemas em kits entregues" 
      });
    }

    const report = await prisma.kitReport.create({
      data: {
        requestId: kitId,
        message,
        teacherId: teacherIdInt,
        teacherName: teacherName || kitRequest.teacher.name,
        resolved: false
      }
    });

    console.log("✅ Report criado:", report);

    const updatedRequest = await prisma.kitRequest.findUnique({
      where: { id: kitId },
      include: {
        teacher: { include: { school: true } },
        class: true,
        reports: { orderBy: { createdAt: 'desc' } }
      }
    });

    res.json(updatedRequest);

  } catch (err) {
    console.error("💥 ERRO NO SERVIDOR:", err);
    
    res.status(500).json({ 
      error: "Erro interno do servidor",
      message: err.message,
      code: err.code
    });
  }
});


// PUT /api/kits/:requestId/reports/:reportId/resolve - Resolver problema reportado
router.put('/:requestId/reports/:reportId/resolve', async (req, res) => {
  try {
    const { requestId, reportId } = req.params;

    const report = await prisma.kitReport.findFirst({
      where: {
        id: parseInt(reportId),
        requestId: parseInt(requestId)
      }
    });

    if (!report) {
      return res.status(404).json({ error: "Report não encontrado" });
    }

    await prisma.kitReport.update({
      where: { id: parseInt(reportId) },
      data: {
        resolved: true,
        resolvedAt: new Date()
      }
    });

    const updatedRequest = await prisma.kitRequest.findUnique({
      where: { id: parseInt(requestId) },
      include: {
        teacher: {
          include: {
            school: true
          }
        },
        class: true,
        reports: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    res.json(updatedRequest);
  } catch (err) {
    console.error("Erro ao resolver problema:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;