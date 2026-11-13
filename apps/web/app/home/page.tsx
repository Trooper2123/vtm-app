import Link from "next/link";
import { auth0 } from "../../lib/auth0";
import { redirect } from "next/navigation";
import { requestOwnProfile, type Profile } from "../../lib/profile-api";

const accountLabels = {
  player: "Jogador(a)",
  game_master: "Mestre(a)",
  both: "Jogador(a) e mestre(a)",
};

export default async function HomePage() {
  const session = await auth0.getSession();
  if (!session) redirect("/");
  let response: Response;

  try {
    response = await requestOwnProfile("GET");
  } catch {
    return (
      <main className="page-shell">
        <section className="panel">
          <h1>Não foi possível carregar seu perfil</h1>
          <p>Verifique a configuração da API e tente novamente.</p>
          <Link href="/">Tentar novamente</Link>
          <p><Link href="/auth/logout">Sair</Link></p>
        </section>
      </main>
    );
  }

  if (response.status === 404) redirect("/");
  if (!response.ok) {
    return (
      <main className="page-shell">
        <section className="panel">
          <h1>Não foi possível carregar seu perfil</h1>
          <p>O serviço respondeu com um erro. Tente novamente em alguns instantes.</p>
          <Link href="/">Tentar novamente</Link>
          <p><Link href="/auth/logout">Sair</Link></p>
        </section>
      </main>
    );
  }

  const { profile } = (await response.json()) as { profile: Profile };

  return (
    <main className="page-shell">
      <section className="panel">
        <p className="eyebrow">Área inicial</p>
        <h1>Bem-vindo(a), {profile.nickname || profile.name}</h1>
        <p>Seu perfil foi criado e está associado à sua conta autenticada.</p>
        <dl className="profile-summary">
          <div><dt>Nome</dt><dd>{profile.name}</dd></div>
          {profile.pronouns ? <div><dt>Pronomes</dt><dd>{profile.pronouns}</dd></div> : null}
          <div><dt>E-mail</dt><dd>{profile.email}</dd></div>
          <div><dt>Cadastro</dt><dd>{accountLabels[profile.accountType]}</dd></div>
        </dl>
        <p><Link href="/auth/logout">Sair</Link></p>
      </section>
    </main>
  );
}
