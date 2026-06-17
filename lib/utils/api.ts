export async function readApiError(
  response: Response,
  fallback: string
): Promise<string> {
  const text = await response.text();

  try {
    const data = JSON.parse(text) as { error?: string };
    return data.error ?? fallback;
  } catch {
    if (text.startsWith("Internal Server Error")) {
      return "The server hit an error. Try restarting the dev server with npm run dev.";
    }
    return text || fallback;
  }
}
