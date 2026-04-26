import sequelize from "../Config/database.js";
import MenuOpciones from "../models/MenuOpciones.js";


export const getMenuDinamico = async (req, res) => {
  const { id } = req.params; 
 
  try {
    const menu = await MenuOpciones.findAll({
      where: { 
        Rol: id, 
        parent_id: null // Solo traer los padres al primer nivel
      },
      include: [{
        model: MenuOpciones,
        as: 'subItems',
        where: { Rol: id }, // Los hijos también deben ser del mismo rol
        required: false // Por si el padre no tiene hijos
      }],
      order: [['orden', 'ASC']]
    });

    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error al cargar el menú" });
  }
};