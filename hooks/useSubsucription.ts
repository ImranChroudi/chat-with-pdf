"use client"

import { useUser } from "@clerk/nextjs";
import { useState } from "react";


const PRO_LIMIT = 20 ; 
const FREE_LIMIT = 5;


function useSubscription(){
    const [hasActiveMembership , setHasActiveMembership] = useState(null)
    const [isOverLimit , setIsOverLimit] = useState(false)

    const {user} = useUser();

}

export default useSubscription