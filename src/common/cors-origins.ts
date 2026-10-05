// Orígenes permitidos por CORS, para la API REST y para los WebSockets.
// Prioridad: CORS_ORIGINS (separados por comas) > FRONTEND_URL > localhost.
export function getAllowedOrigins(): string[]
{
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173';
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}
