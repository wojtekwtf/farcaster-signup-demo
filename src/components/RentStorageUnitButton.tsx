import { usePrepareContractWrite, useContractWrite, useContractRead, useAccount, useWaitForTransaction } from 'wagmi'

import { useFid } from '@/providers/fidContext'
import { StorageRegistryABI } from '@/abi/StorageRegistryABI'
import { useEffect, useState } from 'react'

import PuffLoader from "react-spinners/PuffLoader";

export default function RegisterFIDButton() {

  const { fid } = useFid()
  const { isConnected } = useAccount()
  const [price, setPrice] = useState<number>(0)

  const { data: unitPrice } = useContractRead({
    // address: '0x00000000fcce7f938e7ae6d3c335bd6a1a7c593d', // mainnet
    address: '0xa6B79d91FAD0E4952FDaB8Cc2DE803fC423aAdBf', // testnet
    abi: StorageRegistryABI,
    functionName: 'unitPrice',
  })

  const { config } = usePrepareContractWrite({
    // address: '0x00000000fcce7f938e7ae6d3c335bd6a1a7c593d', // mainnet
    address: '0xa6B79d91FAD0E4952FDaB8Cc2DE803fC423aAdBf', // testnet
    abi: StorageRegistryABI,
    functionName: 'rent',
    args: [fid, 1],
    value: BigInt(price),
    enabled: Boolean(price),
  })
  const { data: rentTxHash, write } = useContractWrite(config)

  const { isError, isLoading, isSuccess } = useWaitForTransaction({
    hash: rentTxHash?.hash,
  })

  useEffect(() => {
    if (unitPrice) {
      setPrice(Math.floor(Number(unitPrice) * 1.1))
    }
  }, [unitPrice])

  return (

    <button
      disabled={!isConnected || !fid || !write}
      onClick={() => write?.()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${isSuccess && '!bg-green-500 !text-white'}}`}
    >
      <PuffLoader
        color="#ffffff"
        size={20}
        loading={isLoading}
      />
      {isSuccess ? 'Success' : 'Rent'}
    </button >
  )
}