import { PublicKey } from "@solana/web3.js";

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
export let TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export let BINARY_OPTION_PROGRAM_ID = new PublicKey(
  "6Msecaqpxtqatks2JyqXg66nYZ3XxrZ8gDwuSaH6sept"
);

export let SYSTEM_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111"
);

export let SYSVAR_RENT_ID = new PublicKey(
  "SysvarRent111111111111111111111111111111111"
)

export let ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export let LENDING_PROGRAM_ID = new PublicKey(
  "TokenLending1111111111111111111111111111111"
);

export let SWAP_PROGRAM_ID = new PublicKey(
  "SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8"
);

export let PYTH_HELLO_WORLD = new PublicKey(
  "BKYTayVSTcCWYm8Qzub8EGkr61Tsnepp4ioxbtVFBCFw"
);

export const PROGRAM_IDS = [
  {
    name: "mainnet-beta",
  },
  {
    name: "testnet",
  },
  {
    name: "devnet",
  },
  {
    name: "localnet",
  },
];

export const setProgramIds = (envName: string) => {
  let instance = PROGRAM_IDS.find((env) => env.name === envName);
  if (!instance) {
    return;
  }
};

export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
  };
};
