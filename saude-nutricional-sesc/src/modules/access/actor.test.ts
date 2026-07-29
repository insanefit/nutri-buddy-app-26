import { beforeEach, describe, expect, it, vi } from "vitest";

type ProfileData = {
  id: string;
  full_name: string;
  role: string;
  primary_unit_id: string;
  active: boolean;
};

type QueryResult<T> = {
  data: T | null;
  error: Error | null;
};

const {
  authGetUserMock,
  createClientMock,
  fromMock,
  grantsEqMock,
  grantsGtMock,
  grantsIsMock,
  grantsLteMock,
  grantsQuery,
  grantsSelectMock,
  profileEqMock,
  profileMaybeSingleMock,
  profileQuery,
  profileSelectMock,
  redirectMock,
  state,
  unitsEqMock,
  unitsQuery,
  unitsSelectMock,
} = vi.hoisted(() => {
  const hoistedState: {
    profileResult: QueryResult<ProfileData>;
    grantsResult: QueryResult<{ unit_id: string }[]>;
    unitsResult: QueryResult<{ id: string }[]>;
    validFromFilter: { column: string; value: string } | null;
    validUntilFilter: { column: string; value: string } | null;
  } = {
    profileResult: {
      data: {
        id: "00000000-0000-4000-8000-000000000002",
        full_name: "Nutricionista Teste",
        role: "nutritionist",
        primary_unit_id: "10000000-0000-4000-8000-000000000001",
        active: true,
      },
      error: null,
    },
    grantsResult: {
      data: [
        { unit_id: "10000000-0000-4000-8000-000000000001" },
        { unit_id: "10000000-0000-4000-8000-000000000002" },
      ],
      error: null,
    },
    unitsResult: {
      data: [
        { id: "10000000-0000-4000-8000-000000000001" },
        { id: "10000000-0000-4000-8000-000000000002" },
      ],
      error: null,
    },
    validFromFilter: null,
    validUntilFilter: null,
  };
  const profileQueryDouble: Record<string, unknown> = {};
  const grantsQueryDouble: Record<string, unknown> = {};
  const unitsQueryDouble: Record<string, unknown> = {};

  return {
    authGetUserMock: vi.fn(),
    createClientMock: vi.fn(),
    fromMock: vi.fn(),
    grantsEqMock: vi.fn(
      (_column: string, _value: unknown) => grantsQueryDouble,
    ),
    grantsGtMock: vi.fn(async (column: string, value: string) => {
      hoistedState.validUntilFilter = { column, value };
      return hoistedState.grantsResult;
    }),
    grantsIsMock: vi.fn(
      (_column: string, _value: unknown) => grantsQueryDouble,
    ),
    grantsLteMock: vi.fn((column: string, value: string) => {
      hoistedState.validFromFilter = { column, value };
      return grantsQueryDouble;
    }),
    grantsQuery: grantsQueryDouble,
    grantsSelectMock: vi.fn(() => grantsQueryDouble),
    profileEqMock: vi.fn(
      (_column: string, _value: unknown) => profileQueryDouble,
    ),
    profileMaybeSingleMock: vi.fn(
      async () => hoistedState.profileResult,
    ),
    profileQuery: profileQueryDouble,
    profileSelectMock: vi.fn(() => profileQueryDouble),
    redirectMock: vi.fn((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`);
    }),
    state: hoistedState,
    unitsEqMock: vi.fn(
      async (_column: string, _value: unknown) =>
        hoistedState.unitsResult,
    ),
    unitsQuery: unitsQueryDouble,
    unitsSelectMock: vi.fn(() => unitsQueryDouble),
  };
});

Object.assign(profileQuery, {
  select: profileSelectMock,
  eq: profileEqMock,
  maybeSingle: profileMaybeSingleMock,
});
Object.assign(grantsQuery, {
  select: grantsSelectMock,
  eq: grantsEqMock,
  is: grantsIsMock,
  lte: grantsLteMock,
  gt: grantsGtMock,
});
Object.assign(unitsQuery, {
  select: unitsSelectMock,
  eq: unitsEqMock,
});

vi.mock("next/dist/compiled/server-only", () => ({}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("../../platform/supabase/server", () => ({
  createClient: createClientMock,
}));

import { loadActor, requireUnitAccess } from "./actor";

const user = {
  id: "00000000-0000-4000-8000-000000000002",
};
const inactiveUnitId = "10000000-0000-4000-8000-000000000003";

describe("actor access context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.profileResult = {
      data: {
        id: user.id,
        full_name: "Nutricionista Teste",
        role: "nutritionist",
        primary_unit_id: "10000000-0000-4000-8000-000000000001",
        active: true,
      },
      error: null,
    };
    state.grantsResult = {
      data: [
        { unit_id: "10000000-0000-4000-8000-000000000001" },
        { unit_id: "10000000-0000-4000-8000-000000000002" },
      ],
      error: null,
    };
    state.unitsResult = {
      data: [
        { id: "10000000-0000-4000-8000-000000000001" },
        { id: "10000000-0000-4000-8000-000000000002" },
      ],
      error: null,
    };
    state.validFromFilter = null;
    state.validUntilFilter = null;
    authGetUserMock.mockResolvedValue({
      data: { user },
      error: null,
    });
    fromMock.mockImplementation((table: string) => {
      if (table === "profiles") return profileQuery;
      if (table === "unit_access_grants") return grantsQuery;
      if (table === "units") return unitsQuery;
      throw new Error(`Unexpected table: ${table}`);
    });
    createClientMock.mockResolvedValue({
      auth: { getUser: authGetUserMock },
      from: fromMock,
    });
  });

  it("redirects an unauthenticated request before loading a profile", async () => {
    authGetUserMock.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(loadActor()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rejects an authentication error before loading a profile", async () => {
    authGetUserMock.mockResolvedValue({
      data: { user },
      error: new Error("invalid token"),
    });

    await expect(loadActor()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rejects an absent or inactive profile", async () => {
    state.profileResult = { data: null, error: null };

    await expect(loadActor()).rejects.toThrow("PROFILE_INACTIVE");
  });

  it("does not disguise a profile query failure as inactivity", async () => {
    state.profileResult = {
      data: null,
      error: new Error("database unavailable"),
    };

    await expect(loadActor()).rejects.toThrow("PROFILE_LOAD_FAILED");
  });

  it("rejects malformed profile data", async () => {
    state.profileResult = {
      data: {
        ...state.profileResult.data!,
        role: "administrator",
      },
      error: null,
    };

    await expect(loadActor()).rejects.toThrow("ACTOR_DATA_INVALID");
  });

  it("rejects a profile identity different from the authenticated user", async () => {
    state.profileResult = {
      data: {
        ...state.profileResult.data!,
        id: "00000000-0000-4000-8000-000000000003",
      },
      error: null,
    };

    await expect(loadActor()).rejects.toThrow("ACTOR_DATA_INVALID");
  });

  it("rejects a failure while loading active grants", async () => {
    state.grantsResult = {
      data: null,
      error: new Error("database unavailable"),
    };

    await expect(loadActor()).rejects.toThrow("ACTOR_ACCESS_LOAD_FAILED");
  });

  it("allows an active coordinator without grants to access another active unit", async () => {
    state.profileResult = {
      data: {
        ...state.profileResult.data!,
        role: "coordinator",
      },
      error: null,
    };
    state.grantsResult = { data: [], error: null };

    const actor = await requireUnitAccess(
      "10000000-0000-4000-8000-000000000002",
    );

    expect(actor.accessibleUnitIds).toEqual([
      "10000000-0000-4000-8000-000000000001",
      "10000000-0000-4000-8000-000000000002",
    ]);
    expect(Object.isFrozen(actor.accessibleUnitIds)).toBe(true);
    expect(actor.accessibleUnitIds).not.toContain(inactiveUnitId);
    expect(unitsEqMock).toHaveBeenCalledWith("active", true);
    expect(grantsSelectMock).not.toHaveBeenCalled();
  });

  it("continues to deny a nutritionist without a grant", async () => {
    state.grantsResult = { data: [], error: null };

    await expect(
      requireUnitAccess("10000000-0000-4000-8000-000000000002"),
    ).rejects.toThrow("UNIT_FORBIDDEN");
    expect(unitsSelectMock).not.toHaveBeenCalled();
  });

  it("fails closed when active units cannot be loaded for a coordinator", async () => {
    state.profileResult = {
      data: {
        ...state.profileResult.data!,
        role: "coordinator",
      },
      error: null,
    };
    state.grantsResult = { data: [], error: null };
    state.unitsResult = {
      data: null,
      error: new Error("database unavailable"),
    };

    await expect(loadActor()).rejects.toThrow("ACTOR_ACCESS_LOAD_FAILED");
  });

  it("rejects malformed active units returned for a coordinator", async () => {
    state.profileResult = {
      data: {
        ...state.profileResult.data!,
        role: "coordinator",
      },
      error: null,
    };
    state.grantsResult = { data: [], error: null };
    state.unitsResult = {
      data: [{ id: "unit-malformada" }],
      error: null,
    };

    await expect(loadActor()).rejects.toThrow("ACTOR_DATA_INVALID");
  });

  it("rejects a malformed unit id in active nutritionist grants", async () => {
    state.grantsResult = {
      data: [{ unit_id: "grant-malformado" }],
      error: null,
    };

    await expect(loadActor()).rejects.toThrow("ACTOR_DATA_INVALID");
  });

  it("creates a new frozen context from the active profile and current grants", async () => {
    const actor = await loadActor();

    expect(actor).toEqual({
      userId: user.id,
      fullName: "Nutricionista Teste",
      role: "nutritionist",
      primaryUnitId: "10000000-0000-4000-8000-000000000001",
      accessibleUnitIds: [
        "10000000-0000-4000-8000-000000000001",
        "10000000-0000-4000-8000-000000000002",
      ],
    });
    expect(Object.isFrozen(actor)).toBe(true);
    expect(Object.isFrozen(actor.accessibleUnitIds)).toBe(true);
    expect(profileEqMock.mock.calls).toEqual([
      ["id", user.id],
      ["active", true],
    ]);
    expect(grantsEqMock).toHaveBeenCalledWith("profile_id", user.id);
    expect(grantsIsMock).toHaveBeenCalledWith("revoked_at", null);
    expect(state.validFromFilter?.column).toBe("valid_from");
    expect(state.validUntilFilter?.column).toBe("valid_until");
    expect(state.validFromFilter?.value).toBe(
      state.validUntilFilter?.value,
    );
  });

  it("validates a unit identifier before loading the actor", async () => {
    await expect(requireUnitAccess("../outra-unidade")).rejects.toThrow(
      "Unidade inválida",
    );
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns the actor when the validated unit is accessible", async () => {
    await expect(
      requireUnitAccess("10000000-0000-4000-8000-000000000002"),
    ).resolves.toMatchObject({ userId: user.id });
  });

  it("rejects a validated unit outside the actor context", async () => {
    await expect(
      requireUnitAccess("10000000-0000-4000-8000-000000000003"),
    ).rejects.toThrow("UNIT_FORBIDDEN");
  });
});
