from brownie import nftCert, network
from Data.metadata.sample_metadata import metadata_template
from pathlib import Path
import requests
import json
import os
import pandas as pd

def read_csv():
    csv_file_path = "./Data/metadata/token_uri.csv"
    if Path(csv_file_path).exists():
        df = pd.read_csv(csv_file_path)
        global token_uri_dict
        token_uri_dict = dict(zip(df["token_id"], df["token_uri"]))

def write_csv():
    df = pd.DataFrame(list(token_uri_dict.items()), columns=["token_id", "token_uri"])
    df.to_csv("./Data/metadata/token_uri.csv", index=False)

token_uri_dict = {}

def main():
    read_csv()

    nft = nftCert[-1]
    number_of_nft = nft.tokenCounter()
    print(f"You have created {number_of_nft} nfts!")
    for token_id in range(number_of_nft):
        metadata_file_name = f"./Data/metadata/{network.show_active()}/{token_id}.json"

        metadata = metadata_template
        if Path(metadata_file_name).exists():
            print(f"{metadata_file_name} already exists! Delete it to overwrite")
        else:
            print(f"Creating Metadata file: {metadata_file_name}")
            metadata["description"][
                "certificate_authority_name"
            ] = "Kasetsart University"
            image_to_upload = None
            if os.getenv("UPLOAD_IPFS") == "true":
                image_path = "./Data/cert_image/{}.jpg".format(token_id)
                image_to_upload = upload_to_ipfs(image_path)
            metadata["image"] = image_to_upload
            with open(metadata_file_name, 'w') as file:
                json.dump(metadata, file)
            print(metadata_file_name)
            token_uri = upload_to_ipfs(metadata_file_name)
            token_uri_dict[token_id] = token_uri

    write_csv()

def upload_to_ipfs(filepath):
    with Path(filepath).open("rb") as fp:
        image_binary = fp.read()
        ipfs_url = "http://127.0.0.1:5001"
        endpoint = "/api/v0/add"
        response = requests.post(ipfs_url + endpoint, files={"file": image_binary})
        ipfs_hash = response.json()["Hash"]
        filename = filepath.split("/")[-1:][0]
        image_uri = f"https://ipfs.io/ipfs/{ipfs_hash}?filename={filename}"
        print(image_uri)
        return image_uri
