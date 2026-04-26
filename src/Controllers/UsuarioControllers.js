import bcrypt from "bcryptjs";
import Usuario from "../Models/Usuario.js";
import Pacientes from "../Models/Pacientes.js";
import Sucursal from "../Models/Sucursal.js"
import Doctor from "../Models/Doctor.js";
import Roles from "../Models/Roles.js"
import sequelize from "../Config/database.js";
import Personas from "../Models/Personas.js";
import DoctorHorarioSucursal from "../Models/DoctorHorarioSucursal.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken"
import { getCodigoSecuencia } from "./CodigosControlers.js";

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const { value, rolId } = req.query;

    // 1. Condiciones para la tabla Usuario (ej: el Rol)
    let userConditions = {};
    if (rolId) {
      userConditions.rolId = rolId;
    }

    // 2. Condiciones para la tabla Persona (ej: búsqueda por nombre/apellido)
    let personaConditions = {};
    if (value) {
      personaConditions[Op.or] = [
        { nombre: { [Op.iLike]: `%${value}%` } },
        { apellido: { [Op.iLike]: `%${value}%` } },
        { cedula: { [Op.iLike]: `%${value}%` } } // Opcional: buscar también por DNI
      ];
    }

    const users = await Usuario.findAll({
      where: userConditions,
      // Solo traemos los campos de acceso
      attributes: ["id", "usuario", "rolId", "estado"],
      include: [
        {
          model: Personas,
          // Si hay búsqueda por 'value', aplicamos el filtro aquí
          where: value ? personaConditions : null,
          attributes: ["nombre", "apellido", "cedula", "sexo", "tipoSangre", "telefono", "fechaNacimiento", "foto_url", "email"],
        },
        {
          model: Pacientes,
          attributes: ["alergias", "enfermedades", "numeroCarnet", "seguroMedico"]
        },
        {
          model: Doctor,
          attributes: ["codigo", "especialidadId"],
          include: [
            {
              model: DoctorHorarioSucursal,
              attributes: [
                "id",
                "diaSemana",
                "horaInicio",
                "horaFin",
                "sucursalId",
                "duracionCita",
                "maxPacientes",
                "esTiempoDescanso"
              ],
              // El include de Sucursal debe ir DENTRO de DoctorHorarioSucursal
              include: [
                {
                  model: Sucursal,
                  attributes: ["id", "nombre"]
                }
              ]
            }
          ]
        },
        {
          model: Roles,
          attributes: ["id", "nombre"],
        },
      ],
      order: [["id", "ASC"]],
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Crear usuario con validaciones y encriptación
export const createUser = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      nombre, apellido, telefono, cedula, fechaNacimiento,
      email, rolId, foto_url, tipoSangre, sexo, direccion,
      perfil, horariosData, codigo
    } = req.body;

    // 1. Validaciones básicas (Persona + Usuario)
    if (!email || !rolId || !nombre || !apellido || !cedula) {
      return res.status(400).json({ error: "Faltan campos obligatorios (nombre, apellido, cedula, email, rol)" });
    }

    // 2. Crear la Persona primero (La base de todo)
    // Nota: El DNI es único, si ya existe, Sequelize lanzará un error y saltará al catch
    const persona = await Personas.create({
      nombre,
      apellido,
      telefono,
      cedula,
      tipoSangre,
      sexo,
      direccion,
      email,
      fechaNacimiento
    }, { transaction: t });

    // 3. Encriptación de contraseña
    const hashedPassword = await bcrypt.hash("123456789", 10);


    //creamos el usuario
    const primeraLetra = nombre.trim().charAt(0).toLowerCase();
    const primerApellido = apellido.trim().split(" ")[0].toLowerCase();

    // usuario final
    let usuarioNuevo = primeraLetra + "." + primerApellido;

    // 4. Crear el Usuario vinculado a la Persona
    const user = await Usuario.create({
      personaId: persona.id, // FK vinculada a la persona creada arriba
      usuario: usuarioNuevo,
      email,
      password: hashedPassword,
      rolId,
      foto_url,
      estado: true,
      resetear: true
    }, { transaction: t });

    // 5. Lógica Dinámica de Perfiles (Doctor o Paciente)
    // Ahora los perfiles se vinculan también a la Persona (o al Usuario, según tu preferencia)
    // Lo más limpio es vincular el perfil a la PERSONA para que la historia médica siga al humano
    if (perfil) {
      if (rolId === 3) { // Paciente
        await Pacientes.create({
          personaId: persona.id,
          usuarioId: user.id,
          ...perfil
        }, { transaction: t });
      }
      else if (rolId === 2) {
        let codigoFinal = "";

        if (codigo === "") {
          codigoFinal = await getCodigoSecuencia(1, t); // pásale la transacción si aplica
        } else {
          codigoFinal = codigo;
        }

        // Doctor
        // 1. Guardamos la instancia creada para obtener el ID real
        const nuevoDoctor = await Doctor.create({
          personaId: persona.id,
          usuarioId: user.id,
          codigo: codigoFinal,
          ...perfil
        }, { transaction: t });

        // 2. Pasamos el ID de la instancia (nuevoDoctor.id) y la transacción
        await guardarHorariosDoctor(horariosData, nuevoDoctor.id, t);
      }
    }

    // 6. Confirmar cambios
    await t.commit();

    // Respuesta limpia (sin password)
    const { password: _, ...userData } = user.toJSON();
    res.status(201).json({
      message: "Registro exitoso",
      user: userData,
      persona: persona
    });

  } catch (error) {
    // Si algo falla, el rollback deshace TODO (Persona, Usuario y Perfil)
    await t.rollback();

    // Manejo de errores de duplicidad (Email o DNI)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: "El email o la cedula ya están registrados" });
    }

    res.status(500).json({ error: error.message });
  }
};

