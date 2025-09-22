export const CONFIG: {
  PORT: number;
  MONGO_URI: string | undefined;
  MONGO_DB_NAME: string | undefined;
  NODE_ENV: string | undefined;
} = {
  PORT: Number(process.env.PORT || 3000),
  MONGO_URI: process.env.MONGO_URI,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME,
  NODE_ENV: process.env.NODE_ENV,
};
