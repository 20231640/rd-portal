import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.js";
import classesRouter from "./routes/classes.js";
import trainingsRouter from "./routes/trainings.js";
import reportFoldersRoutes from "./routes/report-folders.js";
import kitsRoutes from "./routes/kits.js";
import teachersRoutes from "./routes/teachers.js"; 
import path from "path";


const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Usar process.cwd() em vez de __dirname (mais simples)
app.use('/certificates', express.static(path.join(process.cwd(), 'public/certificates')));

app.get("/", (req, res) => {
  res.send("🔥 API do RD-Portal a funcionar!");
});

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teachersRoutes); 
app.use("/api/classes", classesRouter);
app.use("/api/trainings", trainingsRouter);
app.use("/api/report-folders", reportFoldersRoutes);
app.use("/api/kits", kitsRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => 
  console.log(`🚀 Servidor a correr em http://0.0.0.0:${PORT}`)
);