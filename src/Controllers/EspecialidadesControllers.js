import Especialidad from "../Models/Especialidad.js";
import { Op } from "sequelize";



//Obtener las Especialidades 
export const GetEspecialidades = async (req, res) => {
    try {
        let {  nombre } = req.query;
         // Filtros dinámicos
    const where = {};

    if (nombre) {
      where.nombre = {
        [Op.iLike]: `%${nombre}%`, // Postgres (case-insensitive)
        // Para MySQL usa [Op.like]
      };
    }
    
        const especialidad = await Especialidad.findAll({
            attributes: ["id", "nombre","descripcion", "estado"],
            where,
            order: [["id", "ASC"]],
        });
        res.json(especialidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Crear Especialidades
export const PostEspecialidades = async (req, res) => {
    try {
        const { nombre, estado,descripcion } = req.body;
        //  Validación básica
        if (!nombre) {
            return res.status(400).json({ error: "Nombre de la especialidad es obligatorios" });
        }

        const nuevaEspecialidad = await Especialidad.create({
            nombre,
            estado,
            descripcion
        });

        res.status(200).json({
            message: "Especialidad creada con éxito",
            especialidad: nuevaEspecialidad,
        });

    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


//Actualizar especialidades
export const PutEspecialidades = async (req, res) => {
    try {
        const { id } = req.params;
         const { nombre, estado, descripcion } = req.body;

        //  Validar si llega el id
        if (!id) {
            return res.status(400).json({ error: "El ID de la sucursal es obligatorio" });
        };

            //  Buscar la sucursal
    const especialidad = await Especialidad.findByPk(id);

    if (!especialidad) {
      return res.status(404).json({ error: "Especialidad no encontrada" });
    }

      //  Actualizar los campos (solo los que lleguen en el body)
    especialidad.nombre = nombre !== undefined ? nombre : especialidad.nombre;
    especialidad.estado = estado !== undefined ? estado : especialidad.estado;
    especialidad.descripcion = descripcion != undefined ? descripcion : especialidad.descripcion;

     await especialidad.save();

      res.status(200).json({
      message: "Especialidad actualizada con éxito",
      especialidad,
    });

    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }

}

//