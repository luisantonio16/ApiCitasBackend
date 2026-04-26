import { sequelize, Doctor, DoctorSucursal, Horario, Especialidad, Sucursal, DoctorHorarioSucursal } from "../Models/index.js";
import { Op } from "sequelize";
import { getCodigoSecuencia } from "./CodigosControlers.js";



//OBTENEMOS TODS LOS DOCTORES
export const GetDoctores = async (req, res) => {
  try {
    let { page, limit, estado, value } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (estado !== undefined) {
      where.estado = estado === "true";
    }

    if (value) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${value}%` } },
        { apellido: { [Op.iLike]: `%${value}%` } },
        { email: { [Op.iLike]: `%${value}%` } },
        { codigo: { [Op.iLike]: `%${value}%` } },
      ];
    }

    const doctores = await Doctor.findAll({
      where,
      attributes: [
        "id",
        "codigo",
        "nombre",
        "apellido",
        "telefono",
        "email",
        "estado",
        "foto_url",
        "biografia",
      ],
      include: [
        {
          model: Especialidad,
          attributes: ["id", "nombre"],
        },
        {
          model: DoctorHorarioSucursal,
          attributes: ["id","sucursalId", "diaSemana", "horaInicio", "horaFin"],
          include: [
            {
              model: Sucursal,
              attributes: ["id", "nombre", "direccion"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    // Transformar la respuesta (agrupación correcta)
    const doctoresTransformados = doctores.map((doctor) => {
      const sucursalesMap = {};

      doctor.DoctorHorarioSucursals.forEach((rel) => {
        const suc = rel.Sucursal;
        if (!suc) return;

        if (!sucursalesMap[suc.id]) {
          sucursalesMap[suc.id] = {
            id: suc.id,
            nombre: suc.nombre,
            direccion: suc.direccion,
            horarios: [],
          };
        }

        sucursalesMap[suc.id].horarios.push({
          id: rel.id,
          diaSemana: rel.diaSemana,
          horaInicio: rel.horaInicio,
          horaFin: rel.horaFin,
        });
      });

      return {
        id: doctor.id,
        codigo: doctor.codigo,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        telefono: doctor.telefono,
        email: doctor.email,
        foto_url: doctor.foto_url,
        estado: doctor.estado,
        biografia: doctor.biografia,
        Especialidad: doctor.Especialidad,
        sucursales: Object.values(sucursalesMap),
      };
    });

    const total = await Doctor.count({ where });

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: doctoresTransformados,
    });
  } catch (error) {
    console.error("Error en GetDoctores:", error);
    res.status(500).json({
      error: "Error obteniendo doctores",
      details: error.message,
    });
  }
};

// Crear doctor con sucursal y horarios
export const PostDoctores = async (req, res) => {
  const t = await sequelize.transaction(); // 🚀 iniciamos transacción
  try {
    const {
      nombre,
      apellido,
      telefono,
      email,
      biografia,
      estado,
      foto_url,
      especialidadId,
      horarios,   // array de horarios
    } = req.body;

    // Validar que vengan los campos obligatorios
    if (!nombre || !apellido || !especialidadId) {
      return res.status(400).json({
        error: "Nombre, apellido y especialidadId son obligatorios",
      });
    }

    const codigo = await getCodigoSecuencia(1);

    // Crear el doctor
    const nuevoDoctor = await Doctor.create(
      {
        nombre,
        apellido,
        telefono,
        email,
        foto_url,
        estado,
        biografia,
        codigo: codigo,
        especialidadId,
      },
      { transaction: t }
    );

    // Crear horarios y asociar sucursales
    if (horarios && horarios.length > 0) {
      // Extraemos los IDs de sucursal únicos desde los horarios
      const sucursalIdsUnicos = [...new Set(horarios.map(h => h.sucursalId))];

      // Creamos las asociaciones DoctorSucursal (sin duplicar)
      await Promise.all(
        sucursalIdsUnicos.map(sucursalId =>
          DoctorSucursal.create(
            { DoctorId: nuevoDoctor.id, SucursalId: sucursalId },
            { transaction: t }
          )
        )
      );
      // Creamos los horarios del doctor
      for (const h of horarios) {
        await DoctorHorarioSucursal.create(
          {
            doctorId: nuevoDoctor.id,
            sucursalId: h.sucursalId,
            diaSemana: h.dia_semana,
            horaInicio: h.hora_inicio,
            horaFin: h.hora_fin
          },
          { transaction: t }
        );
      }
    }

    //Confirmar transacción
    await t.commit();

    res.status(201).json({
      message: "Doctor creado con éxito",
      doctor: nuevoDoctor,
    });

  } catch (error) {
    await t.rollback();

    console.log("Error:" + error);
    // Si es un error de validación de Sequelize
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: error.errors.map((e) => e.message),
      });
    }

    // Para cualquier otro error
    console.error("Error al crear doctor:", error);
    return res.status(500).json({
      error: error.message || "Error interno del servidor",
    });
  }
};


//Actualizar Doctores
export const PutDoctores = async (req, res) => {
const t = await Doctor.sequelize.transaction();

try {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    telefono,
    email,
    estado,
    foto_url,
    especialidadId,
    horarios = [],
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "El ID del doctor es obligatorio" });
  }

  const doctor = await Doctor.findByPk(id, { transaction: t });
  if (!doctor) {
    await t.rollback();
    return res.status(404).json({ error: "Doctor no encontrado" });
  }

  // =========================
  // ACTUALIZAR DATOS BÁSICOS
  // =========================
  await doctor.update(
    {
      nombre,
      apellido,
      telefono,
      email,
      estado,
      foto_url,
      especialidadId,
    },
    { transaction: t }
  );

  // =========================
  // ACTUALIZAR HORARIOS
  // =========================
  if (Array.isArray(horarios)) {
    const relacionesActuales = await DoctorHorarioSucursal.findAll({
      where: { doctorId: id },
      transaction: t,
    });

    const actualSet = new Set(
      relacionesActuales.map(
        (r) =>
          `${r.sucursalId}-${r.diaSemana}-${r.horaInicio}-${r.horaFin}`
      )
    );

    const nuevoSet = new Set(
      horarios.map(
        (h) =>
          `${h.sucursalId}-${h.diaSemana}-${h.horaInicio}-${h.horaFin}`
      )
    );

    // 1️⃣ Eliminar los horarios que ya no existen
    for (const rel of relacionesActuales) {
      const clave = `${rel.sucursalId}-${rel.diaSemana}-${rel.horaInicio}-${rel.horaFin}`;
      if (!nuevoSet.has(clave)) {
        await DoctorHorarioSucursal.destroy({
          where: { id: rel.id },
          transaction: t,
        });
      }
    }

    //  Crear los nuevos horarios
    for (const h of horarios) {
      if (
        !h.sucursalId ||
        !h.diaSemana ||
        !h.horaInicio ||
        !h.horaFin
      ) {
        await t.rollback();
        return res.status(400).json({
          error:
            "Cada horario debe incluir sucursal, dia, hora Inicio y hora Fin",
        });
      }

      const clave = `${h.sucursalId}-${h.diaSemana}-${h.horaInicio}-${h.horaFin}`;
      if (!actualSet.has(clave)) {
        await DoctorHorarioSucursal.create(
          {
            doctorId: id,
            sucursalId: h.sucursalId,
            diaSemana: h.diaSemana,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
          },
          { transaction: t }
        );
      }
    }
  }

  await t.commit();

  res.status(200).json({
    message: "Doctor actualizado con éxito",
  });
} catch (error) {
  await t.rollback();
  console.error("Error en PutDoctores:", error);
  res.status(500).json({ error: error.message });
}
};

//obtener doctores by sucursales
export const getDoctoresBySucursal = async (req, res) => {
  try {
    const { sucursalId } = req.params;

    // =========================
    // CASO 1: TODAS LAS SUCURSALES
    // =========================
    if (Number(sucursalId) === 0) {
      const doctores = await Doctor.findAll({
        where: { estado: true },
        attributes: ["id", "nombre", "apellido"],
        include: [
          {
            model: Especialidad,
            attributes: ["id", "nombre"],
          },
          {
            model: DoctorHorarioSucursal,
            attributes: ["sucursalId","diaSemana", "horaInicio", "horaFin"],
            include: [
              {
                model: Sucursal,
                attributes: ["id", "nombre"],
              },
            ],
          },
        ],
        order: [["apellido", "ASC"]],
      });

      return res.json(transformarDoctoresPorSucursal(doctores));
    }

    // =========================
    // VALIDAR SUCURSAL
    // =========================
    const sucursal = await Sucursal.findByPk(sucursalId);
    if (!sucursal) {
      return res.status(404).json({
        message: "Sucursal no encontrada",
      });
    }

    // =========================
    // DOCTORES DE UNA SUCURSAL
    // =========================
    const doctores = await Doctor.findAll({
      where: { estado: true },
      attributes: ["id", "nombre", "apellido"],
      include: [
        {
          model: Especialidad,
          attributes: ["id", "nombre"],
        },
        {
          model: DoctorHorarioSucursal,
          required: true, //  clave: solo doctores con horarios en esta sucursal
          where: { sucursalId },
          attributes: ["sucursalId","diaSemana", "horaInicio", "horaFin"],
            include: [
              {
                model: Sucursal,
                attributes: ["id", "nombre"],
              },
            ],
        },
      ],
      order: [["apellido", "ASC"]],
    });

    return res.json(transformarDoctoresPorSucursal(doctores));
    
    // return res.json(
    //   doctores.map((doctor) => ({
    //     id: doctor.id,
    //     nombre: doctor.nombre,
    //     apellido: doctor.apellido,
    //     especialidad: doctor.Especialidad,
    //     horarios: doctor.DoctorHorarioSucursals.map((h) => ({
    //       diaSemana: h.diaSemana,
    //       horaInicio: h.horaInicio,
    //       horaFin: h.horaFin,
    //     })),
    //   }))
    // );
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener doctores",
      error: error.message,
    });
  }
};

function transformarDoctoresPorSucursal(doctores) {
  return doctores.map((doctor) => {
    const sucursalesMap = {};

    doctor.DoctorHorarioSucursals.forEach((rel) => {
      const suc = rel.Sucursal;
      if (!suc) return;

      if (!sucursalesMap[suc.id]) {
        sucursalesMap[suc.id] = {
          id: suc.id,
          nombre: suc.nombre,
          horarios: [],
        };
      }

      sucursalesMap[suc.id].horarios.push({
        diaSemana: rel.diaSemana,
        horaInicio: rel.horaInicio,
        horaFin: rel.horaFin,
      });
    });

    return {
      id: doctor.id,
      nombre: doctor.nombre,
      apellido: doctor.apellido,
      especialidad: doctor.Especialidad,
      sucursales: Object.values(sucursalesMap),
    };
  });
}
