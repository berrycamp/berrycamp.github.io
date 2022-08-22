/**
 * The default port EVEREST DEBUG RC runs on.
 */
const DEFAULT_EVEREST_PORT = 32270;

/**
 * Teleport to a room in everest.
 */
export const teleport = async (port: number | undefined, params: string): Promise<void> => {
  try {
    const baseUrl: string = `http://localhost:${port ?? DEFAULT_EVEREST_PORT}`;
    await fetch(`${baseUrl}/tp${params}`, {mode: "no-cors"});
  } catch (e) {
    // Do nothing.
  }
}