import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";


 const DoctorHorarioSucursal = sequelize.define("DoctorHorarioSucursal", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    doctorId: { type: DataTypes.INTEGER, allowNull: false },
    sucursalId: { type: DataTypes.INTEGER, allowNull: false },
    horarioId: { type: DataTypes.INTEGER, allowNull: false },
  });


export default DoctorHorarioSucursal;