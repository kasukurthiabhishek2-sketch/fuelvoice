import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'fuelvoice',
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'unknown',
      gitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown',
      productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
