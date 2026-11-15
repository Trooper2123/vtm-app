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
        <section className="panel panel--entry">
          <div className="panel-intro">
            <p className="eyebrow">Meus Vampiros / Acesso</p>
            <div className="intro-copy">
              <h1>Suas histórias começam aqui.</h1>
              <p>Entre na sua conta para criar seu perfil no novo aplicativo.</p>
            </div>
          </div>
          <div className="panel-content">
            <p className="section-label">Acesso à conta</p>
            <h2>Continue sua jornada</h2>
            <p>Use sua conta para entrar ou crie uma agora.</p>
            <div className="entry-actions">
              <Link className="button-primary" href="/auth/login">Entrar</Link>
              <Link className="button-secondary" href="/auth/login?screen_hint=signup">Criar conta</Link>
            </div>
          </div>
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
      <section className="panel panel--entry">
        <div className="panel-intro">
          <p className="eyebrow">Meus Vampiros / Primeiro acesso</p>
          <div className="intro-copy">
            <h1>Crie seu perfil.</h1>
            <p>Escolha como quer se apresentar no novo aplicativo.</p>
          </div>
          <a className="quiet-link" href="/auth/logout">Sair da conta</a>
        </div>
        <div className="panel-content">
          <p className="section-label">Seus dados</p>
          <h2>Apresentação</h2>
          <p>Preencha as informações que serão associadas à sua conta.</p>
          <ProfileForm email={session.user.email ?? ""} />
        </div>
      </section>
    </main>
  );
}
