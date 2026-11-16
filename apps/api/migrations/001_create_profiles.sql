-- Perfil da conta autenticada no novo app.
-- Aplicar primeiro no branch Neon compartilhado de Preview/teste.
CREATE TABLE IF NOT EXISTS public.profiles (
  auth0_sub text PRIMARY KEY,
  name varchar(100) NOT NULL,
  nickname varchar(40),
  pronouns varchar(60),
  email varchar(320) NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('player', 'game_master', 'both')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
