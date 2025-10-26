CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE rounds (
  id serial PRIMARY KEY,
  uuid uuid DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  drawn_numbers integer[]
);

CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id int REFERENCES rounds(id) ON DELETE CASCADE,
  id_number varchar(20) NOT NULL,
  numbers integer[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON tickets (round_id);
