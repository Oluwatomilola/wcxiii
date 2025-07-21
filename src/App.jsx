import { useState } from "react";
import abi from "./abi.json";
import { ethers } from "ethers";

const contractAddress = "0x9D1eb059977D71E1A21BdebD1F700d4A39744A70";

function App() {
  const [text, setText] = useState("");
  const [fetchedMessage, setFetchedMessage] = useState("");

  async function requestAccount() {
    if (!window.ethereum || window.ethereum?.isMetaMask !== true) {
      throw new Error("Only MetaMask is supported. Please install it.");
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  const handleSet = async () => {
    try {
      if (!text) {
        alert("Please enter a message before setting.");
        return;
      }

      if (window.ethereum?.isMetaMask !== true) {
        alert("Only MetaMask is supported.");
        return;
      }

      await requestAccount();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.setMessage(text);
      await tx.wait();

      alert("Message successfully set on-chain.");
      setText(""); // Clear input
    } catch (error) {
      console.error("Error setting message:", error);
      alert(error.message || "An error occurred while setting the message.");
    }
  };

  const handleGet = async () => {
    try {
      if (!window.ethereum?.isMetaMask) {
        alert("Only MetaMask is supported. Please install it.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Optionally require Goerli (chainId 5) or other chain here
      // if (network.chainId !== 5) {
      //   alert("Please switch to the Goerli testnet.");
      //   return;
      // }

      console.log("Connected to:", network.name, `(chainId: ${network.chainId})`);

      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        alert("No contract deployed at this address.");
        console.error("No bytecode at contract address:", contractAddress);
        return;
      }

      const contract = new ethers.Contract(contractAddress, abi, provider);
      const message = await contract.getMessage();
      setFetchedMessage(message);
    } catch (error) {
      console.error("Error getting message:", error);
      alert(error.message || "An error occurred while fetching the message.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Set & Get Message from Smart Contract</h1>

      <input
        type="text"
        placeholder="Set message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ padding: "0.5rem", width: "300px" }}
      />
      <button onClick={handleSet} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
        Set Message
      </button>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleGet} style={{ padding: "0.5rem 1rem" }}>
          Get Message
        </button>

        {fetchedMessage && (
          <p style={{ marginTop: "1rem" }}>
            <strong>Fetched Message:</strong> {fetchedMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
