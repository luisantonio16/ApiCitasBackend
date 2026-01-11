import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";

const Horario = sequelize.define("Horario", {
  dia_semana: { type: DataTypes.STRING, allowNull: false },
  hora_inicio: { type: DataTypes.STRING, allowNull: false },
  hora_fin: { type: DataTypes.STRING, allowNull: false },
  sucursalId: { type: DataTypes.INTEGER, allowNull: false }, 
      estado: {
    type: DataTypes.BOOLEAN, 
    allowNull: false,
    defaultValue: true, 
  },
  diaId: { type: DataTypes.INTEGER, allowNull: true }, 
});

export default Horario;
