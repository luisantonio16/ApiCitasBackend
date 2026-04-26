import { Router } from "express";
import { getRoles } from "../Controllers/RolesControllers.js";


const router = Router();


router.get("/", getRoles);

export default router;