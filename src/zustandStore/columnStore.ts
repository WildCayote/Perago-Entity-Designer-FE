import { create } from "zustand";

export interface ColumnInterface {
  tableName: any;
  id: string;
  modelId: string;
  name: string;
  type: string;
  isPrimary: boolean;
  isForiegn: boolean;
  relation?: relationInterface;
}

export interface relationInterface {
  id?: string;
  columnId: string;
  referencedColumnId: string;
  type: string;
}

interface columnStore {
  columns: ColumnInterface[];
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  setColumns: (columns: ColumnInterface[]) => void;
  addColumn: (column: ColumnInterface) => void;
  deleteColumn: (column: string) => void;
}

export const useColumnStore = create<columnStore>((set) => ({
  columns: [] as ColumnInterface[],
  isLoading: true,
  setLoading: (isLoading: boolean) => set({ isLoading: isLoading }),
  setColumns: (columns: ColumnInterface[]) => set({ columns: columns }),
  addColumn: (column: ColumnInterface) =>
    set((state) => ({ columns: state.columns.concat([column]) })),
  deleteColumn: (columnId: string) =>
    set((state) => ({
      columns: state.columns.filter((column) => column.id != columnId),
    })),
}));
