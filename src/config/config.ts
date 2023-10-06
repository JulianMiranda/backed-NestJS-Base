/**
 * PUERTO
 */
export const PORT = process.env.PORT || 5001;

/**
 * Database connection
 */
export const MONGO_CONNECTION =
  process.env.MONGO_CONNECTION ||
  'mongodb+srv://tyto:cg4aHUFHlwCuQTnS@cluster0.izd5twr.mongodb.net/carapp';
//'mongodb+srv://tyto:<password>@cluster0.emi8e.mongodb.net/?retryWrites=true&w=majority';

export const DEFAULT_API_WELCOME_MESSAGE =
  process.env.DEFAULT_API_WELCOME_MESSAGE || 'CarApp Envios!';
