/**
 * Cookie de sessão no domínio do frontend para o middleware proteger rotas.
 * A API define access_token no domínio dela; o middleware do Next só enxerga cookies deste domínio.
 */
const SESSION_COOKIE = "app_session";
const SESSION_MAX_AGE_DAYS = 7;

export function setSessionCookie() {
  if (typeof document === "undefined") return;
  const maxAge = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
