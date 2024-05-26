/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Web3 from "web3";
import {
  addTokenToWallet,
  checkWalletConnected,
  checkWalletInstalled,
  formatBalance,
  getNetworkName,
  switchNetwork,
  toWei,
  tokenList,
} from "../../utils";

function Web3Component() {
  const isWalletInstalled = checkWalletInstalled();
  const isWalletConnected = checkWalletConnected();
  const [instantProvider, setInstantProvider] = useState<Web3>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState<bigint | number>();
  const [chainId, setChainId] = useState<bigint>();
  const [txId, setTxId] = useState<string>();

  const handleConnectToWallet = async () => {
    if (isWalletInstalled) {
      try {
        // Request account access
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        // Instance web3 with the provided information
        const web3 = new Web3((window as any).ethereum);
        setInstantProvider(web3);
        return true;
      } catch (e) {
        // User denied access
        return false;
      }
    }
  };
  const handleDicConnectWallet = async () => {
    setInstantProvider(undefined);
    setAccounts([]);
    setBalance(0);
    setChainId(undefined);
  };

  const handleGetAccounts = async () => {
    if (isWalletInstalled && instantProvider) {
      try {
        // Read accounts
        const result: string[] = await instantProvider.eth.getAccounts();
        setAccounts(result || []);
        return true;
      } catch (e) {
        return "undefined";
      }
    }
  };
  const handleGetChainId = async () => {
    if (isWalletInstalled && instantProvider) {
      try {
        // Read accounts
        const result: bigint = await instantProvider.eth.getChainId();
        setChainId(result);
        return true;
      } catch (e) {
        return "undefined";
      }
    }
  };

  const handleGetBalance = async () => {
    if (isWalletInstalled && instantProvider) {
      try {
        // Read account balance
        const result: bigint = await instantProvider.eth.getBalance(
          accounts[0]
        );
        //balance in wei ,wei is the smallest unit in the ether values scale
        setBalance(result);
        return result;
      } catch (e) {
        return 0;
      }
    }
  };

  const handleTransfer = async (receiverAddress: string, amount: string) => {
    if (isWalletInstalled && instantProvider) {
      const amountInWei = toWei(amount);

      try {
        const txObject = {
          from: accounts[0],
          to: receiverAddress,
          value: amountInWei,
        };
        instantProvider.eth
          .sendTransaction(txObject)
          .on("transactionHash", (hash) => {
            console.log("Transaction Hash:", hash);
            setTxId(hash);
          })
          .on("receipt", (receipt) => {
            console.log("Transaction Receipt:", receipt);
          })
          .on("error", (error) => {
            console.error("Error:", error);
          });

        return true;
      } catch (e) {
        return 0;
      }
    }
  };

  return (
    <>
      <h1>Web3 JS </h1>
      <div className="card">
        <div className="flex flex-col gap-5 ">
          <div
            className={`flex flex-col items-center ${
              isWalletInstalled ? "text-green-700" : "text-red-500"
            }`}
          >
            {isWalletInstalled
              ? "Ethereum Wallet is installed!"
              : "No Ethereum provider found. Please install MetaMask or another compatible wallet."}
          </div>

          <div className="flex flex-col items-center">
            {!instantProvider ? (
              <button className="w-72" onClick={handleConnectToWallet}>
                Connect To Wallet
              </button>
            ) : (
              <button className="w-72" onClick={handleDicConnectWallet}>
                Disconnect Wallet
              </button>
            )}
          </div>
          {instantProvider && (
            <div className="flex flex-col items-center gap-5">
              <button className="w-72" onClick={handleGetChainId}>
                Show ChainId , Network
              </button>

              {!!chainId && (
                <div className="flex flex-col items-center gap-5">
                  {`ChainID ${Number(chainId)} corresponds to ${getNetworkName(
                    Number(chainId)
                  )}`}
                </div>
              )}
            </div>
          )}
          {instantProvider && (
            <div className="flex flex-col items-center gap-5">
              <button className="w-72" onClick={handleGetAccounts}>
                Show Account
              </button>

              <div className="flex flex-col items-center gap-5">
                {accounts.map((account) => {
                  return <p key={account}>{account}</p>;
                })}
              </div>
            </div>
          )}

          {instantProvider && accounts.length > 0 && (
            <div className="flex flex-col items-center gap-5">
              <button className="w-72" onClick={handleGetBalance}>
                Show Balance
              </button>
              {!!balance && (
                <div className="flex flex-col gap-5">
                  <p>{balance.toString()} wei</p>
                  <p>{formatBalance(balance.toString())} ETH</p>
                </div>
              )}
            </div>
          )}
          {instantProvider && accounts.length > 0 && (
            <div className="flex flex-col items-center gap-5">
              <button
                className="w-72"
                onClick={() => {
                  handleTransfer(
                    "0x7D29beC3810841aB6C64A78B46e0a1463Ea790E5",
                    "0.003"
                  );
                }}
              >
                Transfer
              </button>
              {!!txId && (
                <div className="flex flex-col gap-5">
                  <p>TxId:{txId} </p>
                </div>
              )}
            </div>
          )}

          {instantProvider && (
            <div className="flex flex-col items-center gap-5">
              <button
                className="w-72"
                onClick={() => {
                  addTokenToWallet(tokenList[0]);
                }}
              >
                Add USDT (ERC20 Token) To Wallet
              </button>
            </div>
          )}
          {instantProvider && (
            <div className="flex flex-col items-center gap-5">
              <button
                className="w-72"
                onClick={() => {
                  switchNetwork(1);
                }}
              >
                Switch Network
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Web3Component;
