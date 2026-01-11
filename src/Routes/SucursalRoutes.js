import { Router } from "express";
import {getSucursales,AddSucursal, updateSucursal} from "../Controllers/SucursalControllers.js"
const router = Router();

router.get("/", getSucursales);
router.post("/", AddSucursal);
router.put("/:id",updateSucursal)

export default router;