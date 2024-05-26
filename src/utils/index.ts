import { ethers } from "ethers";
// import Web3 from "web3";

export const formatBalanceCustomToken = (
  rawBalance: number,
  decimal: number
) => {
  // const balance = Web3.utils.fromWei(rawBalance, decimal);
  const balance = ethers.formatUnits(rawBalance.toString(), decimal);
  return balance;
};
export const formatBalance = (rawBalance: string | number) => {
  // const balance = Web3.utils.fromWei(rawBalance, "ether");
  const balance = ethers.formatEther(rawBalance.toString());
  return balance;
};
export const toWei = (rawBalance: string | number) => {
  // const wei = Web3.utils.toWei(rawBalance, "ether");
  const wei = ethers.parseEther(rawBalance.toString());
  return wei;
};
export const toWeiCustom = (rawBalance: string | number, decimal: number) => {
  // const wei = Web3.utils.toWei(rawBalance, decimal);
  const wei = ethers.parseUnits(rawBalance.toString(), decimal);
  return wei;
};

export const formatChainAsNum = (chainIdHex: string) => {
  const chainIdNum = parseInt(chainIdHex);
  return chainIdNum;
};

export const formatAddress = (addr: string) => {
  const upperAfterLastTwo = addr.slice(0, 2) + addr.slice(2);
  return `${upperAfterLastTwo.substring(0, 5)}...${upperAfterLastTwo.substring(
    39
  )}`;
};

export const tokenList = [
  {
    address: "0x55d398326f99059fF775485246999027B3197955",
    symbol: "USDT",
    decimal: 18,
  },
];
export interface ChainIdToNetworkMap {
  [key: number]: string;
}

const chainIdToNetwork: ChainIdToNetworkMap = {
  1: "Ethereum Mainnet",
  3: "Ropsten Testnet",
  4: "Rinkeby Testnet",
  5: "Goerli Testnet",
  42: "Kovan Testnet",
  56: "Binance Smart Chain Mainnet",
  97: "Binance Smart Chain Testnet",
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet",
  250: "Fantom Opera",
  4002: "Fantom Testnet",
  43114: "Avalanche Mainnet",
  43113: "Avalanche Fuji Testnet",
  10: "Optimism Mainnet",
  69: "Optimism Kovan Testnet",
  42161: "Arbitrum One",
  421611: "Arbitrum Rinkeby Testnet",
  128: "Huobi ECO Chain Mainnet",
  256: "Huobi ECO Chain Testnet",
  1666600000: "Harmony Mainnet Shard 0",
  1666700000: "Harmony Testnet Shard 0",
  100: "xDai Chain",
  77: "POA Network Sokol",
  99: "POA Network Core",
  61: "Ethereum Classic Mainnet",
  30: "RSK Mainnet",
  31: "RSK Testnet",
  66: "OKExChain Mainnet",
  65: "OKExChain Testnet",
  1285: "Moonriver",
  1287: "Moonbase Alpha Testnet",
  2020: "Ronin",
  888: "Wanchain",
  8888: "Wanchain Testnet",
  2222: "Kava EVM",
  2221: "Kava EVM Testnet",
  122: "Fuse Mainnet",
  123: "Fuse Testnet",
  1663: "Lachain Mainnet",
  553: "Lachain Testnet",
  25: "Cronos Mainnet",
  338: "Cronos Testnet",
  1313161554: "Aurora Mainnet",
  1313161555: "Aurora Testnet",
  40: "Telos EVM Mainnet",
  41: "Telos EVM Testnet",
};

export function getNetworkName(chainId: number) {
  return chainIdToNetwork[chainId] || "Unknown Network";
}

export const checkWalletInstalled = () => {
  if (typeof (window as any).ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    return true;
  }
  return false;
};
export const checkWalletConnected = () => {
  if (typeof (window as any).ethereum !== "undefined") {
    return (window as any).ethereum.isConnected();
  }
  return false;
};

