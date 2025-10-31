import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.js";
import classesRouter from "./routes/classes.js";
import trainingsRouter from "./routes/trainings.js";
import path from "path";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/certificates', express.static(path.join(process.cwd(), 'public/certificates')));


app.get("/", (req, res) => {
  res.send("✅ API do RD-Portal a funcionar!");
});

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/classes", classesRouter);
app.use("/api/trainings", trainingsRouter);


const PORT = 4000;
app.listen(PORT, "0.0.0.0", () => 
  console.log(`🚀 Servidor a correr em http://0.0.0.0:${PORT}`)
);

