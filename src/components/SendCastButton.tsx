import {
  FarcasterNetwork,
  makeCastAdd,
  NobleEd25519Signer,
  Message
} from '@farcaster/hub-web';
import { useAccount } from 'wagmi';

import { useFid } from '@/providers/fidContext'
import { useSigner } from '@/providers/signerContext'

import axios from 'axios'

export default function RegisterFIDButton({ castText }: { castText: string }) {

  const { signer } = useSigner()
  const { fid } = useFid()
  const { isConnected } = useAccount()

  const sendCast = async () => {

    const messageDataOptions = {
      fid: fid,
      network: FarcasterNetwork.MAINNET
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
      axios.post("/hub", { message: Message.toJSON(message.unwrapOr(null) as Message) })
    } else {
      console.log("failed to create message")
    }
  }

  return (
    // TODO add loading
    <button
      disabled={!isConnected || !Boolean(signer) || castText === ""}
      onClick={() => { sendCast() }}
      type="button"
      className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300"
    >
      Send cast
    </button >
  )
}
