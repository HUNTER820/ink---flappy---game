import { createThirdwebClient, defineChain } from "thirdweb";

export const client = createThirdwebClient({
  clientId: "153ffed67f635ce4952c7c96c138bf04",
});

export const BASE_CHAIN = defineChain({
  id: 57073,
  name: "Ink",
  rpc: "https://rpc-gel.inkonchain.com",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockExplorers: [{ name: "Ink Explorer", url: "https://explorer.inkonchain.com" }],
});

export const RECIPIENT_ADDRESS = "0x522b7354dde52a80d8188a3577519aba8ad0572f";

export const SINGLE_PLAY_ETH = "0.000025";

export const SINGLE_PLAY_WEI = BigInt("25000000000000");
