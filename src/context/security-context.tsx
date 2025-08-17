
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Simple "hashing" for demonstration. In a real app, use a proper library like bcrypt.
const simpleHash = (s: string) => {
    let h = 0;
    for(let i = 0; i < s.length; i++) {
        h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return h.toString();
};

interface SecurityContextType {
  lockedTabs: Record<string, string>; // tabId -> passwordHash
  unlockedTabs: Set<string>;
  lockTab: (tabId: string, password: string) => void;
  unlockTab: (tabId: string) => void;
  removeLock: (tabId: string) => void;
  verifyPassword: (tabId: string, password: string) => boolean;
  isTabLocked: (tabId: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [lockedTabs, setLockedTabs] = useState<Record<string, string>>({});
  const [unlockedTabs, setUnlockedTabs] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        try {
          const settingsRef = doc(db, 'securitySettings', user.uid);
          const docSnap = await getDoc(settingsRef);
          if (docSnap.exists()) {
            setLockedTabs(docSnap.data().lockedTabs || {});
          } else {
            setLockedTabs({});
          }
        } catch (error) {
          console.error("Failed to load security settings from Firestore", error);
        } finally {
           setIsLoaded(true);
        }
      } else {
        // If no user, reset settings and mark as loaded
        setLockedTabs({});
        setUnlockedTabs(new Set());
        setIsLoaded(true);
      }
    };
    fetchSettings();
  }, [user]);

  const saveToFirestore = async (data: Record<string, string>) => {
      if (!user) return;
      try {
        const settingsRef = doc(db, 'securitySettings', user.uid);
        await setDoc(settingsRef, { lockedTabs: data }, { merge: true });
      } catch (error) {
        console.error("Failed to save security settings to Firestore", error)
      }
  }

  const lockTab = async (tabId: string, password: string) => {
    const newLocks = { ...lockedTabs, [tabId]: simpleHash(password) };
    setLockedTabs(newLocks);
    await saveToFirestore(newLocks);
    // Re-lock the tab if it was previously unlocked
    setUnlockedTabs(prev => {
        const newSet = new Set(prev);
        newSet.delete(tabId);
        return newSet;
    })
  };
  
  const removeLock = async (tabId: string) => {
    const newLocks = { ...lockedTabs };
    delete newLocks[tabId];
    setLockedTabs(newLocks);
    await saveToFirestore(newLocks);
    setUnlockedTabs(prev => {
        const newSet = new Set(prev);
        newSet.delete(tabId);
        return newSet;
    })
  }

  const unlockTab = (tabId: string) => {
    setUnlockedTabs(prev => new Set(prev).add(tabId));
  };

  const verifyPassword = (tabId: string, password: string) => {
    return lockedTabs[tabId] === simpleHash(password);
  };

  const isTabLocked = useCallback((tabId: string) => {
    if (!isLoaded || !user) return false; // Don't lock tabs if not loaded or no user
    return lockedTabs.hasOwnProperty(tabId) && !unlockedTabs.has(tabId);
  }, [lockedTabs, unlockedTabs, isLoaded, user]);

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <SecurityContext.Provider value={{ lockedTabs, unlockedTabs, lockTab, unlockTab, removeLock, verifyPassword, isTabLocked }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
