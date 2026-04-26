import { Router } from "express";
import { getUsers, createUser, updateUser, login, resetearPasswordAdmin } from "../Controllers/UsuarioControllers.js";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.put("/resetear-password/:id", resetearPasswordAdmin);
router.post("/login", login);

export default router;
