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
  personaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },

  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  alergias: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  enfermedades: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  seguroMedico: {
    type: DataTypes.STRING, // Nombre de la aseguradora
    allowNull: true,
  },
  numeroCarnet: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactoEmergencia: {
    type: DataTypes.STRING, // "Nombre - Teléfono"
    allowNull: true,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

export default Pacientes;
