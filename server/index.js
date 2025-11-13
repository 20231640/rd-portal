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

// Para substituir __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

// ✅ CORS MELHORADO - CRÍTICO!
app.use(cors({
  origin: [
    'http://localhost:5173',
     // substitua pelo seu URL Netlify
    'http://localhost:4000' // para testes locais
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// ✅ SERVIR FICHEIROS ESTÁTICOS CORRETO
app.use('/certificates', express.static(path.join(__dirname, 'public/certificates')));

// ✅ ENDPOINTS DE TESTE - ADICIONE ESTES!
app.get("/", (req, res) => {
  res.send("✅ API do RD-Portal a funcionar!");
});

app.get("/api/test", (req, res) => {
  res.json({ 
    message: '✅ API a funcionar!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    res.json({ 
      success: true, 
      dbTime: result[0].current_time,
      message: '✅ Base de dados conectada!'
    });
  } catch (error) {
    console.error('❌ Erro na base de dados:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ ROTAS
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/classes", classesRouter);
app.use("/api/trainings", trainingsRouter);
app.use("/api/report-folders", reportFoldersRoutes);
app.use("/api/kits", kitsRoutes);

// ✅ MIDDLEWARE DE ERRO GLOBAL
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ✅ ROTA 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor a correr em http://0.0.0.0:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});