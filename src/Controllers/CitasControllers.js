import { Horario, Cita, Doctor, Sucursal, Usuario, Pacientes } from "../Models/index.js";
import { Op } from "sequelize";


//Creamos la citas
export const crearCita = async (req, res) => {
  try {
    const {
      fecha,
      horaInicio,
      horaFin,
      motivo,
      doctorId,
      sucursalId,
      pacienteId,
      horarioDescripcion
    } = req.body;

    //  Validar fechas
    if (!horaInicio || !horaFin) {
      return res.status(400).json({
        error: "Debe enviar fechaHoraInicio y fechaHoraFin"
      });
    }

    if (new Date(horaInicio) >= new Date(horaFin)) {
      return res.status(400).json({
        error: "La hora de inicio debe ser menor que la hora de fin"
      });
    }

    //Validar solapamiento (LO IMPORTANTE)
    const existeConflicto = await Cita.findOne({
      where: {
        doctorId,
        sucursalId,

        horaInicio: {
          [Op.lt]: horaFin,
        },
        horaFin: {
          [Op.gt]: horaInicio,
        },

        estado: {
          [Op.notIn]: ["Cancelada", "Rechazada"],
        },
      },
    });

    if (existeConflicto) {
      return res.status(400).json({
        error: "El doctor ya tiene una cita en ese horario"
      });
    }

    //  Crear cita
    const cita = await Cita.create({
      horaInicio,
      horaFin,
      motivo,
      doctorId,
      sucursalId,
      pacienteId,
      horarioDescripcion,
      fecha
    });

    res.status(201).json({
      status:200,
       message: "Cita creada con éxito",
       cita
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al crear cita",
      details: error.message
    });
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
export const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fecha,
      horaInicio,
      horaFin,
      motivo,
      doctorId,
      sucursalId,
      pacienteId,
      estado,
      horarioDescripcion
    } = req.body;

    const cita = await Cita.findByPk(id);

    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    // 🧠 Validar fechas
    if (horaInicio && horaFin) {
      if (new Date(horaInicio) >= new Date(horaFin)) {
        return res.status(400).json({
          error: "La hora de inicio debe ser menor que la de fin"
        });
      }

      // 🔥 Validar solapamiento (excluyendo la misma cita)
      const conflicto = await Cita.findOne({
        where: {
          id: { [Op.ne]: id },
          doctorId: doctorId || cita.doctorId,
          sucursalId: sucursalId || cita.sucursalId,

          horaInicio: { [Op.lt]: horaFin },
          horaFin: { [Op.gt]: horaInicio },

          estado: {
            [Op.notIn]: ["Cancelada", "Rechazada"]
          }
        }
      });

      if (conflicto) {
        return res.status(400).json({
          error: "Ya existe otra cita en ese horario"
        });
      }
    }

    await cita.update({
      horaInicio,
      horaFin,
      motivo,
      doctorId,
      sucursalId,
      pacienteId,
      estado,
      fecha,
      horarioDescripcion
    });

    res.json(cita);

  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar cita",
      details: error.message
    });
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

//citas por pacientes
export const historialPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;

    const citas = await Cita.findAll({
      where: { pacienteId },
      order: [["horaInicio", "DESC"]],
    });

    res.json(citas);

  } catch (error) {
    res.status(500).json({ error: "Error al obtener historial" });
  }
};


//cancelar cita
export const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoCancelacion } = req.body;

    const cita = await Cita.findByPk(id);

    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    await cita.update({
      estado: "Cancelada",
      motivoCancelacion
    });

    res.json({ message: "Cita cancelada correctamente", cita });

  } catch (error) {
    res.status(500).json({
      error: "Error al cancelar cita",
      details: error.message
    });
  }
};

//Citas Por fecha
export const obtenerCitasPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;

    const inicioDia = new Date(`${fecha}T00:00:00`);
    const finDia = new Date(`${fecha}T23:59:59`);

    const citas = await Cita.findAll({
      where: {
        fechaHoraInicio: {
          [Op.between]: [inicioDia, finDia],
        },
      },
      order: [["fechaHoraInicio", "ASC"]],
    });

    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Citas por doctor
export const obtenerCitasPorDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const citas = await Cita.findAll({
      where: { doctorId },
      order: [["fechaHoraInicio", "ASC"]],
    });

    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};