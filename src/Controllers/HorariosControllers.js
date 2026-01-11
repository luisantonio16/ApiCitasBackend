import { Horario, Cita, Doctor, Sucursal, Dias } from "../Models/index.js";
import { Op } from "sequelize";

// Crear un horario
export const crearHorario = async (req, res) => {
  try {
    const { dia_semana, hora_inicio, hora_fin, sucursalId, diaId } = req.body;

    if (!dia_semana || !hora_inicio || !hora_fin || !sucursalId || !diaId) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // 1. Validar que no se solapen horarios en la misma sucursal y mismo día
    const horarioExistente = await Horario.findOne({
      where: {
        sucursalId,
        diaId,
        // condición de solapamiento
        [Op.or]: [
          {
            hora_inicio: {
              [Op.between]: [hora_inicio, hora_fin],
            },
          },
          {
            hora_fin: {
              [Op.between]: [hora_inicio, hora_fin],
            },
          },
          {
            [Op.and]: [
              { hora_inicio: { [Op.lte]: hora_inicio } },
              { hora_fin: { [Op.gte]: hora_fin } },
            ],
          },
        ],
      },
    });

    if (horarioExistente) {
      return res.status(400).json({
        errorCodigo: 1,
        error: "Este horario ya existe en la sucursal.",
      });
    }

    const horario = await Horario.create({
      dia_semana,
      hora_inicio,
      hora_fin,
      sucursalId,
      diaId
    });

    res.status(201).json(horario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear horario", details: error.message });
  }
};

// Actualizar un horario
export const actualizarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { dia_semana, hora_inicio, hora_fin, diaId, sucursalId } = req.body;

    // 1. Validar que no se solapen horarios en la misma sucursal y mismo día
    const horarioExistente = await Horario.findOne({
      where: {
        sucursalId,
        diaId,

        // EXCLUIR EL HORARIO QUE SE ESTÁ EDITANDO
        id: {
          [Op.ne]: id, // <--- aquí va el ID que estás editando
        },

        [Op.or]: [
          {
            hora_inicio: {
              [Op.between]: [hora_inicio, hora_fin],
            },
          },
          {
            hora_fin: {
              [Op.between]: [hora_inicio, hora_fin],
            },
          },
          {
            [Op.and]: [
              { hora_inicio: { [Op.lte]: hora_inicio } },
              { hora_fin: { [Op.gte]: hora_fin } },
            ],
          },
        ],
      },
    });

    if (horarioExistente) {
      return res.status(400).json({
        errorCodigo: 1,
        error: "Este horario ya existe en la sucursal.",
      });
    }


    const horario = await Horario.findByPk(id);
    if (!horario) return res.status(404).json({ error: "Horario no encontrado" });

    await horario.update({ dia_semana, hora_inicio, hora_fin, sucursalId, diaId });
    res.json(horario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar horario", details: error.message });
  }
};

// Obtener todos los horarios
export const getHorarios = async (req, res) => {
  try {
    const horarios = await Horario.findAll({
      include: [
        { model: Sucursal, attributes: ["id", "nombre"] },
        { model: Dias, attributes: ["id", "dia_semana", "estado"] }
      ],
      order: [["dia_semana", "ASC"], ["hora_inicio", "ASC"]],
    });
    res.json(horarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener horarios", details: error.message });
  }
};

// Obtener horarios de un doctor
export const getHorariosDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    //  Buscar al doctor e incluir sus sucursales y sus horarios
    const doctor = await Doctor.findByPk(doctorId, {
      include: [
        {
          model: Sucursal,
          through: { attributes: [] }, // no mostrar la tabla intermedia
          include: [
            {
              model: Horario,
              attributes: ["id", "dia_semana", "hora_inicio", "hora_fin"],
            },
          ],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor no encontrado", idDoctor: idDoctor });
    }

    // Extraer los horarios combinados de todas las sucursales
    const horarios = doctor.Sucursals.flatMap((sucursal) => {
      return sucursal.Horarios.map((h) => ({
        sucursal: sucursal.nombre,
        dia_semana: h.dia_semana,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
      }));
    });

    res.json({ doctor: doctor.nombre, horarios });
  } catch (error) {
    console.error("Error al obtener horarios del doctor:", error);
    res.status(500).json({ message: "Error al obtener horarios" });
  }
};

// Obtener horarios de una Sucursal
export const getHorariosSucursal = async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const horarios = await Horario.findAll({
      where: { sucursalId },
      include: [{ model: Sucursal, attributes: ["id", "nombre"] }],
      order: [["dia_semana", "ASC"], ["hora_inicio", "ASC"]],
    });
    res.json(horarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener horarios del doctor", details: error.message });
  }
};

// Obtener horarios disponibles para agendar
export const getHorariosDisponibles = async (req, res) => {
  try {
    const { doctorId, sucursalId, fecha } = req.query;

    if (!doctorId || !sucursalId || !fecha)
      return res.status(400).json({ error: "Faltan parámetros" });

    // Obtener horarios del doctor en la sucursal y día de la semana
    const dia_semana = new Date(fecha).toLocaleDateString("es-ES", { weekday: "long" });

    const horarios = await Horario.findAll({
      where: { doctorId, sucursalId, dia_semana },
      order: [["hora_inicio", "ASC"]],
    });

    // Obtener citas existentes para esa fecha
    const citas = await Cita.findAll({
      where: { doctorId, sucursalId, fecha },
    });

    // Filtrar horarios disponibles
    const horariosDisponibles = horarios.filter((horario) => {
      return !citas.some(
        (cita) =>
          cita.hora >= horario.hora_inicio &&
          cita.hora < horario.hora_fin
      );
    });

    res.json(horariosDisponibles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener horarios disponibles", details: error.message });
  }
};
