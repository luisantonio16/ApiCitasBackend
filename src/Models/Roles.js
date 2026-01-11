import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Roles = sequelize.define("Roles", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },

      descripcion: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
    
});

export default Roles;