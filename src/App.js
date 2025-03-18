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
    { text: "- 22 UNIQUE 1/1 -", color: "#00e0ff" },
    { text: "- AlmostHyperInscribedLiquidGoose -", color: "#00bcff" },
    { text: "- Make your family proud, buy Bitcoin -", color: "#0021ff" },
    { text: "- As I walk through the valley of the shadow of death I take a look at my life and realize there's nothin' left -", color: "#8300ff" },
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
  const audioPlayerRef = useRef(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const contractABI = useMemo(() =>  [
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
          "name": "wallet",
          "type": "address"
        }
      ],
      "name": "resetMintCount",
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
      "inputs": [],
      "name": "saleIsActive",
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
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "setMintPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "status",
          "type": "bool"
        }
      ],
      "name": "setSaleActive",
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
    }, 

  ], []);

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

const createProvider = () => {
  if (!window.ethereum) return null;

  const provider = new BrowserProvider(window.ethereum, {
    chainId: 998,
    name: "Hyperliquid Testnet",
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
        audioPlayerRef.current.playAudio(); // Use the exposed method name
      }, 100);
    }

    if (!rpcUrl || !rpcUrl.startsWith("https://")) {
      throw new Error("Invalid RPC URL. Please check your environment configuration.");
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x3E6",
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
    const mintLimitPerWallet = await contract.MINT_LIMIT_PER_WALLET();

    if (mintsByWallet + mintQuantity > Number(mintLimitPerWallet)) {
      alert("Goosy greedy goose, you allready minted your quotas");
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
    if (error.message.includes("Exceeds wallet mint limit")) {
      alert("You've reached the mint limit of 3 NFTs per wallet!");
    } else {
      alert("Minting failed: " + error.message);
    }
  }
};

// Memoized functions with useCallback
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
}, [contractAddress, contractABI]); // Dependencies

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
}, [contractAddress, contractABI]); // Dependencies

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
}, [account, contractAddress, contractABI]); // Dependencies

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
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        await fetchTotalSupply();
        await fetchMintPrice();
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [account, fetchTotalSupply, fetchMintPrice, fetchMintsByWallet]);

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
        {/* Blurred Background Video (full screen) */}
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

        {/* Central Video (80% width) */}
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
            filter:"blur(3px)",
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

        {/* Overlay to hide blurred video in the center */}
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

      {/* NFT Scroll Band */}
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
            
              color: 'black',
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
          marginTop: "20px", // Reduced from 80px to bring it closer to the top
          gap: "10px",
          position: "absolute",
          top: "150px", // Position it below the NFT scroll band
          width: "100%",
        }}
      >
         <h1
            style={{
              color: "#FFFFFF",
              WebkitTextStroke: "2px #000000", // Red stroke
              MozTextStroke: "2px #000000", // Mozilla prefix
              textStroke: "2px #000000", // Standard (less supported)
              fontSize: "55px",
              marginTop: -60, // Adjusted negative margin
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)", // Optional shadow for depth

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
            top: "73%", // Center vertically
            left: "50%",
            transform: "translate(-50%, -50%)", // Center both horizontally and vertically
            width: "100%",
            zIndex: 102,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "60px", // Reduced margin
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
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                opacity: mintQuantity > 0 ? 1 : 0.5,
              }}
              disabled={mintQuantity === 0}
            >
              Mint {mintQuantity} NFT{mintQuantity !== 1 ? "s" : ""}
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
            <p style={{ color: "#000000", marginTop: "10px", textAlign: "center" }}>
              Transaction:{" "}
              <a
                href={`https://testnet.purrsec.com/tx/${txHash}`}
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
            href={`https://testnet.purrsec.com/address/${contractAddress}`}
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