
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const unprotectedRoutes = ['/login', '/signup', '/forgot-password'];
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
    if (loading) return;

    const isAuthRoute = unprotectedRoutes.includes(pathname);
    const isSpecialRoute = pathname === specialRoute;

    if (!user && !isAuthRoute) {
      // If user is not logged in and not on an auth page, redirect to login.
      router.push('/login');
    } else if (user && isAuthRoute) {
      // If user is logged in and on an auth page, redirect to shop selection.
      router.push('/select-shop');
    }
  }, [user, loading, pathname, router]);

  // Render a loading state while authentication is being checked, especially on protected routes.
  if (loading && !unprotectedRoutes.includes(pathname)) {
     return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }
  
  // If the user is not authenticated and is trying to access a protected route,
  // return null to prevent rendering the page content before the redirect happens.
  if (!user && !unprotectedRoutes.includes(pathname)) {
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
