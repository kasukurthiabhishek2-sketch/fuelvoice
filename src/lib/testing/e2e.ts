/**
 * Whether deterministic browser-only E2E fixtures are allowed.
 *
 * Production deployments do not set NEXT_PUBLIC_FUELVOICE_E2E_MOCKS, so a
 * visitor cannot enable mock auth/data merely by writing localStorage. The
 * Playwright production-build harness opts in explicitly at build time.
 */
export function canUseE2EMocks(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_FUELVOICE_E2E_MOCKS === 'true'
  );
}


/** Enable deterministic station/review fixtures without pretending the visitor is signed in. */
export function canUseE2EGuestDataMocks(): boolean {
  if (!canUseE2EMocks() || typeof window === 'undefined') return false;
  return localStorage.getItem('fuelvoice:mock_guest_data') === 'true';
}


export type E2EAdminDataset = 'reviews' | 'reports' | 'users';

/** Deterministic admin-query turbulence used only by the explicit E2E build. */
export async function applyE2EAdminQueryBehavior(dataset: E2EAdminDataset): Promise<void> {
  if (!canUseE2EMocks() || typeof window === 'undefined') return;

  const mode = localStorage.getItem(`fuelvoice:mock_admin_${dataset}`);
  if (mode === 'slow') {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 1500));
  }
  if (mode === 'error') {
    throw new Error(`Mock admin ${dataset} query failed`);
  }
}
