/**
 * Teleport to a room in everest.
 */
export const teleport = async (port: number | undefined, params: string): Promise<void> => {
  try {
    const baseUrl: string = `http://localhost:${port ?? 32270}`;
    await fetch(`${baseUrl}/tp${params}`, {mode: "no-cors"});
  } catch (e) {
    // Do nothing.
  }
}