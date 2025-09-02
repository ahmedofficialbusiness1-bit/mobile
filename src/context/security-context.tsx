
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';

// This is a simplified, client-side only security context.
// For production, a more robust solution would be needed.

interface SecurityContextType {
  password: string | null;
  setPassword: (password: string) => void;
  checkPassword: (password: string) => boolean;
  lockedItems: string[];
  toggleLockedItem: (itemId: string) => void;
  isItemLocked: (itemId: string) => boolean;
  unlockItem: (itemId: string) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [password, setPasswordState] = useState<string | null>(null);
  const [lockedItems, setLockedItems] = useState<string[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    if (user) {
        try {
            const storedPassword = localStorage.getItem(`sp_${user.uid}`);
            const storedLockedItems = localStorage.getItem(`sl_${user.uid}`);
            if (storedPassword) setPasswordState(storedPassword);
            if (storedLockedItems) setLockedItems(JSON.parse(storedLockedItems));
        } catch (error) {
            console.error("Failed to load security settings from localStorage", error);
        }
    }
  }, [user]);

  const setPassword = useCallback((newPassword: string) => {
    if (user) {
        setPasswordState(newPassword);
        localStorage.setItem(`sp_${user.uid}`, newPassword);
    }
  }, [user]);

  const checkPassword = (input: string) => {
    return input === password;
  };

  const toggleLockedItem = useCallback((itemId: string) => {
    if (user) {
        const newLockedItems = lockedItems.includes(itemId)
          ? lockedItems.filter(id => id !== itemId)
          : [...lockedItems, itemId];
        setLockedItems(newLockedItems);
        localStorage.setItem(`sl_${user.uid}`, JSON.stringify(newLockedItems));
    }
  }, [lockedItems, user]);
  
  const isItemLocked = (itemId: string) => {
      // An item is locked if it's in the lockedItems list AND not in the session's unlockedItems list
      return lockedItems.includes(itemId) && !unlockedItems.includes(itemId);
  }

  const unlockItem = (itemId: string) => {
      // Add item to the session's unlocked list
      if (!unlockedItems.includes(itemId)) {
          setUnlockedItems(prev => [...prev, itemId]);
      }
  }

  return (
    <SecurityContext.Provider value={{ password, setPassword, checkPassword, lockedItems, toggleLockedItem, isItemLocked, unlockItem }}>
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
