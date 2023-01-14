/**
 * The default port EVEREST DEBUG RC runs on.
 */
const DEFAULT_EVEREST_URL: string = "http://localhost:32270";

const DEFAULT_INIT: RequestInit = {
  /**
   * Not hitting the same origin, we can't rely on cors support.
   */
  mode: "no-cors",
}

/**
 * Teleport to a room in everest.
 */
export const teleport = async ({
  url = DEFAULT_EVEREST_URL,
  params
} : {
  url?: string | undefined,
  params: string,
}): Promise<void> => {
  try {
    await fetch(`${url}/tp${params}`, DEFAULT_INIT);
  } catch (e) {
    // Do nothing.
  }
}