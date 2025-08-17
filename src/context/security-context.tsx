
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

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
  const [lockedTabs, setLockedTabs] = useState<Record<string, string>>({});
  const [unlockedTabs, setUnlockedTabs] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedLocks = localStorage.getItem('dirabiz_locks');
      if (storedLocks) {
        setLockedTabs(JSON.parse(storedLocks));
      }
    } catch (error) {
        console.error("Failed to load security settings from localStorage", error)
    }
    setIsLoaded(true);
  }, []);

  const saveToLocalStorage = (data: Record<string, string>) => {
      try {
        localStorage.setItem('dirabiz_locks', JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save security settings to localStorage", error)
      }
  }

  const lockTab = (tabId: string, password: string) => {
    const newLocks = { ...lockedTabs, [tabId]: simpleHash(password) };
    setLockedTabs(newLocks);
    saveToLocalStorage(newLocks);
    // Re-lock the tab if it was previously unlocked
    setUnlockedTabs(prev => {
        const newSet = new Set(prev);
        newSet.delete(tabId);
        return newSet;
    })
  };
  
  const removeLock = (tabId: string) => {
    const newLocks = { ...lockedTabs };
    delete newLocks[tabId];
    setLockedTabs(newLocks);
    saveToLocalStorage(newLocks);
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
    if (!isLoaded) return false; // Don't lock tabs until settings are loaded
    return lockedTabs.hasOwnProperty(tabId) && !unlockedTabs.has(tabId);
  }, [lockedTabs, unlockedTabs, isLoaded]);

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
