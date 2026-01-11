import { Router } from "express";
import { CrearPacientes, getPacientes, updatePaciente, togglePacienteEstado} from "../Controllers/PacientesControllers.js"

const router = Router();

router.post("/", CrearPacientes);
router.get("/", getPacientes);
router.put("/:id", updatePaciente);
router.patch("/:id/estado", togglePacienteEstado);

export default router;