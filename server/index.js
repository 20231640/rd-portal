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
import { fileURLToPath } from 'url';

const app = express();
const prisma = new PrismaClient();

// ✅ CORS PARA PRODUÇÃO
app.use(cors({
  origin: [
    "http://localhost:5173",        // Dev frontend
    "https://rd-portal.vercel.app"  // Produção
  ],
  credentials: true
}));

app.use(express.json());

// ✅ SERVIR FICHEIROS ESTÁTICOS (corrigido)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/certificates', express.static(path.join(__dirname, '../public/certificates')));

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