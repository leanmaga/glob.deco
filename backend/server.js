require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();

// CORS configurado correctamente - permite CUALQUIER dominio de Vercel
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como mobile apps o curl)
      if (!origin) return callback(null, true);

      // Lista de orígenes permitidos
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://glob-deco.vercel.app",
        "https://glob-deco-wtv4.vercel.app",
      ];

      // Permitir cualquier subdominio de vercel.app
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging en desarrollo
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rutas con prefijo /api
app.use("/api/auth", require("./routes/auth"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/products", require("./routes/products"));

// Ruta de salud
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    cors: "enabled",
  });
});

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "API de Glob.deco",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      categories: "/api/categories",
      products: "/api/products",
    },
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Función async para iniciar el servidor
const startServer = async () => {
  try {
    // 1. Primero conectar a MongoDB
    await connectDB();

    // 2. Luego levantar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Entorno: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API disponible en: http://localhost:${PORT}/api`);
      console.log(`✅ CORS habilitado para múltiples orígenes`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

process.on("unhandledRejection", (err) => {
  console.error("❌ Error no manejado:", err);
  process.exit(1);
});
