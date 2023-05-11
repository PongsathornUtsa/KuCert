import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  useProvider,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useWaitForTransaction,
  useAccount
} from "wagmi";
import ContractInterface from "../../abiFile.json";

type FormData = {
  name: string;
  university_name: string;
  student_id: string;
  issued_date: string;
  signer: string;
  image: FileList;
};

type FormProps = {
  setMetadata: (metadata: {
    name: string;
    image: string;
    description: {
      university_name: string;
      student_id: string;
      issued_date: string;
      signer: string;
    };
  }) => void;
  setPreview: (preview: boolean) => void;
};

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

const Form: React.FC<FormProps> = ({ setMetadata, setPreview }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>();

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

  const { address: account, isConnecting } = useAccount();

  const [tokenURI, setTokenURI] = useState("");

  const onSubmit = handleSubmit(async ({ name, image, university_name, student_id, issued_date, signer }) => {
    if (image.length === 0) {
      console.error("Image is required");
      return;
    }

    const formData = new FormData();
    formData.append("file", image[0]);

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
        image: ImgHash,
        description: {
          university_name,
          student_id,
          issued_date,
          signer
        }
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

      const tokenURI = `https://ipfs.io/ipfs/${resJSON.data.IpfsHash}`;
      console.log("Token URI:", tokenURI);
      setTokenURI(tokenURI);
      setMetadata(metadata);
    } catch (error) {
      console.error("Error uploading file: ", error);
      return;
    }
  });

  const onPreview = () => {
    const { name, university_name, student_id, issued_date, signer } = getValues();
    setMetadata({
      name,
      image: "Image hash will be available after submit",
      description: {
        university_name,
        student_id,
        issued_date,
        signer
      }
    });
    setPreview(true);
  };
  const { data: universityRole } = useContractRead({
    abi: ContractInterface,
    address: CONTRACT_ADDRESS,
    functionName: "UNIVERSITY_ROLE",
  });

  const { data: hasUniversityRole } = useContractRead({
    abi: ContractInterface,
    address: CONTRACT_ADDRESS,
    functionName: "hasRole",
    args: [universityRole, account],
  });

  const [submitEnabled, setSubmitEnabled] = useState(false);

  useEffect(() => {
    if (hasUniversityRole !== undefined && hasUniversityRole !== null && !isConnecting) {
      setSubmitEnabled(Boolean(hasUniversityRole));
    } else {
      setSubmitEnabled(false);
    }
  }, [hasUniversityRole, isConnecting]);

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2>Please provide the data for NFT below</h2>
      <div className="form-row">
        <label className="form-label">Name:</label>
        <input className="form-input" {...register("name", { required: true })} placeholder="Enter your name and surname" />
        {errors.name && <p className="error-message">This field is required</p>}
      </div>

      <div className="form-row">
        <label className="form-label">University Name:</label>
        <input className="form-input" {...register("university_name", { required: true })} placeholder="Enter your university name" />
        {errors.university_name && <p className="error-message">This field is required</p>}
      </div>

      <div className="form-row">
        <label className="form-label">Student ID:</label>
        <input className="form-input" {...register("student_id", { required: true })} placeholder="Enter your student id" />
        {errors.student_id && <p className="error-message">This field is required</p>}
      </div>

      <div className="form-row">
        <label className="form-label">Issued Date:</label>
        <input className="form-input" {...register("issued_date", { required: true })} placeholder="Enter issued date in dd/mm/yy" />
        {errors.issued_date && <p className="error-message">This field is required</p>}
      </div>

      <div className="form-row">
        <label className="form-label">Signer:</label>
        <input className="form-input" {...register("signer", { required: true })} placeholder="Enter the issuer name" />
        {errors.signer && <p className="error-message">This field is required</p>}
      </div>

      <div className="form-row">
        <label className="form-label">Image:</label>
        <input {...register("image", { required: true })} type="file" />
        {errors.image && <p className="error-message">This field is required</p>}
      </div>
      <button type="submit" className="btn btn-block" disabled={!submitEnabled}>
        Submit
      </button>

      <button type="button" className="btn btn-block" onClick={onPreview}>
        Preview
      </button>
      {tokenURI && (
        <div style={{ marginTop: "1rem" }}>
          Successfully created token URI!
          <div>
            Token URI: <a href={tokenURI} target="_blank" rel="noopener noreferrer">{tokenURI}</a>
          </div>
        </div>
      )}
    </form>
  );
};

export default Form;