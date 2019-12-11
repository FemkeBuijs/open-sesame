import dotenv from 'dotenv';
dotenv.config();

const databaseConfig = () => {
  const config = {
     host: process.env.DB_HOST,
     user: process.env.MYSQL_USER,
     password: process.env.MYSQL_PASSWORD,
     database: process.env.MYSQL_DATABASE,
  }
  return config;
};

export default databaseConfig();
