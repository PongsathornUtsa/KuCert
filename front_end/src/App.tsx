import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

type FormData = {
  name: string;
  description: string;
  image: FileList;
};

const PINATA_API_KEY = "3dfd64b3d6ca31560fa4";
const PINATA_API_SECRET =
  "f7510a6ef4e8af5668885123ad2274643130d0efd42a2640528b2d397fc82a35";

const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>();
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [preview, setPreview] = useState(false);
  const [metadata, setMetadata] = useState({ name: "", description: "", image: "" });

  const onSubmit = handleSubmit(async ({ name, description, image }) => {
    if (image.length === 0) {
      console.error("Image is required");
      return;
    }

    const formData = new FormData();
    formData.append("file", image[0]);

    setUploadStatus("uploading");

    try {
      const resFile = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const ImgHash = `https://ipfs.io/ipfs/${resFile.data.IpfsHash}`;

      const metadata = {
        name,
        description,
        image: ImgHash,
      };

      const resJSON = await axios.post(
        "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        metadata,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
          },
        }
      );

      const tokenURI = `https://ipfs.io/ipfs/${resJSON.data.IpfsHash}.json`;
      console.log("Token URI:", tokenURI);
      setUploadStatus("completed");
    } catch (error) {
      console.error("Error uploading file: ", error);
      setUploadStatus("failed");
    }
  });

  const onPreview = () => {
    const { name, description } = getValues();
    setMetadata({
      name,
      description,
      image: "Image hash will be available after submit",
    });
    setPreview(true);
  }

  return (
    <div>
        <div style={{ position: "absolute", top: "10px", right: '10px' }}>
          <ConnectButton />
        </div>
      <div className="container">
        <form className="form" onSubmit={onSubmit}>
          <h2>Mint NFT</h2>
          <div className="form-row">
            <label className="form-label">Name:</label>
            <input className="form-input" {...register("name", { required: true })} />
            {errors.name && <p className="error-message">This field is required</p>}
          </div>

          <div className="form-row">
            <label className="form-label">Description:</label>
            <input className="form-input" {...register("description", { required: true })} />
            {errors.description && <p className="error-message">This field is required</p>}
          </div>

          <div className="form-row">
            <label className="form-label">Image:</label>
            <input {...register("image", { required: true })} type="file" />
            {errors.image && <p className="error-message">This field is required</p>}
          </div>

          <button type="submit" className="btn btn-block">
            Submit
          </button>

          <button type="button" className="btn btn-block" onClick={onPreview}>
            Preview
          </button>
        </form>

        {preview && (
          <div className="metadata-preview">
            <h2>Metadata Preview</h2>
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        )}

        {uploadStatus === "uploading" && <p className="upload-status">Uploading...</p>}
        {uploadStatus === "completed" && <p className="upload-status">Upload completed!</p>}
        {uploadStatus === "failed" && <p className="upload-status">Upload failed. Please try again.</p>}
      </div>
    </div>

  );
};

export default App;

