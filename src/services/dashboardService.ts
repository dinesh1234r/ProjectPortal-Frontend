
import api from "./api";

export interface DashboardProject {
  id: number;
}

export interface DashboardTask {
  id: number;
  isCompleted: boolean;
}

export interface DashboardData {
  projects: DashboardProject[];
  tasks: DashboardTask[];
}

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

const PROJECTS_QUERY = `
  query DashboardProjects {
    projects {
      id
    }
  }
`;

const TASKS_QUERY = `
  query DashboardTasks {
    tasks {
      id
      isCompleted
    }
  }
`;

async function executeQuery<T>(
  query: string,
): Promise<T> {
  const response = await api.post<GraphQLResponse<T>>(
    "/graphql",
    { query },
  );

  const result = response.data;

  if (result.errors?.length) {
    throw new Error(
      result.errors
        .map((error) => error.message)
        .join("; "),
    );
  }

  if (!result.data) {
    throw new Error(
      "The server returned no dashboard data.",
    );
  }

  return result.data;
}

export async function fetchDashboardData():
  Promise<DashboardData> {
  // Run sequentially so the two root resolvers do not
  // execute concurrently in the same GraphQL request.
  const projectsResult = await executeQuery<
    Pick<DashboardData, "projects">
  >(PROJECTS_QUERY);

  const tasksResult = await executeQuery<
    Pick<DashboardData, "tasks">
  >(TASKS_QUERY);

  return {
    projects: projectsResult.projects,
    tasks: tasksResult.tasks,
  };
}
