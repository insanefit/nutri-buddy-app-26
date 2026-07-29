import { beforeEach, describe, expect, it, vi } from "vitest";

const { createBrowserClientMock, supabaseClient } = vi.hoisted(() => ({
  createBrowserClientMock: vi.fn(),
  supabaseClient: { kind: "browser-client" },
}));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: createBrowserClientMock,
}));

vi.mock("../env", () => ({
  publicEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      "publishable-test-key-123456",
  },
}));

import { createClient } from "./browser";

describe("browser Supabase client", () => {
  beforeEach(() => {
    createBrowserClientMock.mockReset();
    createBrowserClientMock.mockReturnValue(supabaseClient);
  });

  it("creates a typed client with public configuration only", () => {
    expect(createClient()).toBe(supabaseClient);
    expect(createBrowserClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-test-key-123456",
    );
  });
});
