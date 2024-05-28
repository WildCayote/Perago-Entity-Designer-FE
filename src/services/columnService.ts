import { ColumnInterface } from "@/zustandStore/columnStore";
import APIClient from "./apiClient";

export interface ColumnDto {
  name: string;
  type: string;
  isPrimary: boolean;
  isForiegn: boolean;
}

const apiClient = new APIClient<ColumnDto>("");

export async function createColumnAPI(tableId: string, column: ColumnDto) {
  apiClient.endPoint = `models/${tableId}/columns`;
  return apiClient.post({}, column);
}

export async function createColumnsAPI(tableId: string, columns: ColumnDto[]) {
  let createdColumns = [];
  for (const column of columns) {
    try {
      const result = await createColumnAPI(tableId, column);
      createdColumns.push(result.data);
    } catch (err) {
      throw err;
    }
  }

  return createdColumns;
}

export async function getModelColumns(tableId: string) {
  apiClient.endPoint = `models/${tableId}/columns`;
  
  return apiClient.get<ColumnInterface[]>();
}

export async function deleteColumnAPI(modelId : string , columnId: string) {
  apiClient.endPoint = `http://localhost:3000/api/v1/models/${modelId}/columns/`
  return apiClient.delete({}, columnId);
}


