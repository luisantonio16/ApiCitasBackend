import { Router } from "express";
import { getMenuDinamico } from "../Controllers/MenuOpcionesControllers.js";


const router = Router();

router.get("/:id", getMenuDinamico);

export default router;