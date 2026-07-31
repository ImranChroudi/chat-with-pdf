import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

export async function askQuestion(id : string, question: string) {
    const {userId} = auth.portect()

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

    



    


}