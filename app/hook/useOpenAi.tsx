import { useState } from "react";
import axios from "axios";
import Toast from "react-native-toast-message";

// import { useNetworkState } from "expo-network";
const apiKey = process.env.EXPO_PUBLIC_AI_KEY;

export default function useOpenAIChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const sendMessage = async (
    prompt: string,
    history: {
      id: string;
      source: "user" | "ai";
      msg: string;
    }[],
    conversationMode: "text" | "image"
  ) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model:
            conversationMode == "text"
              ? "qwen/qwen3-4b:free"
              : "opengvlab/internvl3-14b:free",
          messages:
            conversationMode == "text"
              ? [
                  {
                    role: "system",
                    content:
                      "You are a helpful medical assistant. Only answer health- or medicine-related questions. your question must be precise.",
                  },
                  {
                    role: "assistant",
                    content:
                      history.length > 0 ? history[history.length - 1].msg : "",
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ]
              : [
                  {
                    role: "system",
                    content:
                      "You are a helpful medical assistant. Only answer health- or medicine-related questions. your question must be precise.",
                  },
                  {
                    role: "assistant",
                    content:
                      history.length > 0 ? history[history.length - 1].msg : "",
                  },
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: "You are a helpful and knowledgeable medical assistant. Your job is to analyze medicine labels, packaging, or prescriptions. First, extract any readable text from the image. If the image contains medicine-related content, explain what the medicine is used for, how it works, and any important warnings or instructions. If the image is not clearly related to health or medicine, politely decline to answer and explain that only medical-related images are supported.",
                      },
                      {
                        type: "image_url",
                        image_url: {
                          url: prompt,
                        },
                      },
                    ],
                  },
                ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = res.data.choices[0].message.content;
      setResponse(reply);
      return reply;
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Sorry!",
        text2: "Something went wrong to communicate with AI.",
        position: "bottom",
      });
      console.error("OpenAI error:", err.message);
      setError("Failed to fetch response");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage };
}
