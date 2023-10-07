import { usePrepareContractWrite, useContractWrite } from 'wagmi'

export default function RegisterFIDButton() {

  const { config } = usePrepareContractWrite({
    address: '0x00000000fcce7f938e7ae6d3c335bd6a1a7c593d',
    abi: [
      { "inputs": [{ "internalType": "uint256", "name": "fid", "type": "uint256" }, { "internalType": "uint256", "name": "units", "type": "uint256" }], "name": "rent", "outputs": [{ "internalType": "uint256", "name": "overpayment", "type": "uint256" }], "stateMutability": "payable", "type": "function" }
    ],
    functionName: 'rent',
    args: [680, 1],
    value: BigInt(5000000000000000), // TODO estimate it correctly
    enabled: false,
  })
  const { write } = useContractWrite(config)

  return (

    < button
      disabled={!write}
      onClick={() => write?.()}
      type="button"
      className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100"
    >
      Rent storage
    </button >
  )
}