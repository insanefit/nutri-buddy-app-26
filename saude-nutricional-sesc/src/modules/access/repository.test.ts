import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryResult<T> = {
  data: T | null;
  error: Error | null;
};

const {
  createClientMock,
  fromMock,
  grantOrderMock,
  grantQuery,
  grantSelectMock,
  profileEqMock,
  profileOrderMock,
  profileQuery,
  profileSelectMock,
  state,
  unitEqMock,
  unitMaybeSingleMock,
  unitNameQuery,
  unitNameSelectMock,
  unitOptionEqMock,
  unitOptionOrderMock,
  unitOptionQuery,
  unitOptionSelectMock,
} = vi.hoisted(() => {
  const hoistedState: {
    grantsResult: QueryResult<unknown[]>;
    profileOptionsResult: QueryResult<unknown[]>;
    unitNameResult: QueryResult<unknown>;
    unitOptionsResult: QueryResult<unknown[]>;
  } = {
    grantsResult: { data: [], error: null },
    profileOptionsResult: { data: [], error: null },
    unitNameResult: { data: null, error: null },
    unitOptionsResult: { data: [], error: null },
  };

  const grantQueryDouble: Record<string, unknown> = {};
  const profileQueryDouble: Record<string, unknown> = {};
  const unitNameQueryDouble: Record<string, unknown> = {};
  const unitOptionQueryDouble: Record<string, unknown> = {};

  return {
    createClientMock: vi.fn(),
    fromMock: vi.fn(),
    grantOrderMock: vi.fn(async () => hoistedState.grantsResult),
    grantSelectMock: vi.fn(() => grantQueryDouble),
    grantQuery: grantQueryDouble,
    profileEqMock: vi.fn(() => profileQueryDouble),
    profileOrderMock: vi.fn(async () => hoistedState.profileOptionsResult),
    profileSelectMock: vi.fn(() => profileQueryDouble),
    profileQuery: profileQueryDouble,
    state: hoistedState,
    unitEqMock: vi.fn(() => unitNameQueryDouble),
    unitMaybeSingleMock: vi.fn(async () => hoistedState.unitNameResult),
    unitNameQuery: unitNameQueryDouble,
    unitNameSelectMock: vi.fn(() => unitNameQueryDouble),
    unitOptionEqMock: vi.fn(() => unitOptionQueryDouble),
    unitOptionOrderMock: vi.fn(async () => hoistedState.unitOptionsResult),
    unitOptionQuery: unitOptionQueryDouble,
    unitOptionSelectMock: vi.fn(() => unitOptionQueryDouble),
  };
});

