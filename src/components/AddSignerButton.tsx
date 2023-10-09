import { NobleEd25519Signer } from '@farcaster/hub-web';

import { usePrepareContractWrite, useContractWrite, useAccount, useSignTypedData, useWaitForTransaction } from 'wagmi'
import * as ed from "@noble/ed25519";
import { SignedKeyRequestMetadataABI } from '@/abi/SignedKeyRequestMetadataABI';
import { encodeAbiParameters } from 'viem'
import { useEffect, useState } from 'react';
import { KeyRegistryABI } from '@/abi/KeyRegistryABI';

import { useFid } from '@/providers/fidContext'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import PuffLoader from "react-spinners/PuffLoader";
import { useSigner } from '@/providers/signerContext';

/*** EIP-712 helper code ***/

const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
  name: "Farcaster SignedKeyRequestValidator",
  version: "1",
  // chainId: 10, // mainnet
  chainId: 420, // testnet
  // verifyingContract: "0x00000000fc700472606ed4fa22623acf62c60553", // mainnet
  verifyingContract: "0xd4d096D6Cfbab085e97e0011bEd6001DBb90D050", // testnet
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

  const { fid } = useFid()
  const { signer, setSigner } = useSigner()
  const { isConnected } = useAccount()

  const [privateKey, setPrivateKey] = useState<Uint8Array | undefined>()
  const [publicKey, setPublicKey] = useState<`0x${string}` | undefined>()
  const [metadata, setMetadata] = useState<`0x${string}` | undefined>()
  const [deadline, setDeadline] = useState<number>(0)

  const { address } = useAccount()

  const { data, isLoading: isLoadingSign, isSuccess: isSuccessSign, signTypedData } = useSignTypedData({
    domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
    types: {
      SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
    },
    primaryType: "SignedKeyRequest",
    message: {
      requestFid: BigInt(fid),
      key: publicKey as `0x${string}`,
      deadline: BigInt(deadline),
    },
  });

  const { config, isError: isErrorPrepareContractWrite, error: errorPrepareContractWrite } = usePrepareContractWrite({
    // address: '0x00000000fC9e66f1c6d86D750B4af47fF0Cc343d', // mainnet
    address: '0x34A6F04B474eB64d9a82017a01acbe5A58A0F541', // testnet
    abi: KeyRegistryABI,
    functionName: 'add',
    args: [1, publicKey, 1, metadata],
    enabled: Boolean(metadata),
  })

  const { data: txData, isError: isErrorContractWrite, error: errorContractWrite, isIdle, isLoading, write } = useContractWrite(config)

  const { isLoading: isLoadingTx, isSuccess: isSuccessTx } = useWaitForTransaction({
    hash: txData?.hash,
  })

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
    if (isSuccessSign) {
      if (address === undefined) {
        alert("Wallet not connected")
        return
      }
      if (data === undefined) {
        alert("Error signing data")
        return
      }
      const metadata = encodeMetadata(fid, address, data, deadline)
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
    const signerPublicKeyLocalStorageKey = `signerPublicKey-${fid}`
    const signerPrivateKeyLocalStorageKey = `signerPrivateKey-${fid}`

    if (isLoadingTx) {
      console.log(`https://optimistic.etherscan.io/tx/${txData?.hash}`)
    }

    if (isSuccessTx === true) {
      if (localStorage.getItem(signerPublicKeyLocalStorageKey) !== null && localStorage.getItem(signerPrivateKeyLocalStorageKey) !== null) {
        return
      }

      localStorage.setItem(signerPublicKeyLocalStorageKey, publicKey as `0x${string}`)
      localStorage.setItem(signerPrivateKeyLocalStorageKey, ed.etc.bytesToHex(privateKey as Uint8Array))

      const ed25519Signer = new NobleEd25519Signer(privateKey as Uint8Array);
      setSigner(ed25519Signer);
    }
  }, [isLoadingTx, isSuccessTx])


  return (

    <button
      disabled={!isConnected || !fid || !!signer}
      onClick={() => addSigner()}
      type="button"
      className={`w-28 inline-flex justify-center items-center gap-x-2 rounded-md bg-purple-600 disabled:bg-purple-200 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:shadow-none disabled:cursor-not-allowed hover:bg-purple-500 duration-100 dark:disabled:bg-purple-900 dark:disabled:bg-opacity-60 dark:disabled:text-gray-300 ${(isSuccessTx || !!signer) && '!bg-green-500 !text-white !dark:text-white'}}`}
    >
      <PuffLoader
        color="#ffffff"
        size={20}
        loading={isLoadingTx || isLoadingSign}
      />
      {!!signer ? <CheckCircleIcon className='w-5 h-5' /> : isSuccessTx ? 'Success' : 'Add'}
    </button >
  )
}