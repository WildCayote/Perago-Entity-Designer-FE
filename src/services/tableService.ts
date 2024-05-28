import APIClient from "./apiClient";

export interface TableDto {
  name: string;
}
const apiClient = new APIClient<TableDto>("");

export async function createTableAPI(projectId: string, table: TableDto) {
  apiClient.endPoint = `projects/${projectId}/models`;
  return await apiClient.post({}, table);
}

export async function deleteTableAPI(projectId: string, tableId: string){
  apiClient.endPoint = `http://localhost:3000/api/v1/projects/${projectId}/models/`
  return  apiClient.delete({}, tableId)
}

export async function updateTableAPI(projectId: string, tableId: string, newName){
  apiClient.endPoint = `http://localhost:3000/api/v1/projects/${projectId}/models/${tableId}`
  const data = {name: newName }
  return apiClient.update({}, data)
}