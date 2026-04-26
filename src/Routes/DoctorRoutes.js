import { Router } from "express";
import { GetDoctores, PostDoctores, PutDoctores, getDoctoresBySucursal } from "../Controllers/DoctorControllers.js";
import { getCodigoSecuencia } from "../Controllers/CodigosControlers.js";

const router = Router();

router.get("/", GetDoctores);
router.post("/", PostDoctores);
router.put("/:id", PutDoctores);
router.get("/sucursal/:sucursalId", getDoctoresBySucursal);


export default router;
