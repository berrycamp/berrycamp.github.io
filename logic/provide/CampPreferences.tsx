import {FC, Fragment, useEffect} from "react";
import {ICampSettings, useCampContext} from "./CampContext";

const THEME_KEY = "theme";
const HIDE_SUBROOMS_KEY = "hideSubrooms";
const LIST_MODE_KEY = "listMode";
const PORT_KEY = "port";

export const CampPreferencesProvider: FC = ({children}) => {
  const {settings, setSettings} = useCampContext();

  /**
  * Retrieve and validate user settings from localstorage.
  */
  useEffect(() => {
    const storageSettings: ICampSettings = {};

    const theme: string | null = localStorage.getItem(THEME_KEY);
    if (theme !== null) {
      storageSettings.theme = theme === "dark" ? "dark" : "light";
    }

    const listMode: string | null = localStorage.getItem(LIST_MODE_KEY);
    if (listMode !== null) {
      storageSettings.listMode = true;
    }

    const hideSubrooms: string | null = localStorage.getItem(HIDE_SUBROOMS_KEY);
    if (hideSubrooms !== null) {
      storageSettings.hideSubrooms = true;
    }

    const port: string | null = localStorage.getItem(PORT_KEY);
    if (port !== null) {
      storageSettings.port = Number(port);
    }

    setSettings(storageSettings);
  }, [setSettings]);

  /**
   * Set user settings in localstorage.
   */
  useEffect(() => {
    [THEME_KEY, HIDE_SUBROOMS_KEY, LIST_MODE_KEY, PORT_KEY].forEach(key => localStorage.removeItem(key));

    const {theme, listMode, hideSubrooms, port} = settings;

    if (theme !== undefined) {
      localStorage.setItem(THEME_KEY, theme);
    }

    if (listMode) {
      localStorage.setItem(LIST_MODE_KEY, String(true));
    }

    if (hideSubrooms) {
      localStorage.setItem(HIDE_SUBROOMS_KEY, String(true));
    }

    if (port !== undefined) {
      localStorage.setItem(PORT_KEY, String(port));
    }
  }, [settings]);

  return (
    <Fragment>
      {children}
    </Fragment>
  )
}