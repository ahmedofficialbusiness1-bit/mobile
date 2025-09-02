
'use client'

import React, { createContext, useContext, ReactNode } from 'react';

// This is a stub implementation to prevent errors after removing the security feature.
// It does nothing and all checks will pass.

interface SecurityContextType {
  isItemLocked: (itemId: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  const isItemLocked = (itemId: string) => {
    return false; // Always return false
  };

  return (
    <SecurityContext.Provider value={{ isItemLocked }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    // This provides a default value if the provider is not in the tree
    // which can happen if we are removing it.
    return {
        isItemLocked: () => false
    };
  }
  return context;
};
