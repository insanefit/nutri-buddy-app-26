import { createClient } from "@supabase/supabase-js";

const requiredEnvironment = Object.freeze([
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "E2E_COORDINATOR_PASSWORD",
  "E2E_NUTRITIONIST_PASSWORD",
]);

const localHosts = new Set(["127.0.0.1", "localhost", "::1"]);
const primaryUnitId = "10000000-0000-4000-8000-000000000001";

function readEnvironment() {
  const missing = requiredEnvironment.filter(
    (name) => !process.env[name]?.trim(),
  );
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const supabaseUrl = new URL(process.env.SUPABASE_URL);
  if (!localHosts.has(supabaseUrl.hostname)) {
    throw new Error("SUPABASE_URL must target the local Supabase instance");
  }

  const coordinatorPassword = process.env.E2E_COORDINATOR_PASSWORD;
  const nutritionistPassword = process.env.E2E_NUTRITIONIST_PASSWORD;
  if (coordinatorPassword.length < 12 || nutritionistPassword.length < 12) {
    throw new Error("E2E passwords must contain at least 12 characters");
  }
  if (coordinatorPassword === nutritionistPassword) {
    throw new Error("E2E users must use different passwords");
  }

  return Object.freeze({
    supabaseUrl: supabaseUrl.toString(),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    coordinatorPassword,
    nutritionistPassword,
  });
}

function createFixtures(environment) {
  return Object.freeze([
    Object.freeze({
      email: "coordinator@example.test",
      password: environment.coordinatorPassword,
      fullName: "Coordenação Teste",
      role: "coordinator",
    }),
    Object.freeze({
      email: "nutritionist@example.test",
      password: environment.nutritionistPassword,
      fullName: "Nutricionista Teste",
      role: "nutritionist",
    }),
  ]);
}

async function seedLocalUsers() {
  const environment = readEnvironment();
  const admin = createClient(
    environment.supabaseUrl,
    environment.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  const fixtures = createFixtures(environment);
  const { data: listed, error: listError } =
    await admin.auth.admin.listUsers({ page: 1, perPage: 1_000 });

  if (listError) {
    throw new Error("Unable to list local Auth users");
  }

  const usersByEmail = new Map(
    listed.users.map((user) => [user.email, user]),
  );

  for (const fixture of fixtures) {
    const existing = usersByEmail.get(fixture.email);
    const authResult = existing
      ? await admin.auth.admin.updateUserById(existing.id, {
          password: fixture.password,
          email_confirm: true,
        })
      : await admin.auth.admin.createUser({
          email: fixture.email,
          password: fixture.password,
          email_confirm: true,
        });

    if (authResult.error || !authResult.data.user) {
      throw new Error("Unable to prepare a local Auth fixture");
    }

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: authResult.data.user.id,
        full_name: fixture.fullName,
        role: fixture.role,
        primary_unit_id: primaryUnitId,
        active: true,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      throw new Error(
        `Unable to prepare a local profile fixture (${profileError.code ?? "unknown"})`,
      );
    }
  }
}

try {
  await seedLocalUsers();
  console.log("Local E2E users are ready.");
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Unknown local seed failure";
  console.error(`Local E2E user seed failed: ${message}`);
  process.exitCode = 1;
}
