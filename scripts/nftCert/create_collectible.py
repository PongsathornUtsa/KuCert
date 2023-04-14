from brownie import nftCert
from scripts.nftCert.helpful_scripts import get_account


def main():
    account = get_account()
    nft = nftCert[-1]
    creation_transaction = nft.createCollectible({"from": account})
    creation_transaction.wait(1)
    print("Collectible created :{nft}")
