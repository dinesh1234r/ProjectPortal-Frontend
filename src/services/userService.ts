import api from "./api";

export interface AssignableUser {
  id: number;
  name: string;
  email: string;
}

export interface TeamUser extends AssignableUser {
  role: "Admin" | "Manager" | "Employee";
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: "Manager" | "Employee";
}

export interface CreatedUser extends TeamUser {
  temporaryPassword: string;
}

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export const fetchAssignableUsers =
  async (): Promise<AssignableUser[]> => {
    const response = await api.post<
      GraphQLResponse<{ assignableUsers: AssignableUser[] }>
    >("/graphql", {
      query: `
        query GetAssignableUsers {
          assignableUsers {
            id
            name
            email
          }
        }
      `,
    });

    const result = response.data;

    if (result.errors?.length) {
      throw new Error(
        result.errors.map((error) => error.message).join("; "),
      );
    }

    if (!result.data) {
      throw new Error("The server returned no user data.");
    }

    return result.data.assignableUsers;
  };

export const fetchTeamUsers = async (): Promise<TeamUser[]> => {
  const response = await api.post<
    GraphQLResponse<{ users: TeamUser[] }>
  >("/graphql", {
    query: `
      query GetUsers {
        users {
          id
          name
          email
          role
          createdAt
        }
      }
    `,
  });

  const result = response.data;

  if (result.errors?.length) {
    throw new Error(
      result.errors.map((error) => error.message).join("; "),
    );
  }

  if (!result.data) {
    throw new Error("The server returned no user data.");
  }

  return result.data.users;
};

export const createTeamUser = async (
  request: CreateUserRequest,
): Promise<CreatedUser> => {
  const response = await api.post<CreatedUser>(
    "/api/User",
    request,
  );

  return response.data;
};