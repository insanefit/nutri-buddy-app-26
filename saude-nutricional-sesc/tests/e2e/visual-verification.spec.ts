import { expect, test } from "@playwright/test";

const coordinatorPassword = process.env.E2E_COORDINATOR_PASSWORD ?? "";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
] as const;

for (const viewport of viewports) {
  test(`authenticated settings visual check at ${viewport.name}`, async ({
    page,
  }, testInfo) => {
    expect(coordinatorPassword, "E2E_COORDINATOR_PASSWORD").not.toBe("");
    await page.setViewportSize(viewport);

    const browserErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        browserErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      browserErrors.push(error.message);
    });

    await page.goto("/login");
    await page.getByLabel("E-mail").fill("coordinator@example.test");
    await page.getByLabel("Senha").fill(coordinatorPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/inicio$/);
    await page
      .getByRole("link", { name: "Configurações", exact: true })
      .click();
    await expect(page).toHaveURL(/\/settings\/access$/);
    await expect(
      page.getByRole("heading", { name: "Administração de acessos" }),
    ).toBeVisible();

    await expect(page.getByLabel("Profissional")).toBeVisible();
    await expect(page.getByLabel("Unidade")).toBeVisible();
    await expect(
      page.getByLabel("Motivo", { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Válido até")).toBeVisible();
    await expect(
      page.getByRole("table", { name: "Autorizações entre unidades" }),
    ).toBeVisible();

    expect(
      await page.evaluate(
        () => document.body.innerText.trim().length > 0,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () =>
          document.querySelector(
            "[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay",
          ) === null,
      ),
    ).toBe(true);

    const pageMetrics = await page.evaluate(() => ({
      bodyScrollWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(pageMetrics.bodyScrollWidth).toBeLessThanOrEqual(
      pageMetrics.viewportWidth,
    );

    const tableOverflow = await page
      .getByRole("table", { name: "Autorizações entre unidades" })
      .evaluate((table) => {
        const container = table.parentElement;
        return {
          contained:
            container !== null &&
            table.scrollWidth > container.clientWidth &&
            ["auto", "scroll"].includes(
              window.getComputedStyle(container).overflowX,
            ),
        };
      });
    if (viewport.name === "tablet") {
      expect(tableOverflow.contained).toBe(true);
    }

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Ir para o conteúdo" }),
    ).toBeFocused();

    const interactiveSnapshot = await page
      .locator(
        "a, button, input:not([type=hidden]), select, textarea",
      )
      .evaluateAll((elements) =>
        elements.map((element) => ({
          tag: element.tagName.toLowerCase(),
          label:
            element.getAttribute("aria-label") ??
            element.textContent?.trim() ??
            element.getAttribute("name") ??
            "",
        })),
      );
    await testInfo.attach(`${viewport.name}-interactive-snapshot`, {
      body: Buffer.from(JSON.stringify(interactiveSnapshot, null, 2)),
      contentType: "application/json",
    });

    await page.screenshot({
      path: testInfo.outputPath(`${viewport.name}-settings.png`),
      fullPage: true,
    });

    expect(browserErrors).toEqual([]);
  });
}
