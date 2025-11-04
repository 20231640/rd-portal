// server/routes/auth.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const router = express.Router();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/* ============================================
   🔹 REGISTO DE PROFESSOR
   ============================================ */
router.post("/register", async (req, res) => {
  const { name, email, password, phone, school, region } = req.body;

  if (!name || !email || !password || !school) {
    return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  try {
    // Verifica se email já existe
    const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
    if (existingTeacher) return res.status(400).json({ message: "Email já registado." });

    // Verifica se escola existe, senão cria
    let schoolRecord = await prisma.school.findUnique({ where: { name: school } });
    if (!schoolRecord) {
      schoolRecord = await prisma.school.create({
        data: {
          name: school,
          region: region || null,
          approved: false,
          code: `SCH${((await prisma.school.count()) + 1).toString().padStart(3, "0")}`,
        },
      });
    }

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Cria professor
    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        blocked: false,
        schoolApproved: schoolRecord.approved,
        school: { connect: { id: schoolRecord.id } },
      },
      include: { school: true },
    });

    res.status(201).json({ message: "Professor registado com sucesso.", teacher });
  } catch (err) {
    console.error("❌ Erro ao registar professor:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 LOGIN
   ============================================ */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Email e password são obrigatórios." });

  try {
    // Login admin hardcoded
    if (email === "admin@rd.pt" && password === "admin123") return res.json({ role: "admin" });

    const teacher = await prisma.teacher.findUnique({ where: { email }, include: { school: true } });
    if (!teacher) return res.status(401).json({ message: "Credenciais inválidas." });

    const valid = await bcrypt.compare(password, teacher.password);
    if (!valid) return res.status(401).json({ message: "Credenciais inválidas." });

    if (teacher.blocked) return res.status(403).json({ message: "Conta bloqueada pelo administrador." });
    if (!teacher.school.approved) return res.status(403).json({ message: `A escola "${teacher.school.name}" ainda não foi aprovada.` });

    res.json({ role: "teacher", teacher });
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 ESQUECEU-SE DA PASSWORD (MODO DESENVOLVIMENTO)
   ============================================ */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório.' });
    }

    // Verifica se o professor existe
    const teacher = await prisma.teacher.findUnique({
      where: { email }
    });

    // Por segurança, não revelamos se o email existe ou não
    if (!teacher) {
      return res.json({ 
        message: 'Se o email existir na nossa base de dados, enviaremos um link de recuperação.' 
      });
    }

    // Gera token de recuperação
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Atualiza o professor com o token
    await prisma.teacher.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      }
    });

    // URL para reset de password
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    
    // 🔥 APENAS CONSOLE.LOG - SEM EMAIL REAL
    console.log('🔐 🔐 🔐 LINK DE RECUPERAÇÃO (COPIAR E COLAR NO BROWSER):');
    console.log('📧 Email:', email);
    console.log('🔑 Token:', resetToken);
    console.log('🌐 URL:', resetUrl);
    console.log('🔐 🔐 🔐');

    res.json({ 
      message: 'Se o email existir na nossa base de dados, enviaremos um link de recuperação.',
      resetUrl: resetUrl // Para desenvolvimento
    });

  } catch (error) {
    console.error('❌ Erro no forgot-password:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

/* ============================================
   🔹 REDEFINIR PASSWORD
   ============================================ */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token e nova password são obrigatórios.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A password deve ter pelo menos 6 caracteres.' });
    }

    // Encontra o professor com token válido
    const teacher = await prisma.teacher.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date() // Verifica se não expirou
        }
      }
    });

    if (!teacher) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    // Hash da nova password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Atualiza a password e limpa os campos de recuperação
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.json({ message: 'Password redefinida com sucesso!' });

  } catch (error) {
    console.error('❌ Erro no reset-password:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

/* ============================================
   🔹 LISTAR ESCOLAS
   ============================================ */
router.get("/schools", async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      include: { teachers: true },
      orderBy: { name: "asc" },
    });
    res.json(schools);
  } catch (err) {
    console.error("❌ Erro ao listar escolas:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 CRIAR ESCOLA (ADMIN)
   ============================================ */
router.post("/schools", async (req, res) => {
  try {
    const { name, region } = req.body;
    if (!name) return res.status(400).json({ message: "Nome é obrigatório." });

    const existing = await prisma.school.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ message: "Escola já existe." });

    const newSchool = await prisma.school.create({
      data: {
        name,
        region: region || null,
        approved: true,
        code: `SCH${((await prisma.school.count()) + 1).toString().padStart(3, "0")}`,
      },
    });

    res.status(201).json(newSchool);
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
    await prisma.$transaction([
      prisma.school.update({ where: { id: Number(id) }, data: { approved: true } }),
      prisma.teacher.updateMany({ where: { schoolId: Number(id) }, data: { schoolApproved: true } }),
    ]);
    const updatedSchool = await prisma.school.findUnique({ where: { id: Number(id) } });
    res.json({ message: "Escola aprovada com sucesso.", updated: updatedSchool });
  } catch (err) {
    console.error("❌ Erro ao aprovar escola:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 REJEITAR / REMOVER ESCOLA
   ============================================ */
router.delete("/schools/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.$transaction([
      prisma.teacher.deleteMany({ where: { schoolId: Number(id) } }),
      prisma.school.delete({ where: { id: Number(id) } }),
    ]);
    res.json({ message: "Escola removida com sucesso." });
  } catch (err) {
    console.error("❌ Erro ao remover escola:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 EDITAR ESCOLA
   ============================================ */
router.put("/schools/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, region, approved } = req.body;
    const updated = await prisma.school.update({
      where: { id: Number(id) },
      data: { name, region, approved },
    });
    res.json(updated);
  } catch (err) {
    console.error("❌ Erro ao atualizar escola:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 LISTAR PROFESSORES
   ============================================ */
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({ include: { school: true }, orderBy: { name: "asc" } });
    res.json(teachers);
  } catch (err) {
    console.error("❌ Erro ao listar professores:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 EDITAR PROFESSOR
   ============================================ */
router.put("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.password) delete data.password;

    const updated = await prisma.teacher.update({
      where: { id: Number(id) },
      data,
      include: { school: true },
    });
    res.json(updated);
  } catch (err) {
    console.error("❌ Erro ao atualizar professor:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 APAGAR PROFESSOR
   ============================================ */
router.delete("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id: Number(id) } });
    res.json({ message: "Professor removido com sucesso." });
  } catch (err) {
    console.error("❌ Erro ao apagar professor:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================
   🔹 OBTER 1 PROFESSOR POR ID
   ============================================ */
router.get("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({ where: { id: Number(id) }, include: { school: true } });
    if (!teacher) return res.status(404).json({ message: "Professor não encontrado." });
    res.json(teacher);
  } catch (err) {
    console.error("❌ Erro ao obter professor:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;