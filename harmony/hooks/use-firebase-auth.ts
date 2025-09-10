import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useFirebaseAuth() {
  const { user, isLoaded } = useUser();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setIsReady(true);
    }
  }, [isLoaded]);

  return {
    isReady,
    username: user?.username || null,
    user,
    isAuthenticated: !!user,
  };
}
