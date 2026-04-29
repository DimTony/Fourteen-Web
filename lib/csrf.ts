export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function waitForCsrfToken(maxAttempts = 10): Promise<string> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkToken = () => {
      const token = getCsrfToken();
      if (token) {
        resolve(token);
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        reject(new Error("CSRF token not found after max attempts"));
        return;
      }

      // Wait 100ms before retrying
      setTimeout(checkToken, 100);
    };

    checkToken();
  });
}
