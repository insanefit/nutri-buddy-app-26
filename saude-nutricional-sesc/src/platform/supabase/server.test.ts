import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cookieStore,
  cookiesMock,
  createServerClientMock,
  supabaseClient,
} = vi.hoisted(() => ({
  cookieStore: {
    getAll: vi.fn(),
    set: vi.fn(),
  },
  cookiesMock: vi.fn(),
  createServerClientMock: vi.fn(),
  supabaseClient: { kind: "server-client" },
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("../env", () => ({
  publicEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      "publishable-test-key-123456",
  },
}));

import { createClient } from "./server";

describe("server Supabase client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookiesMock.mockResolvedValue(cookieStore);
    cookieStore.getAll.mockReturnValue([
      { name: "sb-session", value: "current-session" },
    ]);
    createServerClientMock.mockReturnValue(supabaseClient);
  });

  it("reads request cookies and writes every refreshed cookie", async () => {
    expect(await createClient()).toBe(supabaseClient);

    const [, , options] = createServerClientMock.mock.calls[0];

    expect(options.cookies.getAll()).toEqual([
      { name: "sb-session", value: "current-session" },
    ]);

    options.cookies.setAll([
      {
        name: "sb-session",
        value: "refreshed-session",
        options: { httpOnly: true, path: "/" },
      },
      {
        name: "sb-refresh",
        value: "refreshed-token",
        options: { sameSite: "lax" },
      },
    ]);

    expect(cookieStore.set.mock.calls).toEqual([
      [
        "sb-session",
        "refreshed-session",
        { httpOnly: true, path: "/" },
      ],
      ["sb-refresh", "refreshed-token", { sameSite: "lax" }],
    ]);
  });
});
