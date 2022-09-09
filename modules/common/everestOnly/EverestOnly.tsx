import {FC, PropsWithChildren} from "react";
import {useCampContext} from "~/modules/provide/CampContext";

/**
 * Show when everest mode is enabled.
 */
export const EverestOnly: FC<PropsWithChildren<unknown>> = ({children}) => {
  const {settings: {everest}} = useCampContext();
  if (!everest) {
    return null;
  }

  return (
    <>{children}</>
  );
}