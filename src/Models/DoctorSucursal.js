import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const DoctorSucursal = sequelize.define("DoctorSucursal", {
  // relación muchos a muchos entre doctor y sucursal
}, { timestamps: false });

export default DoctorSucursal;
