import { Horario, Cita, Doctor, Sucursal, Usuario, Pacientes } from "../Models/index.js";
import { Op } from "sequelize";


// Crear cita (con validación de duplicados)
export const crearCita = async (req, res) => {
  try {
    const { fecha, horaInicio, horaFin, motivo, doctorId, sucursalId, pacienteId } = req.body;

    // Validar si ya existe cita en ese horario para el doctor
    const existe = await Cita.findOne({
      where: { fecha, horaInicio, doctorId, sucursalId }
    });

    if (existe) {
      return res.status(400).json({
        error: "Ya existe una cita asignada para este doctor en esa fecha y hora"
      });
    }

    const cita = await Cita.create({
      fecha, motivo, doctorId, sucursalId, horaInicio, horaFin, pacienteId
    });

    res.status(201).json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al crear cita", details: error.message });
  }
};


//obtenemos citas, por doctor, pacientes, sucursal, estado
export const getCitas = async (req, res) => {
  try {
    const { estado, sucursalId, doctorId, search } = req.query;

    // =========================
    // WHERE PRINCIPAL (CITA)
    // =========================
    const whereCita = {};

    // Estado
    if (estado && estado !== "Todos") {
      whereCita.estado = estado;
    }

    // Sucursal
    if (sucursalId && Number(sucursalId) !== 0) {
      whereCita.sucursalId = Number(sucursalId);
    }

    // Doctor
    if (doctorId && Number(doctorId) !== 0) {
      whereCita.doctorId = Number(doctorId);
    }

    // =========================
    // WHERE PACIENTE (BÚSQUEDA)
    // =========================
    const wherePaciente = {};

    if (search && search.trim() !== "") {
      wherePaciente[Op.or] = [
        { nombres: { [Op.iLike]: `%${search}%` } },
        { apellidos: { [Op.iLike]: `%${search}%` } },
        { cedula: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const citas = await Cita.findAll({
      where: whereCita,
      include: [
        {
          model: Doctor,
          attributes: ["id", "nombre", "apellido"]
        },
        {
          model: Sucursal,
          attributes: ["id", "nombre"]
        },
        {
          model: Pacientes,
          attributes: ["id", "nombres", "apellidos", "cedula"],
          where: Object.keys(wherePaciente).length ? wherePaciente : undefined
        }
      ],
      order: [
        ["fecha", "DESC"],
        ["horaInicio", "ASC"]
      ]
    });

    return res.json(citas);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al obtener citas",
      details: error.message
    });
  }
};


// Obtener cita por ID
export const getCitaById = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id, {
      include: [
        { model: Doctor, attributes: ["id", "nombre", "apellido"] },
        { model: Usuario, attributes: ["id", "nombre", "apellido"] },
        { model: Sucursal, attributes: ["id", "nombre"] },
        { model: Horario, attributes: ["id", "horaInicio", "horaFin"] },
      ]
    });

    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener cita", details: error.message });
  }
};

// Modificar cita
export const updateCita = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Cita.update(req.body, { where: { id } });

    if (updated === 0) return res.status(404).json({ error: "Cita no encontrada" });

    const citaActualizada = await Cita.findByPk(id);
    res.json(citaActualizada);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar cita", details: error.message });
  }
};

// Eliminar cita
export const deleteCita = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Cita.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ error: "Cita no encontrada" });

    res.json({ message: "Cita eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar cita", details: error.message });
  }
};

// Cambiar estado de la cita (pendiente, confirmada, cancelada)
export const cambiarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["pendiente", "confirmada", "cancelada"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

    cita.estado = estado;
    await cita.save();

    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al cambiar estado", details: error.message });
  }
};

// Validar disponibilidad de un doctor en fecha/hora/sucursal
export const validarDisponibilidad = async (req, res) => {
  try {
    const { fecha, hora, doctorId, sucursalId } = req.body;

    const existe = await Cita.findOne({
      where: { fecha, hora, doctorId, sucursalId }
    });

    res.json({ disponible: !existe });
  } catch (error) {
    res.status(500).json({ error: "Error al validar disponibilidad", details: error.message });
  }
};

// Obtener citas por doctor
export const getCitasPorDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const citas = await Cita.findAll({ where: { doctorId } });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener citas del doctor", details: error.message });
  }
};

// Obtener citas por usuario
export const getCitasPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const citas = await Cita.findAll({ where: { usuarioId } });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener citas del usuario", details: error.message });
  }
};

// Obtener citas por sucursal
export const getCitasPorSucursal = async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const citas = await Cita.findAll({ where: { sucursalId } });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener citas de la sucursal", details: error.message });
  }
};