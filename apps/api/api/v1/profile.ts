import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";

type AccountType = "player" | "game_master" | "both";
type Profile = {
  name: string;
  nickname: string | null;
  pronouns: string | null;
  email: string;
  accountType: AccountType;
  createdAt: string;
  updatedAt: string;
};

type ProfileRow = {
  name: string;
  nickname: string | null;
  pronouns: string | null;
  email: string;
  account_type: AccountType;
  created_at: Date | string;
  updated_at: Date | string;
};

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getIssuer(): string {
  const configured = process.env.AUTH0_ISSUER_URL;
  if (!configured) throw new Error("AUTH0_ISSUER_URL is not configured");
  return configured.endsWith("/") ? configured : `${configured}/`;
}

function toIsoDate(value: Date | string): string {
  return typeof value === "string" ? new Date(value).toISOString() : value.toISOString();
}

function profileFromRow(row: ProfileRow): Profile {
  return {
    name: row.name,
    nickname: row.nickname,
    pronouns: row.pronouns,
    email: row.email,
    accountType: row.account_type,
    createdAt: toIsoDate(row.created_at),
    updatedAt: toIsoDate(row.updated_at),
  };
}

function sendError(response: VercelResponse, status: number, code: string, message: string) {
  return response.status(status).json({ error: { code, message } });
}

async function authenticate(request: VercelRequest): Promise<{ subject: string } | null> {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return null;

  const issuer = getIssuer();
  const audience = process.env.AUTH0_API_AUDIENCE;
  if (!audience) throw new Error("AUTH0_API_AUDIENCE is not configured");

  jwks ??= createRemoteJWKSet(new URL(".well-known/jwks.json", issuer));
  const { payload } = await jwtVerify(authorization.slice("Bearer ".length), jwks, {
    issuer,
    audience,
  });

  return typeof payload.sub === "string" ? { subject: payload.sub } : null;
}

function parseProfile(body: unknown): Omit<Profile, "createdAt" | "updatedAt"> | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const value = body as Record<string, unknown>;
  const stringValue = (field: string) =>
    typeof value[field] === "string" ? (value[field] as string).trim() : "";

  const name = stringValue("name");
  const nickname = stringValue("nickname");
  const pronouns = stringValue("pronouns");
  const email = stringValue("email").toLowerCase();
  const accountType = value.accountType;

  if (!name || name.length > 100) return null;
  if (nickname.length > 40 || pronouns.length > 60) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return null;
  if (accountType !== "player" && accountType !== "game_master" && accountType !== "both") return null;

  return {
    name,
    nickname: nickname || null,
    pronouns: pronouns || null,
    email,
    accountType,
  };
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return sendError(response, 405, "method_not_allowed", "Método não permitido.");
  }

  let identity: { subject: string } | null;
  try {
    identity = await authenticate(request);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not configured")) {
      console.error("Profile API authentication configuration is incomplete.");
      return sendError(response, 500, "configuration_error", "A autenticação da API não está configurada.");
    }
    return sendError(response, 401, "unauthorized", "Token ausente, inválido ou expirado.");
  }

  if (!identity) return sendError(response, 401, "unauthorized", "Token ausente, inválido ou expirado.");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Profile API database configuration is incomplete.");
    return sendError(response, 500, "configuration_error", "O banco de dados da API não está configurado.");
  }

  const sql = neon(databaseUrl);

  try {
    if (request.method === "GET") {
      const rows = (await sql`
        SELECT name, nickname, pronouns, email, account_type, created_at, updated_at
        FROM public.profiles
        WHERE auth0_sub = ${identity.subject}
        LIMIT 1
      `) as ProfileRow[];

      if (!rows[0]) return sendError(response, 404, "profile_not_found", "Perfil ainda não cadastrado.");
      return response.status(200).json({ profile: profileFromRow(rows[0]) });
    }

    const profile = parseProfile(request.body);
    if (!profile) {
      return sendError(response, 400, "validation_error", "Revise os campos do perfil.");
    }

    const rows = (await sql`
      INSERT INTO public.profiles (auth0_sub, name, nickname, pronouns, email, account_type)
      VALUES (
        ${identity.subject},
        ${profile.name},
        ${profile.nickname},
        ${profile.pronouns},
        ${profile.email},
        ${profile.accountType}
      )
      ON CONFLICT (auth0_sub) DO NOTHING
      RETURNING name, nickname, pronouns, email, account_type, created_at, updated_at
    `) as ProfileRow[];

    if (!rows[0]) return sendError(response, 409, "profile_already_exists", "Já existe um perfil para esta conta.");
    return response.status(201).json({ profile: profileFromRow(rows[0]) });
  } catch {
    console.error("Profile API request failed.");
    return sendError(response, 500, "internal_error", "Não foi possível concluir a operação do perfil.");
  }
}
