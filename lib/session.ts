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
  try {
    localStorage.removeItem("companyId");
    localStorage.removeItem("companyName");
  } catch {
    // ignore
  }
}

export const COMPANY_ID_KEY = "companyId";
export const COMPANY_NAME_KEY = "companyName";

export const COMPANY_CONTEXT_UPDATED = "company-context-updated";

export function setUserCompanyContext(companyId: string | null, companyName: string | null) {
  if (typeof document === "undefined") return;
  try {
    if (companyId != null) localStorage.setItem(COMPANY_ID_KEY, companyId);
    else localStorage.removeItem(COMPANY_ID_KEY);
    if (companyName != null) localStorage.setItem(COMPANY_NAME_KEY, companyName);
    else localStorage.removeItem(COMPANY_NAME_KEY);
    window.dispatchEvent(new CustomEvent(COMPANY_CONTEXT_UPDATED));
  } catch {
    // ignore
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
