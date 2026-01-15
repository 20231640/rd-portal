import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

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

router.post("/", async (req, res) => {
  try {
    const { name, students, cycle, year, teacherId, state } = req.body;

    if (!name || !students || !cycle || !year || !teacherId) {
      return res.status(400).json({ message: "Dados incompletos" });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(teacherId) },
      select: { hasCompletedTraining: true, certificateUrl: true }
    });

    if (!teacher?.hasCompletedTraining && !teacher?.certificateUrl) {
      return res.status(403).json({ 
        message: "Não pode criar turmas sem completar a formação e obter certificado. Complete a formação primeiro." 
      });
    }

    const teacherWithSchool = await prisma.teacher.findUnique({
      where: { id: parseInt(teacherId) },
      include: { school: true },
    });

    if (!teacherWithSchool) {
      return res.status(404).json({ message: "Professor não encontrado" });
    }

    if (!teacherWithSchool.school) {
      return res.status(400).json({ message: "Professor não tem escola associada" });
    }
    
    const count = await prisma.class.count({ 
      where: { teacherId: parseInt(teacherId) } 
    });

    let newCode;
    if (teacherWithSchool.school.code) {  
      newCode = `${teacherWithSchool.school.code}-${count + 1}`;  
    } else {
      const schoolAbbrev = teacherWithSchool.school.name.substring(0, 3).toUpperCase();  
      newCode = `${schoolAbbrev}-${count + 1}`;
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        students: parseInt(students),
        cycle: cycle.trim(),
        year: year.trim(),
        teacherId: parseInt(teacherId),
        schoolId: teacherWithSchool.school.id,  
        code: newCode,
        state: state || "ACTIVE",
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

router.put("/:id/state", async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;
    
    if (!state || !["ACTIVE", "COMPLETED"].includes(state)) {
      return res.status(400).json({ message: "Estado inválido. Use 'ACTIVE' ou 'COMPLETED'" });
    }

    const updated = await prisma.class.update({
      where: { id: parseInt(id) },
      data: { state },
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
    console.error("Erro ao atualizar estado:", err);
    res.status(500).json({ 
      message: "Erro ao atualizar estado da turma",
      error: err.message 
    });
  }
});

export default router;