/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Web3 from "web3";
import {
  JsonRpcProviderUrl,
  checkWalletInstalled,
  formatBalance,
  formatBalanceCustomToken,
  getNetworkName,
  toWei,
  toWeiCustom,
  tokenABI,
  tokenList,
} from "../utils/index";

function Web3Component() {
  const isWalletInstalled = checkWalletInstalled();
  const [instantProvider, setInstantProvider] = useState<Web3>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState<bigint | number>();
  const [tokenBalance, setTokenBalance] = useState<number>();
  const [chainId, setChainId] = useState<bigint>();

  const [txId, setTxId] = useState<string>();

  const [tokenBalanceRPC, setTokenBalanceRPC] = useState<number>();

  useEffect(() => {
    (window as any).ethereum &&
      (window as any).ethereum.on(
        "accountsChanged",
        function (_accounts: string[]) {
          // Handle accountsChanged event
          console.log("Accounts changed:", _accounts);
          // Update UI or perform necessary actions
          setAccounts(_accounts);
        }
      );
    (window as any) &&
      (window as any).ethereum.on("chainChanged", function (_chain: any) {
        // Handle accountsChanged event
        console.log("chain changed:", _chain);
        // Update UI or perform necessary actions
      });

    return () => {
      (window as any) &&
        (window as any).ethereum.removeListener(
          "accountsChanged",
          function (_accounts: string[]) {
            // Handle accountsChanged event
            console.log("Accounts changed:", _accounts);
            setAccounts(_accounts);
            // Update UI or perform necessary actions
          }
        );
      (window as any) &&
        (window as any).ethereum.removeListener(
          "chainChanged",
          function (_chain: any) {
            // Handle chainChanged event
            console.log("chain changed:", _chain);
            // Update UI or perform necessary actions
          }
        );
    };
  }, []);

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
    setTokenBalance(0);
    setTokenBalanceRPC(0);
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
        // Read chainId
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

  const handleGetTokenBalance = async () => {
    if (isWalletInstalled && instantProvider) {
      try {
        const tokenContract = new instantProvider.eth.Contract(
          tokenABI,
          tokenList[0].address
        );
        // Read token balance
        const result: any = await tokenContract.methods
          .balanceOf(accounts[0])
          .call();

        setTokenBalance(result);
        return true;
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
        await instantProvider.eth
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

  const handleTransferToken = async (
    receiverAddress: string,
    amount: string
  ) => {
    if (isWalletInstalled && instantProvider) {
      try {
        const tokenContract = new instantProvider.eth.Contract(
          tokenABI,
          tokenList[0].address
        );
        const amountInWei = toWeiCustom(amount, tokenList[0].decimal);

        const data = await tokenContract.methods
          .transfer(receiverAddress, amountInWei)
          .send({ from: accounts[0] })
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
        return false;
      }
    }
  };

  const handleGetBalanceWithOutSigner = async (address: string) => {
    try {
      // Create a new instance of web3
      const web3 = new Web3(JsonRpcProviderUrl);

      // Create a contract instance
      const tokenContract = new web3.eth.Contract(
        tokenABI,
        tokenList[0].address
      );
      // Read token balance
      const result: any = await tokenContract.methods.balanceOf(address).call();
      setTokenBalanceRPC(result);
      return result;
    } catch (e) {
      return 0;
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
              ? "EVM Wallet is installed!"
              : "No Ethereum provider found. Please install MetaMask or another compatible wallet."}
          </div>

          <div className="flex flex-col items-center">
            {!instantProvider ? (
              <button className="w-96" onClick={handleConnectToWallet}>
                Connect To Wallet
              </button>
            ) : (
              <button className="w-96" onClick={handleDicConnectWallet}>
                Disconnect Wallet
              </button>
            )}
          </div>
          {instantProvider && (
            <div className="flex flex-col items-center gap-5">
              <button className="w-96" onClick={handleGetChainId}>
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
              <button className="w-96" onClick={handleGetAccounts}>
                Show Accounts
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
              <button className="w-96" onClick={handleGetBalance}>
                Show Balance ETH
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
              <button className="w-96" onClick={handleGetTokenBalance}>
                Show {tokenList[0].symbol} (ERC20 Token) Balance
              </button>
              {!!tokenBalance && (
                <div className="flex flex-col gap-5">
                  <p>{tokenBalance.toString()} wei</p>
                  <p>
                    {formatBalanceCustomToken(
                      tokenBalance,
                      tokenList[0].decimal
                    )}{" "}
                    {tokenList[0].symbol}
                  </p>
                </div>
              )}
            </div>
          )}
          {instantProvider && accounts.length > 0 && (
            <div className="flex flex-col items-center gap-5">
              <button
                className="w-96"
                onClick={() => {
                  handleTransfer(
                    "0x7D29beC3810841aB6C64A78B46e0a1463Ea790E5",
                    "0.001"
                  );
                }}
              >
                Transfer {"0.001"} ETH
              </button>
              {!!txId && (
                <div className="flex flex-col gap-5">
                  <p>TxId:{txId} </p>
                </div>
              )}
            </div>
          )}
          {instantProvider && accounts.length > 0 && (
            <div className="flex flex-col items-center gap-5">
              <button
                className="w-96"
                onClick={() => {
                  handleTransferToken(
                    "0x7D29beC3810841aB6C64A78B46e0a1463Ea790E5",
                    "0.001"
                  );
                }}
              >
                Transfer {"0.001"} {tokenList[0].symbol} (ERC20 Token) Balance
                <br />
                With BrowserProvider (Signer)
              </button>
              {!!txId && (
                <div className="flex flex-col gap-5">
                  <p>TxId:{txId} </p>
                </div>
              )}
            </div>
          )}
          {instantProvider && accounts.length > 0 && (
            <div className="flex flex-col items-center gap-5">
              <button
                className="w-96"
                onClick={() => {
                  handleGetBalanceWithOutSigner(
                    "0x548f6afdd7A64d3dDB654a01e6E114795e3b38fe"
                  );
                }}
              >
                Show {tokenList[0].symbol} (ERC20 Token) Balance <br />
                With RPC Provider
              </button>
              {!!tokenBalanceRPC && (
                <div className="flex flex-col gap-5">
                  <p>{tokenBalanceRPC.toString()} wei</p>
                  <p>
                    {formatBalanceCustomToken(
                      tokenBalanceRPC,
                      tokenList[0].decimal
                    )}{" "}
                    {tokenList[0].symbol}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Web3Component;
