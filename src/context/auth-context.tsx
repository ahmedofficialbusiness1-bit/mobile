
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authRoutes = ['/login', '/signup', '/forgot-password'];
const specialRoute = '/select-shop';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.email === 'ahmedofficialbusiness1@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return; // Wait until Firebase auth check is complete

    const isAuthRoute = authRoutes.includes(pathname);

    if (!user && !isAuthRoute) {
      // If not logged in and not on an auth page, redirect to login
      router.push('/login');
    } else if (user && isAuthRoute) {
      // If logged in and on an auth page, redirect to shop selection
      router.push('/select-shop');
    }
  }, [user, loading, pathname, router]);


  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <Logo />
        <div className="text-muted-foreground">Loading application...</div>
      </div>
    );
  }

  // Prevent rendering protected pages before redirect
  if (!user && !authRoutes.includes(pathname)) {
    return null;
  }
  
  // Prevent rendering auth pages before redirect
  if (user && authRoutes.includes(pathname)) {
      return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
