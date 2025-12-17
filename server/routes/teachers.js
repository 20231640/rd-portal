import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// No seu routes/teachers.js - MODIFIQUE a rota POST
router.post("/", async (req, res) => {
  try {
    console.log('📥 Recebendo dados para criar professor:', req.body);
    
    const { supabaseUserId, name, email, phone, school, municipality } = req.body; // MUDADO: region → municipality

    // VALIDAÇÕES
    if (!supabaseUserId || !name || !email) {
      console.log('❌ Dados incompletos:', { supabaseUserId, name, email });
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // Verificar se email já existe (incluindo arquivados)
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (existingTeacher) {
      console.log('❌ Email já existe:', email);
      return res.status(400).json({ error: "Email já registado" });
    }

    // Encontra ou cria escola (verificando escolas arquivadas)
    let schoolRecord = await prisma.school.findFirst({ 
      where: { 
        name: school,
        archived: false // Só considerar escolas não arquivadas
      } 
    });
    
    if (!schoolRecord) {
      console.log('🏫 Criando nova escola:', school);
      schoolRecord = await prisma.school.create({
        data: {
          name: school,
          municipality: municipality || null, // MUDADO: region → municipality
          approved: false,
          code: `SCH${Date.now()}`,
          archived: false
        },
      });
    }

    console.log('👨‍🏫 Criando professor...');
    // Cria professor
    const teacher = await prisma.teacher.create({
      data: {
        supabaseUserId,
        name,
        email,
        phone: phone || null,
        schoolId: schoolRecord.id,
        schoolApproved: schoolRecord.approved,
        emailVerified: false,
        password: "supabase_auth",
        archived: false // ✅ Garantir que novo professor não está arquivado
      },
      include: { 
        school: {
          select: {
            id: true,
            name: true,
            approved: true,
            archived: true, // ✅ Incluir status da escola
          }
        }
      },
    });

    console.log('✅ Professor criado com sucesso:', teacher.id);
    res.status(201).json(teacher);
    
  } catch (err) {
    console.error("❌ Erro ao criar professor:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ROTA ATUALIZADA: Buscar professor por email (verificar arquivado)
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
            archived: true // ✅ INCLUIR ARCHIVED DA ESCOLA
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
      schoolArchived: teacher.school?.archived 
    });

    // ✅ RETORNAR O CAMPO archived PARA O LOGIN VERIFICAR
    res.json(teacher);
  } catch (err) {
    console.error("❌ Erro ao buscar professor:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ROTA ATUALIZADA: Buscar professor por ID do Supabase
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
            archived: true // ✅ INCLUIR ARCHIVED DA ESCOLA
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

// ✅ ROTA ATUALIZADA: Listar professores (só não arquivados por padrão)
router.get("/", async (req, res) => {
  try {
    console.log('📋 GET /api/teachers - Listar professores');
    const { includeArchived } = req.query; // Opcional: incluir arquivados
    
    const teachers = await prisma.teacher.findMany({
      where: includeArchived === 'true' ? {} : { archived: false }, // ✅ Filtrar arquivados
      include: {
        school: {
          select: {
            id: true,
            name: true,
            approved: true,
            archived: true // ✅ Incluir status da escola
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

// ✅ ROTA ADICIONAL: Buscar professores arquivados
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
            archived: true
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