from brownie import network, nftCert
from scripts.nftCert.helpful_scripts import OPENSEA_URL, get_account
import pandas as pd


def main():
    print(f"Working on {network.show_active()}")
    nft = nftCert[-1]
    number_of_collectibles = nft.tokenCounter()
    print(f"You have {number_of_collectibles} tokenIds")
    
    # Read token URIs from CSV
    df = pd.read_csv("Data/metadata/token_uri.csv")
    
    for index, row in df.iterrows():
        token_id = row["token_id"]
        token_uri = row["token_uri"]
        
        #if not nft.tokenURI(token_id).startswith("https://"):
        print(f"Setting tokenURI of {token_id}")
        set_tokenURI(token_id, nft, token_uri)


def set_tokenURI(token_id, nft_contract, tokenURI):
    account = get_account()
    tx = nft_contract.setTokenURI(token_id, tokenURI, {"from": account})
    tx.wait(1)
    print(
        f"Awesome! You can view your NFT at {OPENSEA_URL.format(nft_contract.address, token_id)}"
    )
    print("Please wait up to 20 minutes, and hit the refresh metadata button")
