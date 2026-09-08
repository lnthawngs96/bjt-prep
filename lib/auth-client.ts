'use client';

import { createAuthClient } from 'better-auth/react';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import type { auth } from '@/lib/auth';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  plugins: [
    adminClient(),
    // Kéo các trường phụ (locale, role) từ cấu hình server sang type của client.
    inferAdditionalFields<typeof auth>(),
  ],
});

export const { signIn, signOut, useSession } = authClient;
