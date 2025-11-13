import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// No seu routes/teachers.js - MODIFIQUE a rota POST
router.post("/", async (req, res) => {
  try {
    console.log('📥 Recebendo dados para criar professor:', req.body);
    
    const { supabaseUserId, name, email, phone, school, region } = req.body;

    // VALIDAÇÕES
    if (!supabaseUserId || !name || !email) {
      console.log('❌ Dados incompletos:', { supabaseUserId, name, email });
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // Verificar se email já existe
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (existingTeacher) {
      console.log('❌ Email já existe:', email);
      return res.status(400).json({ error: "Email já registado" });
    }

    // Encontra ou cria escola
    let schoolRecord = await prisma.school.findUnique({ 
      where: { name: school } 
    });
    
    if (!schoolRecord) {
      console.log('🏫 Criando nova escola:', school);
      schoolRecord = await prisma.school.create({
        data: {
          name: school,
          region: region || null,
          approved: false,
          code: `SCH${Date.now()}` // Código único
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
        password: "supabase_auth" // Campo obrigatório no schema
      },
      include: { school: true },
    });

    console.log('✅ Professor criado com sucesso:', teacher.id);
    res.status(201).json(teacher);
    
  } catch (err) {
    console.error("❌ Erro ao criar professor:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ NOVA ROTA: Buscar professor por email
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      include: { 
        school: true,
        classes: true 
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

// ✅ NOVA ROTA: Buscar professor por ID do Supabase
router.get("/supabase/:supabaseUserId", async (req, res) => {
  try {
    const { supabaseUserId } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { supabaseUserId },
      include: { 
        school: true,
        classes: true 
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

// ✅ ADICIONAR ESTA ROTA NO teachers.js
router.get("/", async (req, res) => {
  try {
    console.log('📋 GET /api/teachers - Listar todos os professores');
    
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
    
    console.log(`✅ Encontrados ${teachers.length} professores`);
    res.json(teachers);
  } catch (err) {
    console.error("❌ Erro ao listar professores:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;