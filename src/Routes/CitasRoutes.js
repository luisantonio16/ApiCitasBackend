import express from "express";
import {
  crearCita,
  getCitas,
  getCitaById,
  deleteCita,
  cambiarEstadoCita,
  validarDisponibilidad,
  getCitasPorDoctor,
  getCitasPorSucursal,
  actualizarCita
} from "../Controllers/CitasControllers.js";

const router = express.Router();

// Crear nueva cita
router.post("/", crearCita);

// Obtener todas las citas
router.get("/", getCitas);

//  Obtener una cita por ID
router.get("/:id", getCitaById);

//  Actualizar cita
router.put("/:id", actualizarCita);

//  Eliminar cita
router.delete("/:id", deleteCita);

//  Cambiar estado de la cita (pendiente, confirmada, cancelada)
router.patch("/:id/estado", cambiarEstadoCita);

//  Validar disponibilidad de un doctor en fecha/hora/sucursal
router.post("/validar-disponibilidad", validarDisponibilidad);

// Listar citas de un doctor
router.get("/doctor/:doctorId", getCitasPorDoctor);

//  Listar citas de una sucursal
router.get("/sucursal/:sucursalId", getCitasPorSucursal);

export default router;
