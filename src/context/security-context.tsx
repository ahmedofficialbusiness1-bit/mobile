
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';

// This is a simplified, client-side only security context.
// For production, a more robust solution would be needed.

interface SecurityContextType {
  locks: Record<string, string>;
  setLock: (itemId: string, password: string) => void;
  removeLock: (itemId: string) => void;
  checkPassword: (itemId: string, password: string) => boolean;
  isItemLocked: (itemId: string, ignoreSessionUnlock?: boolean) => boolean;
  unlockItem: (itemId: string) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [locks, setLocks] = useState<Record<string, string>>({});
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);

  // Load state from localStorage on mount or when user changes
  useEffect(() => {
    if (user) {
        try {
            const storedLocks = localStorage.getItem(`sl_${user.uid}`);
            if (storedLocks) {
                setLocks(JSON.parse(storedLocks));
            } else {
                setLocks({});
            }
        } catch (error) {
            console.error("Failed to load security settings from localStorage", error);
            setLocks({});
        }
        // Reset session unlocks when user changes
        setUnlockedItems([]);
    } else {
        // Clear all security state on logout
        setLocks({});
        setUnlockedItems([]);
    }
  }, [user]);

  const setLock = useCallback((itemId: string, password: string) => {
    if (user) {
        setLocks(prev => {
            const newLocks = { ...prev, [itemId]: password };
            localStorage.setItem(`sl_${user.uid}`, JSON.stringify(newLocks));
            return newLocks;
        });
    }
  }, [user]);

  const removeLock = useCallback((itemId: string) => {
    if (user) {
        setLocks(prev => {
            const newLocks = { ...prev };
            delete newLocks[itemId];
            localStorage.setItem(`sl_${user.uid}`, JSON.stringify(newLocks));
            return newLocks;
        });
        // Also remove it from the session's unlocked items
        setUnlockedItems(prev => prev.filter(id => id !== itemId));
    }
  }, [user]);

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
