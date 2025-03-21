import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import AudioPlayer from "./AudioPlayer";
import "./App.css";

// Component for the scrolling NFT band (unchanged)
const NFTScrollBand = () => {
  const nfts = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    imagePath: `${process.env.PUBLIC_URL}/bandeau/${index + 1}.png`,
    name: `NFT #${index + 1}`,
  }));

  return (
    <div className="nft-scroll-container">
      <div className="nft-scroll-track">
        {[...nfts, ...nfts].map((nft, index) => (
          <div key={`nft-${index}`} className="nft-item">
            <div className="nft-image">
              <img
                src={nft.imagePath}
                alt={`NFT ${nft.id}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bottom News Band Component with GGC NEWS (unchanged)
const BottomNewsBand = () => {
  return (
    <div className="news-band">
      <div className="news-logo">
        <div className="news-logo-letter">G</div>
        <div className="news-logo-letter">G</div>
        <div className="news-logo-letter">C</div>
        <div className="news-logo-text">NEWS</div>
      </div>
    </div>
  );
};

// Bottom News Ticker Component (unchanged)
const BottomNewsTicker = () => {
  const [enlarged, setEnlarged] = useState(false);

  const toggleSize = () => {
    setEnlarged(!enlarged);
  };

  const newsMessages = [
    { text: "- 2222 AlmostHyperInscribedLiquidGoose -", color: "#00ffd5" },
    { text: "- discord.gg/DAk23DxT8z -", color: "#00ffd5" },
    { text: "- 22 UNIQUE 1/1 -", color: "#00e0ff" },
    { text: "- AlmostHyperInscribedLiquidGoose -", color: "#00bcff" },
    { text: "- discord.gg/DAk23DxT8z -", color: "#00bcff" },
    { text: "- Make your family proud, buy Bitcoin -", color: "#0021ff" },
    { text: "- As I walk through the valley of the shadow of death I take a look at my life and realize there's nothin' left -", color: "#8300ff" },
    { text: "- discord.gg/DAk23DxT8z -", color: "#cc00ff" },
    { text: "- NSM UN LEZARD TRIANGULAIRE -", color: "#cc00ff" },
  ];

  return (
    <div
      className={`bottom-news-ticker ${enlarged ? "ticker-enlarged" : ""}`}
      onClick={toggleSize}
      style={{
        background: "rgba(0, 0, 0, 0.8)",
        padding: "5px 0",
        overflow: "hidden",
        whiteSpace: "nowrap",
        cursor: "pointer",
      }}
    >
      <div
        className="ticker-track"
        style={{
          display: "inline-block",
          animation: "scroll 60s linear infinite",
        }}
      >
        {[...newsMessages, ...newsMessages].map((message, index) => (
          <span
            key={`news-${index}`}
            className="ticker-item"
            style={{
              display: "inline-block",
              padding: "0 30px",
              fontSize: enlarged ? "55px" : "54px",
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: "700",
              fontStyle: "normal",
              color: message.color,
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              transition: "font-size 0.3s",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {message.text}
          </span>
        ))}
      </div>
    </div>
  );
};

// NFT Preview Component (unchanged)
const NFTPreview = ({ quantity }) => {
  const previewItems = Array.from({ length: quantity }, (_, index) => index + 1);

  return (
    <div
      style={{
        position: "absolute",
        top: "210px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "450px",
        height: "240px",
        background: "rgba(0, 0, 0, 0.5)",
        border: "2px solid white",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "15px",
        padding: "20px",
        zIndex: 100,
      }}
    >
      {quantity === 0 ? (
        <div style={{ color: "#FFFFFF", fontSize: "18px", fontFamily: "monospace" }}>
          Click on + to max mint
        </div>
      ) : (
        previewItems.map((item, index) => (
          <div
            key={`preview-${index}`}
            style={{
              width: `${100 / Math.min(quantity, 3)}%`,
              maxWidth: "150px",
              aspectRatio: "1/1",
              background: "#222",
              border: "1px solid #FFFFFF",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/mystery.png`}
              alt={`NFT Preview ${item}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ))
      )}
    </div>
  );
};

// MintLimitModal Component (unchanged)
const MintLimitModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#222",
          padding: "20px",
          borderRadius: "10px",
          border: "2px solid #00FF00",
          textAlign: "right",
          color: "#FFFFFF",
          fontFamily: "monospace",
          maxWidth: "400px",
        }}
      >
        <img
          src={`${process.env.PUBLIC_URL}/goose-warning.png`}
          alt="Goose Warning"
          style={{ width: "100px", height: "100px", marginBottom: "10px" }}
        />
        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
          Goosy greedy goose, you already minted your quotas!
        </p>
        <button
          onClick={onClose}
          style={{
            background: "#ec7700",
            color: "#000",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

function App() {
  const [account, setAccount] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [balance, setBalance] = useState("0");
  const [totalSupply, setTotalSupply] = useState(0);
  const [maxSupply] = useState(2222);
  const [price, setPrice] = useState("0.22");
  const [mintQuantity, setMintQuantity] = useState(0);
  const [mintsByWallet, setMintsByWallet] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isMintingEnabled, setIsMintingEnabled] = useState(false);
  const audioPlayerRef = useRef(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xeb60F5A2AA239a5a1247849579e6b16D9bE75972";
  const contractABI = useMemo(() => 
    [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "ERC721IncorrectOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ERC721InsufficientApproval",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidOperator",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC721InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ERC721NonexistentToken",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "approved",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "ApprovalForAll",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "FREE_MINT_LIMIT",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "MAX_SUPPLY",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "MAX_UNIQUE_SUPPLY",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "MINT_LIMIT_PER_WALLET",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "_baseTokenURI",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "_uniqueBaseTokenURI",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "getApproved",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "isApprovedForAll",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "isUnique",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "mintPrice",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "mintingEnabled",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "mintsPerWallet",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ownerOf",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "newBaseURI",
            "type": "string"
          }
        ],
        "name": "setBaseURI",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "newUniqueBaseURI",
            "type": "string"
          }
        ],
        "name": "setUniqueBaseURI",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bool",
            "name": "_enabled",
            "type": "bool"
          }
        ],
        "name": "toggleMinting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "tokenURI",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "uniqueMintedCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }

  ], []);

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.hyperliquid.xyz/evm";

  const createProvider = () => {
    if (!window.ethereum) return null;

    const provider = new BrowserProvider(window.ethereum, {
      chainId: 999,
      name: "Hyperliquid Mainnet",
      ensAddress: null,
    });

    return provider;
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install a compatible wallet (e.g., MetaMask or Hyperliquid wallet)");
        return;
      }

      const provider = createProvider();
      if (!provider) throw new Error("Provider not initialized");

      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      setShouldPlay(true);

      if (audioPlayerRef.current) {
        console.log("Attempting to play audio...");
        setTimeout(() => {
          audioPlayerRef.current.playAudio();
        }, 100);
      }

      if (!rpcUrl || !rpcUrl.startsWith("https://")) {
        throw new Error("Invalid RPC URL. Please check your environment configuration.");
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x3E7",
            chainName: "Hyperliquid",
            rpcUrls: [rpcUrl],
            nativeCurrency: {
              name: "Hyperliquid Token",
              symbol: "HYPE",
              decimals: 18,
            },
            blockExplorerUrls: ["HYPERLIQUID_EXPLORER_URL"],
          },
        ],
      });
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  };

  const mint = async () => {
    try {
      if (!account) {
        alert("Please connect your wallet first");
        return;
      }

      const provider = createProvider();
      if (!provider) throw new Error("Provider not initialized");

      const contract = new Contract(contractAddress, contractABI, provider);
      const mintingEnabled = await contract.mintingEnabled();
      if (!mintingEnabled) {
        alert("Minting is currently disabled by the owner");
        return;
      }

      const mintLimitPerWallet = await contract.MINT_LIMIT_PER_WALLET();
      if (mintsByWallet + mintQuantity > Number(mintLimitPerWallet)) {
        alert("Goosy greedy goose, you already minted your quotas");
        return;
      }

      const signer = await provider.getSigner();
      const contractWithSigner = new Contract(contractAddress, contractABI, signer);

      const currentSupply = await contract.totalSupply();
      const freeMintLimit = 222;
      const mintPriceWei = await contract.mintPrice();

      let cost;
      if (Number(currentSupply) + mintQuantity <= freeMintLimit) {
        cost = window.BigInt(0);
      } else if (Number(currentSupply) < freeMintLimit) {
        const freeCount = freeMintLimit - Number(currentSupply);
        const paidCount = mintQuantity - freeCount;
        cost = mintPriceWei * window.BigInt(paidCount);
      } else {
        cost = mintPriceWei * window.BigInt(mintQuantity);
      }

      const tx = await contractWithSigner.mint(mintQuantity, { value: cost });
      setTxHash(tx.hash);
      await tx.wait();
      alert(`Minted ${mintQuantity} NFT(s)! Transaction: ${tx.hash}`);

      fetchTotalSupply();
      fetchMintsByWallet();
    } catch (error) {
      console.error("Minting failed:", error);
      if (error.message.includes("Minting is not enabled")) {
        alert("Minting is currently disabled by the owner");
      } else if (error.message.includes("Exceeds wallet mint limit")) {
        alert("You've reached the mint limit of 3 NFTs per wallet!");
      } else {
        alert("Minting failed: " + error.message);
      }
    }
  };

  const checkOwnership = useCallback(async () => {
    try {
      const provider = createProvider();
      if (!provider || !account) return;

      const contract = new Contract(contractAddress, contractABI, provider);
      const ownerAddress = await contract.owner();
      setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error("Error checking ownership:", error);
    }
  }, [account, contractAddress, contractABI]);

  const checkMintingStatus = useCallback(async () => {
    try {
      const provider = createProvider();
      if (!provider) return;

      const contract = new Contract(contractAddress, contractABI, provider);
      const enabled = await contract.mintingEnabled();
      setIsMintingEnabled(enabled);
    } catch (error) {
      console.error("Error checking minting status:", error);
    }
  }, [contractAddress, contractABI]);

  const toggleMinting = async (newState) => {
    if (!isOwner) return;

    try {
      const provider = createProvider();
      if (!provider) throw new Error("Provider not initialized");

      const signer = await provider.getSigner();
      const contractWithSigner = new Contract(contractAddress, contractABI, signer);
      const tx = await contractWithSigner.toggleMinting(newState);
      await tx.wait();
      await checkMintingStatus();
      alert(`Minting ${newState ? "enabled" : "disabled"} successfully!`);
    } catch (error) {
      console.error("Error toggling minting:", error);
      alert("Failed to toggle minting: " + error.message);
    }
  };

  const fetchTotalSupply = useCallback(async () => {
    try {
      const provider = createProvider();
      if (!provider) return;

      const contract = new Contract(contractAddress, contractABI, provider);
      const supply = await contract.totalSupply();
      setTotalSupply(Number(supply));
    } catch (error) {
      console.error("Error fetching supply:", error);
    }
  }, [contractAddress, contractABI]);

  const fetchMintPrice = useCallback(async () => {
    try {
      const provider = createProvider();
      if (!provider) return;

      const contract = new Contract(contractAddress, contractABI, provider);
      const priceWei = await contract.mintPrice();
      const priceHype = formatUnits(priceWei, 18);

      const currentSupply = await contract.totalSupply();
      const freeMintLimit = 222;

      if (Number(currentSupply) < freeMintLimit) {
        setPrice("FREE MINT");
      } else {
        setPrice(priceHype);
      }
    } catch (error) {
      console.error("Error fetching mint price:", error);
      setPrice("FREE MINT");
    }
  }, [contractAddress, contractABI]);

  const fetchMintsByWallet = useCallback(async () => {
    try {
      const provider = createProvider();
      if (!provider || !account) return;

      const contract = new Contract(contractAddress, contractABI, provider);
      const mints = await contract.mintsPerWallet(account);
      setMintsByWallet(Number(mints));
    } catch (error) {
      console.error("Error fetching wallet mints:", error);
    }
  }, [account, contractAddress, contractABI]);

  const calculateTotalPrice = () => {
    if (totalSupply < 222) {
      return "FREE MINT";
    } else {
      return (parseFloat(price) * mintQuantity).toFixed(2) + " HYPE";
    }
  };

  const totalPrice = calculateTotalPrice();

  useEffect(() => {
    const fetchData = async () => {
      if (account) {
        try {
          const provider = createProvider();
          if (!provider) return;

          const balanceWei = await provider.getBalance(account);
          const balanceHype = formatUnits(balanceWei, 18);
          setBalance(parseFloat(balanceHype).toFixed(2));

          await fetchTotalSupply();
          await fetchMintPrice();
          await fetchMintsByWallet();
          await checkOwnership();
          await checkMintingStatus();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        await fetchTotalSupply();
        await fetchMintPrice();
        await checkMintingStatus();
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [account, fetchTotalSupply, fetchMintPrice, fetchMintsByWallet, checkOwnership, checkMintingStatus]);

  const incrementQuantity = () => {
    if (mintQuantity < 3) {
      setMintQuantity(mintQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (mintQuantity > 0) {
      setMintQuantity(mintQuantity - 1);
    }
  };

  return (
    <div className="App" style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      {/* Video Background Container */}
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        <video
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(10px)",
            zIndex: -2,
          }}
        >
          <source src={`${process.env.PUBLIC_URL}/moneyprinter.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div
          style={{
            position: "absolute",
            top: "13.5%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            height: "73.5%",
            overflow: "hidden",
            display: "flex",
            filter: "blur(3px)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: -1,
          }}
        >
          <video
            autoPlay
            loop
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          >
            <source src={`${process.env.PUBLIC_URL}/moneyprinter.mp4`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            width: "80%",
            height: "80%",
            background: "transparent",
            zIndex: 0,
          }}
        />
      </div>

      <div className="nft-scroll-wrapper">
        <NFTScrollBand />
      </div>

      <NFTPreview quantity={mintQuantity} />

      {account ? (
        <div className="wallet-container">
          {balance} HYPE | {`${account.slice(0, 6)}...${account.slice(-4)}`}
        </div>
      ) : (
        <div className="wallet-container">
          <button
            onClick={connectWallet}
            style={{
              color: "black",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              width: "100%",
            }}
          >
            Connect Wallet
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
          gap: "10px",
          position: "absolute",
          top: "150px",
          width: "100%",
        }}
      >
        <h1
          style={{
            color: "#FFFFFF",
            WebkitTextStroke: "2px #000000",
            MozTextStroke: "2px #000000",
            textStroke: "2px #000000",
            fontSize: "55px",
            marginTop: -60,
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
            padding: "10px 20px",
            borderRadius: "5px",
          }}
        >
          ALMOST HYPER INSCRIBED LIQUID GOOSE
        </h1>
      </div>

      {account && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "absolute",
            top: "73%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            zIndex: 102,
          }}
        >
          {/* Minting Status */}
          <div
            style={{
              color: "#FFFFFF",
              fontSize: "18px",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Minting is currently:{" "}
            <span style={{ color: isMintingEnabled ? "#00FF00" : "#FF0000" }}>
              {isMintingEnabled ? "ENABLED" : "DISABLED"}
            </span>
          </div>

          {/* Owner Controls */}
          {isOwner && (
            <button
            onClick={() => toggleMinting(!isMintingEnabled)}
            style={{
            position: "fixed", // Makes it stick to the screen
            top: "50%", // Vertically centered
            right: "20px", // On the right side (change to "left: '20px'" for left)
            width: "50px", // Square size
            height: "50px", // Square size
            background: isMintingEnabled ? "#FF4444" : "#44FF44", // Red when enabled, green when disabled
            color: "#000",
            padding: "0", // Remove padding to fit square shape
            border: "2px solid #fff", // Match your app’s border style
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex", // Center the text/icon
            alignItems: "center",
            justifyContent: "center",
            zIndex: 103, // Above other elements
            }}
            title={isMintingEnabled ? "Disable Minting" : "Enable Minting"} // Tooltip
            >
            {isMintingEnabled ? "D" : "E"} {/* Shortened for square */}
            </button>
            )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "100px",
            }}
          >
            <button
              onClick={mint}
              style={{
                background: "#ec7700",
                color: "#000",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px 0 0 5px",
                cursor: isMintingEnabled && mintQuantity > 0 ? "pointer" : "not-allowed",
                fontSize: "18px",
                fontWeight: "bold",
                opacity: isMintingEnabled && mintQuantity > 0 ? 1 : 0.5,
              }}
              disabled={!isMintingEnabled || mintQuantity === 0}
            >
              {isMintingEnabled ? `Mint ${mintQuantity} NFT${mintQuantity !== 1 ? "s" : ""}` : "Minting Disabled"}
            </button>
            <button
              onClick={decrementQuantity}
              style={{
                background: "#333",
                color: "#ec7700",
                padding: "10px 15px",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              −
            </button>
            <button
              onClick={incrementQuantity}
              style={{
                background: "#333",
                color: "#ec7700",
                padding: "10px 15px",
                border: "none",
                borderRadius: "0 5px 5px 0",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              +
            </button>
          </div>
          <p style={{ color: "#000000", marginTop: "10px", textAlign: "center" }}>
            Total: {totalPrice}
          </p>

          {txHash && (
            <p
              style={{
                position: "fixed",
                bottom: "200px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "#FFFFFF",
                textAlign: "center",
                zIndex: 103,
                background: "rgba(0, 0, 0, 0.5)",
                padding: "5px 10px",
                borderRadius: "5px",
              }}
            >
              Transaction:{" "}
              <a
                href={`https://purrsec.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0000EE" }}
              >
                {txHash}
              </a>
            </p>
          )}
        </div>
      )}

      <div
        style={{
          position: "fixed",
          bottom: "120px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg, #1a1a1a, #2d2d2d)",
          padding: "15px 25px",
          borderRadius: "15px",
          border: "2px solid #FFFFFF",
          boxShadow: "0 4px 12px rgba(0, 255, 0, 0.2)",
          color: "#FFFFFF",
          fontFamily: "'Courier New', monospace",
          textAlign: "center",
          zIndex: 102,
          minWidth: "320px",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            background: "rgba(0, 0, 0, 0.5)",
            padding: "5px 10px",
            borderRadius: "8px",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "10px",
          }}
        >
          <span>{totalSupply}/{maxSupply} minted</span>
          <span>
            {totalSupply < 222 ? (
              <span style={{ color: "#ec7700" }}>222 Free mint</span>
            ) : (
              <span style={{ color: "#ec7700" }}>0 Free mint</span>
            )}
          </span>
        </div>
        <div
          style={{
            fontSize: "18px",
            background: "rgba(0, 0, 0, 0.5)",
            padding: "5px 10px",
            borderRadius: "8px",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "right",
            minHeight: "10px",
          }}
        >
          <span>Price: {price}</span>
          <span>
            {price === "FREE MINT" ? "" : <span style={{ color: "#ec7700" }}>0.22 HYPE Per mint</span>}
          </span>
        </div>
        <div
          style={{
            fontSize: "16px",
            background: "rgba(0, 0, 0, 0.5)",
            padding: "5px 10px",
            borderRadius: "8px",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "10px",
          }}
        >
          <a
            href={`https://purrsec.com/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#00ccff",
              textDecoration: "underline",
              fontWeight: "bold",
              transition: "color 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.color = "#00ffcc")}
            onMouseOut={(e) => (e.target.style.color = "#00ccff")}
          >
            {contractAddress && `${contractAddress.slice(0, 10)}...${contractAddress.slice(-8)}`}
          </a>
          <span style={{ color: "#ffcc00" }}>3 Mint max per wallet</span>
        </div>
      </div>
      <BottomNewsBand />
      <BottomNewsTicker />
      <MintLimitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AudioPlayer
        audioSrc={`${process.env.PUBLIC_URL}/1.mp3`}
        trackName="JuL - Alors la zone (Version Skyrock)"
        ref={audioPlayerRef}
        shouldPlay={shouldPlay}
        startTime={25}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 103,
        }}
      />
    </div>
  );
}

export default App;