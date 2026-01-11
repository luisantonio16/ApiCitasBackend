import  Sequelize  from "sequelize";
import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port:Number(process.env.DB_PORT),
    logging: false, // cambia a true si quieres ver las queries SQL en consola
  }
);


export default sequelize;
