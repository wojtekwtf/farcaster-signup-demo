import { ViemLocalEip712Signer } from "@farcaster/hub-web";

import { useAccount } from "wagmi";
import { Hex, PrivateKeyAccount, bytesToHex, hexToBytes } from "viem";
import { useCallback, useState } from "react";

import { toast } from "sonner";
import PuffLoader from "react-spinners/PuffLoader";
import { useSigner } from "@/providers/signerContext";
import { useFid } from "@/providers/fidContext";

export default function CollectAddKeySigButton({
  disabled,
  burnerAccount,
  metadata,
  deadline,
  setAddKeySig,
}: {
  disabled: boolean;
  burnerAccount?: PrivateKeyAccount;
  metadata: Hex;
  deadline: number;
  setAddKeySig: (sig: Hex) => void;
}) {
  const { fid } = useFid();
  const { signerPublicKey } = useSigner();
  const { isConnected } = useAccount();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCollected, setIsCollected] = useState<boolean>(false);

  const collectAddKeySig = useCallback(async () => {
    if (burnerAccount && metadata && signerPublicKey && deadline) {
      setIsLoading(true);

      const userEip712signer = new ViemLocalEip712Signer(burnerAccount);
      const sig = await userEip712signer.signAdd({
        key: hexToBytes(signerPublicKey),
        keyType: 1,
        metadata,
        metadataType: 1,
        owner: burnerAccount.address,
        nonce: BigInt(0),
        deadline: BigInt(deadline),
      });
      sig.match(
        (sig) => {
          setIsLoading(false);
          setIsCollected(true);
          setAddKeySig(bytesToHex(sig));
        },
        (error) => {
          setIsLoading(false);
          toast.error(error.message);
        }
      );
    }
  }, [burnerAccount, metadata, signerPublicKey, deadline, setIsLoading]);

  return (
    <button
      disabled={disabled || !fid || isCollected || !isConnected}
      onClick={() => collectAddKeySig()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${
        isCollected && "!bg-green-500 !text-white !dark:text-white"
      }}`}
    >
      {isCollected ? (
        "Collected"
      ) : (
        <div className="inline-flex justify-center items-center gap-x-2">
          <PuffLoader color="#ffffff" size={20} loading={isLoading} />
          Collect
        </div>
      )}
    </button>
  );
}
