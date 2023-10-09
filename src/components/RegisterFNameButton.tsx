import { useAccount, useSignTypedData, useSwitchNetwork } from 'wagmi'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { useFid } from '@/providers/fidContext'
import { toast } from 'sonner';
import PuffLoader from "react-spinners/PuffLoader";

const MESSAGE_DOMAIN = {
  name: 'Farcaster name verification',
  version: '1',
  chainId: 1,
  verifyingContract: '0xe3be01d99baa8db9905b33a3ca391238234b79d1',
} as const;

const MESSAGE_TYPE = {
  UserNameProof: [
    { name: 'name', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'owner', type: 'address' },
  ],
} as const;

export default function RegisterFIDButton({ fname }: { fname: string }) {

  const { address, isConnected } = useAccount()
  const { fid } = useFid()
  const [isLoading, setIsLoading] = useState(false)
  const [timestamp, setTimestamp] = useState<number>(0)

  const { data: signature, isError, error: errorSign, isSuccess: isSuccessSign, signTypedData } = useSignTypedData({
    domain: MESSAGE_DOMAIN,
    types: MESSAGE_TYPE,
    primaryType: 'UserNameProof',
    message: {
      name: fname,
      timestamp: BigInt(timestamp),
      owner: address as `0x${string}`,
    },
  });

  const { isSuccess: isSuccessSwitch, pendingChainId, switchNetwork } = useSwitchNetwork()

  const registerFname = async () => {
    if (fname.length === 0) {
      toast.error("fname can't be empty")
      return
    }
    if (isError) {
      toast.error("Error registering fname", { description: errorSign?.message })
      return
    }
    setTimestamp(Math.floor(Date.now() / 1000))

    setIsLoading(true)
    switchNetwork?.(1)
  }

  useEffect(() => {
    if (isSuccessSign) {
      axios.post("https://fnames.farcaster.xyz/transfers", {
        "name": fname, // Name to register
        "from": 0,  // Fid to transfer from (0 for a new registration)
        "to": fid, // Fid to transfer to (0 to unregister)
        "fid": fid, // Fid making the request (must match from or to)
        "owner": address, // Custody address of fid making the request
        "timestamp": timestamp,  // Current timestamp in seconds
        "signature": signature // EIP-712 signature signed by the custody address of the fid
      })
        .then((response) => {
          toast.success("fname registered")
          setIsLoading(false)
          switchNetwork?.(10) // mainnet
          // TODO update name in the hub
        })
        .catch((error) => {
          toast.error("Failed to register fname", { description: error.response.data.code })
          setIsLoading(false)
          switchNetwork?.(10) // mainnet
        });
    }
  }, [isSuccessSign])

  useEffect(() => {
    if (isSuccessSwitch && pendingChainId === 1) {
      signTypedData?.()
    }
  }, [isSuccessSwitch])

  return (

    <button
      disabled={!isConnected || !fid || !signTypedData}
      onClick={() => registerFname()}
      type="button"
      className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300"
    >
      <PuffLoader
        color="#ffffff"
        size={20}
        loading={isLoading}
      />
      Register
    </button >
  )
}