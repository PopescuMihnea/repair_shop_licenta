export interface ILanguageCtx {
  locale: string;
  language: Object;
  actions: {
    changeLanguage: (event: React.MouseEvent<HTMLElement>) => void;
  };
}
