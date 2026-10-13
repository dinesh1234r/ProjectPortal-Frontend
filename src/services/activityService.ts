
import api from "./api";

export interface ActivityItem {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  entityName: string;
  description: string;
  actorName: string;
  actorRole: string;
  createdAt: string;
}

export const fetchRecentActivity = async (
  limit = 8,
): Promise<ActivityItem[]> => {
  const response = await api.get<ActivityItem[]>(
    "/api/Activity/recent",
    {
      params: { limit },
    },
  );

  return response.data;
};
