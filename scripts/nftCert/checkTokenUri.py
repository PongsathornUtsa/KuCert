from brownie import network, nftCert

def main():
    print(f"Working on {network.show_active()}")
    nft = nftCert[-1]
    number_of_collectibles = nft.tokenCounter()
    print(f"You have {number_of_collectibles} tokenIds")
    
    # Replace `token_id` with the ID of your token
    token_id = 0
    token_uri = nft.tokenURI(token_id)
    
    print(f"The tokenURI for token ID {token_id} is {token_uri}")
