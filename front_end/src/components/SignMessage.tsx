import { useState, useEffect, useRef } from "react";
import { useSignMessage } from 'wagmi';
import { verifyMessage } from 'ethers/lib/utils';
import {
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
} from "wagmi";
import ContractInterface from "../../abiFile.json";

const SignMessage = () => {
  const recoveredAddress = useRef<string>();
  const [tokenId, setTokenId] = useState("");
  const [signature, setSignature] = useState("");
  const [retrieveTokenId, setRetrieveTokenId] = useState("");

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

  const { data, error, isLoading, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      // Verify signature when sign message succeeds
      const address = verifyMessage(variables.message, data);
      recoveredAddress.current = address;
    },
  });

  const { config: setSignatureConfig } = usePrepareContractWrite({
    abi: ContractInterface,
    address: CONTRACT_ADDRESS,
    functionName: "setCertificateSignature",
    args: [parseInt(tokenId, 10), signature],
    enabled: !!(tokenId && signature),
    onError(error) {
      console.log('Error set signature')
    },
  });


  const { write: setSignatureWrite } = useContractWrite(setSignatureConfig);

  // Use useContractRead to get the signature for a token ID
  const { data: retrievedSignature } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ContractInterface,
    functionName: "getCertificateSignature",
    args: retrieveTokenId ? [parseInt(retrieveTokenId, 10)] : undefined,
    enabled: !!retrieveTokenId,
    onError(error) {
      console.log('Error retrived')
    },
  });

  useEffect(() => {
    if (retrievedSignature) {
      console.log(`Signature for token ID ${tokenId}: ${retrievedSignature}`);
    }
  }, [retrievedSignature, tokenId]);


  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Token ID:", parseInt(tokenId, 10));
    console.log("Signature:", signature);
    await setSignatureWrite?.();
  };

  const [displayedSignature, setDisplayedSignature] = useState("");

  useEffect(() => {
    if (retrievedSignature) {
      console.log(`Signature for token ID ${retrieveTokenId}: ${retrievedSignature}`);
      setDisplayedSignature(retrievedSignature as string);
    }
  }, [retrievedSignature, retrieveTokenId]);

  return (
    <div>
      <form className='form'
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target as HTMLFormElement)
          const message = formData.get('message') as string
          signMessage({ message })
        }}
      >
        <h2>Enter a message to sign</h2>
        <textarea className='form-textarea' id="message" name="message" placeholder="metadata..." />
        <button className='btn btn-block' disabled={isLoading}>
          {isLoading ? 'Check Wallet' : 'Sign Message'}
        </button>

        {data && (
          <div>
            <div><h3>Recovered Address: </h3>{recoveredAddress.current}</div>
            <div><h3>Signature: </h3>{data}</div>
          </div>
        )}

        {error && <div>{error.message}</div>}
      </form>

      <form className="form" onSubmit={handleFormSubmit}>
        <h2>Set Signature for specific Token ID</h2>
        <input
          className="form-input"
          placeholder="Enter token ID"
          name="tokenId"
          style={{ marginTop: "0.5rem" }}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Enter signature"
          name="signature"
          style={{ marginTop: "0.5rem" }}
          onChange={(e) => setSignature(e.target.value)}
        />
        <button
          className="btn btn-block"
          type="submit"
        >
          Save Signature
        </button>
      </form>

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.target as HTMLFormElement);
          const tokenIdInput = formData.get("tokenId") as string;
          setRetrieveTokenId(tokenIdInput);
        }}
      >
        <h2>Retrieve Signature for Token ID</h2>
        <input
          className="form-input"
          placeholder="Enter token ID"
          name="tokenId"
          style={{ marginTop: "0.5rem" }}
        />
        <button
          className="btn btn-block"
          type="submit"
        >
          Retrieve Signature
        </button>
        {displayedSignature && (
          <div>
            <h3>Signature for token ID {retrieveTokenId}:</h3>
            <p>{displayedSignature}</p>
          </div>
        )}
      </form>

    </div>
  );
}

export default SignMessage;

