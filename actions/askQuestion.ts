import { adminDb } from "@/firebaseAdmin";
import { generateLangChainCompletion } from "@/lib/langChain";
import { auth } from "@clerk/nextjs/server";

export async function askQuestion(id : string, question: string) {
    const {userId} = await auth.protect();

    console.log("question", question);
    

    const chatRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(id)
    .collection("chat")

    const chatSnapshot = await chatRef.get();
    const userMessages = chatSnapshot.docs.filter((doc)=> doc.data().role === "human");

    const userMessage = {
        role: "human",
        content: question,
        createdAt: new Date()
    }

    await chatRef.add(userMessage);


    // generate AI response 
    const reply = await generateLangChainCompletion(id , question);

    const aiMessage = {
        role : "ai",
        message : reply,
        createdAt : new Date()
    }; 

    await chatRef.add(aiMessage);
    
    return {success : true , message : null};

}