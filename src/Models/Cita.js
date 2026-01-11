import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Cita = sequelize.define("Cita", {
   id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  horaInicio: { type: DataTypes.STRING, allowNull: false },
  horaFin: { type: DataTypes.STRING, allowNull: true },
  estado: {
    type: DataTypes.ENUM("Pendientes", "Confirmadas", "Rechazadas"),
    defaultValue: "pendiente",
  },
  motivo: { type: DataTypes.TEXT },
   doctorId: { type: DataTypes.INTEGER, allowNull: false },  
  pacienteId: { type: DataTypes.INTEGER, allowNull: false },  
  sucursalId: { type: DataTypes.INTEGER, allowNull: false }, 
  horarioDescripcion:{type:DataTypes.STRING, allowNull:true}
});

export default Cita;
