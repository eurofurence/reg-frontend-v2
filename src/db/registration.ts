// Use a simple in-memory store instead of query-db-collection to avoid missing package APIs.
import { useQueryClient } from "@tanstack/react-query";

export type Registration = {
  // ticket
  type?: "full" | "day";
  day?: string;
  level?: string;

  // personal
  nickname?: string;
  firstName?: string;
  lastName?: string;
  fullNamePermission?: boolean;
  dateOfBirth?: string;
  spokenLanguages?: string[];
  pronounsSelection?: string;
  pronounsOther?: string;
  wheelchair?: boolean;
};

const REGISTRATION_QUERY_KEY = ["registration"] as const;

export const registrationDefault: Registration = {};

export const registrationApi = {
  get: (client: ReturnType<typeof useQueryClient>) =>
    client.getQueryData(REGISTRATION_QUERY_KEY) as Registration | undefined,
  update: (
    client: ReturnType<typeof useQueryClient>,
    patch: Partial<Registration>
  ) =>
    client.setQueryData(
      REGISTRATION_QUERY_KEY,
      (old: Registration | undefined) => ({
        ...(old ?? registrationDefault),
        ...patch,
      })
    ),
};

export default registrationApi;
