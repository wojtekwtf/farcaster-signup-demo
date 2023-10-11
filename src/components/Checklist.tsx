'use client'
import { NobleEd25519Signer } from '@farcaster/hub-web';

import { ConnectKitButton } from 'connectkit'
import RegisterFIDButton from './RegisterFIDButton'
import RentStorageUnitButton from './RentStorageUnitButton'
import AddSignerButton from './AddSignerButton'
import RegisterFNameButton from './RegisterFNameButton'
import SendCastButton from './SendCastButton'

import { useEffect, useState } from 'react'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import { useFid } from '@/providers/fidContext'
import { useSigner } from '@/providers/signerContext'
import { IdRegistryABI } from '@/abi/IdRegistryABI'

import { Toaster } from 'sonner'
import axios from 'axios';


export default function Checklist() {

  const { address, isConnected } = useAccount()
  const { fid, setFid } = useFid()
  const { signer, setSigner } = useSigner()
  const { chain } = useNetwork()

  const [recoveryAddress, setRecoveryAddress] = useState<string>("")
  const [fname, setFname] = useState<string>("")
  const [castText, setCastText] = useState('')
  const [castHash, setCastHash] = useState<string>("")
  const [disableRecoveryAddress, setDisableRecoveryAddress] = useState<boolean>(false)
  const [disableFname, setDisableFname] = useState<boolean>(false)
  const [hasStorage, setHasStorage] = useState<boolean>(false)

  const [registerFidTxHash, setRegisterFidTxHash] = useState<string>("")
  const [rentTxHash, setRentTxHash] = useState<string>("")
  const [addSignerTxHash, setAddSignerTxHash] = useState<string>("")

  const BLOCK_EXPLORER_URL = "https://optimistic.etherscan.io/" // mainnet
  // const BLOCK_EXPLORER_URL = "https://goerli-optimism.etherscan.io/" // testnet

  const { data: idOf } = useContractRead({
    address: '0x00000000FcAf86937e41bA038B4fA40BAA4B780A', // mainnet
    // address: '0xb088Ff89329D74EdE2dD63C43c2951215910853D', // testnet
    abi: IdRegistryABI,
    functionName: 'idOf',
    args: [address],
    enabled: Boolean(address),
    chainId: 10, // mainnet
    // chainId: 420, // testnet
  })

  const { data: recoveryOf } = useContractRead({
    // address: '0x00000000FcAf86937e41bA038B4fA40BAA4B780A', // mainnet
    address: '0xb088Ff89329D74EdE2dD63C43c2951215910853D', // testnet
    abi: IdRegistryABI,
    functionName: 'recoveryOf',
    args: [fid],
    enabled: Boolean(fid),
    chainId: 10, // mainnet
    // chainId: 420, // testnet
  })

  useEffect(() => {
    console.log("Your FID is: " + idOf)
    if (idOf) {
      setFid(Number(idOf))
    } else if (chain?.id !== 1) {
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
      console.log("checking signer")
      const privateKey = localStorage.getItem(`signerPrivateKey-${fid}`);
      if (privateKey !== null) {
        const ed25519Signer = new NobleEd25519Signer(Buffer.from(privateKey, 'hex'));
        setSigner(ed25519Signer);
      }
    } else {
      setSigner(null);
    }

    if (fid !== 0) {
      // todo change to my hub
      console.log("checking storage units")
      axios.get(`http://nemes.farcaster.xyz:2281/v1/storageLimitsByFid?fid=${fid}`)
        .then(function (response) {
          setHasStorage(Boolean(response.data.limits[0].limit)) // mainnet
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      setHasStorage(false)
    }

    if (fid !== 0) {
      console.log("checking fname")
      axios.get(`https://fnames.farcaster.xyz/transfers?fid=${fid}`)
        .then(function (response) {
          if (response.data.transfers.length > 0) {
            setFname(response.data.transfers[0].username) // mainnet
            setDisableFname(true) // mainnet
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      setFname("")
      setDisableFname(false)
    }
  }, [fid])

  return (
    <fieldset className="border-gray-200 md:min-w-[600px]">
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
              Create account
            </label>
            <p id="comments-description" className="text-gray-500 dark:text-gray-400">
              Register a new Farcaster ID to your Ethereum address and choose <br />
              a recovery address
            </p>
            <div className='flex flex-row gap-x-1 text-gray-500 dark:text-gray-400'>
              <a href='https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/RegisterFIDButton.tsx' target='_blank' className="underline">
                Go to code
              </a>
              {!!registerFidTxHash && <p>|</p>}
              {!!registerFidTxHash &&
                <a href={`${BLOCK_EXPLORER_URL}tx/${registerFidTxHash}`} target='_blank' className="underline">
                  Show transaction
                </a>
              }
            </div>
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
          <RegisterFIDButton recoveryAddress={recoveryAddress} setRegisterFidTxHash={setRegisterFidTxHash} />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="candidates" className="font-medium text-gray-900 dark:text-white">
              Rent storage
            </label>
            <p id="candidates-description" className="text-gray-500 dark:text-gray-400">
              Renting one unit of storage lets you store up to 5,000 casts for a year. <br />
              The fee helps reduce spam on the network.
            </p>
            <div className='flex flex-row gap-x-1 text-gray-500 dark:text-gray-400'>
              <a href='https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/RentStorageUnitButton.tsx' target='_blank' className="underline">
                Go to code
              </a>
              {!!rentTxHash && <p>|</p>}
              {!!rentTxHash &&
                <a href={`${BLOCK_EXPLORER_URL}tx/${rentTxHash}`} target='_blank' className="underline">
                  Show transaction
                </a>
              }
            </div>
          </div>
          <RentStorageUnitButton hasStorage={hasStorage} setHasStorage={setHasStorage} setRentTxHash={setRentTxHash} />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="offers" className="font-medium text-gray-900 dark:text-white">
              Add a signer
            </label>
            <p id="offers-description" className="text-gray-500 dark:text-gray-400">
              A signer is a key pair that lets you create new messages or "casts"
            </p>
            <div className='flex flex-row gap-x-1 text-gray-500 dark:text-gray-400'>
              <a href='https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/AddSignerButton.tsx' target='_blank' className="underline">
                Go to code
              </a>
              {!!addSignerTxHash && <p>|</p>}
              {!!addSignerTxHash &&
                <a href={`${BLOCK_EXPLORER_URL}tx/${addSignerTxHash}`} target='_blank' className="underline">
                  Show transaction
                </a>
              }
            </div>
          </div>
          <AddSignerButton setAddSignerTxHash={setAddSignerTxHash} />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="offers" className="font-medium text-gray-900 dark:text-white">
              Register an fname <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <p id="offers-description" className="text-gray-500 dark:text-gray-400">
              Acquire a free offchain ENS username issued by Farcaster. <br />
              You can also use onchain ENS names, but that's not covered here.
            </p>
            <a href='https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/RegisterFNameButton.tsx' target='_blank' className="text-gray-500 dark:text-gray-400 underline">
              Go to code
            </a>
            <input
              type="text"
              name="fname"
              id="fname"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              className="mt-2 block w-64 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:dark:bg-gray-800 disabled:dark:text-gray-400 disabled:dark:ring-gray-700 duration-100"
              placeholder="Enter your fname"
              disabled={!isConnected || !fid || disableFname}
              data-1p-ignore
            />
          </div>
          <RegisterFNameButton fname={fname} disableFname={disableFname} setDisableFname={setDisableFname} />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="offers" className="font-medium text-gray-900 dark:text-white">
              Publish a cast
            </label>
            <p id="offers-description" className="text-gray-500 dark:text-gray-400">
              Write a hello world message or cast that shows up on your account.
            </p>
            <div className='flex flex-row gap-x-1 text-gray-500 dark:text-gray-400'>
              <a href='https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/SendCastButton.tsx' target='_blank' className="text-gray-500 dark:text-gray-400 underline">
                Go to code
              </a>
              {!!castHash && <p>|</p>}
              {!!castHash &&
                fname ?
                <a href={`https://warpcast.com/${fname}/${castHash.slice(0, 10)}`} target='_blank' className="underline">
                  See on warpcast
                </a>
                :
                <a href={`https://warpcast.com/~/conversations/${castHash.slice(0, 10)}`} target='_blank' className="underline">
                  See on warpcast
                </a>
              }
              {(!!castHash && !!fname) && <p>|</p>}
              {(!!castHash && !!fname) &&
                <a href={`https://flink.fyi/${fname}/${castHash}`} target='_blank' className="underline">
                  See on flink.fyi
                </a>
              }
            </div>
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
          <SendCastButton castText={castText} castHash={castHash} setCastHash={setCastHash} />
        </div>
      </div>
    </fieldset>
  )
}
