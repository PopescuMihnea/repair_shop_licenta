export interface IUserCtx {
  email: string;
  actions: {
    changeEmail: (newEmail: string, session: boolean) => void;
    removeEmail: () => void;
  };
}
