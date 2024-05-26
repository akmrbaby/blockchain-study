import dotenv from "dotenv";
import { ethers } from "ethers";
import { PaymasterMode, createSmartAccountClient } from "@biconomy/account";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BUNDLER_URL = process.env.BUNDLER_URL;
const RPC_URL = process.env.RPC_URL;
const TO_ADDRESS = process.env.TO_ADDRESS;
const TRANSCATION_DATA = process.env.TRANSCATION_DATA;
const BICONOMY_PAYMASTER_API_KEY = process.env.BICONOMY_PAYMASTER_API_KEY;

// Your configuration with private key and Biconomy API key
const config = {
  privateKey: PRIVATE_KEY,
  bundlerUrl: BUNDLER_URL, // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
  rpcUrl: RPC_URL,
  biconomyPaymasterApiKey: BICONOMY_PAYMASTER_API_KEY, // PaymasterのAPIキー
};

// Generate EOA from private key using ethers.js
let provider = new ethers.JsonRpcProvider(config.rpcUrl);
let signer = new ethers.Wallet(config.privateKey || "", provider);

async function main() {
  // Create Biconomy Smart Account instance
  const smartWallet = await createSmartAccountClient({
    signer,
    bundlerUrl: config.bundlerUrl || "",
    biconomyPaymasterApiKey: config.biconomyPaymasterApiKey, // PaymasterのAPIキー
  });

  const saAddress = await smartWallet.getAccountAddress();
  console.log("SA Address", saAddress);

  // Build the transaction
  const tx = {
    to: TO_ADDRESS || "",
    data: TRANSCATION_DATA || "",
  };

  const userOpResponse = await smartWallet.sendTransaction(tx, {
    paymasterServiceData: { mode: PaymasterMode.SPONSORED }, // Paymasterの設定
  });
  const { transactionHash } = await userOpResponse.waitForTxHash();
  console.log("Transaction Hash", transactionHash);

  const userOpReceipt = await userOpResponse.wait();
  if (userOpReceipt.success == "true") {
    console.log("UserOp receipt", userOpReceipt);
    console.log("Transaction receipt", userOpReceipt.receipt);
  }
}

main();
