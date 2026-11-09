const TOKEN_KEY = "admin-token";

function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const hasAdminToken = () => Boolean(readToken());

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Sin almacenamiento disponible no hay sesión que limpiar.
  }
}

/** Devuelve true si la contraseña fue aceptada por el servidor. */
export async function loginAdmin(password: string): Promise<boolean> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return false;

  const { token } = await res.json();
  sessionStorage.setItem(TOKEN_KEY, token);
  return true;
}

export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = readToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    clearAdminToken();
    window.location.reload();
  }
  return res;
}
