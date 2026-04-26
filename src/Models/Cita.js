import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Cita = sequelize.define("Cita", {
   id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  horaInicio: { type: DataTypes.TIME, allowNull: false },
  horaFin: { type: DataTypes.TIME, allowNull: true },
 estado: {
  type: DataTypes.ENUM("Pendiente", "Confirmada", "Rechazada", "Cancelada", "Completada"),
  defaultValue: "Pendiente",
},
  motivo: { type: DataTypes.TEXT },
   motivoCancelacion: { type: DataTypes.TEXT },
    asistio: {
    type: DataTypes.BOOLEAN,
    defaultValue: null,
  },
   doctorId: { type: DataTypes.INTEGER, allowNull: false },  
  pacienteId: { type: DataTypes.INTEGER, allowNull: false },  
  sucursalId: { type: DataTypes.INTEGER, allowNull: false }, 
  horarioDescripcion:{type:DataTypes.STRING, allowNull:true}
});

export default Cita;
