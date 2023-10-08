import { usePrepareContractWrite, useContractWrite, useAccount, useWaitForTransaction } from 'wagmi'
import { useFid } from '@/providers/fidContext'

import PuffLoader from "react-spinners/PuffLoader";
import { IdRegistryABI } from '@/abi/IdRegistryABI';

export default function RegisterFIDButton({ recoveryAddress }: { recoveryAddress: string }) {

  const { fid, setFid } = useFid()
  const { address, isConnected } = useAccount()

  const { config } = usePrepareContractWrite({
    // address: '0x00000000FcAf86937e41bA038B4fA40BAA4B780A', // mainnet
    address: '0xb088Ff89329D74EdE2dD63C43c2951215910853D', // testnet
    abi: IdRegistryABI,
    functionName: 'register',
    args: [recoveryAddress],
    enabled: false, // mainnet
    // enabled: true, // testnet
  })
  const { data: rentTxHash, write } = useContractWrite(config)

  const { isError, isLoading, isSuccess } = useWaitForTransaction({
    hash: rentTxHash?.hash,
  })

  return (

    <button
      disabled={!isConnected
        || address === undefined
        || fid !== null
        || !(/^(0x)?[0-9a-fA-F]{40}$/i.test(recoveryAddress))
        || recoveryAddress.toLowerCase() === address.toLowerCase()}
      onClick={() => write?.()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${fid && "!bg-green-500 !text-white"}`}
    >
      <PuffLoader
        color="#ffffff"
        size={20}
        loading={isLoading}
      />
      {fid ? `FID: ${fid}` : "Register"}
    </button >
  )
}