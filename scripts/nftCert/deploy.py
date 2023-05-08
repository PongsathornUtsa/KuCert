from scripts.nftCert.helpful_scripts import get_account, OPENSEA_URL
from brownie import nftCert, network, config, web3
import yaml, json
import os ,shutil

def get_abi(contract):
    contract_data = contract._build
    return contract_data["abi"]

def save_abi_to_file(contract, file_name):
    abi = get_abi(contract)
    with open(file_name, 'w') as outfile:
        json.dump(abi, outfile, indent=2)

def deploy():
    account = get_account()
    deploy_gas_estimate = nftCert.deploy.estimate_gas({"from": account})
    print("Account balance:", account.balance()/ 1e18, "ether")
    nft = nftCert.deploy(
        {"from": account, "gas_limit": 5000000}, publish_source = config["networks"][network.show_active()]["verify"]
    )
    print(f'your contract deployed at {nft.address}')
    save_abi_to_file(nft, "abiFile.json")
    save_abi_to_file(nft, "front_end/abiFile.json")
    #update_front_end()
    return nft

# def update_front_end():
#     copy_folders_to_front_end("./build", "./front_end/src/chain-info")
    
#     with open('brownie-config.yaml','r') as brownie_config:
#         config_dict = yaml.load(brownie_config, Loader = yaml.FullLoader)
#         with open('./front_end/src/brownie-config.json','w') as brownie_config_json:
#             json.dump(config_dict,brownie_config_json)
#         print("Frontend update")

# def copy_folders_to_front_end(src, dest):
#     if os.path.exists(dest):
#         shutil.rmtree(dest)
#     shutil.copytree(src, dest)

def main():
    deploy()

