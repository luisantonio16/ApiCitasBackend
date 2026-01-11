import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Sucursal = sequelize.define("Sucursal", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: { type: DataTypes.STRING, allowNull: false },
  direccion: { type: DataTypes.TEXT },
  telefono: { type: DataTypes.STRING },
  estado: {
    type: DataTypes.BOOLEAN, 
    allowNull: false,
    defaultValue: false, 
  },
});

export default Sucursal;
