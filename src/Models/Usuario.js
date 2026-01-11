import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Usuario = sequelize.define("Usuarios", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: "Debe ser un email válido" },
      notEmpty: { msg: "El email es obligatorio" },
    },
  },
   usuario: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            notEmpty: { msg: "El usuario es obligatorio" },
        },
    },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "La contraseña es obligatoria" },
      len: {
        args: [6, 100],
        msg: "La contraseña debe tener al menos 6 caracteres",
      },
    },
  },
  foto_url: {
    type: DataTypes.TEXT, // aquí guardas la URL o ruta de la foto
    allowNull: true,
  },
});

export default Usuario;
