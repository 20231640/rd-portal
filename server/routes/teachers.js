import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ROTA POST para criar professor
router.post("/", async (req, res) => {
  try {
    console.log('📥 Recebendo dados para criar professor:', req.body);
    
    const { supabaseUserId, name, email, phone, school, municipality } = req.body;

    if (!supabaseUserId || !name || !email) {
      console.log('❌ Dados incompletos:', { supabaseUserId, name, email });
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const existingTeacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (existingTeacher) {
      console.log('❌ Email já existe:', email);
      return res.status(400).json({ error: "Email já registado" });
    }

    let schoolRecord = await prisma.school.findFirst({ 
      where: { 
        name: school,
        archived: false
      } 
    });
    
    if (!schoolRecord) {
      console.log('🏫 Criando nova escola:', school);
      schoolRecord = await prisma.school.create({
        data: {
          name: school,
          municipality: municipality || null,
          approved: false,
          code: `SCH${Date.now()}`,
          archived: false
        },
      });
    }

    console.log('👨‍🏫 Criando professor...');
    const teacher = await prisma.teacher.create({
      data: {
        supabaseUserId,
        name,
        email,
        phone: phone || null,
        schoolId: schoolRecord.id,
        emailVerified: false,
        password: "supabase_auth",
        archived: false
      },
      include: { 
        school: {
          select: {
            id: true,
            name: true,
            approved: true,
            archived: true
          }
        }
      },
    });

    console.log('✅ Professor criado com sucesso:', {
      id: teacher.id,
      schoolName: teacher.school.name,
      schoolApproved: teacher.school.approved
    });
    
    res.status(201).json(teacher);
    
  } catch (err) {
    console.error("❌ Erro ao criar professor:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      include: { 
        school: {
          select: {
            id: true,
            name: true,
            approved: true,
            archived: true
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
      return res.status(404).json({ message: "Professor não encontrado." });
    }

    console.log('🔍 Professor encontrado:', { 
      id: teacher.id, 
      name: teacher.name, 
      archived: teacher.archived,
      schoolArchived: teacher.school?.archived,
      schoolApproved: teacher.school?.approved
    });

    if (teacher.archived) {
      return res.status(403).json({ 
        error: "A sua conta foi arquivada. Contacte o administrador." 
      });
    }

    if (teacher.school && teacher.school.archived) {
      return res.status(403).json({ 
        error: "A sua escola foi arquivada. Contacte o administrador." 
      });
    }

    if (teacher.school && !teacher.school.approved) {
      return res.status(403).json({ 
        error: "A sua escola ainda não foi aprovada pelo administrador. Aguarde a aprovação." 
      });
    }

    console.log('✅ Professor válido para login:', teacher.id);
    res.json(teacher);
    
  } catch (err) {
    console.error("❌ Erro ao buscar professor:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Buscar professor por ID do Supabase
router.get("/supabase/:supabaseUserId", async (req, res) => {
  try {
    const { supabaseUserId } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { supabaseUserId },
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
      }
    });

    if (!teacher) {
      return res.status(404).json({ message: "Professor não encontrado." });
    }

    res.json(teacher);
  } catch (err) {
    console.error("❌ Erro ao buscar professor:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Listar professores
router.get("/", async (req, res) => {
  try {
    console.log('📋 GET /api/teachers - Listar professores');
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
    
    console.log(`✅ Encontrados ${teachers.length} professores`);
    res.json(teachers);
  } catch (err) {
    console.error("❌ Erro ao listar professores:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Buscar professores arquivados
router.get("/archived", async (req, res) => {
  try {
    console.log('📋 GET /api/teachers/archived - Listar professores arquivados');
    
    const teachers = await prisma.teacher.findMany({
      where: { archived: true },
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
      orderBy: { archivedAt: "desc" },
    });
    
    console.log(`✅ Encontrados ${teachers.length} professores arquivados`);
    res.json(teachers);
  } catch (err) {
    console.error("❌ Erro ao listar professores arquivados:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;