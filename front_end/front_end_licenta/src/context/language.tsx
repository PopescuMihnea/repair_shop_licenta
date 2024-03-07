import {
  createContext,
  useMemo,
  useState,
  useCallback,
  useContext,
} from "react";
import { ILanguageCtx } from "../interfaces/ILanguageCtx";
import { IntlProvider } from "react-intl";

const localeLocalStorageKey = "carsLocale";
const localStorageLocale = window.localStorage.getItem(localeLocalStorageKey);
const browserLocale: string =
  localStorageLocale !== null ? localStorageLocale : navigator.language;

let initialLanguage = {};
try {
  initialLanguage = (
    (await import(`../i18n/${browserLocale}.json`)) as {
      default: Record<string, string>;
    }
  ).default;
} catch (err) {
  initialLanguage = (await import("../i18n/en-US.json")).default;
}

const LanguageContext = createContext<ILanguageCtx>({
  locale: browserLocale,
  language: initialLanguage,
  actions: {
    changeLanguage: (_: React.MouseEvent<HTMLElement>) => {},
  },
});

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [locale, setLocale] = useState(browserLocale);

  const changeLanguage = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const newLocale = (event.target as Element).id;

    setLocale(newLocale);
    window.localStorage.setItem(localeLocalStorageKey, newLocale);
    let active = true;
    loadLanguage();
    return () => {
      //console.log(locale);
      active = false;
    };

    async function loadLanguage() {
      let newLanguage = {};
      try {
        newLanguage = (
          (await import(`../i18n/${newLocale}.json`)) as {
            default: Record<string, string>;
          }
        ).default;
      } catch (err) {
        newLanguage = (await import("../i18n/en-US.json")).default;
      }

      if (!active) {
        return;
      }
      setLanguage(newLanguage);
    }
  }, []);

  const contextValue: ILanguageCtx = useMemo(
    () => ({
      locale,
      language,
      actions: {
        changeLanguage,
      },
    }),
    [language, locale, changeLanguage]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      <IntlProvider locale={locale} messages={language}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const { locale, actions } = useContext(LanguageContext);
  return { locale, actions };
};

export const useLanguageContextMessages = () => {
  const { language } = useContext(LanguageContext);
  return { language };
};

export default LanguageProvider;
