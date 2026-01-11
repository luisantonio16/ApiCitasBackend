import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Doctor = sequelize.define("Doctor", {
   id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
  nombre: { type: DataTypes.STRING, allowNull: false },
  apellido: { type: DataTypes.STRING, allowNull: false },
  telefono: { type: DataTypes.STRING },
  biografia: { type: DataTypes.TEXT },
  codigo:{ type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
   foto_url: {
    type: DataTypes.TEXT, // aquí guardas la URL o ruta de la foto
    allowNull: true,
  },
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
});

export default Doctor;
