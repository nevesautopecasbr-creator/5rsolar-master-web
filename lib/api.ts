const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function isLocalHost(hostname: string) {
  return LOCAL_HOSTS.has(hostname);
}

export function getApiBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const windowBase = `${window.location.protocol}//${window.location.hostname}:3001`;
    if (envUrl) {
      try {
        const envHost = new URL(envUrl).hostname;
        if (isLocalHost(envHost) && !isLocalHost(window.location.hostname)) {
          return windowBase;
        }
      } catch {
        // Ignore invalid env URL and fall back to window base.
        return windowBase;
      }
      return envUrl;
    }
    return windowBase;
  }
  if (envUrl) {
    return envUrl;
  }
  return "http://localhost:3001";
}

let refreshPromise: Promise<Response> | null = null;

export async function apiFetch(
  input: string,
  init: RequestInit = {},
  retry = true,
): Promise<Response> {
  const apiBase = getApiBaseUrl();
  const companyId =
    typeof window !== "undefined" ? localStorage.getItem("companyId") : null;
  const response = await fetch(`${apiBase}${input}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(companyId ? { "x-company-id": companyId } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (response.status === 401 && retry) {
    if (!refreshPromise) {
      refreshPromise = fetch(`${apiBase}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      }).finally(() => {
        refreshPromise = null;
      });
    }
    const refresh = await refreshPromise.catch(() => null);
    if (refresh?.ok) {
      return apiFetch(input, init, false);
    }
  }

  return response;
}
