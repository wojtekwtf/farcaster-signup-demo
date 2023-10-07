import {
  FarcasterNetwork,
  makeCastAdd,
  NobleEd25519Signer,
} from '@farcaster/hub-web';
import { useAccount } from 'wagmi';

import { useEffect, useState } from 'react'

export default function RegisterFIDButton() {

  const [signer, setSigner] = useState<NobleEd25519Signer | undefined>()
  const { address } = useAccount()

  const sendCast = async () => {

    const messageDataOptions = {
      fid: 15671,
      network: FarcasterNetwork.MAINNET
    };

    const message = await makeCastAdd(
      {
        text: "test from client js", // TODO change to text from input
        embeds: [],
        embedsDeprecated: [],
        mentions: [],
        mentionsPositions: [],
      },
      messageDataOptions,
      signer as NobleEd25519Signer // function can only be called if signer is defined
    );

    if (message) {
      alert(message.unwrapOr(null)?.data.castAddBody.text)

      // TODO add api
    } else {
      console.log("failed to create message")
    }
  }

  useEffect(() => {
    // listen on localStorage for changes to the signer
    const privateKey = localStorage.getItem(`signerPrivateKey-${address}`);
    if (privateKey === null) {
      return
    }

    const ed25519Signer = new NobleEd25519Signer(Buffer.from(privateKey, 'hex'));
    setSigner(ed25519Signer);
  }, [])

  return (

    <button
      disabled={!Boolean(signer)}
      onClick={() => { sendCast() }}
      type="button"
      className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100"
    >
      Send cast
    </button >
  )
}
