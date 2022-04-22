import {FC, Fragment, useEffect} from "react";
import {useCampContext} from "./CampContext";

export const CampPreferencesProvider: FC = ({children}) => {
  const {settings, toggleView, toggleTheme, toggleSubrooms, setSettings} = useCampContext();

  /**
   * Load user preferences.
   */
  useEffect(() => {
    setSettings({
      theme: document.documentElement.style.getPropertyValue("--initial-theme") === "dark" ? "dark" : "light",
      view: window.localStorage.getItem("view") === "list" ? "list" : "grid",
      subrooms: window.localStorage.getItem("subrooms") !== "false",
      cozy: false,
    });
  }, [setSettings]);

  /**
   * Get the user or media mode preference. Default to light if not provided.
   */
  useEffect(() => {
    window.localStorage.setItem("theme", settings.theme);
    if (settings.theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [settings.theme])

  /**
   * Set the view in local storage.
   */
  useEffect(() => {
    window.localStorage.setItem("view", settings.view);
  }, [settings.view]);

  /**
   * Set the subrooms in local storage.
   */
  useEffect(() => {
    window.localStorage.setItem("subrooms", String(settings.subrooms))
  }, [settings.subrooms]);

  return (
    <Fragment>
      {children}
    </Fragment>
  )
}