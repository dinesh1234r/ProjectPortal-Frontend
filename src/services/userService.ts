import api from "./api";

export interface AssignableUser {
  id: number;
  name: string;
  email: string;
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