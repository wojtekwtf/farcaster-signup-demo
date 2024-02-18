import {
  FarcasterNetwork,
  makeUserDataAdd,
  UserDataType,
  NobleEd25519Signer,
  Message,
} from "@farcaster/hub-web";

import { useAccount, useSignTypedData, useSwitchNetwork } from "wagmi";
import { useEffect, useState } from "react";
import { useSigner } from "@/providers/signerContext";
import axios from "axios";

import { useFid } from "@/providers/fidContext";
import { toast } from "sonner";

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import PuffLoader from "react-spinners/PuffLoader";

import { FNAME_URL, REQUEST_TIMEOUT } from "@/constants";

const MESSAGE_DOMAIN = {
  name: "Farcaster name verification",
  version: "1",
  chainId: 1,
  verifyingContract: "0xe3be01d99baa8db9905b33a3ca391238234b79d1",
} as const;

const MESSAGE_TYPE = {
  UserNameProof: [
    { name: "name", type: "string" },
    { name: "timestamp", type: "uint256" },
    { name: "owner", type: "address" },
  ],
} as const;

export default function RegisterFnameButton({
  fname,
  disableFname,
  setDisableFname,
}: {
  fname: string;
  disableFname: boolean;
  setDisableFname: (value: boolean) => void;
}) {
  const { signer } = useSigner();
  const { address, isConnected } = useAccount();
  const { fid } = useFid();
  const [isLoading, setIsLoading] = useState(false);
  const [timestamp, setTimestamp] = useState<number>(0);

  const {
    data: signature,
    isError,
    error: errorSign,
    isSuccess: isSuccessSign,
    signTypedData,
  } = useSignTypedData({
    domain: MESSAGE_DOMAIN,
    types: MESSAGE_TYPE,
    primaryType: "UserNameProof",
    message: {
      name: fname,
      timestamp: BigInt(timestamp),
      owner: address as `0x${string}`,
    },
  });

  const {
    isSuccess: isSuccessSwitch,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();

  const registerFname = async () => {
    if (fname.length === 0) {
      toast.error("fname can't be empty");
      return;
    }
    if (isError) {
      toast.error("Error registering fname", {
        description: errorSign?.message,
      });
      return;
    }
    setTimestamp(Math.floor(Date.now() / 1000));

    setIsLoading(true);
    switchNetwork?.(1);
  };

  const setFnameAsPrimary = async () => {
    const dataOptions = {
      fid: fid,
      network: FarcasterNetwork.MAINNET,
    };

    const userDataAddBody = {
      type: UserDataType.USERNAME,
      value: fname,
    };

    const message = await makeUserDataAdd(
      userDataAddBody,
      dataOptions,
      signer as NobleEd25519Signer
    );

    if (message) {
      axios
        .post("/hub", {
          message: Message.toJSON(message.unwrapOr(null) as Message),
        })
        .then((res) => {
          toast.success("fname registered");
          setDisableFname(true);
        })
        .catch((err) => {
          toast.error("Failed to register fname", {
            description: err.response.data,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      console.log("Failed to create message");
    }
  };

  useEffect(() => {
    if (isSuccessSign) {
      axios
        .post(
          `${FNAME_URL}/transfers`,
          {
            name: fname, // Name to register
            from: 0, // Fid to transfer from (0 for a new registration)
            to: fid, // Fid to transfer to (0 to unregister)
            fid: fid, // Fid making the request (must match from or to)
            owner: address, // Custody address of fid making the request
            timestamp: timestamp, // Current timestamp in seconds
            signature: signature, // EIP-712 signature signed by the custody address of the fid
          },
          { timeout: REQUEST_TIMEOUT }
        )
        .then((response) => {
          setFnameAsPrimary();
        })
        .catch((error) => {
          toast.error("Failed to register fname", {
            description: error.response.data.code,
          });
        })
        .finally(() => {
          setIsLoading(false);
          switchNetwork?.(10); // mainnet
          // switchNetwork?.(420) // testnet
        });
    }
  }, [isSuccessSign]);

  useEffect(() => {
    if (isSuccessSwitch && pendingChainId === 1) {
      signTypedData?.();
    }
  }, [isSuccessSwitch]);

  return (
    <button
      disabled={!isConnected || !fid || !signTypedData || disableFname}
      onClick={() => registerFname()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${
        disableFname && "!bg-green-500 !text-white"
      }`}
    >
      <PuffLoader color="#ffffff" size={20} loading={isLoading} />
      {disableFname ? <CheckCircleIcon className="w-5 h-5" /> : "Register"}
    </button>
  );
}
