import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Dias = sequelize.define("Dias", {
  dia_semana: { type: DataTypes.STRING, allowNull: false,  unique: true, },
  estado: {
    type: DataTypes.BOOLEAN, 
    allowNull: false,
  },
});

export default Dias;
