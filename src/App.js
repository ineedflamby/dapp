import { useState, useEffect, useRef } from "react";
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
    { text: "- 2222 AlmostHyperInscribedLiquidGoose -", color: "#ff4444" },
    { text: "- 22 UNIQUE 1/1 -", color: "#00ff00" },
    { text: "- AlmostHyperInscribedLiquidGoose -", color: "#00ccff" },
    { text: "- Make your family proud, buy Bitcoin -", color: "#00ccff" },
    { text: "- As I walk through the valley of the shadow of death I take a look at my life and realize there's nothin' left -", color: "#00ccff" },
    { text: "- NSM UN LEZARD TRIANGULAIRE -", color: "#00ccff" },
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
          textAlign: "center",
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
  const audioPlayerRef = useRef();

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
 const contractABI =  [
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
    }
  ];
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

  const fetchTotalSupply = async () => {
    try {
      const provider = createProvider();
      if (!provider) return;

      const contract = new Contract(contractAddress, contractABI, provider);
      const supply = await contract.totalSupply();
      setTotalSupply(Number(supply));
    } catch (error) {
      console.error("Error fetching supply:", error);
    }
  };

  const fetchMintPrice = async () => {
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
  };

  const fetchMintsByWallet = async () => {
    try {
      const provider = createProvider();
      if (!provider || !account) return;

      const contract = new Contract(contractAddress, contractABI, provider);
      const mints = await contract.mintsPerWallet(account);
      setMintsByWallet(Number(mints));
    } catch (error) {
      console.error("Error fetching wallet mints:", error);
    }
  };

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

          fetchTotalSupply();
          fetchMintPrice();
          fetchMintsByWallet();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        fetchTotalSupply();
        fetchMintPrice();
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [account]);

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
    <div className="App" style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src={`${process.env.PUBLIC_URL}/moneyprinter.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="nft-scroll-wrapper">
        <NFTScrollBand />
      </div>

      <NFTPreview quantity={mintQuantity} />

      {account ? (
        <div
          style={{
            position: "absolute",
            top: "140px",
            right: "0px",
            background: "#222",
            padding: "8px 12px",
            borderRadius: "0px",
            borderBottomLeftRadius: "10px",
            border: "1px solid #f000",
            color: "#FFFFFF",
            fontSize: "18px",
            fontFamily: "monospace",
            zIndex: 101,
          }}
        >
          {balance} HYPE | {`${account.slice(0, 6)}...${account.slice(-4)}`}
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            top: "140px",
            right: "0px",
            height: "34px",
            width: "200px",
          }}
        >
          <button
            onClick={connectWallet}
            style={{
              background: "#FFFFFF",
              color: "#000",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
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
          marginTop: "80px",
          gap: "10px",
        }}
      >
        <h1
          style={{
            color: "#F00000",
            fontSize: "36px",
            marginTop: "-80px",
          }}
        >
          ALMOST HYPER INSCRIBED LIQUID GOOSE
        </h1>
      </div>

      {account && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "0px",
              marginTop: "350px",
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
            <p style={{ color: "#000000", marginTop: "-135px", textAlign: "center" }}>
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
          <span>{totalSupply}/2222 minted</span>
          <span>
            {totalSupply < 222 ? (
              <span style={{ color: "#00ff00" }}>222 Free mint</span>
            ) : (
              <span style={{ color: "#ff4444" }}>0 Free mint</span>
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
            alignItems: "center",
            minHeight: "10px",
          }}
        >
          <span>Price: {price}</span>
          <span>
            {price === "FREE MINT" ? "" : <span style={{ color: "#ffcc00" }}>0.22 HYPE Per mint</span>}
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
      <AudioPlayer audioSrc={`${process.env.PUBLIC_URL}/1.mp3`} trackName="JuL - Alors la zone (Version Skyrock)" />
    </div>
  );
}

export default App;



  