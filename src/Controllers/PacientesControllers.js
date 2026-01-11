import sequelize from "../Config/database.js";
import bcrypt from "bcryptjs";
import Pacientes from "../Models/Pacientes.js";
import Usuario from "../Models/Usuario.js";
import Roles from "../Models/Roles.js";


export const CrearPacientes = async (req, res) => {

    //Inicio de transacciones
    const t = await sequelize.transaction();

    try {
        const { crearUsuario, usuario, paciente } = req.body;

        // Validaciones básicas
        if (!paciente?.nombres || !paciente?.apellidos) {
            return res.status(400).json({
                message: "Datos del paciente incompletos",
            });
        }

        let usuarioCreado = null;

        //creamos el  usuario

        if (crearUsuario) {
            if (!usuario?.email || !usuario?.password || !usuario?.usuario) {
                return res.status(400).json({
                    message: "Usuario y contraseña son obligatorios para crear el usuario",
                });
            }

            const existeUsuario = await Usuario.findOne({
                where: { email: usuario.email },
            });

            if (existeUsuario) {
                return res.status(409).json({
                    message: "El email ya está registrado",
                });
            }

            const rolPaciente = await Roles.findOne({
                where: { nombre: "PACIENTE" },
            });

            if (!rolPaciente) {
                return res.status(500).json({
                    message: "Rol PACIENTE no existe",
                });
            }

            const passwordHash = await bcrypt.hash(usuario.password, 10);

            usuarioCreado = await Usuario.create(
                {
                    email: usuario.email,
                    password: passwordHash,
                    rolId: rolPaciente.id,
                    estado: true,
                },
                { transaction: t }
            );
        }

        const nuevoPaciente = await Pacientes.create(
            {
                ...paciente,
                usuarioId: usuarioCreado ? usuarioCreado.id : null,
                estado: true,
            },
            { transaction: t }
        );
        await t.commit();

        return res.status(201).json({
            message: "Paciente creado correctamente",
            data: {
                paciente: nuevoPaciente,
                usuario: usuarioCreado,
            },
        });


    } catch (error) {
        //capturamos el error
        await t.rollback();

        return res.status(500).json({
            message: "Error al crear el paciente",
            error: error.message,
        });
    }

}

/**
 * =========================
 * LISTAR PACIENTES
 * =========================
 */
export const getPacientes = async (req, res) => {
  try {

    const pacientes = await Pacientes.findAll({
      include: [
        {
          model: Usuario,
          attributes: ["id", "email", "estado"],
        },
      ],
      order: [["id", "DESC"]],
    });
    
    return res.json(pacientes);

  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener pacientes",
      error: error.message,
    });
  }
};


/**
 * =========================
 * ACTUALIZAR PACIENTE
 * =========================
 */

export const updatePaciente = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const paciente = await Pacientes.findByPk(id);

    if (!paciente) {
      return res.status(404).json({
        message: "Paciente no encontrado",
      });
    }

    await paciente.update(
      {
        ...req.body,
      },
      { transaction: t }
    );

    await t.commit();

    return res.json({
      message: "Paciente actualizado correctamente",
      data: paciente,
    });

  } catch (error) {
    await t.rollback();

    return res.status(500).json({
      message: "Error al actualizar paciente",
      error: error.message,
    });
  }
};

/**
 * =========================
 * DESACTIVAR PACIENTE 
 * =========================
 */

export const togglePacienteEstado = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findByPk(id);

    if (!paciente) {
      return res.status(404).json({
        message: "Paciente no encontrado",
      });
    }

    paciente.estado = !paciente.estado;
    await paciente.save();

    return res.json({
      message: `Paciente ${
        paciente.estado ? "activado" : "desactivado"
      } correctamente`,
      estado: paciente.estado,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al cambiar estado del paciente",
      error: error.message,
    });
  }
};
