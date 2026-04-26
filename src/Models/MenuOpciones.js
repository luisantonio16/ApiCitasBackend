import { DataTypes } from "sequelize";
import sequelize from "../Config/database.js";



const MenuOpciones = sequelize.define("MenuOpciones",{
    titulo: DataTypes.STRING,
    ruta: DataTypes.STRING,
    Rol:DataTypes.INTEGER,
   icono: DataTypes.STRING, // Guardaremos el nombre del icono, ej: "HomeOutlined"
    orden: DataTypes.INTEGER, // Para decidir qué opción va primero
    parent_id: {
      type: DataTypes.INTEGER,
      allowDefault: null
    }
})

export default MenuOpciones;