// server/routes/classes.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Listar turmas de um professor
router.get("/", async (req, res) => {
  const { teacherId } = req.query;
  try {
    const classes = await prisma.class.findMany({
      where: { teacherId: parseInt(teacherId) }
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

    // Buscar o professor e a escola
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(teacherId) },
      include: { school: true },
    });
    if (!teacher) return res.status(404).json({ message: "Professor não encontrado" });

    // Contar turmas existentes da escola
    const count = await prisma.class.count({ where: { schoolId: teacher.school.id } });

    // Gerar código: SCHOOLCODE-ORD
    const newCode = `${teacher.school.code}-${count + 1}`;

    const newClass = await prisma.class.create({
      data: {
        name,
        students,
        cycle,
        year,
        teacherId: teacher.id,
        schoolId: teacher.school.id,
        code: newCode,
        status: "Registered", // status inicial
      },
    });

    res.json(newClass);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar turma" });
  }
});


// Editar turma
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, students, cycle, year } = req.body;
    const updated = await prisma.class.update({
      where: { id: parseInt(id) },
      data: { name, students, cycle, year }
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
