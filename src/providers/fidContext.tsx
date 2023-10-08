
'use client'
// FidContext.js
import { createContext, useContext, useState, ReactNode } from 'react';

type FidContextType = {
  fid: number;
  setFid: React.Dispatch<React.SetStateAction<number>>;
};

const FidContext = createContext<FidContextType | null>(null);

export const FidProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fid, setFid] = useState<number>(0);

  return (
    <FidContext.Provider value={{ fid, setFid }}>
      {children}
    </FidContext.Provider>
  );
};

export const useFid = () => {
  const context = useContext(FidContext);
  if (!context) {
    throw new Error('useFid must be used within a FidProvider');
  }
  return context;
};
