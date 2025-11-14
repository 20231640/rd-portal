// server/routes/auth.js - VERSÃO COMPLETA PARA ADMIN
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// 🔹 ROTAS PARA GESTÃO DE ESCOLAS (ADMIN)
// ============================================

/* ============================================
   🔹 LISTAR ESCOLAS
   ============================================ */
router.get("/schools", async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
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
    const { name, region, address } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Nome da escola é obrigatório" });
    }

    // Verificar se escola já existe
    const existingSchool = await prisma.school.findUnique({
      where: { name: name.trim() }
    });

    if (existingSchool) {
      return res.status(400).json({ error: "Já existe uma escola com este nome" });
    }

    const school = await prisma.school.create({
      data: {
        name: name.trim(),
        region: region?.trim() || null,
        approved: false,
        code: `SCH${Date.now()}` // Código único temporário
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

    const school = await prisma.school.update({
      where: { id: parseInt(id) },
      data: { approved: true },
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
    const { name, region } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Nome da escola é obrigatório" });
    }

    const school = await prisma.school.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        region: region?.trim() || null
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
   🔹 ELIMINAR ESCOLA
   ============================================ */
router.delete("/schools/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a escola tem professores
    const schoolWithTeachers = await prisma.school.findUnique({
      where: { id: parseInt(id) },
      include: { teachers: true }
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

/* ============================================
   🔹 LISTAR PROFESSORES (PARA ADMIN)
   ============================================ */
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
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
      orderBy: { name: "asc" },
    });
    res.json(teachers);
  } catch (err) {
    console.error("❌ Erro ao listar professores:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 🔹 BLOQUEAR/DESBLOQUEAR PROFESSOR
// ============================================
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
            approved: true
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

// ============================================
// 🔹 EDITAR PROFESSOR
// ============================================
router.put("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    // Verificar se email já existe noutro professor
    if (email) {
      const existingTeacher = await prisma.teacher.findFirst({
        where: {
          email: email,
          id: { not: parseInt(id) }
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
        ...(phone !== undefined && { phone: phone?.trim() || null })
      },
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

// ============================================
// 🔹 ELIMINAR PROFESSOR
// ============================================
router.delete("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se professor existe
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
      include: { classes: true }
    });

    if (!teacher) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    // Se o professor tem turmas, podemos optar por:
    // 1. Eliminar as turmas primeiro OU
    // 2. Impedir a eliminação
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
      include: { school: true }
    });
    
    res.json(teacher);
  } catch (error) {
    console.error('❌ Erro ao atualizar certificado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});




export default router;