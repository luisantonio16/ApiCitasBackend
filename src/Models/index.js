import sequelize from "../Config/database.js";

import Usuario from "./Usuario.js";
import Sucursal from "../Models/Sucursal.js";
import Doctor from "./Doctor.js";
import DoctorSucursal from "./DoctorSucursal.js";
import Horario from "./Horario.js";
import Cita from "./Cita.js";
import Especialidad from "./Especialidad.js";
import CitasHistorial from "./CitasHistorial.js";
import Codigos from "./Codigos.js";
import DoctorHorarioSucursal from "./DoctorHorarioSucursal.js";
import Dias from "./Dias.js";
import Pacientes from "./Pacientes.js";
import Roles from "./Roles.js";

// 🔗 Relaciones
Doctor.belongsToMany(Sucursal, { through: DoctorSucursal });
Sucursal.belongsToMany(Doctor, { through: DoctorSucursal });

Sucursal.hasMany(Horario, { foreignKey: "sucursalId" });
Horario.belongsTo(Sucursal, { foreignKey: "sucursalId" });

Especialidad.hasMany(Doctor, { foreignKey: "especialidadId" });
Doctor.belongsTo(Especialidad, { foreignKey: "especialidadId" });

Doctor.hasMany(Cita ,{foreignKey: "doctorId"});
Cita.belongsTo(Doctor, {foreignKey: "doctorId"});

Sucursal.hasMany(Cita, {foreignKey: "sucursalId"});
Cita.belongsTo(Sucursal, {foreignKey: "sucursalId"});

Pacientes.hasMany(Cita,{foreignKey:"pacienteId"});
Cita.belongsTo(Pacientes,{foreignKey:"pacienteId"});

// CitasHistorial.belongsTo(Cita, { foreignKey: "citaId" });
// Cita.hasMany(CitasHistorial, { foreignKey: "citaId" });

//relaciones sucursal, doctor y horario
DoctorHorarioSucursal.belongsTo(Doctor, { foreignKey: "doctorId" });
DoctorHorarioSucursal.belongsTo(Sucursal, { foreignKey: "sucursalId" });
DoctorHorarioSucursal.belongsTo(Horario, { foreignKey: "horarioId" });

//Relación: un día tiene muchos horarios
Dias.hasMany(Horario, { foreignKey: "diaId" });
Horario.belongsTo(Dias, { foreignKey: "diaId" });

Doctor.hasMany(DoctorHorarioSucursal, { foreignKey: "doctorId" });
Sucursal.hasMany(DoctorHorarioSucursal, { foreignKey: "sucursalId" });
Horario.hasMany(DoctorHorarioSucursal, { foreignKey: "horarioId" });

//relaciones de pacientes de usuario y pacientes
Usuario.hasOne(Pacientes, { foreignKey: "usuarioId" });
Pacientes.belongsTo(Usuario, { foreignKey: "usuarioId" });

//usuario relacion con rol
Usuario.belongsTo(Roles,{foreignKey: "rolId"});
Roles.hasMany(Usuario,{foreignKey: "rolId"});
Usuario.hasOne(Doctor, { foreignKey: "usuarioId" });



export { sequelize, Usuario, Sucursal, Doctor, DoctorSucursal, Horario, Cita, Especialidad, Codigos, DoctorHorarioSucursal, Dias, Pacientes, Roles };
export default sequelize;  
