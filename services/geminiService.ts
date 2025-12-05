import { Message } from "../types";

const API_URL = 'http://localhost:5000/api';

export const sendMessageStream = async (
  history: Message[], 
  message: string, 
  onChunk: (text: string) => void
): Promise<string> => {
  let fullResponse = "";
  
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        history: history.filter(msg => !msg.isLoading), // Send clean history
        message 
      })
    });

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const text = decoder.decode(value, { stream: true });
      fullResponse += text;
      onChunk(fullResponse);
    }

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }

  return fullResponse;
};
