import { queryRewritePrompt} from "./prompts";
import { type UIMessage, generateText } from "ai";
import { LanguageModelV1 } from "ai";


export async function generateSearchQuery(messages: UIMessage[], model: LanguageModelV1) {
    if (messages.length === 0) {
      return "";
    }
    const cleanedMessages = messages[0] && messages[0].role === "assistant" ? messages.slice(1) : messages;
    const conversationHistory = cleanedMessages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");
    
    const { text } = await generateText({
      model: model,
      messages: [{ role: "user", content: conversationHistory }],
      temperature: 0.1,
      system: queryRewritePrompt,
    });
    return text;
}
