"use client";
import { ID_REGISTRY_ADDRESS, NobleEd25519Signer } from "@farcaster/hub-web";

import { ConnectKitButton } from "connectkit";
import CollectRegisterSigButton from "./CollectRegisterSigButton";

import { useEffect, useState } from "react";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import { useFid } from "@/providers/fidContext";
import { useSigner } from "@/providers/signerContext";
import { IdRegistryABI } from "@/abi/IdRegistryABI";

import { Toaster } from "sonner";
import { Hex, PrivateKeyAccount, zeroAddress } from "viem";
import CollectAddKeySigButton from "./CollectAddKeySigButton";
import BundlerRegisterButton from "./BundlerRegisterButton";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import GenerateSignedKeyMetadataButton from "./GenerateSignedKeyMetadata";
import RegisterFIDButton from "./RegisterFIDButton";

export default function BundlerChecklist() {
  const { address, isConnected } = useAccount();
  const { fid, setFid } = useFid();
  const { setSigner } = useSigner();
  const { chain } = useNetwork();

  const [recoveryAddress, setRecoveryAddress] = useState<string>("");
  const [disableRecoveryAddress, setDisableRecoveryAddress] =
    useState<boolean>(false);
  const [burnerAccount, setBurnerAccount] = useState<
    PrivateKeyAccount | undefined
  >();
  const [burnerFid, setBurnerFid] = useState<number>(0);
  const [deadline, setDeadline] = useState<number>(0);
  const [registerSig, setRegisterSig] = useState<Hex>("0x00");
  const [addKeySig, setAddKeySig] = useState<Hex>("0x00");
  const [metadata, setMetadata] = useState<Hex>("0x00");
  const [registerFidTxHash, setRegisterFidTxHash] = useState<string>("");
  const [registerTxHash, setRegisterTxHash] = useState<string>("");

  const BLOCK_EXPLORER_URL = "https://optimistic.etherscan.io/"; // mainnet
  // const BLOCK_EXPLORER_URL = "https://goerli-optimism.etherscan.io/" // testnet

  const { data: idOf } = useContractRead({
    address: ID_REGISTRY_ADDRESS, // mainnet
    abi: IdRegistryABI,
    functionName: "idOf",
    args: [address],
    enabled: Boolean(address),
    chainId: 10, // mainnet
    // chainId: 420, // testnet
  });

  const { data: recoveryOf } = useContractRead({
    address: ID_REGISTRY_ADDRESS, // mainnet
    // address: '0xb088Ff89329D74EdE2dD63C43c2951215910853D', // testnet
    abi: IdRegistryABI,
    functionName: "recoveryOf",
    args: [fid],
    enabled: Boolean(fid),
    chainId: 10, // mainnet
    // chainId: 420, // testnet
  });

  useEffect(() => {
    if (!burnerAccount) {
      setBurnerAccount(privateKeyToAccount(generatePrivateKey()));
    }
    if (deadline === 0) {
      const oneHour = 60 * 60;
      const deadline = Math.floor(Date.now() / 1000) + oneHour;
      setDeadline(deadline);
    }
  }, []);

  useEffect(() => {
    console.log("Your FID is: " + idOf);
    if (idOf) {
      setFid(Number(idOf));
    } else if (chain?.id !== 1) {
      setFid(0);
    }
  }, [idOf]);

  useEffect(() => {
    console.log("Your recovery address is: " + recoveryOf);
    if (recoveryOf !== undefined) {
      setRecoveryAddress(recoveryOf as Hex);
      setDisableRecoveryAddress(true);
    } else {
      setRecoveryAddress("");
      setDisableRecoveryAddress(false);
    }
  }, [recoveryOf]);

  useEffect(() => {
    if (fid !== 0) {
      console.log("checking signer");
      const privateKey = localStorage.getItem(`signerPrivateKey-${fid}`);
      if (privateKey !== null) {
        const ed25519Signer = new NobleEd25519Signer(
          Buffer.from(privateKey, "hex")
        );
        setSigner(ed25519Signer);
      }
    } else {
      setSigner(null);
    }
  }, [fid]);

  return (
    <fieldset className="border-gray-200 md:min-w-[600px]">
      <Toaster richColors expand={true} />
      <div className="flex flex-row justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Sign up using the Bundler
        </h1>
        <ConnectKitButton />
      </div>
      <div className="divide-y divide-gray-200">
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label
              htmlFor="comments"
              className="font-medium text-gray-900 dark:text-white"
            >
              Burner account
            </label>
            <p
              id="comments-description"
              className="text-gray-500 dark:text-gray-400"
            >
              In this demo, we generate a new burner account to receive the FID.
              <br />
              We use the connected wallet as the recovery address so you can
              retrieve it later.
            </p>
            <p
              id="comments-description"
              className="text-gray-500 dark:text-gray-400 pt-4"
            >
              Address: <pre>{burnerAccount?.address}</pre>
            </p>
          </div>
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label
              htmlFor="comments"
              className="font-medium text-gray-900 dark:text-white"
            >
              Create an app FID
            </label>
            <p
              id="comments-description"
              className="text-gray-500 dark:text-gray-400"
            >
              Register a new Farcaster ID and choose a recovery address.
              <br />
              You'll use this FID to identify your app.
            </p>
            <div className="flex flex-row gap-x-1 text-gray-500 dark:text-gray-400">
              <a
                href="https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/RegisterFIDButton.tsx"
                target="_blank"
                className="underline"
              >
                Go to code
              </a>
              {!!registerFidTxHash && <p>|</p>}
              {!!registerFidTxHash && (
                <a
                  href={`${BLOCK_EXPLORER_URL}tx/${registerFidTxHash}`}
                  target="_blank"
                  className="underline"
                >
                  Show transaction
                </a>
              )}
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
          <RegisterFIDButton
            recoveryAddress={recoveryAddress}
            setRegisterFidTxHash={setRegisterFidTxHash}
          />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label
              htmlFor="comments"
              className="font-medium text-gray-900 dark:text-white"
            >
              Collect register signature
            </label>
            <p
              id="comments-description"
              className="text-gray-500 dark:text-gray-400"
            >
              Collect an offchain signature from the account receiving the FID.
            </p>
            <div className="flex flex-row gap-x-1 text-gray-500 dark:text-gray-400">
              <a
                href="https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/RegisterFIDButton.tsx"
                target="_blank"
                className="underline"
              >
                Go to code
              </a>
            </div>
          </div>
          <CollectRegisterSigButton
            burnerAccount={burnerAccount}
            deadline={deadline}
            setRegisterSig={setRegisterSig}
          />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label
              htmlFor="comments"
              className="font-medium text-gray-900 dark:text-white"
            >
              Generate signer and metadata
            </label>
            <p
              id="comments-description"
              className="text-gray-500 dark:text-gray-400"
            >
              A signer is a key pair that lets an app create new messages or
              "casts."
              <br />
              First, your app should generate and save a new signer keypair.
              <br />
              Then, sign a message to identify your app.
            </p>
            <div className="flex flex-row gap-x-1 text-gray-500 dark:text-gray-400">
              <a
                href="https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/RegisterFIDButton.tsx"
                target="_blank"
                className="underline"
              >
                Go to code
              </a>
            </div>
          </div>
          <GenerateSignedKeyMetadataButton
            disabled={registerSig === "0x00"}
            deadline={deadline}
            setMetadata={setMetadata}
          />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label
              htmlFor="offers"
              className="font-medium text-gray-900 dark:text-white"
            >
              Collect add key signature
            </label>
            <p
              id="offers-description"
              className="text-gray-500 dark:text-gray-400"
            >
              Collect an offchain signature from the account that's signing up
              to
              <br />
              authorize adding the new signer.
            </p>
            <div className="flex flex-row gap-x-1 text-gray-500 dark:text-gray-400">
              <a
                href="https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/AddSignerButton.tsx"
                target="_blank"
                className="underline"
              >
                Go to code
              </a>
            </div>
          </div>
          <CollectAddKeySigButton
            disabled={registerSig === "0x00" || metadata === "0x00"}
            burnerAccount={burnerAccount}
            metadata={metadata}
            setAddKeySig={setAddKeySig}
            deadline={deadline}
          />
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label
              htmlFor="comments"
              className="font-medium text-gray-900 dark:text-white"
            >
              Call Bundler
            </label>
            <p
              id="comments-description"
              className="text-gray-500 dark:text-gray-400"
            >
              Call the Bundler contract with the collected signatures and
              metadata
              <br />
              to register in a single transaction.
            </p>
            <div className="flex flex-row gap-x-1 text-gray-500 dark:text-gray-400">
              <a
                href="https://github.com/wojtekwtf/farcaster-signup-demo/blob/main/src/components/RegisterFIDButton.tsx"
                target="_blank"
                className="underline"
              >
                Go to code
              </a>
              {!!registerTxHash && <p>|</p>}
              {!!registerTxHash && (
                <a
                  href={`${BLOCK_EXPLORER_URL}tx/${registerTxHash}`}
                  target="_blank"
                  className="underline"
                >
                  Show transaction
                </a>
              )}
            </div>
          </div>
          <BundlerRegisterButton
            burnerAccount={burnerAccount}
            burnerFid={burnerFid}
            deadline={deadline}
            registerSig={registerSig}
            addKeySig={addKeySig}
            metadata={metadata}
            setBurnerFid={setBurnerFid}
            setRegisterTxHash={setRegisterTxHash}
          />
        </div>
      </div>
    </fieldset>
  );
}
