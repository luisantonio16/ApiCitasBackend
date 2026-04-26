import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const DoctorSucursal = sequelize.define("DoctorSucursal", {
  // relación muchos a muchos entre doctor y sucursal
   duracionCitaMinutos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
  },
}, { timestamps: false });

export default DoctorSucursal;
