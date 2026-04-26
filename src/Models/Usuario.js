import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";
import bcrypt from "bcryptjs";

const Usuario = sequelize.define("Usuarios", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  personaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
  rolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }, 
  resetear: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true,
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
});


Usuario.prototype.validarPassword = async function (passwordEnviado) {
  return await bcrypt.compare(passwordEnviado, this.password);
};


export default Usuario;
