export type AppRole = "coordinator" | "nutritionist";

export type ActorContext = Readonly<{
  userId: string;
  fullName: string;
  role: AppRole;
  primaryUnitId: string;
  accessibleUnitIds: readonly string[];
}>;
