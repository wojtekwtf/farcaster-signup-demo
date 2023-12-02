"use client";

import { NobleEd25519Signer } from "@farcaster/hub-web";

import { createContext, useContext, useState, ReactNode } from "react";
import { Hex } from "viem";

type SignerContextType = {
  signer: NobleEd25519Signer | null;
  setSigner: React.Dispatch<React.SetStateAction<NobleEd25519Signer | null>>;
  signerPublicKey: Hex | undefined;
  setSignerPublicKey: React.Dispatch<React.SetStateAction<Hex | undefined>>;
};

const SignerContext = createContext<SignerContextType | null>(null);

export const SignerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [signer, setSigner] = useState<NobleEd25519Signer | null>(null);
  const [signerPublicKey, setSignerPublicKey] = useState<Hex | undefined>();

  return (
    <SignerContext.Provider
      value={{ signer, setSigner, signerPublicKey, setSignerPublicKey }}
    >
      {children}
    </SignerContext.Provider>
  );
};

export const useSigner = () => {
  const context = useContext(SignerContext);
  if (!context) {
    throw new Error("useSigner must be used within a SignerProvider");
  }
  return context;
};
