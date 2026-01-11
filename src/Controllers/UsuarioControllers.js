import bcrypt from "bcryptjs";
import Usuario from "../Models/Usuario.js";
import { Op } from "sequelize";

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await Usuario.findAll({
      attributes: ["id", "nombre", "apellido", "usuario", "email"],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear usuario con validaciones y encriptación
export const createUser = async (req, res) => {
  try {
    const { nombre, apellido, usuario, email, password } = req.body;
    // Validar campos manualmente
    if (!nombre || !apellido || !usuario || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verificar si el email ya existe
    const existeEmail = await Usuario.findOne({ where: { email } });
    if (existeEmail) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Verificar si el usuario ya existe
    const existeUsuario = await Usuario.findOne({ where: { usuario } });
    if (existeUsuario) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Usuario.create({
      nombre,
      apellido,
      usuario,
      email,
      password: hashedPassword,
    });

    // No devolver la contraseña
    const { password: _, ...userData } = user.toJSON();

    res.status(201).json(userData);
  } catch (error) {
    // Validaciones de Sequelize
    if (error.errors) {
      return res.status(400).json({ error: error.errors.map((e) => e.message) });
    }
    res.status(500).json({ error: error.message });
  }
};

// Actualizar usuario por ID
export const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { nombre, apellido, usuario, email, password } = req.body;

    const user = await Usuario.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Validar usuario único
    if (usuario) {
      const existeUsuario = await Usuario.findOne({
        where: { usuario, id: { [Op.ne]: userId } },
      });
      if (existeUsuario) return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Validar email único
    if (email) {
      const existeEmail = await Usuario.findOne({
        where: { email, id: { [Op.ne]: userId } },
      });
      if (existeEmail) return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Actualizar campos
    if (nombre) user.nombre = nombre;
    if (apellido) user.apellido = apellido;
    if (usuario) user.usuario = usuario;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    const { password: _, ...userData } = user.toJSON();
    res.json(userData);
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ error: error.errors.map((e) => e.message) });
    }
    res.status(500).json({ error: error.message });
  }
};
