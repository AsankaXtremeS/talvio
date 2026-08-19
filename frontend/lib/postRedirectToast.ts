export type RedirectToastPayload = {
  message: string;
  tone?: "success" | "error";
};

const REDIRECT_TOAST_KEY = "talvio:redirect-toast";

export function setRedirectToast(payload: RedirectToastPayload): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(REDIRECT_TOAST_KEY, JSON.stringify(payload));
}

export function consumeRedirectToast(): RedirectToastPayload | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(REDIRECT_TOAST_KEY);
  if (!raw) return null;

  window.sessionStorage.removeItem(REDIRECT_TOAST_KEY);

  try {
    const parsed = JSON.parse(raw) as RedirectToastPayload;
    if (!parsed?.message) return null;
    return parsed;
  } catch {
    return null;
  }
}
