export const BLOCK_EXPLORER_URL = "https://optimistic.etherscan.io/"; // mainnet
// export const BLOCK_EXPLORER_URL = "https://goerli-optimism.etherscan.io/" // testnet

export const REQUEST_TIMEOUT = 5000;

// Currently this is the only fname url.
export const FNAME_URL = "https://fnames.farcaster.xyz";

// Public hubs may or may not go down, causing this
// to stop working properly. Grab a new one from
// https://foss.farchiver.xyz/
// if this stops working.
export const FARCASTER_HTTP_URL = "http://api.farcasthub.com:2281";

// https://github.com/OpenFarcaster/teleport/blob/c0458f0a37259ac30ad023f804132ba4ca67c4a9/lib/hub/src/main.rs#L107
export const FARCASTER_GRPC_URL = "api.farcasthub.com:2283";

