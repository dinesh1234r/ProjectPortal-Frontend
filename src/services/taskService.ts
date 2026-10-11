import api from "./api";

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  projectId: number;
  assignedUserId: number | null;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: number;
  assignedUserId?: number | null;
}

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export const fetchTasksByProject = async (
  projectId: number,
): Promise<TaskItem[]> => {
  const query = `
    query GetTasksByProject($projectId: Int!) {
      tasks(where: { projectId: { eq: $projectId } }) {
        id
        title
        description
        isCompleted
        projectId
        assignedUserId
        createdAt
      }
    }
  `;

  const response = await api.post<
    GraphQLResponse<{ tasks: TaskItem[] }>
  >("/graphql", {
    query,
    variables: { projectId },
  });

  const result = response.data;

  if (result.errors?.length) {
    throw new Error(
      result.errors.map((error) => error.message).join("; "),
    );
  }

  if (!result.data) {
    throw new Error("The server returned no task data.");
  }

  return result.data.tasks;
};

export const createTask = async (
  request: CreateTaskRequest,
): Promise<void> => {
  await api.post("/api/Tasks", request);
};