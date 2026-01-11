import express from "express";
import {
  crearHorario,
  actualizarHorario,
  getHorarios,
  getHorariosDoctor,
  getHorariosDisponibles,
  getHorariosSucursal
} from "../Controllers/HorariosControllers.js";

const router = express.Router();

router.post("/", crearHorario);
router.put("/:id", actualizarHorario);
router.get("/", getHorarios);
router.get("/doctor/:doctorId", getHorariosDoctor);
router.get("/sucursal/:sucursalId", getHorariosSucursal);
router.get("/disponibles", getHorariosDisponibles);

export default router;
