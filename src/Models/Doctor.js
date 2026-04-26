import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Doctor = sequelize.define("Doctor", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  biografia: { type: DataTypes.TEXT },
  codigo: { type: DataTypes.STRING, allowNull:false, },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  especialidadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
});

export default Doctor;