export async function addTokenToWallet(data: {
  address: string;
  symbol: string;
  decimal: number;
}) {
  const tokenAddress = data.address;
  const tokenSymbol = data.symbol;
  const tokenDecimals = data.decimal;

  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await (window as any).ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20", // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals, // The number of decimals in the token
        },
      },
    });
    return wasAdded;
  } catch (error) {
    console.log(error);
  }
}
export async function switchNetwork(id: number) {
  let networkData;
  switch (id) {
    // Binance Smart Chain Testnet
    case 97:
      networkData = [
        {
          chainId: `0x${Number(97).toString(16)}`,
          chainName: "BSC Testnet",
          rpcUrls: [
            "https://data-seed-prebsc-2-s1.binance.org:8545/",
            "https://data-seed-prebsc-2-s2.binance.org:8545/",
            "https://data-seed-prebsc-1-s2.binance.org:8545/",
            "https://data-seed-prebsc-1-s1.binance.org:8545",
            "https://data-seed-prebsc-1-s3.binance.org:8545/",
            "https://data-seed-prebsc-2-s3.binance.org:8545/",
          ],
          nativeCurrency: {
            name: "BNB",
            symbol: "BNB",
            decimals: 18,
          },
          blockExplorerUrls: ["https://testnet.bscscan.com/"],
        },
      ];
      break;
    // Binance Smart Chain Mainnet
    case 56:
      networkData = [
        {
          chainId: `0x${Number(56).toString(16)}`,
          chainName: "Binance Smart Chain",
          nativeCurrency: {
            name: "BNB",
            symbol: "BNB",
            decimals: 18,
          },
          rpcUrls: [
            "https://bsc-dataseed.binance.org/",
            "https://bsc-dataseed1.defibit.io/",
            "https://bsc-dataseed1.ninicoin.io/",
          ],
          blockExplorerUrls: ["https://bscscan.com/"],
          iconUrls: ["https://bscscan.com/images/svg/brands/bnb.svg?v=1.3"],
        },
      ];
      break;
    // Ethereum Rinkeby Testnet
    case 3:
      networkData = [
        {
          chainId: `0x${Number(3).toString(16)}`,
        },
      ];
      break;
    // Ethereum Rinkeby Testnet
    case 4:
      networkData = [
        {
          chainId: `0x${Number(4).toString(16)}`,
        },
      ];
      break;
    // Ethereum Mainnet
    case 1:
      networkData = [
        {
          chainId: `0x${Number(1).toString(16)}`,
        },
      ];
      break;
    // Avalanche  Testnet
    case 43113:
      networkData = [
        {
          chainId: `0x${Number(43113).toString(16)}`,
          chainName: "Avalanche Fuji Testnet",
          rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
          nativeCurrency: {
            name: "AVAX",
            symbol: "AVAX",
            decimals: 18,
          },
          blockExplorerUrls: ["https://testnet.explorer.avax.network/"],
        },
      ];
      break;
    // Avalanche  Mainnet
    case 43114:
      networkData = [
        {
          chainId: `0x${Number(43114).toString(16)}`,
          chainName: "Avalanche Mainnet",
          rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
          nativeCurrency: {
            name: "AVAX",
            symbol: "AVAX",
            decimals: 18,
          },
          blockExplorerUrls: ["https://cchain.explorer.avax.network"],
        },
      ];
      break;
    // mumbai
    case 80001:
      networkData = [
        {
          chainId: `0x${Number(80001).toString(16)}`,
          chainName: "mumbai",
          rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
          blockExplorerUrls: ["https://mumbai.polygonscan.com"],
        },
      ];
      break;
    // mumbai
    case 80002:
      networkData = [
        {
          chainId: `0x${Number(80002).toString(16)}`,
          chainName: "mumbai",
          rpcUrls: ["https://rpc-amoy.maticvigil.com/"],
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
          blockExplorerUrls: ["https://amoy.polygonscan.com"],
        },
      ];
      break;
    default:
      break;
  }
  if (networkData && (window as any).ethereum) {
    return (window as any).ethereum.request({
      method:
        id === 4 || id === 1 || id === 3
          ? "wallet_switchEthereumChain"
          : "wallet_addEthereumChain",
      params: networkData,
    });
  }
}
export const toChecksumAddress = async (address: string) => {
  return ethers.getAddress(address);
};
