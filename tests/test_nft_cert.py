import pytest
from eth_account import Account
from brownie import web3
from eth_account import Account
from eth_account.messages import encode_defunct
from brownie import accounts, nftCert, network
import os
from eth_keys import keys

def test_mint_with_token_uri():
    contract = nftCert.deploy({'from': accounts[0]})
    contract.grantRole(contract.UNIVERSITY_ROLE(), accounts[1], {'from': accounts[0]})
    token_uri = "https://example.com/nft/0"

    # Create a new collectible and set its URI as the University
    tx = contract.mintWithTokenURI(token_uri, {'from': accounts[1]})
    assert tx.return_value == 0
    assert contract.tokenURI(0) == token_uri

def test_university_transfer():
    contract = nftCert.deploy({'from': accounts[0]})
    contract.grantRole(contract.UNIVERSITY_ROLE(), accounts[1], {'from': accounts[0]})
    token_uri = "https://example.com/nft/0"
    contract.mintWithTokenURI(token_uri, {'from': accounts[1]})

    token_id = 0

    # Transfer the NFT from accounts[1] to accounts[2] as the University
    contract.safeTransferFrom(accounts[1], accounts[2], token_id, "0x", {'from': accounts[1]})
    assert contract.ownerOf(token_id) == accounts[2]



