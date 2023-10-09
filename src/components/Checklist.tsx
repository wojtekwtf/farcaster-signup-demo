'use client'
import { NobleEd25519Signer } from '@farcaster/hub-web';

import { ConnectKitButton } from 'connectkit'
import RegisterFIDButton from './RegisterFIDButton'
import RentStorageUnitButton from './RentStorageUnitButton'
import AddSignerButton from './AddSignerButton'
import RegisterFNameButton from './RegisterFNameButton'
import SendCastButton from './SendCastButton'

import { useEffect, useState } from 'react'
import { useAccount, useContractRead } from 'wagmi'
import { useFid } from '@/providers/fidContext'
import { useSigner } from '@/providers/signerContext'
import { IdRegistryABI } from '@/abi/IdRegistryABI'

import { Toaster } from 'sonner'


export default function Checklist() {

  const { address, isConnected } = useAccount()
  const { fid, setFid } = useFid()
  const { signer, setSigner } = useSigner()

  const [recoveryAddress, setRecoveryAddress] = useState<string>("")
  const [fname, setFname] = useState<string>("")
  const [castText, setCastText] = useState('')
  const [disableRecoveryAddress, setDisableRecoveryAddress] = useState<boolean>(false)

  const { data: idOf } = useContractRead({
    address: '0x00000000FcAf86937e41bA038B4fA40BAA4B780A', // mainnet
    // address: '0xb088Ff89329D74EdE2dD63C43c2951215910853D', // testnet
    abi: IdRegistryABI,
    functionName: 'idOf',
    args: [address],
    enabled: Boolean(address),
  })

  const { data: recoveryOf } = useContractRead({
    address: '0x00000000FcAf86937e41bA038B4fA40BAA4B780A', // mainnet
    // address: '0xb088Ff89329D74EdE2dD63C43c2951215910853D', // testnet
    abi: IdRegistryABI,
    functionName: 'recoveryOf',
    args: [fid],
    enabled: Boolean(fid),
  })

  useEffect(() => {
    console.log("Your FID is: " + idOf)
    if (idOf) {
      setFid(Number(idOf))
    } else {
      setFid(0)
    }
  }, [idOf])

  useEffect(() => {
    console.log("Your recovery address is: " + recoveryOf)
    if (recoveryOf !== undefined) {
      setRecoveryAddress(recoveryOf as string)
      setDisableRecoveryAddress(true)
    } else {
      setRecoveryAddress("")
      setDisableRecoveryAddress(false)
    }
  }, [recoveryOf])

  useEffect(() => {
    if (fid !== 0) {
      const privateKey = localStorage.getItem(`signerPrivateKey-${fid}`);
      if (privateKey === null) {
        return
      }

      const ed25519Signer = new NobleEd25519Signer(Buffer.from(privateKey, 'hex'));
      setSigner(ed25519Signer);
    } else {
      setSigner(null);
    }
  }, [fid])

  return (
    <fieldset className=" border-gray-200 min-w-[600px]">
      <Toaster richColors expand={true} />
      <div className='flex flex-row justify-between mb-6'>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Sign up for Farcaster
        </h1>
        <ConnectKitButton />
      </div>
      <div className="divide-y divide-gray-200">
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="comments" className="font-medium text-gray-900 dark:text-white">
              Register an FID
            </label>
            <p id="comments-description" className="text-gray-500 dark:text-gray-400">
              To perform any action on farcaster, your need an FID <br /> and a recovery address
            </p>
            <a href='https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/RegisterFIDButton.tsx' target='_blank' id="comments-description" className="text-gray-500 dark:text-gray-400 underline">
              Show code
            </a>
            <input
              type="text"
              name="cast"
              id="cast"
              value={recoveryAddress}
              onChange={(e) => setRecoveryAddress(e.target.value)}
              className="mt-2 block w-64 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:dark:bg-gray-800 disabled:dark:text-gray-400 disabled:dark:ring-gray-700 duration-100"
              placeholder="Recovery address"
              disabled={!isConnected || disableRecoveryAddress}
              data-1p-ignore
            />
          </div>
          <RegisterFIDButton recoveryAddress={recoveryAddress} />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="candidates" className="font-medium text-gray-900 dark:text-white">
              Rent a storage unit
            </label>
            <p id="candidates-description" className="text-gray-500 dark:text-gray-400">
              To use Farcaster you need to pay for storing data in the hubs. <br />
              One storage unit lets you store up to 5000 casts a year and costs $7
            </p>
            <a href='https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/RentStorageUnitButton.tsx' target='_blank' id="comments-description" className="text-gray-500 dark:text-gray-400 underline">
              Show code
            </a>
          </div>
          <RentStorageUnitButton />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="offers" className="font-medium text-gray-900 dark:text-white">
              Add a signer
            </label>
            <p id="offers-description" className="text-gray-500 dark:text-gray-400">
              Signers are keypairs that have a permission to write <br />
              to the protocol on your behalf.
            </p>
            <a href='https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/AddSignerButton.tsx' target='_blank' id="comments-description" className="text-gray-500 dark:text-gray-400 underline">
              Show code
            </a>
          </div>
          <AddSignerButton />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="offers" className="font-medium text-gray-900 dark:text-white">
              Register an fname <span className="text-gray-400">(optional)</span>
            </label>
            <p id="offers-description" className="text-gray-500 dark:text-gray-400">
              Fnames are ENS domains managed by Warpcast team. <br />
              They are not required to use Farcaster. But you can register one anyway
            </p>
            <a href='https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/RegisterFNameButton.tsx' target='_blank' id="comments-description" className="text-gray-500 dark:text-gray-400 underline">
              Show code
            </a>
            <input
              type="text"
              name="fname"
              id="fname"
              onChange={(e) => setFname(e.target.value)}
              className="mt-2 block w-64 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:dark:bg-gray-800 disabled:dark:text-gray-400 disabled:dark:ring-gray-700 duration-100"
              placeholder="Enter your fname"
              disabled={!isConnected || !fid}
              data-1p-ignore
            />
          </div>
          <RegisterFNameButton fname={fname} />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="offers" className="font-medium text-gray-900 dark:text-white">
              Publish a cast
            </label>
            <p id="offers-description" className="text-gray-500 dark:text-gray-400">
              With an FID, a storage unit and a signer you can publish a cast. <br />
            </p>
            <a href='https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/SendCastButton.tsx' target='_blank' id="comments-description" className="text-gray-500 dark:text-gray-400 underline">
              Show code
            </a>
            <input
              type="text"
              name="cast"
              id="cast"
              onChange={(e) => setCastText(e.target.value)}
              className="mt-2 block w-64 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:dark:bg-gray-800 disabled:dark:text-gray-400 disabled:dark:ring-gray-700 duration-100"
              placeholder="Type your cast"
              disabled={!isConnected || !signer}
            />
          </div>
          <SendCastButton castText={castText} />
        </div>
      </div>
    </fieldset>
  )
}
