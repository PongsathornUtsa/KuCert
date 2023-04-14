import pytest
from eth_account import Account
from brownie import web3
from eth_account import Account
from eth_account.messages import encode_defunct
from brownie import accounts, nftCert, network
import os
from eth_keys import keys

def test_create_collectible():
    # Deploy the contract and assign the University role
    contract = nftCert.deploy({'from': accounts[0]})
    contract.grantRole(contract.UNIVERSITY_ROLE(), accounts[1], {'from': accounts[0]})

    # Create a new collectible as the University
    tx = contract.createCollectible({'from': accounts[1]})
    assert tx.return_value == 0

def test_set_token_uri():
    contract = nftCert.deploy({'from': accounts[0]})
    tx = contract.grantRole(contract.UNIVERSITY_ROLE(), accounts[1], {'from': accounts[0]})
    tx.wait(1)
    tx1 = contract.createCollectible({'from': accounts[1]})
    tx1.wait(1)
    token_id = 0
    token_uri = "https://example.com/nft/0"

    # Set the token URI as the University
    tx2 = contract.setTokenURI(token_id, token_uri, {'from': accounts[1]})
    tx2.wait(1)
    assert contract.tokenURI(token_id) == token_uri

def test_university_transfer():
    contract = nftCert.deploy({'from': accounts[0]})
    contract.grantRole(contract.UNIVERSITY_ROLE(), accounts[1], {'from': accounts[0]})
    contract.createCollectible({'from': accounts[1]})

    token_id = 0

    # Transfer the NFT from accounts[1] to accounts[2] as the University
    contract.safeTransferFrom(accounts[1], accounts[2], token_id, "0x", {'from': accounts[1]})
    assert contract.ownerOf(token_id) == accounts[2]


def test_verify_certificate_signature():
    contract = nftCert.deploy({'from': accounts[0]})
    tx = contract.grantRole(contract.UNIVERSITY_ROLE(), accounts[1], {'from': accounts[0]})
    tx.wait(1)
    tx1 = contract.createCollectible({'from': accounts[1]})
    tx1.wait(1)
    token_id = 0
    token_uri = "https://example.com/nft/0"

    # Set the token URI as the University
    tx2 = contract.setTokenURI(token_id, token_uri, {'from': accounts[1]})
    tx2.wait(1)

    # Generate a new private key
    private_key_bytes = os.urandom(32)
    private_key = keys.PrivateKey(private_key_bytes)

    # Create the corresponding signing account
    signing_account = Account.from_key(private_key.to_hex())
    signer = signing_account.address

    # Generate the message to be signed
    message = token_id.to_bytes(32, "big") + token_uri.encode()
    message_hash = web3.keccak(message)
    eth_signed_message = encode_defunct(message_hash)

    # Sign the message using the dedicated private key
    signature = signing_account.sign_message(eth_signed_message)

    # Set the certificate signature
    contract.setCertificateSignature(token_id, signature.signature, {'from': accounts[1]})

    # Verify the certificate signature
    is_valid = contract.verifyCertificateSignature(token_id, signature.signature, signer)
    assert is_valid == True



