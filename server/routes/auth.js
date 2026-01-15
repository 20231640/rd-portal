import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// 🔹 ROTAS PARA GESTÃO DE ESCOLAS (ADMIN)
// ============================================

/* ============================================
   🔹 LISTAR ESCOLAS (com suporte para arquivadas)
   ============================================ */
router.get("/schools", async (req, res) => {
  try {
    const { includeArchived } = req.query;
    
    const schools = await prisma.school.findMany({
      where: includeArchived === 'true' ? {} : { archived: false },
      include: { 
        teachers: {
          where: { archived: false },
          select: {
            id: true,
            name: true,
            email: true,
            blocked: true,
            archived: true
          }
        }
      },
      orderBy: { name: "asc" },
    });
    res.json(schools);
  } catch (err) {
    console.error("❌ Erro ao listar escolas:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 CRIAR ESCOLA
   ============================================ */
router.post("/schools", async (req, res) => {
  try {
    const { name, municipality, address } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Nome da escola é obrigatório" });
    }

    const existingSchool = await prisma.school.findFirst({
      where: { 
        name: name.trim(),
        archived: false
      }
    });

    if (existingSchool) {
      return res.status(400).json({ error: "Já existe uma escola com este nome" });
    }

    const school = await prisma.school.create({
      data: {
        name: name.trim(),
        municipality: municipality?.trim() || null,
        approved: false,
        code: `SCH${Date.now()}`,
        archived: false
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true,
            blocked: true
          }
        }
      }
    });

    console.log(`✅ Escola "${school.name}" criada (approved: ${school.approved})`);
    res.status(201).json(school);
  } catch (err) {
    console.error("❌ Erro ao criar escola:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 APROVAR ESCOLA
   ============================================ */
router.put("/schools/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✅ Aprovar escola ID: ${id}`);

    const school = await prisma.school.update({
      where: { id: parseInt(id) },
      data: { approved: true },
      include: {
        teachers: {
          where: { archived: false },
          select: {
            id: true,
            name: true,
            email: true,
            blocked: true
          }
        }
      }
    });

    console.log(`🏫 Escola "${school.name}" aprovada.`);

    res.json(school);
  } catch (err) {
    console.error("❌ Erro ao aprovar escola:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Escola não encontrada" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 EDITAR ESCOLA
   ============================================ */
router.put("/schools/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, municipality, approved } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Nome da escola é obrigatório" });
    }

    const school = await prisma.school.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        municipality: municipality?.trim() || null,
        ...(approved !== undefined && { approved: approved })
      },
      include: {
        teachers: {
          where: { archived: false },
          select: {
            id: true,
            name: true,
            email: true,
            blocked: true
          }
        }
      }
    });

    res.json(school);
  } catch (err) {
    console.error("❌ Erro ao editar escola:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Escola não encontrada" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 DESAPROVAR ESCOLA
   ============================================ */
router.put("/schools/:id/disapprove", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`❌ Desaprovar escola ID: ${id}`);

    const school = await prisma.school.update({
      where: { id: parseInt(id) },
      data: { approved: false },
      include: {
        teachers: {
          where: { archived: false },
          select: {
            id: true,
            name: true,
            email: true,
            blocked: true
          }
        }
      }
    });

    console.log(`🏫 Escola "${school.name}" desaprovada.`);

    res.json(school);
  } catch (err) {
    console.error("❌ Erro ao desaprovar escola:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Escola não encontrada" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 ARQUIVAR ESCOLA
   ============================================ */
router.put("/schools/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.teacher.updateMany({
      where: { schoolId: parseInt(id) },
      data: {
        archived: true,
        archivedAt: new Date()
      }
    });

    console.log(`👨‍🏫 Todos os professores da escola arquivados.`);

    const school = await prisma.school.update({
      where: { id: parseInt(id) },
      data: { 
        archived: true,
        archivedAt: new Date()
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true,
            blocked: true,
            archived: true
          }
        }
      }
    });

    console.log(`📦 Escola "${school.name}" arquivada.`);
    
    res.json(school);
  } catch (err) {
    console.error("❌ Erro ao arquivar escola:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Escola não encontrada" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 RESTAURAR ESCOLA
   ============================================ */
router.put("/schools/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;

    const school = await prisma.school.update({
      where: { id: parseInt(id) },
      data: { 
        archived: false,
        archivedAt: null
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true,
            blocked: true
          }
        }
      }
    });

    console.log(`♻️ Escola "${school.name}" restaurada.`);
    res.json(school);
  } catch (err) {
    console.error("❌ Erro ao restaurar escola:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Escola não encontrada" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 ELIMINAR ESCOLA
   ============================================ */
router.delete("/schools/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const schoolWithTeachers = await prisma.school.findUnique({
      where: { id: parseInt(id) },
      include: { 
        teachers: {
          where: { archived: false }
        }
      }
    });

    if (schoolWithTeachers.teachers.length > 0) {
      return res.status(400).json({ 
        error: "Não é possível eliminar escola com professores associados. Transfira os professores primeiro." 
      });
    }

    await prisma.school.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Escola eliminada com sucesso" });
  } catch (err) {
    console.error("❌ Erro ao eliminar escola:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Escola não encontrada" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 🔹 ROTAS PARA GESTÃO DE PROFESSORES (ADMIN)
// ============================================

/* ============================================
   🔹 LISTAR PROFESSORES
   ============================================ */
router.get("/teachers", async (req, res) => {
  try {
    const { includeArchived } = req.query;
    
    const teachers = await prisma.teacher.findMany({
      where: includeArchived === 'true' ? {} : { archived: false },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            approved: true,
            archived: true,
            municipality: true
          }
        },
        classes: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: "asc" },
    });
    res.json(teachers);
  } catch (err) {
    console.error("❌ Erro ao listar professores:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 BUSCAR PROFESSOR POR ID
   ============================================ */
router.get("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            approved: true,
            municipality: true
          }
        },
        classes: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    res.json(teacher);
  } catch (err) {
    console.error("❌ Erro ao buscar professor:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 ARQUIVAR PROFESSOR
   ============================================ */
router.put("/teachers/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: { 
        archived: true,
        archivedAt: new Date()
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            approved: true,
            municipality: true
          }
        },
        classes: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(teacher);
  } catch (err) {
    console.error("❌ Erro ao arquivar professor:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Professor não encontrado" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 RESTAURAR PROFESSOR
   ============================================ */
router.put("/teachers/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: { 
        archived: false,
        archivedAt: null
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            approved: true,
            municipality: true
          }
        },
        classes: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(teacher);
  } catch (err) {
    console.error("❌ Erro ao restaurar professor:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Professor não encontrado" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 BLOQUEAR/DESBLOQUEAR PROFESSOR
   ============================================ */
router.put("/teachers/:id/block", async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    const teacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: { blocked: blocked },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            approved: true,
            municipality: true
          }
        },
        classes: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(teacher);
  } catch (err) {
    console.error("❌ Erro ao bloquear/desbloquear professor:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Professor não encontrado" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 EDITAR PROFESSOR
   ============================================ */
router.put("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, municipality } = req.body;

    if (email) {
      const existingTeacher = await prisma.teacher.findFirst({
        where: {
          email: email,
          id: { not: parseInt(id) },
          archived: false
        }
      });

      if (existingTeacher) {
        return res.status(400).json({ error: "Já existe um professor com este email" });
      }
    }

    const teacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(municipality !== undefined && {
          school: {
            update: {
              municipality: municipality?.trim() || null
            }
          }
        })
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            approved: true,
            municipality: true
          }
        },
        classes: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(teacher);
  } catch (err) {
    console.error("❌ Erro ao editar professor:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Professor não encontrado" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 ELIMINAR PROFESSOR
   ============================================ */
router.delete("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
      include: { 
        classes: {
          where: { archived: false }
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    if (teacher.classes.length > 0) {
      return res.status(400).json({ 
        error: "Não é possível eliminar professor com turmas associadas. Transfira as turmas primeiro." 
      });
    }

    await prisma.teacher.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Professor eliminado com sucesso" });
  } catch (err) {
    console.error("❌ Erro ao eliminar professor:", err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Professor não encontrado" });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 ATUALIZAR CERTIFICADO DO PROFESSOR
   ============================================ */
router.put("/teachers/:id/certificate", async (req, res) => {
  try {
    const { id } = req.params;
    const { certificateUrl, hasCompletedTraining } = req.body;
    
    const teacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: {
        certificateUrl,
        hasCompletedTraining: hasCompletedTraining !== undefined ? hasCompletedTraining : true
      },
      include: { 
        school: true,
        classes: true
      }
    });
    
    res.json(teacher);
  } catch (error) {
    console.error('❌ Erro ao atualizar certificado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/* ============================================
   🔹 VERIFICAR ESTADO DE FORMAÇÃO DO PROFESSOR
   ============================================ */
router.get("/teachers/:id/training-status", async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        hasCompletedTraining: true,
        certificateUrl: true,
        archived: true,
        trainings: {
          where: { completed: true },
          select: {
            id: true,
            title: true,
            completed: true,
            certificateUrl: true,
            certificateGeneratedAt: true
          }
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    res.json({
      hasCompletedTraining: teacher.hasCompletedTraining,
      certificateUrl: teacher.certificateUrl,
      archived: teacher.archived,
      completedTrainings: teacher.trainings,
      canTeach: teacher.hasCompletedTraining && teacher.certificateUrl && !teacher.archived
    });
  } catch (error) {
    console.error('❌ Erro ao verificar estado de formação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================
// 🔹 ROTAS ADICIONAIS PARA ADMIN
// ============================================

/* ============================================
   🔹 ESTATÍSTICAS DO SISTEMA
   ============================================ */
router.get("/stats", async (req, res) => {
  try {
    const [
      totalSchools,
      activeSchools,
      archivedSchools,
      totalTeachers,
      activeTeachers,
      archivedTeachers,
      blockedTeachers,
      teachersWithTraining
    ] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { archived: false } }),
      prisma.school.count({ where: { archived: true } }),
      prisma.teacher.count(),
      prisma.teacher.count({ where: { archived: false } }),
      prisma.teacher.count({ where: { archived: true } }),
      prisma.teacher.count({ where: { blocked: true, archived: false } }),
      prisma.teacher.count({ 
        where: { 
          hasCompletedTraining: true,
          archived: false 
        } 
      })
    ]);

    res.json({
      schools: {
        total: totalSchools,
        active: activeSchools,
        archived: archivedSchools
      },
      teachers: {
        total: totalTeachers,
        active: activeTeachers,
        archived: archivedTeachers,
        blocked: blockedTeachers,
        withTraining: teachersWithTraining
      }
    });
  } catch (err) {
    console.error("❌ Erro ao buscar estatísticas:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 BUSCAR ESCOLAS ARQUIVADAS
   ============================================ */
router.get("/schools/archived", async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      where: { archived: true },
      include: { 
        teachers: {
          select: {
            id: true,
            name: true,
            email: true,
            blocked: true
          }
        }
      },
      orderBy: { archivedAt: "desc" },
    });
    res.json(schools);
  } catch (err) {
    console.error("❌ Erro ao listar escolas arquivadas:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 BUSCAR PROFESSORES ARQUIVADOS
   ============================================ */
router.get("/teachers/archived", async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { archived: true },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            approved: true
          }
        },
        classes: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { archivedAt: "desc" },
    });
    res.json(teachers);
  } catch (err) {
    console.error("❌ Erro ao listar professores arquivados:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;