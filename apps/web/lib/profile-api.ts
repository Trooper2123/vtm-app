import { auth0 } from "./auth0";

export type AccountType = "player" | "game_master" | "both";

export type Profile = {
  name: string;
  nickname: string | null;
  pronouns: string | null;
  email: string;
  accountType: AccountType;
  createdAt: string;
  updatedAt: string;
};

export async function requestOwnProfile(method: "GET" | "POST", body?: Record<string, string>) {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) throw new Error("API_BASE_URL não está configurada no frontend.");

  const { token } = await auth0.getAccessToken();
  return fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/profile`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
}
