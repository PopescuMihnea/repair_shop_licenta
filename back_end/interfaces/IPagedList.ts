export interface IPagedList<T> {
  data: T[];
  page: number;
  pages: number;
}
