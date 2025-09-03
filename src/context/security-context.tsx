
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface SecurityContextType {
  locks: Record<string, string>;
  setLock: (itemId: string, password: string) => Promise<void>;
  removeLock: (itemId: string) => Promise<void>;
  checkPassword: (itemId: string, password: string) => boolean;
  isItemLocked: (itemId: string, ignoreSessionUnlock?: boolean) => boolean;
  unlockItem: (itemId: string) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [locks, setLocks] = useState<Record<string, string>>({});
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocks = async () => {
        if (user) {
            const lockDocRef = doc(db, 'securityLocks', user.uid);
            const docSnap = await getDoc(lockDocRef);
            if (docSnap.exists()) {
                setLocks(docSnap.data() || {});
            } else {
                setLocks({});
            }
            // Reset session unlocks when user changes
            setUnlockedItems([]);
        } else {
             // Clear all security state on logout
            setLocks({});
            setUnlockedItems([]);
        }
    };
    fetchLocks();
  }, [user]);
  
  const setLock = useCallback(async (itemId: string, password: string) => {
    if (user) {
        const lockDocRef = doc(db, 'securityLocks', user.uid);
        const newLocks = { ...locks, [itemId]: password };

        try {
            await setDoc(lockDocRef, newLocks, { merge: true });
            setLocks(newLocks);
        } catch (error) {
            console.error("Failed to set lock in Firestore:", error);
        }
    }
  }, [user, locks]);

  const removeLock = useCallback(async (itemId: string) => {
    if (user) {
        const newLocks = { ...locks };
        delete newLocks[itemId];

        const lockDocRef = doc(db, 'securityLocks', user.uid);
        try {
            await setDoc(lockDocRef, newLocks); // Overwrite with the new map
            setLocks(newLocks);
            // Also remove it from the session's unlocked items
            setUnlockedItems(prev => prev.filter(id => id !== itemId));
        } catch (error) {
            console.error("Failed to remove lock in Firestore:", error);
        }
    }
  }, [user, locks]);


  const checkPassword = (itemId: string, input: string) => {
    return locks[itemId] === input;
  };
  
  const isItemLocked = (itemId: string, ignoreSessionUnlock = false) => {
      const hasPassword = !!locks[itemId];
      if (ignoreSessionUnlock) return hasPassword;

      const isUnlockedInSession = unlockedItems.includes(itemId);
      return hasPassword && !isUnlockedInSession;
  }

  const unlockItem = (itemId: string) => {
      // Add item to the session's unlocked list
      if (!unlockedItems.includes(itemId)) {
          setUnlockedItems(prev => [...prev, itemId]);
      }
  }

  return (
    <SecurityContext.Provider value={{ locks, setLock, removeLock, checkPassword, isItemLocked, unlockItem }}>
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
