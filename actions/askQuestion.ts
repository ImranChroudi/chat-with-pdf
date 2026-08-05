import { adminDb } from "@/firebaseAdmin";
import { generateLangChainCompletion } from "@/lib/langChain";
import { auth } from "@clerk/nextjs/server";

const FREE_LIMIT = 2;
const PRO_LIMIT = 20;

export async function askQuestion(id: string, question: string) {
  const { userId } = await auth.protect();

  console.log("question", question);

  const chatRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(id)
    .collection("chat");

  const chatSnapshot = await chatRef.get();
  const userMessages = chatSnapshot.docs.filter(
    (doc) => doc.data().role === "human",
  );

  const userRef = await adminDb.collection("users").doc(userId).get();

  if (!userRef.data()?.hasActiveMembership) {
    if (userMessages.length >= FREE_LIMIT) {
      return {
        success: false,
        message: `You have reached the free limit of ${FREE_LIMIT} messages. Please upgrade to a paid plan to continue using our service.`,
      };
    }
  }

  if (userRef.data()?.hasActiveMembership) {
    if (userMessages.length >= PRO_LIMIT) {
      return {
        success: false,
        message: `You have reached the pro limit of ${PRO_LIMIT} messages. Please upgrade to a paid plan to continue using our service.`,
      };
    }
  }

  const userMessage = {
    role: "human",
    content: question,
    createdAt: new Date(),
  };

  await chatRef.add(userMessage);

  // generate AI response
  const reply = await generateLangChainCompletion(id, question);

  console.log("reply", reply);
  const aiMessage = {
    role: "ai",
    message: reply,
    createdAt: new Date(),
  };

  await chatRef.add(aiMessage);

  return { success: true, message: null };
}
