import { apiClient } from "@/lib/api";

export interface ChatbotResponse {
  answer: string;
}

export type ChatbotLanguage = "es" | "en";

export const chatbotService = {
  ask: (message: string, lang: ChatbotLanguage): Promise<ChatbotResponse> =>
    apiClient.post<ChatbotResponse>("/chatbot/", { message, lang }),
};
