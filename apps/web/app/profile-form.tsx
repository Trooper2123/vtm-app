"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

export function ProfileForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);

  return (
    <form action={formAction} className="profile-form">
      <label>
        Nome
        <input name="name" autoComplete="name" maxLength={100} required />
      </label>

      <label>
        Apelido <span className="optional">(opcional)</span>
        <input name="nickname" autoComplete="nickname" maxLength={40} />
      </label>

      <label>
        Pronomes <span className="optional">(opcional)</span>
        <input
          name="pronouns"
          placeholder="Ex.: ela/dela"
          maxLength={60}
          autoComplete="off"
        />
      </label>

      <label>
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={email}
          maxLength={320}
          required
        />
        <span className="field-hint">Informe o e-mail de contato do seu perfil.</span>
      </label>

      <fieldset>
        <legend>Quero me cadastrar como</legend>
        <label className="choice">
          <input type="radio" name="accountType" value="player" required />
          Jogador(a)
        </label>
        <label className="choice">
          <input type="radio" name="accountType" value="game_master" />
          Mestre(a)
        </label>
        <label className="choice">
          <input type="radio" name="accountType" value="both" />
          Ambos
        </label>
      </fieldset>

      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}
