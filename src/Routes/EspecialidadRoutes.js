import { Router } from "express";
import { GetEspecialidades, PostEspecialidades, PutEspecialidades } from "../Controllers/EspecialidadesControllers.js";

const router = Router();

router.get("/", GetEspecialidades);
router.post("/", PostEspecialidades);
router.put("/:id", PutEspecialidades);

export default router;