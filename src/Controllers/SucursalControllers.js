import { Sucursal } from "../Models/index.js";
import { Op } from "sequelize";


// Obtener todas las sucursales
export const getSucursales = async (req, res) => {
  try {
    // Paginación
    let { page, limit, estado, nombre } = req.query;

    page = parseInt(page) || 1;     // Página actual
    limit = parseInt(limit) || 10;  // Registros por página
    const offset = (page - 1) * limit;

    // Filtros dinámicos
    const where = {};

    if (estado !== undefined) {
      where.estado = estado === "true"; // convierte string "true"/"false" a boolean
    }

    if (nombre) {
      where.nombre = {
        [Op.iLike]: `%${nombre}%`, // Postgres (case-insensitive)
        // Para MySQL usa [Op.like]
      };
    }

    //  Consulta con filtros + paginación
    const { count, rows } = await Sucursal.findAndCountAll({
      attributes: ["id", "nombre", "direccion", "telefono", "estado"],
      where,
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      sucursales: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//agregar sucursal
export const AddSucursal = async (req, res) => {
  try {
    const { nombre, direccion, telefono, estado } = req.body;

    // Validación básica
    if (!nombre || !direccion) {
      return res.status(400).json({ error: "Nombre y dirección son obligatorios" });
    }

    //  Crear la sucursal
    const nuevaSucursal = await Sucursal.create({
      nombre,
      direccion,
      telefono,
      estado: estado !== undefined ? estado : true, // por defecto activa
    });

    res.status(200).json({
      message: "Sucursal creada con éxito",
      sucursal: nuevaSucursal,
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// actualizar sucursal
export const updateSucursal = async (req, res) => {
  try {
    const { id } = req.params; // id de la sucursal desde la URL
    const { nombre, direccion, telefono, estado } = req.body;

    //  Validar si llega el id
    if (!id) {
      return res.status(400).json({ error: "El ID de la sucursal es obligatorio" });
    }

    //  Buscar la sucursal
    const sucursal = await Sucursal.findByPk(id);

    if (!sucursal) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }

    //  Actualizar los campos (solo los que lleguen en el body)
    sucursal.nombre = nombre !== undefined ? nombre : sucursal.nombre;
    sucursal.direccion = direccion !== undefined ? direccion : sucursal.direccion;
    sucursal.telefono = telefono !== undefined ? telefono : sucursal.telefono;
    sucursal.estado = estado !== undefined ? estado : sucursal.estado;

    await sucursal.save();

    res.status(200).json({
      message: "Sucursal actualizada con éxito",
      sucursal,
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Cambiar estado de sucursal
export const toggleEstadoSucursal = async (req, res) => {
  const { id } = req.params;
  try {
    const sucursal = await Sucursal.findByPk(id);

    if (!sucursal) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }

    sucursal.estado = !sucursal.estado; // alterna true/false
    await sucursal.save();

    res.json({ message: "Estado actualizado", sucursal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}