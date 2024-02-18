import {
  FarcasterNetwork,
  makeCastAdd,
  NobleEd25519Signer,
  Message,
} from "@farcaster/hub-web";
import { useAccount } from "wagmi";
import { useState } from "react";

import { useFid } from "@/providers/fidContext";
import { useSigner } from "@/providers/signerContext";

import PuffLoader from "react-spinners/PuffLoader";
import { toast } from "sonner";
import axios from "axios";
import { REQUEST_TIMEOUT } from "@/constants";

export default function SendCastButton({
  castText,
  castHash,
  setCastHash,
}: {
  castText: string;
  castHash: string;
  setCastHash: (castHash: string) => void;
}) {
  const { signer } = useSigner();
  const { fid } = useFid();
  const { isConnected } = useAccount();
  const [isSending, setIsSending] = useState(false);

  const sendCast = async () => {
    if (castText.length === 0) {
      toast.error("Cast can't be empty");
      return;
    }

    const messageDataOptions = {
      fid: fid,
      network: FarcasterNetwork.MAINNET,
    };

    const message = await makeCastAdd(
      {
        text: castText,
        embeds: [],
        embedsDeprecated: [],
        mentions: [],
        mentionsPositions: [],
      },
      messageDataOptions,
      signer as NobleEd25519Signer // function can only be called if signer is defined
    );

    if (message) {
      axios
        .post(
          "/hub",
          { message: Message.toJSON(message.unwrapOr(null) as Message) }
          // { timeout: REQUEST_TIMEOUT }
        )
        .then((res) => {
          toast.success("Cast sent");
          setCastHash(`0x${Buffer.from(res.data.value.hash).toString("hex")}`);
        })
        .catch((err) => {
          console.error(err);
          let msg = "Failed to send cast. See console for more info.";
          if (err.response) {
            msg = err.response.data;
          }
          if (err.message) {
            msg = err.message;
          }
          toast.error("Failed to send cast", {
            description: msg,
          });
        })
        .finally(() => {
          setIsSending(false);
        });
      setIsSending(true);
    } else {
      console.log("Failed to create message");
    }
  };

  return (
    <button
      disabled={!isConnected || !Boolean(signer)}
      onClick={() => {
        sendCast();
      }}
      type="button"
      className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300"
    >
      <PuffLoader color="#ffffff" size={20} loading={isSending} />
      Send
    </button>
  );
}
