import sequelize from "../Config/database.js";
import  Codigos  from "../Models/Codigos.js";




//Creamos el get que devuelva la secuensia del numero depediendo el id

export const getCodigoSecuencia = async(id) =>{
  const t = await sequelize.transaction();

  try {
    // 1️Obtener y bloquear el registro para esta transacción
    const registro = await Codigos.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE, // evita que otro proceso lea el mismo registro
    });

    if (!registro) throw new Error('Código no encontrado');

    const { serie, numero } = registro;

    const codigoGenerado = `${serie}${numero}`;
    const nuevoNumero = (parseInt(numero, 10) + 1)
      .toString()
      .padStart(numero.length, '0');

    await registro.update(
      { numero: nuevoNumero, updatedAt: new Date() },
      { transaction: t }
    );

    await t.commit();

    return codigoGenerado;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}