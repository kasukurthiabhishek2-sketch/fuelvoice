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
