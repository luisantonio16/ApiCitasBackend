import express from "express";
import cors from "cors";
import  sequelize  from "./models/index.js"; 
import 'dotenv/config'; 


//importamos las rutas 
import UsuariosRoutes from './Routes/UsuariosRoutes.js';
import SucursalRoutes from './Routes/SucursalRoutes.js';
import EspecialidadRoutes from "./Routes/EspecialidadRoutes.js";
import DoctorRoutes from "./Routes/DoctorRoutes.js";
import HorariosRoutes from "./Routes/HorariosRoutes.js";
import CitasRoutes from "./Routes/CitasRoutes.js";
import PacientesRoutes from "./Routes/PacientesRoutes.js"


const app = express();
// Configuración básica (permite todo)
app.use(cors());

app.use(express.json());
app.use("/api/usuario", UsuariosRoutes);
app.use("/api/sucursal", SucursalRoutes);
app.use("/api/especialidad", EspecialidadRoutes);
app.use("/api/doctor", DoctorRoutes);
app.use("/api/horarios", HorariosRoutes);
app.use("/api/citas", CitasRoutes);
app.use("/api/pacientes", PacientesRoutes);

const PORT = process.env.PORT || 4000;


(async () => {
  try {
    await sequelize.sync({ alter: true }); // crea/actualiza tablas
    console.log("✅ Base de datos sincronizada");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al sincronizar DB:", error);
  }
})();


