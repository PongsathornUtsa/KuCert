import pytest
from brownie import accounts, nftCert
import warnings

def test_roles():
    contract = nftCert.deploy({'from': accounts[0]})
    assert contract.hasRole(contract.ADMIN_ROLE(), accounts[0])
    assert contract.hasRole(contract.UNIVERSITY_ROLE(), accounts[0])
    contract.grantRole(contract.UNIVERSITY_ROLE(), accounts[1], {'from': accounts[0]})
    assert contract.hasRole(contract.UNIVERSITY_ROLE(), accounts[1])
    contract.revokeRole(contract.UNIVERSITY_ROLE(), accounts[1], {'from': accounts[0]})
    assert not contract.hasRole(contract.UNIVERSITY_ROLE(), accounts[1])

def test_mint_and_transfer():
    contract = nftCert.deploy({'from': accounts[0]})
    contract.grantRole(contract.UNIVERSITY_ROLE(), accounts[1], {'from': accounts[0]})
    token_uri = "https://example.com/nft/0"
    mint_tx = contract.mint(token_uri, {'from': accounts[1]})
    tokenId = mint_tx.events['CollectibleMinted']['tokenId']
    assert contract.tokenURI(tokenId) == token_uri