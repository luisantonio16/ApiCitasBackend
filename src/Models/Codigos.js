import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Codigos = sequelize.define("Codigos", {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  documento: { type: DataTypes.STRING, allowNull: false },
  serie: { type: DataTypes.STRING, allowNull: false },
  numero: { type: DataTypes.STRING, allowNull: false },
   estado: {
    type: DataTypes.BOOLEAN, 
    allowNull: false,
    defaultValue: true, 
  },
});

export default Codigos;
