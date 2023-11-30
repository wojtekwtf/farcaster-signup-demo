import { NobleEd25519Signer, ViemWalletEip712Signer } from "@farcaster/hub-web";

import { useAccount, useWalletClient } from "wagmi";
import * as ed from "@noble/ed25519";
import { Hex, bytesToHex, hexToBytes } from "viem";
import { useCallback, useEffect, useState } from "react";

import { useFid } from "@/providers/fidContext";

import { toast } from "sonner";
import PuffLoader from "react-spinners/PuffLoader";
import { useSigner } from "@/providers/signerContext";

export default function GenerateSignedKeyMetadataButton({
  disabled,
  deadline,
  setMetadata,
}: {
  disabled: boolean;
  deadline: number;
  setMetadata: (metadata: Hex) => void;
}) {
  const { fid } = useFid();
  const { setSigner, signerPublicKey, setSignerPublicKey } = useSigner();
  const { address, isConnected } = useAccount();

  const [privateKey, setPrivateKey] = useState<Uint8Array | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCollected, setIsCollected] = useState<boolean>(false);

  const { data: walletClient } = useWalletClient();

  const generateSignedKeyMetadata = useCallback(async () => {
    if (walletClient && signerPublicKey && deadline && address) {
      setIsLoading(true);

      const appEip712signer = new ViemWalletEip712Signer(walletClient);
      const metadata = await appEip712signer.getSignedKeyRequestMetadata({
        requestFid: BigInt(fid ?? 0),
        key: hexToBytes(signerPublicKey),
        deadline: BigInt(deadline),
      });
      metadata.match(
        (metadata) => {
          setIsLoading(false);
          setIsCollected(true);
          setMetadata(bytesToHex(metadata));
        },
        (error) => {
          setIsLoading(false);
          toast.error(error.message);
        }
      );
    }
  }, [walletClient, fid, signerPublicKey, deadline, address, setIsLoading]);

  const generateKeyPair = async () => {
    const privateKey = ed.utils.randomPrivateKey();
    const publicKeyBytes = await ed.getPublicKeyAsync(privateKey);
    const publicKey = `0x${Buffer.from(publicKeyBytes).toString("hex")}`;
    setPrivateKey(privateKey);
    setSignerPublicKey(publicKey as `0x${string}`);
  };

  useEffect(() => {
    if (signerPublicKey === undefined && privateKey === undefined) {
      generateKeyPair();
    }
  }, []);

  useEffect(() => {
    const signerPublicKeyLocalStorageKey = `signerPublicKey-${fid}`;
    const signerPrivateKeyLocalStorageKey = `signerPrivateKey-${fid}`;

    if (isCollected === true) {
      if (
        localStorage.getItem(signerPublicKeyLocalStorageKey) !== null &&
        localStorage.getItem(signerPrivateKeyLocalStorageKey) !== null
      ) {
        return;
      }

      localStorage.setItem(
        signerPublicKeyLocalStorageKey,
        signerPublicKey as `0x${string}`
      );
      localStorage.setItem(
        signerPrivateKeyLocalStorageKey,
        ed.etc.bytesToHex(privateKey as Uint8Array)
      );

      const ed25519Signer = new NobleEd25519Signer(privateKey as Uint8Array);
      setSigner(ed25519Signer);
      toast.success("Signer added");
    }
  }, [isCollected]);

  return (
    <button
      disabled={
        disabled || !fid || isCollected || !isConnected || !walletClient
      }
      onClick={() => generateSignedKeyMetadata()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${
        isCollected && "!bg-green-500 !text-white !dark:text-white"
      }}`}
    >
      {isCollected ? (
        "Saved"
      ) : (
        <div className="inline-flex justify-center items-center gap-x-2">
          <PuffLoader color="#ffffff" size={20} loading={isLoading} />
          Generate
        </div>
      )}
    </button>
  );
}