// Actualizar usuario por ID
export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      nombre, apellido, cedula, sexo, tipoSangre, telefono, email, fechaNacimiento,
      usuario, estado, rolId, perfil, horariosData
    } = req.body;


    // Iniciamos transacción (Ejemplo con un ORM genérico/Lógica SQL)
    // 1. Actualizar tabla Usuario (datos de cuenta)
    await Usuario.update({ usuario, estado, rolId }, { where: { id } });

    // 2. Actualizar tabla Persona (datos físicos/contacto)
    // Buscamos el personaId asociado a este usuario primero
    const userRow = await Usuario.findByPk(id);
    await Personas.update({
      nombre, apellido, cedula, sexo, tipoSangre, telefono, email, fechaNacimiento
    }, { where: { id: userRow.personaId } });

    // 3. Actualizar Perfil Dinámico (Paciente o Doctor)
    if (rolId === 2) { // Doctor
      const doctorExistente = await Doctor.findOne({ where: { usuarioId: id } });
      console.log("doctor: ", doctorExistente);

      await Doctor.update(
        {
          // PRIMER ARGUMENTO: Los datos a actualizar
          especialidadId: perfil.especialidadId,
          sucursalId: perfil.sucursalId,
          codigo: perfil.codigo
        },
        {
          // SEGUNDO ARGUMENTO: La condición
          where: { usuarioId: id }
        }
      );
      if (horariosData && horariosData.length > 0) {
        // Ejemplo: Borrar anteriores y crear nuevos (o usar tu lógica de sincronización)
        await DoctorHorarioSucursal.destroy({ where: { doctorId: doctorExistente.id } }); // Asumiendo que usas doctorId o usuarioId
        await DoctorHorarioSucursal.bulkCreate(
          horariosData.map(h => ({ ...h, doctorId: doctorExistente.id }))
        );
      }

    } else if (rolId === 3) { // Paciente
      // 1. Buscamos si ya existe el perfil de paciente
      const pacienteExistente = await Pacientes.findOne({ where: { usuarioId: id } });
      if (pacienteExistente) {
        // 2. Si existe, actualizamos
        await pacienteExistente.update({
          seguroMedico: perfil.seguroMedico,
          numeroCarnet: perfil.numeroCarnet,
          alergias: perfil.alergias,
          enfermedades: perfil.enfermedades
        });
      } else {
        res.status(400).json({ error: "Error no se encontro el paciente." });
      }
    }

    res.status(201).json({ msg: "Usuario y perfil actualizados correctamente" });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ error: error.errors.map((e) => e.message) });
    }
    res.status(500).json({ error: error.message });
  }
};

