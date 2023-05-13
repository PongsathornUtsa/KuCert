import React, { useState, useEffect, ChangeEvent } from 'react'
import { usePrepareContractWrite, useContractWrite, useContractRead } from 'wagmi'
import ContractInterface from '../../abiFile.json'

const Transfer = () => {
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS

  const [fromAddress, setFromAddress] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [checkTokenId, setCheckTokenId] = useState<number | null>(null)
  const [owner, setOwner] = useState('')
  const [displayOwner, setDisplayOwner] = useState(false)
  const [prepareTransfer, setPrepareTransfer] = useState(false);

  const { config } = usePrepareContractWrite({
    abi: ContractInterface,
    address: CONTRACT_ADDRESS,
    functionName: 'safeTransferFrom(address,address,uint256)',
    args: [fromAddress, toAddress, tokenId],
    enabled: prepareTransfer,
    onError(error) {
      console.log(`transfer: ${error}`)
    },
  })
  
  const { write, isLoading } = useContractWrite(config)
  
  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId || parseInt(tokenId, 10) > totalMinted - 1) {
      alert('Please enter a valid tokenId');
      setDisplayOwner(false);
      return;
    }
    setPrepareTransfer(true);
    write?.()
  }
  
  useEffect(() => {
    if (!isLoading) {
      setPrepareTransfer(false);
    }
  }, [isLoading]);

  const [prepareOwnerRead, setPrepareOwnerRead] = useState(false);

  const { data: returnedOwner } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ContractInterface,
    functionName: 'ownerOf',
    args: checkTokenId !== null ? [checkTokenId] : [],
    onError: (error) => {
      console.log(`Owner read error: ${error}`);
      setDisplayOwner(false);
    },
    enabled: prepareOwnerRead,
  });

  const checkOwnerHandler = () => {
    if (checkTokenId !== null && checkTokenId > totalMinted - 1) {
      alert('TokenId exceeds total minted tokens');
      setCheckTokenId(null);
      setDisplayOwner(false);
    } else {
      setOwner(returnedOwner as string);
      setDisplayOwner(true);
      setPrepareOwnerRead(true);
    }
  }

  useEffect(() => {
    setOwner('');
    setDisplayOwner(false);
  }, [checkTokenId])

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
    }
  }, [tokenCounter]);

  return (
    <div>
      <form className="form" onSubmit={onSubmitHandler}>
        <h2>Transfer to student address</h2>
        <label className="form-label">Check owner:</label>
        <input
          className="form-input"
          placeholder="Enter token ID"
          value={checkTokenId || ''}
          onChange={e => setCheckTokenId(Number(e.target.value))}
          style={{ marginTop: "0.5rem" }}
        />
        <button className="btn btn-block" type="button" onClick={checkOwnerHandler}>
          Check Owner
        </button>
        {displayOwner && <p style={{ marginTop: "0.5rem" }}>Owner: {owner}</p>}
        <label className="form-label" style={{ marginTop: "0.5rem" }}>Transfer to student address:</label>
        <input
          className="form-input"
          placeholder="Enter from account address"
          value={fromAddress}
          onChange={e => setFromAddress(e.target.value)}
          style={{ marginTop: "0.5rem" }}
        />
        <input
          className="form-input"
          placeholder="Enter to account address"
          value={toAddress}
          onChange={e => setToAddress(e.target.value)}
          style={{ marginTop: "0.5rem" }}
        />
        <input
          className="form-input"
          placeholder="Enter tokenId"
          value={tokenId}
          onChange={e => setTokenId(e.target.value)}
          style={{ marginTop: "0.5rem" }}
        />
        <button className="btn btn-block" type="submit" style={{ marginTop: "0.5rem" }}>
          {isLoading ? 'Transferring...' : 'Transfer'}
        </button>
      </form>
    </div>
  )
}

export default Transfer

