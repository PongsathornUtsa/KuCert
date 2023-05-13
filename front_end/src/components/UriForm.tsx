import { useState, useEffect } from "react";
import {
  useProvider,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useWaitForTransaction,
} from "wagmi";
import ContractInterface from "../../abiFile.json";
import { ChangeEvent } from 'react';

const MintForm = () => {
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  const provider = useProvider();

  const [mintTokenURI, setMintTokenURI] = useState("");
  const [totalMinted, setTotalMinted] = useState(0);

  const { data: tokenCounter } = useContractRead({
    abi: ContractInterface,
    address: CONTRACT_ADDRESS,
    functionName: "tokenCounter",
    watch: true,
    onError(error) {
      console.log('Please connect to wallet')
    },
  });

  useEffect(() => {
    if (tokenCounter) {
      setTotalMinted(Number(tokenCounter));
      setTokenId(tokenCounter.toString()); // Update tokenId state when tokenCounter changes
    }
  }, [tokenCounter]);

  const { config: contractWriteConfig } = usePrepareContractWrite({
    abi: ContractInterface,
    address: CONTRACT_ADDRESS,
    functionName: "mint",
    args: [mintTokenURI],
    enabled: mintTokenURI.length > 0,
    onError(error) {
      console.log('Error mint')
    },
  });

  const { data: mintData, error, isError, write } = useContractWrite(contractWriteConfig);

  const { isSuccess: txSuccess } = useWaitForTransaction({ hash: mintData?.hash });

  const [etherscanUrl, setEtherscanUrl] = useState("");
  const [openSeaUrl, setOpenSeaUrl] = useState("");

  useEffect(() => {
    const displayEtherscanLink = async () => {
      if (txSuccess) {
        const network = await provider.getNetwork();
        let etherscanUrl = "";
        let openSeaUrl = "";

        switch (network.chainId) {
          case 1: // Mainnet
            etherscanUrl = `https://etherscan.io/tx/${mintData?.hash}`;
            openSeaUrl = `https://opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`;
            break;
          case 5: // Goerli
            etherscanUrl = `https://goerli.etherscan.io/tx/${mintData?.hash}`;
            openSeaUrl = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`;
            break;
          case 11155111: // Sepolia
            etherscanUrl = `https://sepolia.etherscan.io/tx/${mintData?.hash}`;
            openSeaUrl = "OpenSea link not available";
            break;
          default:
            etherscanUrl = "Etherscan link not available";
            openSeaUrl = "OpenSea link not available";
        }

        setEtherscanUrl(etherscanUrl);
        setOpenSeaUrl(openSeaUrl);
      }
    };

    displayEtherscanLink();
  }, [txSuccess, mintData, provider]);

  const [tokenId, setTokenId] = useState("");

  const { data: returnedURI } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ContractInterface,
    functionName: "tokenURI",
    args: tokenId ? [parseInt(tokenId, 10)] : undefined, // Pass undefined if tokenId is not set
    onError: (error) => {
      if (error.message.includes("ERC721URIStorage: URI query for nonexistent token")) {
        setDisplayedTokenURI("");
        console.log("Token URI not found or not set");
      }
    },
    enabled: false,/*!!(tokenid)*/
  });

  const handleTokenIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTokenId(e.target.value);
  };

  const [displayedTokenURI, setDisplayedTokenURI] = useState("");

  const handleSearchTokenURI = () => {
    if (tokenId && parseInt(tokenId, 10) > totalMinted - 1) {
      alert("Token ID is not in the range of the token counter");
      setDisplayedTokenURI("");
    } else if (returnedURI && typeof returnedURI === "string") {
      setDisplayedTokenURI(returnedURI);
      console.log(`Token URI for token ID ${tokenId}: ${returnedURI}`);
    } else {
      setDisplayedTokenURI("");
      console.log("Token URI not found or not set");
    }
  };

  const { data: universityRole } = useContractRead({
    abi: ContractInterface,
    address: CONTRACT_ADDRESS,
    functionName: "UNIVERSITY_ROLE",
    onError(error) {
      console.log('Error role Please connect to walltet')
    },
  });

  const [selectedRole, setSelectedRole] = useState(universityRole);
  const [selectedAccount, setSelectedAccount] = useState("");

  const { config: grantRoleConfig } = usePrepareContractWrite({
    abi: ContractInterface,
    address: CONTRACT_ADDRESS,
    functionName: "grantRole",
    args: [selectedRole, selectedAccount],
    enabled: !!(selectedRole && selectedAccount), // Enable when both selectedRole and selectedAccount are set
  });

  // Write to the contract using the grantRole hook
  const { write: grantRoleWrite } = useContractWrite(grantRoleConfig);

  const handleChangeRole = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleChangeAccount = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedAccount(e.target.value);
  };

  const handleGrantRole = async () => {
    console.log("Selected role:", selectedRole);
    console.log("Selected account:", selectedAccount);
    console.log("grantRoleWrite:", grantRoleWrite);
    if (selectedRole && selectedAccount) {
      try {
        await grantRoleWrite?.();
        console.log(`Granted role ${selectedRole} to ${selectedAccount}`);
      } catch (error) {
        console.error("Error granting role:", error);
      }
    } else {
      console.log("Invalid role or account address.");
    }
  };

  const handleRevokeRole = async () => {
    if (selectedRole && selectedAccount) {
      try {
        await revokeRoleWrite?.();
        console.log(`Revoked role ${selectedRole} from ${selectedAccount}`);
      } catch (error) {
        console.error("Error revoking role:", error);
      }
    } else {
      console.log("Invalid role or account address.");
    }
  };

  const { config: revokeRoleConfig } = usePrepareContractWrite({
    abi: ContractInterface,
    address: CONTRACT_ADDRESS,
    functionName: "revokeRole",
    args: [selectedRole, selectedAccount],
    enabled: !!(selectedRole && selectedAccount), // Enable when both selectedRole and selectedAccount are set
  });

  const { write: revokeRoleWrite } = useContractWrite(revokeRoleConfig);

  return (
    <div>
      <form className="form" onSubmit={(e) => { e.preventDefault() }}>
        <h2>Enter Token URI and Mint NFT</h2>
        <div>Total number of tokens minted: {totalMinted - 1}</div>
        <input
          className="form-input"
          placeholder="Enter token URI"
          value={mintTokenURI}
          onChange={(e) => setMintTokenURI(e.target.value)}
          style={{ marginTop: "0.5rem" }}
        />
        <button className="btn btn-block" type="submit" disabled={!write} onClick={() => write?.()}>
          Mint
        </button>

        {isError && <div>Error: {error?.message}</div>}

        {txSuccess && (
        <div style={{ marginTop: "1rem" }}>
          Successfully minted your NFT!
          <div>
            <a href={etherscanUrl} target="_blank" rel="noopener noreferrer">
              View on Etherscan
            </a>
          </div>
          <div>
            <a href={openSeaUrl} target="_blank" rel="noopener noreferrer">
              View on OpenSea
            </a>
          </div>
        </div>
      )}

        <input
          className="form-input"
          placeholder="Enter token ID"
          onChange={handleTokenIdChange}
          style={{ marginTop: "0.5rem" }}
        />

        <button className="btn btn-block" type="button" onClick={handleSearchTokenURI}>
          Search TokenURI
        </button>
        {displayedTokenURI && (
          <div style={{ marginTop: "1rem" }}>
            Token URI : {displayedTokenURI}
          </div>)}
      </form>

      <form className="form" onSubmit={(e) => { e.preventDefault() }}>
        <h2>Manage Roles</h2>
        <input
          className="form-input"
          placeholder="Enter role"
          value={selectedRole as string}
          onChange={handleChangeRole}
          style={{ marginTop: "0.5rem" }}
        />
        <input
          className="form-input"
          placeholder="Enter account address"
          value={selectedAccount}
          onChange={handleChangeAccount}
          style={{ marginTop: "0.5rem" }}
        />
        <button className="btn btn-block" type="submit" disabled={!grantRoleWrite} onClick={handleGrantRole}>
          Grant Role
        </button>
        <button className="btn btn-block" type="submit" disabled={!revokeRoleWrite} onClick={handleRevokeRole}>
          Revoke Role
        </button>
      </form>

    </div>
  );
};

export default MintForm;
