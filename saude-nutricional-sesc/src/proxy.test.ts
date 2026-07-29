import { describe, expect, it, vi } from "vitest";

const { updateSessionMock } = vi.hoisted(() => ({
  updateSessionMock: vi.fn(),
}));

vi.mock("./platform/supabase/update-session", () => ({
  updateSession: updateSessionMock,
}));

import { config, proxy } from "./proxy";

describe("proxy", () => {
  it("refreshes the session for matched application requests", async () => {
    const request = { url: "https://app.example.test/inicio" };
    const response = { status: 200 };
    updateSessionMock.mockResolvedValue(response);

    await expect(proxy(request as never)).resolves.toBe(response);
    expect(updateSessionMock).toHaveBeenCalledWith(request);
    expect(config.matcher).toEqual([
      "/((?!_next/static|_next/image|favicon.ico).*)",
    ]);
  });
});
