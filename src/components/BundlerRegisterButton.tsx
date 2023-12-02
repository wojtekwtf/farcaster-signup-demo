import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
  useContractRead,
} from "wagmi";

import { useEffect, useState } from "react";
import PuffLoader from "react-spinners/PuffLoader";
import { toast } from "sonner";
import { BUNDLER_ADDRESS, bundlerABI } from "@farcaster/hub-web";
import { Hex, PrivateKeyAccount, bytesToHex, zeroAddress } from "viem";
import { useSigner } from "@/providers/signerContext";

export default function BundlerRegisterButton({
  burnerAccount,
  burnerFid,
  deadline,
  registerSig,
  addKeySig,
  metadata,
  setBurnerFid,
  setRegisterTxHash,
}: {
  burnerAccount?: PrivateKeyAccount;
  burnerFid: number;
  deadline: number;
  registerSig: Hex;
  addKeySig: Hex;
  metadata: Hex;
  setBurnerFid: (fid: number) => void;
  setRegisterTxHash: (hash: string) => void;
}) {
  const { signerPublicKey } = useSigner();
  const { address, isConnected } = useAccount();

  const { data: price }: { data: bigint | undefined } = useContractRead({
    address: BUNDLER_ADDRESS,
    abi: bundlerABI,
    functionName: "price",
    args: [BigInt(0)],
    chainId: 10,
  });

  const { config, isError, error } = usePrepareContractWrite({
    address: BUNDLER_ADDRESS,
    abi: bundlerABI,
    functionName: "register",
    args: [
      {
        to: burnerAccount?.address ?? zeroAddress,
        recovery: address ?? zeroAddress,
        deadline: BigInt(deadline),
        sig: registerSig,
      },
      [
        {
          keyType: 1,
          key: signerPublicKey ?? "0x00",
          metadataType: 1,
          metadata: metadata,
          deadline: BigInt(deadline),
          sig: addKeySig,
        },
      ],
      BigInt(0),
    ],
    enabled: Boolean(price && registerSig && addKeySig && metadata),
    value: BigInt(price ?? 0),
  });
  const { data: registerTxHash, write } = useContractWrite(config);

  const {
    data: txFid,
    isLoading,
    isSuccess: isSuccessTx,
  } = useWaitForTransaction({
    hash: registerTxHash?.hash,
  });

  const register = async () => {
    if (isError) {
      toast.error("Error registering", { description: error?.message });
    } else {
      write?.();
    }
  };

  useEffect(() => {
    if (isSuccessTx && burnerFid === 0) {
      const newFid = parseInt(txFid?.logs[0].topics[2] as string, 16);
      setBurnerFid(newFid);
      toast.success(`FID ${newFid} registered!`);
    }
  }, [isSuccessTx]);

  useEffect(() => {
    if (!!registerTxHash) {
      setRegisterTxHash(registerTxHash.hash);
    }
  }, [registerTxHash]);

  return (
    <button
      disabled={
        !isConnected ||
        address === undefined ||
        registerSig === "0x00" ||
        addKeySig === "0x00"
      }
      onClick={() => register()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${
        burnerFid && "!bg-green-500 !text-white !font-normal"
      }`}
    >
      {burnerFid ? (
        `FID: ${burnerFid}`
      ) : (
        <div className="inline-flex justify-center items-center gap-x-2">
          <PuffLoader color="#ffffff" size={20} loading={isLoading} />
          Register
        </div>
      )}
    </button>
  );
}
