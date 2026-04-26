import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Personas = sequelize.define("Personas", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    apellido: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
     cedula: {
        type: DataTypes.STRING(20),
        allowNull: true
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
       direccion: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
     email: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
            isEmail: { msg: "Debe ser un email válido" },
            notEmpty: { msg: "El email es obligatorio" },
        },
    },
        foto_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },


});

export default Personas;