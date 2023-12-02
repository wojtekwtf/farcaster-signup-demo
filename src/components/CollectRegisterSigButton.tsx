import { useAccount, useWalletClient } from "wagmi";
import { useFid } from "@/providers/fidContext";

import { useCallback, useState } from "react";
import PuffLoader from "react-spinners/PuffLoader";
import { toast } from "sonner";
import { ViemLocalEip712Signer } from "@farcaster/hub-web";
import { bytesToHex, Hex, PrivateKeyAccount } from "viem";

export default function CollectRegisterSigButton({
  burnerAccount,
  deadline,
  setRegisterSig,
}: {
  burnerAccount?: PrivateKeyAccount;
  deadline: number;
  setRegisterSig: (sig: Hex) => void;
}) {
  const { fid } = useFid();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCollected, setIsCollected] = useState<boolean>(false);

  const collectRegisterSig = useCallback(async () => {
    if (burnerAccount && address && deadline) {
      setIsLoading(true);
      const eip712signer = new ViemLocalEip712Signer(burnerAccount);
      const sig = await eip712signer.signRegister({
        to: burnerAccount.address,
        recovery: address,
        nonce: BigInt(0),
        deadline: BigInt(deadline),
      });
      sig.match(
        (sig) => {
          setIsLoading(false);
          setIsCollected(true);
          setRegisterSig(bytesToHex(sig));
        },
        (error) => {
          setIsLoading(false);
          toast.error(error.message);
        }
      );
    }
  }, [
    burnerAccount,
    walletClient,
    address,
    deadline,
    setIsLoading,
    setIsCollected,
    setRegisterSig,
  ]);

  return (
    <button
      disabled={!fid || isCollected || !isConnected || address === undefined}
      onClick={() => collectRegisterSig()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${
        isCollected && "!bg-green-500 !text-white !font-normal"
      }`}
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
