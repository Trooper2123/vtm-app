"use server";

import { redirect } from "next/navigation";
import { requestOwnProfile } from "../lib/profile-api";

export type ProfileFormState = { error?: string };

export async function saveProfile(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const body = {
    name: String(formData.get("name") ?? ""),
    nickname: String(formData.get("nickname") ?? ""),
    pronouns: String(formData.get("pronouns") ?? ""),
    email: String(formData.get("email") ?? ""),
    accountType: String(formData.get("accountType") ?? ""),
  };

  let response: Response;
  try {
    response = await requestOwnProfile("POST", body);
  } catch {
    return {
      error: "Não foi possível conectar ao serviço. Tente novamente em alguns instantes.",
    };
  }

  if (response.status === 201) redirect("/home");

  const result = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  return {
    error: result?.error?.message ?? "Não foi possível salvar o perfil. Tente novamente.",
  };
}
