import api from "./api";

export interface TaskAssignee {
  id: number;
  name: string;
  email: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  projectId: number;
  assignedUserId: number | null;
  assignedUser: TaskAssignee | null;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: number;
  assignedUserId?: number | null;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  assignedUserId: number | null;
  isCompleted: boolean;
}

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

const TASK_FIELDS = `
  id
  title
  description
  isCompleted
  projectId
  assignedUserId
  assignedUser {
    id
    name
    email
  }
  createdAt
`;

const executeTasksQuery = async (
  query: string,
  variables?: Record<string, unknown>,
): Promise<TaskItem[]> => {
  const response = await api.post<
    GraphQLResponse<{ tasks: TaskItem[] }>
  >("/graphql", {
    query,
    variables,
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

export const fetchAllTasks = async (): Promise<TaskItem[]> => {
  return executeTasksQuery(`
    query GetAllTasks {
      tasks {
        ${TASK_FIELDS}
      }
    }
  `);
};

export const fetchTasksByProject = async (
  projectId: number,
): Promise<TaskItem[]> => {
  return executeTasksQuery(
    `
      query GetTasksByProject($projectId: Int!) {
        tasks(where: { projectId: { eq: $projectId } }) {
          ${TASK_FIELDS}
        }
      }
    `,
    { projectId },
  );
};

export const createTask = async (
  request: CreateTaskRequest,
): Promise<void> => {
  await api.post("/api/Tasks", request);
};

export const updateTask = async (
  taskId: number,
  request: UpdateTaskRequest,
): Promise<void> => {
  await api.put(`/api/Tasks/${taskId}`, request);
};