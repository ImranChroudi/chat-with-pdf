"use client";

import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { collection, doc, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";

const PRO_FILE_LIMIT = 10;
const FREE_FILE_LIMIT = 2;



function useSubscription() {
  const [hasActiveMembership, setHasActiveMembership] = useState(null);
  const [isOverFileLimit, setIsOverFileLimit] = useState(false);

  const { user } = useUser();
  const [snapshot, loading, error] = useDocument(
    user && doc(db, "users", user.id),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );

  const [filesSnapshot, filesLoading] = useCollection(
    user && collection(db, "users", user?.id, "files"),
  );

  useEffect(() => {
    if (!snapshot) return;

    const data = snapshot.data();

    if (!data) return;

    setHasActiveMembership(data.hasActiveMembership);
  }, [snapshot]);

  useEffect(() => {
    if (!filesSnapshot || hasActiveMembership) return;

    const files = filesSnapshot?.docs;
    const usersLimit = hasActiveMembership ? PRO_FILE_LIMIT : FREE_FILE_LIMIT;

    console.log("files", files, "usersLimit", usersLimit);

    setIsOverFileLimit(files && files.length > usersLimit);
  }, [filesSnapshot, hasActiveMembership, PRO_FILE_LIMIT, FREE_FILE_LIMIT]);

  return {
    hasActiveMembership,
    isOverFileLimit,
    filesSnapshot,
    filesLoading,
    loading
  };
}

export default useSubscription;
