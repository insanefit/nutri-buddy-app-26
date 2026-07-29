import { expect, test, type Page } from "@playwright/test";

const coordinatorPassword = process.env.E2E_COORDINATOR_PASSWORD ?? "";
const nutritionistPassword = process.env.E2E_NUTRITIONIST_PASSWORD ?? "";

function futureDate(daysFromNow: number): string {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + daysFromNow);
  return value.toISOString().slice(0, 10);
}

async function signIn(
  page: Page,
  email: string,
  password: string,
  expectedHeading: string,
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(
    page.getByRole("heading", { name: expectedHeading, exact: true }),
  ).toBeVisible();
}

test.beforeAll(() => {
  expect(coordinatorPassword, "E2E_COORDINATOR_PASSWORD").not.toBe("");
  expect(nutritionistPassword, "E2E_NUTRITIONIST_PASSWORD").not.toBe("");
});

test("coordinator grants and revokes cross-unit access", async ({
  page,
}) => {
  const grantReason = `Cobertura temporária E2E ${Date.now()}`;
  const revocationReason = "Cobertura temporária concluída";

  await signIn(
    page,
    "coordinator@example.test",
    coordinatorPassword,
    "Bem-vinda, Coordenação Teste",
  );

  await page
    .getByRole("link", { name: "Configurações", exact: true })
    .click();
  await expect(page).toHaveURL(/\/settings\/access$/);

  await page
    .getByLabel("Profissional")
    .selectOption({ label: "Nutricionista Teste" });
  await page
    .getByLabel("Unidade")
    .selectOption({ label: "Unidade Piloto 2" });
  await page.getByLabel("Motivo", { exact: true }).fill(grantReason);
  await page.getByLabel("Válido até").fill(futureDate(30));
  await page
    .getByRole("button", { name: "Autorizar acesso" })
    .click();

  await expect(
    page.getByRole("status").filter({ hasText: "Acesso autorizado." }),
  ).toBeVisible();
  const grantRow = page.getByRole("row").filter({ hasText: grantReason });
  await expect(grantRow).toContainText("Ativo");
  await grantRow
    .getByLabel("Motivo da revogação")
    .fill(revocationReason);
  await grantRow.getByRole("button", { name: "Revogar" }).click();

  await expect(
    page.getByRole("status").filter({ hasText: "Acesso revogado." }),
  ).toBeVisible();
  const revokedRow = page
    .getByRole("row")
    .filter({ hasText: grantReason });
  await expect(revokedRow).toContainText("Revogado");
  await expect(revokedRow).toContainText(revocationReason);
});

test("nutritionist cannot see or directly open access settings", async ({
  page,
}) => {
  await signIn(
    page,
    "nutritionist@example.test",
    nutritionistPassword,
    "Bem-vinda, Nutricionista Teste",
  );

  await expect(
    page.getByRole("link", { name: "Configurações", exact: true }),
  ).toHaveCount(0);

  await page.goto("/settings/access");
  await expect(
    page.getByRole("heading", {
      name: "Não foi possível carregar esta área",
    }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("FORBIDDEN");
  await expect(page.locator("body")).not.toContainText("permission denied");
});
