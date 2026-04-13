import { ConnectButton, useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { client, BASE_CHAIN } from "@/lib/thirdweb";
import { createWallet, injectedProvider } from "thirdweb/wallets";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.okex.wallet"),
  createWallet("io.rabby"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
];

interface WalletConnectProps {
  onConnected?: (address: string) => void;
}

export function WalletConnect({ onConnected }: WalletConnectProps) {
  const account = useActiveAccount();

  if (account && onConnected) {
    onConnected(account.address);
  }

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={BASE_CHAIN}
      connectModal={{
        size: "compact",
        title: "Connect Wallet",
        titleIcon: "",
      }}
      connectButton={{
        label: "Connect Wallet",
        className: "wallet-connect-btn",
      }}
      theme="dark"
    />
  );
}

export function useWalletAddress(): string | undefined {
  const account = useActiveAccount();
  return account?.address;
}
