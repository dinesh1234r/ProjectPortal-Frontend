import api from "./api";

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name: string;
  description: string;
}

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

const PROJECTS_QUERY = `
  query GetProjects {
    projects {
      id
      name
      description
      createdAt
    }
  }
`;

export const fetchProjects = async (): Promise<Project[]> => {
  const response = await api.post<
    GraphQLResponse<{ projects: Project[] }>
  >("/graphql", {
    query: PROJECTS_QUERY,
  });

  const result = response.data;

  if (result.errors?.length) {
    throw new Error(
      result.errors.map((error) => error.message).join("; "),
    );
  }

  if (!result.data) {
    throw new Error("The server returned no project data.");
  }

  return result.data.projects;
};

export const createProject = async (
  request: CreateProjectRequest,
): Promise<Project> => {
  const response = await api.post<Project>(
    "/api/Projects",
    request,
  );

  return response.data;
};

export const updateProject = async (
  projectId: number,
  request: UpdateProjectRequest,
): Promise<Project> => {
  const response = await api.put<Project>(
    `/api/Projects/${projectId}`,
    request,
  );

  return response.data;
};

export const deleteProject = async (
  projectId: number,
): Promise<void> => {
  await api.delete(`/api/Projects/${projectId}`);
};