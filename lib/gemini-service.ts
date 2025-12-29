// Client-side service for interacting with Gemini AI through API routes
export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Send a message and get AI response via API route
   */
  public async sendMessage(
    userId: string, 
    chatId: string, 
    message: string,
    previousMessages: { sender: string; text: string }[] = [],
    systemPrompt?: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chatId,
          userId,
          previousMessages,
          systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'Error. Try again.';
      
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      
      // Provide fallback responses based on error type
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          return 'Please sign in.';
        }
        if (error.message.includes('500')) {
          return 'Server issue. Try later.';
        }
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          return 'Connection issue. Check internet.';
        }
      }
      
      return 'Error. Try again.';
    }
  }

  /**
   * Get basic model information
   */
  public async getModelInfo(): Promise<{ name: string; description: string; maxTokens: number; temperature: number }> {
    return {
      name: 'gemini-1.5-flash',
      description: 'Google Gemini 1.5 Flash - Fast and efficient AI model',
      maxTokens: 1000,
      temperature: 0.7,
    };
  }
}

// Export a singleton instance
export const geminiService = GeminiService.getInstance();