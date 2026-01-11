import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";


const Pacientes = sequelize.define("Pacientes", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    nombres: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: "El nombre es obligatorio" },
        },
    },
    apellidos: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: "El apellido es obligatorio" },
        },
    },
    cedula: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: { msg: "la cedula es obligatorio" },
        },
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: { msg: "El telefono es obligatorio" },
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: "Debe ser un email válido" },
            notEmpty: { msg: "El email es obligatorio" },
        },
    },
    alergias: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tipoSangre: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sexo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
     fechaNacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

    foto_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
     estado: {
    type: DataTypes.BOOLEAN, 
    allowNull: false,
    defaultValue: false, 
  },
});

export default Pacientes;
