require("dotenv").config();
const mongoose = require("mongoose");

console.log("🔍 Prueba de conexión a MongoDB Atlas\n");

// Mostrar información
console.log("1. Variables de entorno:");
console.log("   - MONGODB_URI existe:", !!process.env.MONGODB_URI);

if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI;
  const censored = uri.replace(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    "mongodb+srv://[USER]:[PASS]@"
  );
  console.log("   - URI:", censored);

  // Extraer información
  const match = uri.match(/@([^/]+)/);
  if (match) {
    console.log("   - Host:", match[1]);
  }
}

console.log("\n2. Intentando conexión...");
console.log("   (esto puede tardar hasta 30 segundos)\n");

const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
};

const startTime = Date.now();

mongoose
  .connect(process.env.MONGODB_URI, options)
  .then(() => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("✅ ¡CONEXIÓN EXITOSA!");
    console.log(`   - Tiempo: ${duration}s`);
    console.log(`   - Host: ${mongoose.connection.host}`);
    console.log(`   - Base de datos: ${mongoose.connection.name}`);
    process.exit(0);
  })
  .catch((error) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`❌ ERROR después de ${duration}s\n`);
    console.log("Tipo de error:", error.name);
    console.log("Mensaje:", error.message);

    if (error.message.includes("ENOTFOUND")) {
      console.log("\n💡 SOLUCIÓN: Problema de DNS");
      console.log("   1. Verifica tu conexión a internet");
      console.log("   2. Intenta cambiar tus DNS a 8.8.8.8");
      console.log("   3. Desactiva VPN si tienes una activa");
    } else if (
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("timeout")
    ) {
      console.log("\n💡 SOLUCIÓN: Timeout de conexión");
      console.log("   1. Verifica tu firewall/antivirus");
      console.log("   2. Desactiva Windows Firewall temporalmente");
      console.log(
        "   3. Verifica que no estés en una red corporativa con restricciones"
      );
    } else if (error.message.includes("IP")) {
      console.log("\n💡 SOLUCIÓN: IP bloqueada");
      console.log("   1. Ve a https://www.whatismyip.com y copia tu IP");
      console.log("   2. Agrégala específicamente en Network Access");
      console.log("   3. Espera 5 minutos y vuelve a intentar");
    } else if (error.message.includes("authentication")) {
      console.log("\n💡 SOLUCIÓN: Error de autenticación");
      console.log("   1. Verifica usuario y contraseña en Database Access");
      console.log("   2. Resetea la contraseña del usuario");
      console.log("   3. Actualiza el .env con la nueva contraseña");
    }

    process.exit(1);
  });
