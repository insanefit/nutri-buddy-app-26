import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authGetUserMock,
  createServerClientMock,
  nextMock,
  requestCookieSetMock,
  requestCookiesGetAllMock,
  responseCookieSetMock,
  responseHeaderSetMock,
} = vi.hoisted(() => ({
  authGetUserMock: vi.fn(),
  createServerClientMock: vi.fn(),
  nextMock: vi.fn(),
  requestCookieSetMock: vi.fn(),
  requestCookiesGetAllMock: vi.fn(),
  responseCookieSetMock: vi.fn(),
  responseHeaderSetMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: nextMock,
  },
}));

vi.mock("../env", () => ({
  publicEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      "publishable-test-key-123456",
  },
}));

import { updateSession } from "./update-session";

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestCookiesGetAllMock.mockReturnValue([
      { name: "sb-session", value: "current-session" },
    ]);
    nextMock.mockImplementation(() => ({
      cookies: { set: responseCookieSetMock },
      headers: { set: responseHeaderSetMock },
    }));
    createServerClientMock.mockReturnValue({
      auth: { getUser: authGetUserMock },
    });
    authGetUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  it("validates the user and propagates refreshed cookies and headers", async () => {
    const request = {
      cookies: {
        getAll: requestCookiesGetAllMock,
        set: requestCookieSetMock,
      },
    };

    const pendingResponse = updateSession(request as never);
    const [, , options] = createServerClientMock.mock.calls[0];

    expect(options.cookies.getAll()).toEqual([
      { name: "sb-session", value: "current-session" },
    ]);

    options.cookies.setAll(
      [
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
      ],
      {
        "Cache-Control":
          "private, no-cache, no-store, must-revalidate, max-age=0",
        Expires: "0",
      },
    );

    const response = await pendingResponse;

    expect(authGetUserMock).toHaveBeenCalledOnce();
    expect(requestCookieSetMock.mock.calls).toEqual([
      ["sb-session", "refreshed-session"],
      ["sb-refresh", "refreshed-token"],
    ]);
    expect(responseCookieSetMock.mock.calls).toEqual([
      [
        "sb-session",
        "refreshed-session",
        { httpOnly: true, path: "/" },
      ],
      ["sb-refresh", "refreshed-token", { sameSite: "lax" }],
    ]);
    expect(responseHeaderSetMock.mock.calls).toEqual([
      [
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate, max-age=0",
      ],
      ["Expires", "0"],
    ]);
    expect(nextMock).toHaveBeenCalledTimes(2);
    expect(response).toEqual({
      cookies: { set: responseCookieSetMock },
      headers: { set: responseHeaderSetMock },
    });
  });

  it("does not hide failures while validating the server user", async () => {
    authGetUserMock.mockRejectedValue(new Error("auth unavailable"));
    const request = {
      cookies: {
        getAll: requestCookiesGetAllMock,
        set: requestCookieSetMock,
      },
    };

    await expect(updateSession(request as never)).rejects.toThrow(
      "auth unavailable",
    );
  });
});
