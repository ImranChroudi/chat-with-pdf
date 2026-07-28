"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

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

  const { user } = useUser();
  const router = useRouter();

  const handleUploaded = async (file: File) => {
    if (!file || !user) return;

    const fileIdUploadTo = uuidv4();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileId", fileIdUploadTo);
    formData.append("userId", user.id);

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

      const documentUrl = res.data.url;

      await setDoc(doc(db, "users", user.id, "files", fileIdUploadTo), {
        name: file.name,
        url: documentUrl,
        type: file.type,
        size: file.size,
        createdAt: new Date(),
      });
    } catch (err) {
      console.log(err);
      setStatus(StatusText.SAVING);
    }

    setStatus(StatusText.GENERTATING);
    // Generate Ai Embading

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
