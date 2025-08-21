
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Simple "hashing" for demonstration. In a real app, use a proper library like bcrypt.
const simpleHash = (s: string) => {
    let h = 0;
    for(let i = 0; i < s.length; i++) {
        h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return h.toString();
};

interface SecurityContextType {
  lockedItems: Record<string, string>; // itemId (tabId or shopId) -> passwordHash
  unlockedItems: Set<string>;
  lockItem: (itemId: string, password: string) => void;
  unlockItem: (itemId: string) => void;
  removeItemLock: (itemId: string) => void;
  verifyPassword: (itemId: string, password: string) => boolean;
  isItemLocked: (itemId: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [lockedItems, setLockedItems] = useState<Record<string, string>>({});
  const [unlockedItems, setUnlockedItems] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        try {
          const settingsRef = doc(db, 'securitySettings', user.uid);
          const docSnap = await getDoc(settingsRef);
          if (docSnap.exists()) {
            setLockedItems(docSnap.data().lockedItems || {});
          } else {
            setLockedItems({});
          }
        } catch (error) {
          console.error("Failed to load security settings from Firestore", error);
        } finally {
           setIsLoaded(true);
        }
      } else {
        setLockedItems({});
        setUnlockedItems(new Set());
        setIsLoaded(true);
      }
    };
    fetchSettings();
  }, [user]);

  const saveToFirestore = async (data: Record<string, string>) => {
      if (!user) return;
      try {
        const settingsRef = doc(db, 'securitySettings', user.uid);
        await setDoc(settingsRef, { lockedItems: data }, { merge: true });
      } catch (error) {
        console.error("Failed to save security settings to Firestore", error)
      }
  }

  const lockItem = async (itemId: string, password: string) => {
    const newLocks = { ...lockedItems, [itemId]: simpleHash(password) };
    setLockedItems(newLocks);
    await saveToFirestore(newLocks);
    setUnlockedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
    })
  };
  
  const removeItemLock = async (itemId: string) => {
    const newLocks = { ...lockedItems };
    delete newLocks[itemId];
    setLockedItems(newLocks);
    await saveToFirestore(newLocks);
    setUnlockedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
    })
  }

  const unlockItem = (itemId: string) => {
    setUnlockedItems(prev => new Set(prev).add(itemId));
  };

  const verifyPassword = (itemId: string, password: string) => {
    return lockedItems[itemId] === simpleHash(password);
  };

  const isItemLocked = useCallback((itemId: string) => {
    if (!isLoaded || !user) return false;
    return lockedItems.hasOwnProperty(itemId) && !unlockedItems.has(itemId);
  }, [lockedItems, unlockedItems, isLoaded, user]);

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <SecurityContext.Provider value={{ lockedItems, unlockedItems, lockItem, unlockItem, removeItemLock, verifyPassword, isItemLocked }}>
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
