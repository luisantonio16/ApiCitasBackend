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
import MenuOpciones from "./MenuOpciones.js";
import Personas from "./Personas.js";

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

//Relación: un día tiene muchos horarios
Dias.hasMany(Horario, { foreignKey: "diaId" });
Horario.belongsTo(Dias, { foreignKey: "diaId" });

Doctor.hasMany(DoctorHorarioSucursal, { foreignKey: "doctorId" });
Sucursal.hasMany(DoctorHorarioSucursal, { foreignKey: "sucursalId" });

//relaciones de pacientes de usuario y pacientes
Usuario.hasOne(Pacientes, { foreignKey: "usuarioId" });
Pacientes.belongsTo(Usuario, { foreignKey: "usuarioId" });

//usuario relacion con rol
Usuario.belongsTo(Roles,{foreignKey: "rolId"});
Roles.hasMany(Usuario,{foreignKey: "rolId"});
Usuario.hasOne(Doctor, { foreignKey: "usuarioId" });

//Menu
// Relación recursiva: Un menú puede tener muchos submenús
MenuOpciones.hasMany(MenuOpciones, { 
  as: 'subItems', 
  foreignKey: 'parent_id' 
});

// Un submenú pertenece a un padre
MenuOpciones.belongsTo(MenuOpciones, { 
  as: 'padre', 
  foreignKey: 'parent_id' 
});

//relacion de personas a usuarios
//Un Usuario pertenece a una Persona
Usuario.belongsTo(Personas, { foreignKey: 'personaId' });
//Una Persona tiene un Usuario
Personas.hasOne(Usuario, { foreignKey: 'personaId' });

//relacion paciente y persona
Pacientes.belongsTo(Personas, { foreignKey: 'personaId' });
Personas.hasOne(Pacientes, { foreignKey: 'personaId' });

//relacion Doctor y persona
Doctor.belongsTo(Personas, { foreignKey: 'personaId' });
Personas.hasOne(Doctor, { foreignKey: 'personaId' });

// Si el Doctor pertenece a un Usuario
Usuario.hasOne(Doctor, { foreignKey: 'usuarioId' });
Doctor.belongsTo(Usuario, { foreignKey: 'usuarioId' });

export { sequelize, Usuario, Sucursal, Doctor, DoctorSucursal, Horario, Cita, Especialidad, Codigos, DoctorHorarioSucursal, 
  Dias, Pacientes, Roles, MenuOpciones, Personas};
export default sequelize;  
