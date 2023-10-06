import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <fieldset className=" border-gray-200 min-w-[600px]">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Sign up for Farcaster
      </h1>
      <div className="divide-y divide-gray-200">
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="comments" className="font-medium text-gray-900">
              Register an FID
            </label>
            <p id="comments-description" className="text-gray-500">
              To perform any action on farcaster, your need an FID.
            </p>
          </div>
          <a
            href='https://optimistic.etherscan.io/address/0x00000000fcaf86937e41ba038b4fa40baa4b780a#writeContract'
            target='_blank'
            type="button"
            className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
          >
            Etherscan
            <ArrowTopRightOnSquareIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
          </a>
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="candidates" className="font-medium text-gray-900">
              Purchase a storage unit
            </label>
            <p id="candidates-description" className="text-gray-500">
              To use Farcaster you need to pay for storing data in the hubs. <br />
              One storage unit let's you store up to 5000 casts a year and costs $7
            </p>
          </div>
          <a
            href='https://optimistic.etherscan.io/address/0x00000000fcce7f938e7ae6d3c335bd6a1a7c593d#writeContract'
            target='_blank'
            type="button"
            className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
          >
            Etherscan
            <ArrowTopRightOnSquareIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
          </a>
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="offers" className="font-medium text-gray-900">
              Add a signer
            </label>
            <p id="offers-description" className="text-gray-500">
              Signers are keypairs that have a permission to write <br />
              to the protocol on your behalf.
            </p>
          </div>
          <a
            href='https://goerli-optimism.etherscan.io/address/0x34a6f04b474eb64d9a82017a01acbe5a58a0f541#writeContract'
            target='_blank'
            type="button"
            className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
          >
            Etherscan
            <ArrowTopRightOnSquareIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
          </a>
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="offers" className="font-medium text-gray-900">
              Register an fname <span className="text-gray-400">(optional)</span>
            </label>
            <p id="offers-description" className="text-gray-500 mb-2">
              Fnames are ENS domains managed by Warpcast team. <br />
              They are not required to use Farcaster. But you can register one anyway
            </p>
            <input
              type="text"
              name="fname"
              id="fname"
              className="block w-64 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
              placeholder="Enter your fname"
              data-1p-ignore
            />
          </div>
          <button
            type="button"
            className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
          >
            Register
          </button>
        </div>
        <div className="relative flex items-start pb-4 pt-3.5">
          <div className="min-w-0 flex-1 text-sm leading-6">
            <label htmlFor="offers" className="font-medium text-gray-900">
              Publish a cast
            </label>
            <p id="offers-description" className="text-gray-500 mb-2">
              With an FID, a storage unit and a signer you can publish a cast. <br />
            </p>
            <input
              type="text"
              name="cast"
              id="cast"
              className="block w-64 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
              placeholder="Type your cast"
            />
          </div>
          <button
            type="button"
            className="w-28 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
          >
            Cast
          </button>
        </div>
      </div>
    </fieldset>
  )
}
