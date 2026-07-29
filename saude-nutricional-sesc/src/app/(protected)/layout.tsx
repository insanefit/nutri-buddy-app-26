import type { ReactNode } from "react";
import { AppShell } from "../../components/app-shell";
import { loadActor } from "../../modules/access/actor";
import { getAccessibleUnitName } from "../../modules/access/repository";

type ProtectedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const actor = await loadActor();
  const primaryUnitName = await getAccessibleUnitName(
    actor.primaryUnitId,
  );

  return (
    <AppShell actor={actor} primaryUnitName={primaryUnitName}>
      {children}
    </AppShell>
  );
}
