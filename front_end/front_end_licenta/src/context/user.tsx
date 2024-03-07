import {
  createContext,
  useCallback,
  useState,
  useMemo,
  useContext,
} from "react";
import { IUserCtx } from "../interfaces/user/IUserCtx";

const emailStorageKey = "carsUserEmail";
const localStorageEmail = window.localStorage.getItem(emailStorageKey);
const sessionStorageEmail = window.sessionStorage.getItem(emailStorageKey);
let browserEmail = "";
if (localStorageEmail !== null) {
  browserEmail = localStorageEmail;
} else if (sessionStorageEmail !== null) {
  browserEmail = sessionStorageEmail;
}

const UserContext = createContext<IUserCtx>({
  email: "",
  actions: {
    changeEmail: (_: string, __: boolean) => {},
    removeEmail: () => {},
  },
});

const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [email, setEmail] = useState(browserEmail);

  const changeEmail = useCallback(
    (newEmail: string, session: boolean) => {
      console.log("setting new email", newEmail);
      if (session) {
        window.sessionStorage.setItem(emailStorageKey, newEmail);
      } else {
        window.localStorage.setItem(emailStorageKey, newEmail);
      }
      setEmail(newEmail);
    },
    [emailStorageKey]
  );

  const removeEmail = useCallback(() => {
    window.sessionStorage.removeItem(emailStorageKey);
    window.localStorage.removeItem(emailStorageKey);
    setEmail("");
  }, [emailStorageKey]);

  const contextValue: IUserCtx = useMemo(
    () => ({
      email,
      actions: {
        changeEmail,
        removeEmail,
      },
    }),
    [email, changeEmail]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => {
  const { email, actions } = useContext(UserContext);
  return { email, actions };
};

export default UserProvider;
