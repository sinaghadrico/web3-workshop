/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  JsonRpcProviderUrl,
  checkWalletInstalled,
  exchangeRouterAddress,
  exchangeFactoryAddress,
  formatBalance,
  formatBalanceCustomToken,
  getNetworkName,
  toWei,
  toWeiCustom,
  tokenABI,
  tokenList,
  uniswapV2CFactoryABI,
  uniswapV2RouterABI,
  addTokenToWallet,
  switchNetwork,
} from "../utils/index";
import { ethers } from "ethers";

function EtherComponent() {
  const isWalletInstalled = checkWalletInstalled();
  const [instantProvider, setInstantProvider] =
    useState<ethers.BrowserProvider>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState<bigint | number>();
  const [tokenBalance, setTokenBalance] = useState<number>();
  const [chainId, setChainId] = useState<bigint>();

  const [txId, setTxId] = useState<string>();

  const [tokenBalanceRPC, setTokenBalanceRPC] = useState<number>();

  const [signatureMessage, setSignatureMessage] = useState<string>();

  const handleConnectToWallet = async () => {
    if (isWalletInstalled) {
      try {
        // Request account access
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        // Create a new provider using the injected Ethereum provider
        const provider = new ethers.BrowserProvider((window as any).ethereum);

        setInstantProvider(provider);
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
        // Get the signer (current user)
        const signer = await instantProvider.getSigner();
        const result: string = await signer.getAddress();
        setAccounts([result]);
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
        const result: bigint = await instantProvider
          .getNetwork()
          .then((network) => network.chainId);
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
        const result: bigint = await instantProvider.getBalance(accounts[0]);
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
        const signer = await instantProvider.getSigner();
        debugger;
        const tokenContract = new ethers.Contract(
          tokenList[0].address,
          tokenABI,
          signer
        );
        // Read token balance
        const result: any = await tokenContract.balanceOf(accounts[0]);
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
        const tx = {
          to: receiverAddress,
          value: amountInWei,
          // gasLimit: 21000, // Gas limit for a standard Ether transfer
          // gasPrice: ethers.parseUnits("10", "gwei"), // Gas price in Gwei
        };

        // Sign and send the transaction
        const signer = await instantProvider.getSigner();
        const signedTx = await signer.sendTransaction(tx);
        setTxId(signedTx.hash);

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
        const signer = await instantProvider.getSigner();
        const tokenContract = new ethers.Contract(
          tokenList[0].address,
          tokenABI,
          signer
        );
        const amountInWei = toWeiCustom(amount, tokenList[0].decimal);

        const tx = await tokenContract.transfer(receiverAddress, amountInWei);

        console.log("Transaction sent:", tx.hash);

        // Wait for transaction to be confirmed
        const receipt = await tx.wait(1);
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        setTxId(tx.hash);

        return true;
      } catch (e) {
        return false;
      }
    }
  };

  //allow you to give a specific smart contract permission to use a certain amount of their tokens
  const handleApproveToken = async (
    token: any,
    spenderAddress: string,
    amount: string
  ) => {
    if (isWalletInstalled && instantProvider) {
      try {
        const signer = await instantProvider.getSigner();
        const tokenContract = new ethers.Contract(
          token.address,
          tokenABI,
          signer
        );
        const amountInWei = toWeiCustom(amount, token.decimal);

        await tokenContract.approve(spenderAddress, amountInWei);
        //can check currentAllowance
        const currentAllowance = await tokenContract.allowance(
          accounts[0],
          exchangeRouterAddress
        );
        console.log(currentAllowance);

        return true;
      } catch (e) {
        return false;
      }
    }
  };

  const handleGetBalanceWithOutSigner = async (address: string) => {
    try {
      // Read account balance
      const provider = new ethers.JsonRpcProvider(JsonRpcProviderUrl);

      const tokenContract = new ethers.Contract(
        tokenList[0].address,
        tokenABI,
        provider
      );
      // Read token balance
      const result: any = await tokenContract.balanceOf(address);
      setTokenBalanceRPC(result);
      return result;
    } catch (e) {
      return 0;
    }
  };

  const signMessage = async (message: string) => {
    try {
      if (!(window as any).ethereum)
        throw new Error("No EVM Wallet found. Please install it.");

      if (instantProvider) {
        const signer = await instantProvider.getSigner();
        const signature = await signer.signMessage(message);
        const address = await signer.getAddress();
        setSignatureMessage(signature);
        return {
          message,
          signature,
          address,
        };
      }
    } catch (error) {
      return {
        message: "",
        signature: "",
        address: "",
      };
    }
  };

  const calcDeadline = async () => {
    try {
      const lastBlock = await instantProvider?.getBlock("latest");

      const lastTime = lastBlock?.timestamp || 0;
      if (lastTime === 0) {
        throw new Error("We cant to calculate deadline");
      }
      const _deadline = lastTime + 100000;

      const deadline = toWeiCustom(_deadline, 1);
      return deadline;
    } catch (error) {
      throw new Error("We cant to calculate deadline");
    }
  };

  const handleSwapToken = async (
    inputToken: any,
    outputToken: any,
    receiverAddress: string,
    inputAmount: string
  ) => {
    if (isWalletInstalled && instantProvider) {
      try {
        const signer = await instantProvider.getSigner();

        const uniswapV2FactoryContract = new ethers.Contract(
          exchangeFactoryAddress,
          uniswapV2CFactoryABI,
          signer
        );

        const pair = await uniswapV2FactoryContract.getPair(
          inputToken?.address,
          outputToken?.address
        );

        if (pair === "0x0000000000000000000000000000000000000000") {
          throw new Error("Pair not found between tokens");
        }
        const path = [inputToken.address, outputToken.address];

        const amountInWei = toWeiCustom(inputAmount, inputToken.decimal);
        const uniswapV2RouterContract = new ethers.Contract(
          exchangeRouterAddress,
          uniswapV2RouterABI,
          signer
        );

        const amountOutResult = await uniswapV2RouterContract.getAmountsOut(
          amountInWei,
          path
        );
        const minAmountOutWei = amountOutResult[path.length - 1];
        const minAmountOut = formatBalanceCustomToken(
          minAmountOutWei,
          outputToken.decimal
        );
        console.log("minAmountOut", minAmountOut);

        const deadline = await calcDeadline();

        const tx = await uniswapV2RouterContract.swapExactTokensForTokens(
          amountInWei,
          minAmountOutWei,
          path,
          receiverAddress,
          deadline
        );

        console.log("Transaction sent:", tx.hash);

        // Wait for transaction to be confirmed
        const receipt = await tx.wait(1);
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        setTxId(tx.hash);

        return true;
      } catch (e) {
        return false;
      }
    }
  };
  return (
    <>
      <h1>Ether JS </h1>
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
          {instantProvider && (
            <div className="flex flex-col items-center gap-5">
              <button
                className="w-96"
                onClick={() => {
                  signMessage("test");
                }}
              >
                Sign Message
              </button>

              <div className="flex flex-col gap-5">
                <p>Message: {`test`}</p>
                {!!signatureMessage && <p>Signature: {signatureMessage}</p>}
              </div>
            </div>
          )}
          {instantProvider && (
            <div className="flex flex-col items-center gap-5">
              <button
                className="w-96"
                onClick={() => {
                  addTokenToWallet(tokenList[0]);
                }}
              >
                Add {tokenList[0].symbol} (ERC20 Token) To Wallet
              </button>
            </div>
          )}
          {instantProvider && (
            <div className="flex flex-col items-center gap-5">
              <button
                className="w-96"
                onClick={() => {
                  switchNetwork(1);
                }}
              >
                Switch Network
              </button>
            </div>
          )}
          {instantProvider && accounts.length > 0 && (
            <div className="flex flex-col items-center gap-5">
              <button className="w-96" onClick={handleGetBalance}>
                Show ETH Balance
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
                <br />
                With BrowserProvider (Signer)
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
                  handleGetBalanceWithOutSigner(accounts[0]);
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
                Transfer {"0.001"} {tokenList[0].symbol} (ERC20 Token)
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
                  handleApproveToken(
                    tokenList[0],
                    exchangeRouterAddress,
                    "0.001"
                  );
                }}
              >
                Approve to use {"0.001"} {tokenList[0].symbol}
                <br />
                in swap contract
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
                  handleSwapToken(
                    tokenList[0],
                    tokenList[1],
                    "0x7D29beC3810841aB6C64A78B46e0a1463Ea790E5",
                    "0.001"
                  );
                }}
              >
                Swap {"0.001"} {tokenList[0].symbol} to {"? "}
                {tokenList[1].symbol}
              </button>
              {!!txId && (
                <div className="flex flex-col gap-5">
                  <p>TxId:{txId} </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default EtherComponent;
