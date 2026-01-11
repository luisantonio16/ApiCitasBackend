import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";


const CitasHistorial = sequelize.define("CitasHistorial", {
  estado: {
    type: DataTypes.ENUM("pendiente", "confirmada", "cancelada"),
    allowNull: false,
  },
  citaId: { type: DataTypes.INTEGER, allowNull: false },  
  observacion: { type: DataTypes.TEXT }, 
}, { timestamps: true });

export default CitasHistorial;