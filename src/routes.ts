/**
 * Rotas públicas que podem ser acessadas sem necessidade de autenticação
 * @type {string[]}
 */
export const publicRoutes = ["/", "/auth/new-verification"];

/**
 * Rotas de autenticação
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

/**
 * Prefixo para autenticação de rotas de API.
 * Rotas que começam com esse prefixo são usadas para propósitos de autenticação de API
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * Rota de redirecionamento padrão após a autenticação do usuário no sistema
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
