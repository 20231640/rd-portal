// server/routes/classes.js
const express = require("express");

const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Listar turmas de um professor
router.get("/", async (req, res) => {
  const { teacherId } = req.query;
  try {
    const classes = await prisma.class.findMany({
      where: teacherId ? { teacherId: parseInt(teacherId) } : {},
      include: {
        teacher: {
          include: {
            school: true
          }
        },
        school: true
      }
    });
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar turmas" });
  }
});

// Criar nova turma
router.post("/", async (req, res) => {
  try {
    const { name, students, cycle, year, teacherId } = req.body;

    // Verificar dados obrigatórios
    if (!name || !students || !cycle || !year || !teacherId) {
      return res.status(400).json({ message: "Dados incompletos" });
    }

    // Buscar o professor e a escola
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(teacherId) },
      include: { school: true },
    });
    
    if (!teacher) {
      return res.status(404).json({ message: "Professor não encontrado" });
    }

    if (!teacher.school) {
      return res.status(400).json({ message: "Professor não tem escola associada" });
    }

    // Contar turmas existentes do professor
    const count = await prisma.class.count({ 
      where: { teacherId: parseInt(teacherId) } 
    });

    // Gerar código: usar código da escola se existir, senão usar abreviação do nome
    let newCode;
    if (teacher.school.code) {
      newCode = `${teacher.school.code}-${count + 1}`;
    } else {
      const schoolAbbrev = teacher.school.name.substring(0, 3).toUpperCase();
      newCode = `${schoolAbbrev}-${count + 1}`;
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        students: parseInt(students),
        cycle: cycle.trim(),
        year: year.trim(),
        teacherId: parseInt(teacherId),
        schoolId: teacher.school.id,
        code: newCode,
        status: "Registered",
      },
      include: {
        teacher: {
          include: {
            school: true
          }
        },
        school: true
      }
    });

    res.json(newClass);
  } catch (err) {
    console.error("Erro detalhado:", err);
    res.status(500).json({ 
      message: "Erro ao criar turma",
      error: err.message 
    });
  }
});

// Editar turma
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, students, cycle, year, status } = req.body;
    
    const updated = await prisma.class.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        students: students ? parseInt(students) : undefined, 
        cycle, 
        year,
        status 
      },
      include: {
        teacher: {
          include: {
            school: true
          }
        },
        school: true
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar turma" });
  }
});

// Apagar turma
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.class.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Turma apagada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao apagar turma" });
  }
});

export default router;