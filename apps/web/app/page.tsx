import Link from "next/link";
import { redirect } from "next/navigation";
import { auth0 } from "../lib/auth0";
import { requestOwnProfile } from "../lib/profile-api";
import { ProfileForm } from "./profile-form";

export default async function HomePage() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main className="page-shell">
        <section className="panel">
          <p className="eyebrow">Meus Vampiros</p>
          <h1>Acesse sua conta</h1>
          <p>Entre para criar seu perfil e acessar o aplicativo.</p>
          <p><Link href="/auth/login">Entrar</Link></p>
          <p><Link href="/auth/login?screen_hint=signup">Criar conta</Link></p>
        </section>
      </main>
    );
  }

  let response: Response;
  try {
    response = await requestOwnProfile("GET");
  } catch {
    return (
      <main className="page-shell">
        <section className="panel">
          <h1>Não foi possível consultar seu perfil</h1>
          <p>Verifique a configuração da API e tente novamente.</p>
          <a href="/auth/logout">Sair</a>
        </section>
      </main>
    );
  }

  if (response.ok) redirect("/home");
  if (response.status !== 404) {
    return (
      <main className="page-shell">
        <section className="panel">
          <h1>Não foi possível consultar seu perfil</h1>
          <p>O serviço respondeu com um erro. Tente novamente em alguns instantes.</p>
          <a href="/auth/logout">Sair</a>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="panel">
        <p className="eyebrow">Primeiro acesso</p>
        <h1>Crie seu perfil</h1>
        <p>Essas informações serão usadas para identificar você no novo aplicativo.</p>
        <ProfileForm email={session.user.email ?? ""} />
      </section>
    </main>
  );
}
