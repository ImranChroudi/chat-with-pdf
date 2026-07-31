"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { generateEmbedding } from "@/actions/generateEmbading";

export enum StatusText {
  UPLOADING = "Uploading",
  UPLOADED = "Uploaded",
  SAVING = "Error",
  GENERTATING = "Generating",
}

export type Status = StatusText[keyof StatusText];

 function useUpload() {
  const [progress, setProgress] = useState(0);
  const [fileId, setFileId] = useState("");
  const [status, setStatus] = useState("");
 const router = useRouter();


  const { user , isLoaded} =  useUser();
  console.log("user", user);

  const handleUploaded = async (file: File) => {
    console.log("handle uploaded", file);

    setTimeout(() => {
      console.log("Timeout");
    }, 3000);

    

    if (user === null || user === undefined) {
      console.log("No file or user");
      return;
    };

    const fileIdUploadTo = uuidv4();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileId", fileIdUploadTo);
    formData.append("userId", user?.id);

    console.log(fileIdUploadTo);

    try {
      const res = await axios.post("/api/upload", formData, {
        onUploadProgress(progressEvent) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setProgress(percent);
          setStatus(StatusText.UPLOADING);
        },
      });
      console.log(res);

      if (res.status === 200) {
        setFileId(fileIdUploadTo);
        setStatus(StatusText.UPLOADED);
      }

      const documentUrl = res.data.secure_url;
      console.log("document Url" , documentUrl);

      await setDoc(doc(db, "users", user?.id, "files", fileIdUploadTo), {
        name: file.name,
        url: documentUrl,
        type: file.type,
        size: file.size,
        createdAt: new Date(),
      });
    } catch (err) {
      console.log(err);
      setStatus(StatusText.SAVING);
      return;
    }

    setStatus(StatusText.GENERTATING);
    // Generate Ai Embading

    console.log("Generating embedding");
    await generateEmbedding(fileIdUploadTo);

    setFileId(fileIdUploadTo);
  };

  return {
    progress,
    status,
    fileId,
    handleUpload: handleUploaded,
  };
}

export default useUpload;
