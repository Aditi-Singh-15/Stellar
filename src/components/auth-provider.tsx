
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

// Define a shape for the guest user object
const guestUser: User = {
  uid: 'demo-user',
  displayName: 'Guest User',
  email: 'guest@sahayak.ai',
  photoURL: null,
  emailVerified: true,
  isAnonymous: true,
  metadata: {},
  providerData: [],
  providerId: 'guest',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};


interface AuthContextType {
  user: User | null;
  loading: boolean;
  setGuestMode: (isGuest: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setGuestMode: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  const setGuestMode = (isGuest: boolean) => {
    setIsGuest(isGuest);
    if (isGuest) {
      setUser(guestUser);
      router.push('/dashboard');
    } else {
      // This will trigger the auth state change to sign out the real user if they were logged in
      auth?.signOut(); 
      setUser(null);
      router.push('/login');
    }
  };

  useEffect(() => {
    // If guest mode is active, don't do anything else.
    if (isGuest) {
        setLoading(false);
        return;
    }

    // If firebase is not configured, don't attempt to authenticate.
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      // If a guest session is active, don't replace it.
      if (isGuest) {
          setLoading(false);
          return;
      }
      
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="w-1/2 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, setGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}
