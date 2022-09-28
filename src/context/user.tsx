import React, {
  createContext,
  FC,
  ReactNode,
  useState,
  useContext,
  useEffect,
} from "react";
import { IUser } from "../types";
import { ee } from '../utils/emitter';


interface IUserState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const defaultUserState: IUserState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

type UserContextType = {
  userState: IUserState;
  updateUserState: (updatedState: any) => void;
  handleLsUserStateSave: (stateValue: IUserState) => void;
};

/** Retrieving tokens from localstorage */
function getStateFromLocalstorage(): IUserState {
  const userState = localStorage.getItem("userState");
  return userState ? JSON.parse(userState) : defaultUserState;
}

const defaultUser = getStateFromLocalstorage();

const UserContext = createContext<UserContextType>({
  updateUserState: () => console.warn("No provider for settings context"),
  userState: defaultUser,
  handleLsUserStateSave: () => console.warn("No provider for settings context"),
});

interface IUserProvider {
  children: ReactNode;
}

export const UserProvider: FC<IUserProvider> = ({ children }) => {
  const [userState, setUserState] = useState<IUserState>(defaultUser);

  const handleUpdateUserState = (updatedState: any): void => {
    setUserState({ ...userState, ...updatedState });
  };

  const handleLsUserStateSave = (stateValue: IUserState): void => {
    localStorage.setItem("userState", JSON.stringify(stateValue));
  };

  useEffect(() => {
    //Need to synchronize storage and context token state
    ee.on('accessTokenUpdate', (data: any) => {
      const { accessToken } = data;
      const updatedState = { ...userState, accessToken };
      handleLsUserStateSave(updatedState);
      handleUpdateUserState(updatedState);
    });

    return () => ee.off('accessTokenUpdate');
  }, [])

  return (
    <UserContext.Provider
      value={{
        userState,
        handleLsUserStateSave,
        updateUserState: handleUpdateUserState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
