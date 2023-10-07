import { usePrepareContractWrite, useContractWrite, useAccount, useSignTypedData } from 'wagmi'
import * as ed from "@noble/ed25519";
import { SignedKeyRequestMetadataABI } from '@/abi/SignedKeyRequestMetadataABI';
import { encodeAbiParameters } from 'viem'
import { use, useEffect, useState } from 'react';

/*** EIP-712 helper code ***/

const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
  name: "Farcaster SignedKeyRequestValidator",
  version: "1",
  chainId: 10,
  verifyingContract: "0x00000000fc700472606ed4fa22623acf62c60553",
} as const;

const SIGNED_KEY_REQUEST_TYPE = [
  { name: "requestFid", type: "uint256" },
  { name: "key", type: "bytes" },
  { name: "deadline", type: "uint256" },
] as const;

const encodeMetadata = (fid: number, address: string, signature: string, deadline: number) => {
  const encodedData = encodeAbiParameters(
    SignedKeyRequestMetadataABI.inputs,
    [
      {
        requestFid: BigInt(fid),
        requestSigner: address,
        signature: signature,
        deadline: BigInt(deadline)
      }
    ]
  );

  return encodedData;
}


export default function AddSignerButton() {

  const [privateKey, setPrivateKey] = useState<Uint8Array | undefined>()
  const [publicKey, setPublicKey] = useState<`0x${string}` | undefined>()
  const [metadata, setMetadata] = useState<`0x${string}` | undefined>()
  const [deadline, setDeadline] = useState<number>(0)

  const { address } = useAccount()

  const { data, isSuccess, signTypedData } = useSignTypedData({
    domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
    types: {
      SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
    },
    primaryType: "SignedKeyRequest",
    message: {
      requestFid: BigInt(15671),
      key: publicKey as `0x${string}`,
      deadline: BigInt(deadline),
    },
  });

  const { config, isError: isErrorPrepareContractWrite, error: errorPrepareContractWrite } = usePrepareContractWrite({
    address: '0x00000000fC9e66f1c6d86D750B4af47fF0Cc343d',
    abi: [
      { "inputs": [{ "internalType": "uint32", "name": "keyType", "type": "uint32" }, { "internalType": "bytes", "name": "key", "type": "bytes" }, { "internalType": "uint8", "name": "metadataType", "type": "uint8" }, { "internalType": "bytes", "name": "metadata", "type": "bytes" }], "name": "add", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
    ],
    functionName: 'add',
    args: [1, publicKey, 1, metadata],
    enabled: Boolean(metadata),
  })

  const { data: txHash, isError: isErrorContractWrite, error: errorContractWrite, isIdle, isLoading, write } = useContractWrite(config)

  const addSigner = async () => {
    signTypedData()
  }

  const generateKeyPair = async () => {
    const privateKey = ed.utils.randomPrivateKey();
    const publicKeyBytes = await ed.getPublicKeyAsync(privateKey);
    const publicKey = `0x${Buffer.from(publicKeyBytes).toString("hex")}`;
    setPrivateKey(privateKey);
    setPublicKey(publicKey as `0x${string}`);
  };

  useEffect(() => {
    if (publicKey === undefined && privateKey === undefined) {
      generateKeyPair()
    }
    if (deadline === 0) {
      const oneHour = 60 * 60;
      const deadline = Math.floor(Date.now() / 1000) + oneHour;
      setDeadline(deadline)
    }
  }, [])

  useEffect(() => {
    if (isSuccess) {
      if (address === undefined) {
        alert("Wallet not connected")
        return
      }
      if (data === undefined) {
        alert("Error signing data")
        return
      }
      const metadata = encodeMetadata(15671, address, data, deadline)
      setMetadata(metadata)
    }
  }, [data])

  useEffect(() => {
    if (metadata === undefined) {
      return
    }
  }, [metadata])

  useEffect(() => {
    // This will trigger the tx signing prompt once the tx is prepared and simulated by wagmi
    if (write) {
      write()
    }
  }, [write])

  useEffect(() => {
    if (txHash) {
      console.log(`https://optimistic.etherscan.io/tx/${txHash.hash}`)
    }
  }, [txHash])


  return (

    <button
      disabled={false}
      onClick={() => addSigner()}
      type="button"
      className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100"
    >
      Add signer
    </button >
  )
}