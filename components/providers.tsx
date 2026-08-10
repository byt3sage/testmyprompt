"use client";

import posthog from "posthog-js";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
};

function PostHogIdentity() {
  const { data: session, status } = useSession();
  const identifiedUserId = useRef<string | null>(null);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    const userId = session?.user?.id;

    if (status !== "authenticated" || !userId) {
      if (wasAuthenticated.current) {
        posthog.reset();
        identifiedUserId.current = null;
        wasAuthenticated.current = false;
      }
      return;
    }

    if (identifiedUserId.current !== userId) {
      if (identifiedUserId.current) {
        posthog.reset();
      }

      posthog.identify(userId, {
        email: session.user.email,
        name: session.user.name,
      });
      identifiedUserId.current = userId;
    }

    wasAuthenticated.current = true;
  }, [session?.user?.email, session?.user?.id, session?.user?.name, status]);

  return null;
}

export function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <PostHogIdentity />
      {children}
    </SessionProvider>
  );
}
