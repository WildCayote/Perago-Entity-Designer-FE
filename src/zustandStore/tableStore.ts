import { create } from "zustand";

export interface TableInterface {
  id: string;
  name: string;
  projectId: string;
}

interface tableStore {
  tables: TableInterface[];
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  setTables: (tables: TableInterface[]) => void;
  addTable: (table: TableInterface) => void;
}

const useTableStore = create<tableStore>((set) => ({
  isLoading: true,
  tables: [] as TableInterface[],
  setLoading: (isLoading: boolean) => set({ isLoading: isLoading }),
  setTables: (tables: TableInterface[]) => set(() => ({ tables: tables })),
  addTable: (table: TableInterface) =>
    set((state) => ({ tables: state.tables.concat([table]) })),
  removeTable: (tableId: string) =>
    set((state) => ({

      tables: state.tables.filter((table) => table.id != tableId)
    })),
  
  editTable: (tableId: string, newName :string) => 
    set((state) => {
      const updatedtable= state.tables.map((table) =>
        table.id == tableId ? { ...table, name: newName } : table
      );



      return { tables: updatedtable };
}),

}));

export default useTableStore;
