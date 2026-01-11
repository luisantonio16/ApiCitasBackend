import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Especialidad = sequelize.define("Especialidad", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "El nombre es obligatorio" },
    },
  },
   descripcion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    estado: {
    type: DataTypes.BOOLEAN, 
    allowNull: false,
    defaultValue: false, 
  },

});

export default Especialidad;