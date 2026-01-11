import { sequelize, Doctor, DoctorSucursal, Horario, Especialidad, Sucursal, DoctorHorarioSucursal } from "../Models/index.js";
import { Op } from "sequelize";
import { getCodigoSecuencia } from "./CodigosControlers.js";



//OBTENEMOS TODS LOS DOCTORES
export const GetDoctores = async (req, res) => {
    try {
        // Paginación
        let { page, limit, estado, value } = req.query;

        page = parseInt(page) || 1;     // Página actual
        limit = parseInt(limit) || 10;  // Registros por página
        const offset = (page - 1) * limit;

        // Filtros dinámicos
        const where = {};

        if (estado !== undefined) {
            where.estado = estado === "true"; // Convierte string a boolean
        }

        if (value) {
            where[Op.or] = [
                { nombre: { [Op.iLike]: `%${value}%` } },       // Busca por nombre
                { apellido: { [Op.iLike]: `%${value}%` } },     // Busca por apellido
                { email: { [Op.iLike]: `%${value}%` } },
                { codigo: { [Op.iLike]: `%${value}%` } },
            ];
        }

        // Consulta con paginación y filtros
        const doctores = await Doctor.findAll({
            where,
            include: [
                {
                    model: Especialidad,
                    attributes: ["id", "nombre"],
                },
                {
                    model: DoctorHorarioSucursal,
                    include: [
                        {
                            model: Sucursal,
                            attributes: ["id", "nombre", "direccion"],
                        },
                        {
                            model: Horario,
                            attributes: ["id", "dia_semana","sucursalId", "hora_inicio", "hora_fin"],
                        },
                    ],
                },
            ],
            attributes: ["id", "nombre", "apellido", "telefono", "email", "estado", "foto_url", "biografia", "codigo"],
            limit,
            offset,
            order: [["id", "ASC"]],
        });

    // 🔄 Transformar la respuesta para agrupar horarios por sucursal
    const doctoresTransformados = doctores.map((doctor) => {
      const sucursalesMap = {};

      doctor.DoctorHorarioSucursals.forEach((rel) => {
        const suc = rel.Sucursal;
        const hor = rel.Horario;

        if (!suc || !hor) return;

        if (!sucursalesMap[suc.id]) {
          sucursalesMap[suc.id] = {
            id: suc.id,
            nombre: suc.nombre,
            direccion: suc.direccion,
            horarios: [],
          };
        }

        sucursalesMap[suc.id].horarios.push(hor);
      });

      return {
        id: doctor.id,
        codigo:doctor.codigo,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        telefono: doctor.telefono,
        email: doctor.email,
        foto_url:doctor.foto_url,
        estado:doctor.estado,
        biografia:doctor.biografia,
        Especialidad: doctor.Especialidad,
        sucursales: Object.values(sucursalesMap), // 👈 agrupadas sin duplicar
      };
    });

    // Total de registros (para saber cuántas páginas hay)
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
        res.status(500).json({ error: "Error obteniendo doctores", details: error.message });
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

        // 1️⃣ Crear el doctor
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

        // 2️⃣ y 3️⃣ Crear horarios y asociar sucursales
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

            console.log(sucursalIdsUnicos);

            // Creamos los horarios del doctor
            for (const h of horarios) {
                await DoctorHorarioSucursal.create(
                    {
                        doctorId: nuevoDoctor.id,
                        sucursalId: h.sucursalId,
                        horarioId: h.id

                    },
                    { transaction: t }
                );
            }
        }

        // ✅ Confirmar transacción
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

    //  Actualizar datos básicos
    doctor.nombre = nombre ?? doctor.nombre;
    doctor.apellido = apellido ?? doctor.apellido;
    doctor.telefono = telefono ?? doctor.telefono;
    doctor.email = email ?? doctor.email;
    doctor.estado = estado ?? doctor.estado;
    doctor.foto_url = foto_url ?? doctor.foto_url;
    doctor.especialidadId = especialidadId ?? doctor.especialidadId;

    await doctor.save({ transaction: t });

    // Actualizar horarios/sucursales asignadas
    if (horarios.length > 0) {
      // Obtener las relaciones actuales del doctor
      const relacionesActuales = await DoctorHorarioSucursal.findAll({
        where: { doctorId: id },
        transaction: t,
      });

      // Crear un set con las combinaciones actuales para comparar
      const actualesSet = new Set(
        relacionesActuales.map(
          (r) => `${r.sucursalId}-${r.horarioId}`
        )
      );


      // Crear un set con las combinaciones nuevas
      const nuevasSet = new Set(
        horarios.map((h) => `${h.sucursalId}-${h.horarioId}`)
      );

      // 1. Eliminar relaciones que ya no están
      for (const rel of relacionesActuales) {
        const clave = `${rel.sucursalId}-${rel.horarioId}`;
        if (!nuevasSet.has(clave)) {
          await DoctorHorarioSucursal.destroy({
            where: { id: rel.id },
            transaction: t,
          });
        }
      }

      // 2. Crear solo las nuevas relaciones que no existen
      for (const h of horarios) {
        if (!h.sucursalId || !h.id) {
          await t.rollback();
          return res.status(400).json({
            error: "Cada elemento de horarios debe incluir sucursalId y horarioId",
          });
        }

        const clave = `${h.sucursalId}-${h.id}`;
        if (!actualesSet.has(clave)) {
          await DoctorHorarioSucursal.create(
            {
              doctorId: id,
              sucursalId: h.sucursalId,
              horarioId: h.id,
            },
            { transaction: t }
          );
        }
      }
    }

    // Confirmar transacción
    await t.commit();

    res.status(200).json({
      message: "Doctor actualizado con éxito",
      doctor,
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

    // SI ES 0 → TODOS LOS DOCTORES
    if (Number(sucursalId) === 0) {
      const doctores = await Doctor.findAll({
        where: { estado: true },
         include: [
                {
                    model: Especialidad,
                    attributes: ["id", "nombre"],
                },
              ],
        attributes: ["id", "nombre", "apellido"],
        order: [["apellido", "ASC"]],
      });

      return res.json(doctores);
    }

    // 🔹 VALIDAR SUCURSAL
    const sucursal = await Sucursal.findByPk(sucursalId);

    if (!sucursal) {
      return res.status(404).json({
        message: "Sucursal no encontrada",
      });
    }

    // 🔹 DOCTORES POR SUCURSAL
    const doctores = await sucursal.getDoctors({
      where: { estado: true },
      include: [
                {
                    model: Especialidad,
                    attributes: ["id", "nombre"],
                },
              ],
      attributes: ["id", "nombre", "apellido"],
      joinTableAttributes: [],
      order: [["apellido", "ASC"]],
    });

    return res.json(doctores);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener doctores",
      error: error.message,
    });
  }
};