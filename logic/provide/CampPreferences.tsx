import {FC, Fragment, useEffect} from "react";
import {useCampContext} from "./CampContext";

export const CampPreferencesProvider: FC = ({children}) => {
  const {settings, setView, toggleTheme, toggleSubrooms} = useCampContext();

  /**
   * Load user preferences.
   */
  useEffect(() => {
    setView(window.localStorage.getItem("view") === "list" ? "list" : "grid");
    const theme: "light" | "dark" = document.documentElement.style.getPropertyValue("--initial-theme") === "dark" ? "dark" : "light";
    if (theme !== settings.theme) {
      toggleTheme();
    }

    const subrooms: boolean = window.localStorage.getItem("subrooms") !== "false";
    if (subrooms !== settings.subrooms) {
      toggleSubrooms();
    }
  }, [])

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