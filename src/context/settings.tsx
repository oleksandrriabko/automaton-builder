import React, {
  createContext,
  FC,
  ReactNode,
  useState,
  useContext,
  useEffect,
} from "react";
import { EMPTY_EDGE_LABEL_SIGN, AUTOMATA_TYPE } from "../utils/constants";
import { usePrevious } from "../hooks";

interface ISettingsState {
  defaultEmptyEdge: EMPTY_EDGE_LABEL_SIGN;
  automataType: AUTOMATA_TYPE;
}

const defaultSettingsState: ISettingsState = {
  defaultEmptyEdge: EMPTY_EDGE_LABEL_SIGN.LAMBDA,
  automataType: AUTOMATA_TYPE.FINITE,
};

type SettingsContextType = {
  settingsState: ISettingsState;
  previousSettingsState: ISettingsState | undefined;
  updateSettingsState: (key: string, value: any) => void;
};

/** Retrieving settings from localstorage */
const lsSetttigs = localStorage.getItem("settings");
const defaultSettings = lsSetttigs
  ? JSON.parse(lsSetttigs)
  : defaultSettingsState;

const SettingsContext = createContext<SettingsContextType>({
  previousSettingsState: undefined,
  updateSettingsState: () => console.warn("No provider for settings context"),
  settingsState: defaultSettings,
});

interface ISettingsProvider {
  children: ReactNode;
}

export const SettingsProvider: FC<ISettingsProvider> = ({ children }) => {
  const [settingsState, setSettingsState] =
    useState<ISettingsState>(defaultSettings);

  const previousSettingsState = usePrevious(settingsState);

  const handleUpdateSettingState = (key: string, value: any): void => {
    setSettingsState({
      ...settingsState,
      [key]: value,
    });
  };

  const handleLsSettingsSave = (): void => {
    localStorage.setItem("settings", JSON.stringify(settingsState));
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleLsSettingsSave);

    return () => {
      window.removeEventListener("beforeunload", handleLsSettingsSave);
    };
  });

  return (
    <SettingsContext.Provider
      value={{
        settingsState,
        previousSettingsState,
        updateSettingsState: handleUpdateSettingState,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
