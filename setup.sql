CREATE TABLE IF NOT EXISTS public.tasks (
  id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  "name" text NOT NULL DEFAULT '',
  "code" text NOT NULL DEFAULT '',
  "desc" text NOT NULL DEFAULT '',
  "due"  text NOT NULL DEFAULT '',
  "done" boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS tasks_uid_idx ON public.tasks (uid);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks: own rows" ON public.tasks;
CREATE POLICY "tasks: own rows"
  ON public.tasks
  FOR ALL
  TO authenticated
  USING (uid = (SELECT auth.uid()))
  WITH CHECK (uid = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;


CREATE TABLE IF NOT EXISTS public.classes (
  id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  "code"  text NOT NULL DEFAULT '',
  "day"   text NOT NULL DEFAULT '',
  "start" text NOT NULL DEFAULT '',
  "end"   text NOT NULL DEFAULT '',
  "room"  text NOT NULL DEFAULT '',
  "inst"  text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS classes_uid_idx ON public.classes (uid);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "classes: own rows" ON public.classes;
CREATE POLICY "classes: own rows"
  ON public.classes
  FOR ALL
  TO authenticated
  USING (uid = (SELECT auth.uid()))
  WITH CHECK (uid = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;


CREATE TABLE IF NOT EXISTS public.water (
  id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  "ml"   double precision NOT NULL DEFAULT 0,
  "date" text NOT NULL DEFAULT '',
  "time" text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS water_uid_idx ON public.water (uid);

ALTER TABLE public.water ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "water: own rows" ON public.water;
CREATE POLICY "water: own rows"
  ON public.water
  FOR ALL
  TO authenticated
  USING (uid = (SELECT auth.uid()))
  WITH CHECK (uid = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.water TO authenticated;



CREATE TABLE IF NOT EXISTS public.sleep (
  id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  "bed"  text NOT NULL DEFAULT '',
  "wake" text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS sleep_uid_idx ON public.sleep (uid);

ALTER TABLE public.sleep ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sleep: own rows" ON public.sleep;
CREATE POLICY "sleep: own rows"
  ON public.sleep
  FOR ALL
  TO authenticated
  USING (uid = (SELECT auth.uid()))
  WITH CHECK (uid = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep TO authenticated;


CREATE TABLE IF NOT EXISTS public.routines (
  id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid      uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  "name"   text NOT NULL DEFAULT '',
  "when"   text NOT NULL DEFAULT '',
  "doneOn" text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS routines_uid_idx ON public.routines (uid);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "routines: own rows" ON public.routines;
CREATE POLICY "routines: own rows"
  ON public.routines
  FOR ALL
  TO authenticated
  USING (uid = (SELECT auth.uid()))
  WITH CHECK (uid = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.routines TO authenticated;


CREATE TABLE IF NOT EXISTS public.tx (
  id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  "type" text NOT NULL DEFAULT '',
  "cat"  text NOT NULL DEFAULT '',
  "amt"  double precision NOT NULL DEFAULT 0,
  "date" text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS tx_uid_idx ON public.tx (uid);

ALTER TABLE public.tx ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tx: own rows" ON public.tx;
CREATE POLICY "tx: own rows"
  ON public.tx
  FOR ALL
  TO authenticated
  USING (uid = (SELECT auth.uid()))
  WITH CHECK (uid = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tx TO authenticated;