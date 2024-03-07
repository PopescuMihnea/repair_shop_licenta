import React from "react";
import { IPagedListFilterOptions } from "./IPagedListFilterOption";

export interface IPagedListComponent {
  searchOptions: IPagedListFilterOptions[];
  filterOptions: IPagedListFilterOptions[];
  searchByLocation: boolean;
  resourceType: string;
  resourceUri: string;
  useIdForResource?: boolean;
  createNewUri?: string;
  useIdForCreate?: boolean;
  grid: boolean;
  canCreate: boolean;
  isManager: boolean;
  DataCard: React.ComponentType<{
    data: any;
    queryString: string;
    resourceId?: string;
    isManager?: boolean;
  }>;
}
