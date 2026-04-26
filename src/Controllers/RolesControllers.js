
import  Roles  from "../Models/Roles.js";


// Obtener todos los Roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Roles.findAll({
      attributes: ["id", "nombre", "descripcion"],
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