//Metodo para hacer login
export const login = async (req, res) => {

  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario y verificar si existe y está activo
    const user = await Usuario.findOne({
      where: {
        [Op.or]: [
          { usuario: email }
        ],
        estado: true
      },
      include: [
        {
          model: Personas,
          attributes: ["nombre", "apellido", "cedula", "telefono", "tipoSangre", "sexo"] // Traemos los datos de identidad
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado o inactivo." });
    }
    // 2. Verificar la contraseña usando el método que creamos en el modelo
    const passwordValido = await user.validarPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ msg: "Contraseña incorrecta." });
    }

    // 3. Crear el Token (JWT)
    // payload: datos que viajan en el token
    const payload = {
      id: user.id,
      rolId: user.rolId,
      personaId: user.personaId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'tu_clave_secreta', {
      expiresIn: '8h', // La sesión durará 8 horas
    });

    // 4. Actualizar último login (Opcional pero recomendado)
    user.ultimo_login = new Date();
    await user.save();

    // 5. Responder al cliente
    res.json({
      token,
      user: {
        id: user.id,
        usuario: user.usuario,
        email: user.email,
        rolId: user.rolId,
        // Accedemos a los datos a través del objeto Persona incluido
        nombre: user.Persona ? user.Persona.nombre : null,
        apellido: user.Persona ? user.Persona.apellido : null,
        dni: user.Persona ? user.Persona.dni : null,
        foto_url: user.foto_url
      }
    });

  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ error: error.errors.map((e) => e.message) });
    }
    res.status(500).json({ error: error.message });
  }
}

//
export const guardarHorariosDoctor = async (horariosData, doctorId, transaction) => {
  try {
    if (!horariosData || horariosData.length === 0) return;

    // Mapeamos el array que viene del frontend al formato de la DB
    const horariosParaInsertar = horariosData.map(h => ({
      doctorId: doctorId,
      sucursalId: h.sucursalId,
      diaSemana: h.diaSemana,
      horaInicio: h.horaInicio,
      horaFin: h.horaFin,
      maxPacientes: 10,
      // Si el frontend manda null, usamos 30 por defecto
      duracionCita: h.duracionCita || 30,
      activo: true
    }));

    // Insertamos todos de golpe usando la misma transacción
    await DoctorHorarioSucursal.bulkCreate(horariosParaInsertar, { transaction });

  } catch (error) {
    console.error("Error en guardarHorariosDoctor:", error);
    // Lanzamos el error para que el "t.rollback()" del catch principal lo capture
    throw error;
  }
};

// metodo para resetear contraseña
export const resetearPasswordAdmin = async (req, res) => {
  const { id } = req.params; // Viene de la URL
  const { nuevaPassword } = req.body; // Viene del body

  if (!id || id === 'nan') {
    return res.status(400).json({ error: "ID de usuario no válido" });
  }


  try {
    // 1. Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(nuevaPassword, salt);

    // 2. Actualizar en la base de datos
    const usuarioActualizado = await Usuario.update(
      { password: passwordHasheada },
      { where: { id: id } }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json({ msg: "Contraseña actualizada correctamente por el administrador" });
  } catch (error) {
    res.status(500).json({ msg: "Error al resetear la contraseña" });
  }
}; 