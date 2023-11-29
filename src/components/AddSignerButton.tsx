import {
  KEY_GATEWAY_ADDRESS,
  NobleEd25519Signer,
  ViemWalletEip712Signer,
} from "@farcaster/hub-web";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
  useWalletClient,
} from "wagmi";
import * as ed from "@noble/ed25519";
import { bytesToHex, hexToBytes } from "viem";
import { useCallback, useEffect, useState } from "react";
import { KeyGatewayABI } from "@/abi/KeyGatewayABI";

import { useFid } from "@/providers/fidContext";

import { toast } from "sonner";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import PuffLoader from "react-spinners/PuffLoader";
import { useSigner } from "@/providers/signerContext";

export default function AddSignerButton({
  setAddSignerTxHash,
}: {
  setAddSignerTxHash: (hash: string) => void;
}) {
  const { fid } = useFid();
  const { signer, setSigner } = useSigner();
  const { isConnected } = useAccount();

  const [privateKey, setPrivateKey] = useState<Uint8Array | undefined>();
  const [publicKey, setPublicKey] = useState<`0x${string}` | undefined>();
  const [metadata, setMetadata] = useState<`0x${string}` | undefined>();
  const [deadline, setDeadline] = useState<number>(0);
  const [isLoadingSign, setIsLoadingSign] = useState<boolean>(false);

  const { data: walletClient } = useWalletClient();

  const {
    config,
    isSuccess: isSuccessPrepare,
    isError: isErrorPrepareContractWrite,
    error: errorPrepareContractWrite,
  } = usePrepareContractWrite({
    address: KEY_GATEWAY_ADDRESS,
    abi: KeyGatewayABI,
    functionName: "add",
    args: [1, publicKey, 1, metadata],
    enabled: Boolean(metadata),
  });

  const {
    data: txData,
    isError: isErrorContractWrite,
    error: errorContractWrite,
    write: writeAddSigner,
  } = useContractWrite(config);

  const { isLoading: isLoadingTx, isSuccess: isSuccessTx } =
    useWaitForTransaction({
      hash: txData?.hash,
    });

  const addSigner = useCallback(async () => {
    if (walletClient && fid && publicKey && deadline) {
      setIsLoadingSign(true);
      const eip712signer = new ViemWalletEip712Signer(walletClient);
      const metadata = await eip712signer.getSignedKeyRequestMetadata({
        requestFid: BigInt(fid),
        key: hexToBytes(publicKey),
        deadline: BigInt(deadline),
      });
      metadata.match(
        (metadata) => {
          setIsLoadingSign(false);
          setMetadata(bytesToHex(metadata));
        },
        (error) => {
          setIsLoadingSign(false);
          toast.error(error.message);
        }
      );
    }
  }, [walletClient, fid, publicKey, deadline, setIsLoadingSign, setMetadata]);

  const generateKeyPair = async () => {
    const privateKey = ed.utils.randomPrivateKey();
    const publicKeyBytes = await ed.getPublicKeyAsync(privateKey);
    const publicKey = `0x${Buffer.from(publicKeyBytes).toString("hex")}`;
    setPrivateKey(privateKey);
    setPublicKey(publicKey as `0x${string}`);
  };

  useEffect(() => {
    if (publicKey === undefined && privateKey === undefined) {
      generateKeyPair();
    }
    if (deadline === 0) {
      const oneHour = 60 * 60;
      const deadline = Math.floor(Date.now() / 1000) + oneHour;
      setDeadline(deadline);
    }
  }, []);

  useEffect(() => {
    // This will trigger the tx signing prompt once the tx is prepared and simulated by wagmi
    if (isSuccessPrepare && !!metadata && !!deadline && !signer) {
      // this may be buggy: isSuccessPrepare can trigger randomly in wrong moments
      // but at least we have a check that it wont once we have a signer
      writeAddSigner?.();
    }
  }, [isSuccessPrepare]);

  useEffect(() => {
    if (!signer) {
      if (isErrorPrepareContractWrite) {
        toast.error(errorPrepareContractWrite?.message);
      }
      if (isErrorContractWrite) {
        toast.error(errorContractWrite?.message);
      }
    }
  }, [isErrorPrepareContractWrite, isErrorContractWrite]);

  useEffect(() => {
    const signerPublicKeyLocalStorageKey = `signerPublicKey-${fid}`;
    const signerPrivateKeyLocalStorageKey = `signerPrivateKey-${fid}`;

    if (isLoadingTx) {
      console.log(`https://optimistic.etherscan.io/tx/${txData?.hash}`);
    }

    if (isSuccessTx === true) {
      if (
        localStorage.getItem(signerPublicKeyLocalStorageKey) !== null &&
        localStorage.getItem(signerPrivateKeyLocalStorageKey) !== null
      ) {
        return;
      }

      localStorage.setItem(
        signerPublicKeyLocalStorageKey,
        publicKey as `0x${string}`
      );
      localStorage.setItem(
        signerPrivateKeyLocalStorageKey,
        ed.etc.bytesToHex(privateKey as Uint8Array)
      );

      const ed25519Signer = new NobleEd25519Signer(privateKey as Uint8Array);
      setSigner(ed25519Signer);
      toast.success("Signer added");
    }
  }, [isLoadingTx, isSuccessTx]);

  useEffect(() => {
    if (!!txData) {
      setAddSignerTxHash(txData.hash);
    }
  }, [txData]);

  return (
    <button
      disabled={!isConnected || !walletClient || !fid || !!signer}
      onClick={() => addSigner()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${
        (isSuccessTx || !!signer) &&
        "!bg-green-500 !text-white !dark:text-white"
      }}`}
    >
      {!!signer ? (
        <CheckCircleIcon className="w-5 h-5" />
      ) : (
        <div className="inline-flex justify-center items-center gap-x-2">
          <PuffLoader
            color="#ffffff"
            size={20}
            loading={isLoadingTx || isLoadingSign}
          />
          Add
        </div>
      )}
    </button>
  );
}
