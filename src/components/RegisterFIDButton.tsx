import { usePrepareContractWrite, useContractWrite } from 'wagmi'

export default function RegisterFIDButton() {

  const { config } = usePrepareContractWrite({
    address: '0x00000000FcAf86937e41bA038B4fA40BAA4B780A',
    abi: [
      { "inputs": [{ "internalType": "address", "name": "recovery", "type": "address" }], "name": "register", "outputs": [{ "internalType": "uint256", "name": "fid", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" },
    ],
    functionName: 'register',
    args: ["0xF417ACe7b13c0ef4fcb5548390a450A4B75D3eB3"], // TODO allow people to input this
    enabled: false,
  })
  const { write } = useContractWrite(config)

  return (

    < button
      disabled={!write}
      onClick={() => write?.()}
      type="button"
      className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300"
    >
      Get fid
    </button >
  )
}