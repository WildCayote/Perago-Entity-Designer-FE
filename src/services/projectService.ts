import APIClient from "./apiClient";

export interface ProjectDTO {
  name: string;
  description: string | undefined;
}



const apiClient = new APIClient<ProjectDTO>("projects/");

export async function createProjectAPI(project: ProjectDTO) {
  return await apiClient.post({}, project);
}

export async function deleteProjectAPI(projectId: string) {
  return apiClient.delete({}, projectId);
}

export async function updateProjectAPI(projectId: string, newName: string) {
  // update the endpoint
  apiClient.endPoint = `http://localhost:3000/api/v1/projects/${projectId}`;

  // prep the data
  const data = { name: newName };

  return apiClient.update({}, data);
}