vi.mock("../../platform/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("next/dist/compiled/server-only", () => ({}));

Object.assign(grantQuery, { order: grantOrderMock });
Object.assign(profileQuery, {
  eq: profileEqMock,
  order: profileOrderMock,
});
Object.assign(unitNameQuery, {
  eq: unitEqMock,
  maybeSingle: unitMaybeSingleMock,
});
Object.assign(unitOptionQuery, {
  eq: unitOptionEqMock,
  order: unitOptionOrderMock,
});

import {
  getAccessibleUnitName,
  listAccessAdministrationOptions,
  listAccessGrants,
} from "./repository";

const unitOneId = "10000000-0000-4000-8000-000000000001";
const unitTwoId = "10000000-0000-4000-8000-000000000002";
const nutritionistId = "00000000-0000-4000-8000-000000000002";
const coordinatorId = "00000000-0000-4000-8000-000000000001";
const activeGrantId = "20000000-0000-4000-8000-000000000001";
const revokedGrantId = "20000000-0000-4000-8000-000000000002";

const activeGrantRow = {
  id: activeGrantId,
  profile_id: nutritionistId,
  unit_id: unitTwoId,
  reason: "Cobertura temporária do atendimento",
  granted_by: coordinatorId,
  valid_from: "2026-07-28T12:00:00.000Z",
  valid_until: "2026-12-31T23:59:59.000Z",
  revoked_at: null,
  revocation_reason: null,
  profile: { full_name: "Nutricionista Teste" },
  unit: { name: "Unidade Piloto 2" },
  grantor: { full_name: "Coordenação Teste" },
  access_token: "campo-externo-que-nao-pode-ser-propagado",
};

const revokedGrantRow = {
  ...activeGrantRow,
  id: revokedGrantId,
  reason: "Apoio durante afastamento profissional",
  revoked_at: "2026-07-29T12:00:00.000Z",
  revocation_reason: "Cobertura temporária encerrada",
};

describe("access repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30T12:00:00.000Z"));
    state.grantsResult = {
      data: [activeGrantRow, revokedGrantRow],
      error: null,
    };
    state.profileOptionsResult = {
      data: [
        {
          id: nutritionistId,
          full_name: "Nutricionista Teste",
          primary_unit_id: unitOneId,
          role: "nutritionist",
          active: true,
        },
      ],
      error: null,
    };
    state.unitNameResult = {
      data: {
        id: unitOneId,
        name: "Unidade Piloto 1",
        active: true,
      },
      error: null,
    };
    state.unitOptionsResult = {
      data: [
        {
          id: unitOneId,
          name: "Unidade Piloto 1",
          active: true,
          created_at: "2026-07-28T00:00:00.000Z",
        },
        {
          id: unitTwoId,
          name: "Unidade Piloto 2",
          active: true,
          created_at: "2026-07-28T00:00:00.000Z",
        },
      ],
      error: null,
    };

    fromMock.mockImplementation((table: string) => {
      if (table === "unit_access_grants") {
        return { select: grantSelectMock };
      }
      if (table === "profiles") {
        return { select: profileSelectMock };
      }
      if (table === "units") {
        return {
          select: vi.fn((selection: string) =>
            selection === "id, name, active"
              ? unitNameSelectMock()
              : unitOptionSelectMock(),
          ),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });
    createClientMock.mockResolvedValue({ from: fromMock });
  });

  it("returns validated active and revoked summaries without leaking extra fields", async () => {
    const summaries = await listAccessGrants();

    expect(summaries).toEqual([
      {
        id: activeGrantId,
        profileId: nutritionistId,
        profileName: "Nutricionista Teste",
        unitId: unitTwoId,
        unitName: "Unidade Piloto 2",
        reason: "Cobertura temporária do atendimento",
        grantorName: "Coordenação Teste",
        validFrom: "2026-07-28T12:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z",
        revokedAt: null,
        revocationReason: null,
        status: "active",
      },
      {
        id: revokedGrantId,
        profileId: nutritionistId,
        profileName: "Nutricionista Teste",
        unitId: unitTwoId,
        unitName: "Unidade Piloto 2",
        reason: "Apoio durante afastamento profissional",
        grantorName: "Coordenação Teste",
        validFrom: "2026-07-28T12:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z",
        revokedAt: "2026-07-29T12:00:00.000Z",
        revocationReason: "Cobertura temporária encerrada",
        status: "revoked",
      },
    ]);
    expect(JSON.stringify(summaries)).not.toContain("access_token");
  });

  it("returns a new deeply frozen list on each load", async () => {
    const first = await listAccessGrants();
    const second = await listAccessGrants();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first[0])).toBe(true);
    expect(() => {
      (first as unknown as { status: string }[])[0]!.status = "revoked";
    }).toThrow(TypeError);
  });

  it("marks a non-revoked grant as expired using the server clock", async () => {
    state.grantsResult = {
      data: [
        {
          ...activeGrantRow,
          valid_until: "2026-07-29T23:59:59.000Z",
        },
      ],
      error: null,
    };

    await expect(listAccessGrants()).resolves.toMatchObject([
      { status: "expired" },
    ]);
  });

  it("fails closed when grants cannot be loaded", async () => {
    state.grantsResult = {
      data: null,
      error: new Error("relation unit_access_grants unavailable"),
    };

    await expect(listAccessGrants()).rejects.toThrow(
      "ACCESS_GRANTS_LOAD_FAILED",
    );
  });

  it("fails closed when a grant or joined name is malformed", async () => {
    state.grantsResult = {
      data: [{ ...activeGrantRow, profile: null }],
      error: null,
    };

    await expect(listAccessGrants()).rejects.toThrow(
      "ACCESS_DATA_INVALID",
    );
  });

  it("resolves only the validated accessible unit requested by the layout", async () => {
    await expect(getAccessibleUnitName(unitOneId)).resolves.toBe(
      "Unidade Piloto 1",
    );
    expect(unitEqMock).toHaveBeenCalledWith("id", unitOneId);
    expect(unitEqMock).toHaveBeenCalledWith("active", true);
  });

  it("fails closed for absent, mismatched or malformed accessible units", async () => {
    state.unitNameResult = { data: null, error: null };
    await expect(getAccessibleUnitName(unitOneId)).rejects.toThrow(
      "ACCESSIBLE_UNIT_NOT_FOUND",
    );

    state.unitNameResult = {
      data: { id: unitTwoId, name: "Unidade Piloto 2", active: true },
      error: null,
    };
    await expect(getAccessibleUnitName(unitOneId)).rejects.toThrow(
      "ACCESS_DATA_INVALID",
    );

    state.unitNameResult = {
      data: { id: unitOneId, name: "", active: true },
      error: null,
    };
    await expect(getAccessibleUnitName(unitOneId)).rejects.toThrow(
      "ACCESS_DATA_INVALID",
    );
  });

  it("does not expose database errors while resolving the unit name", async () => {
    state.unitNameResult = {
      data: null,
      error: new Error("permission denied for table units"),
    };

    await expect(getAccessibleUnitName(unitOneId)).rejects.toThrow(
      "ACCESSIBLE_UNIT_LOAD_FAILED",
    );
  });

  it("returns frozen validated administration options", async () => {
    const options = await listAccessAdministrationOptions();

    expect(options.profiles).toEqual([
      {
        id: nutritionistId,
        fullName: "Nutricionista Teste",
        primaryUnitId: unitOneId,
      },
    ]);
    expect(options.units).toEqual([
      { id: unitOneId, name: "Unidade Piloto 1" },
      { id: unitTwoId, name: "Unidade Piloto 2" },
    ]);
    expect(Object.isFrozen(options)).toBe(true);
    expect(Object.isFrozen(options.profiles)).toBe(true);
    expect(Object.isFrozen(options.profiles[0])).toBe(true);
    expect(Object.isFrozen(options.units)).toBe(true);
    expect(Object.isFrozen(options.units[0])).toBe(true);
  });

  it("fails closed when administration options are malformed or unavailable", async () => {
    state.profileOptionsResult = {
      data: [
        {
          id: "perfil-malformado",
          full_name: "Nutricionista Teste",
          primary_unit_id: unitOneId,
          role: "nutritionist",
          active: true,
        },
      ],
      error: null,
    };
    await expect(listAccessAdministrationOptions()).rejects.toThrow(
      "ACCESS_DATA_INVALID",
    );

    state.profileOptionsResult = { data: [], error: null };
    state.unitOptionsResult = {
      data: null,
      error: new Error("units unavailable"),
    };
    await expect(listAccessAdministrationOptions()).rejects.toThrow(
      "ACCESS_OPTIONS_LOAD_FAILED",
    );
  });
});
