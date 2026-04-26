import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";


const DoctorHorarioSucursal = sequelize.define(
  "DoctorHorarioSucursal",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sucursalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // ENUM es más seguro que TEXT para evitar errores de escritura
    diaSemana: {
      type: DataTypes.ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'),
      allowNull: false
    },
    // Duración promedio de la cita (en minutos)
    duracionCita: {
      type: DataTypes.INTEGER,
      defaultValue: 30, // 30 minutos por defecto
      allowNull: false
    },
    maxPacientes:{
       type:DataTypes.INTEGER,
       allowNull:true
    },
    // Por si el doctor toma un descanso (ej. Almuerzo de 12 a 1)
    esTiempoDescanso: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    horaInicio: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    horaFin: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
);


export default DoctorHorarioSucursal;