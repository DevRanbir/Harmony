import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Store chat sessions in memory (in production, consider using Redis or database)
const chatSessions = new Map();

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { message, chatId, userId, previousMessages = [] } = await request.json();
    
    if (!message || !chatId) {
      return NextResponse.json({ error: 'Message and chatId are required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    // Create session key - use userId from request or fallback to 'anonymous'
    const sessionKey = `${userId || 'anonymous'}-${chatId}`;
    
    // Get or create chat session
    let chat = chatSessions.get(sessionKey);
    if (!chat) {
      // Build chat history from previous messages
      const history = [
        {
          role: 'user',
          parts: [{ text: 'You are Harmony, an AI assistant developed by Ranbir as part of Project Harmony. You are friendly, helpful, and knowledgeable. Please introduce yourself as Harmony and mention that you were created by Ranbir. Keep your responses concise but informative. Always maintain a warm and professional tone. When presenting data in tables, use proper markdown table format with | symbols. For code, use markdown code blocks. Use markdown formatting for better readability including headers, lists, bold, italic, etc.' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Hello! I\'m Harmony, your AI assistant created by Ranbir as part of Project Harmony. I\'m here to help you with questions, have conversations, and assist with various topics. I aim to be helpful, friendly, and provide you with accurate information using proper formatting when needed. What can I help you with today?' }],
        },
      ];

      // Add previous messages to history if available
      if (previousMessages && previousMessages.length > 0) {
        // Take only the last 10 messages to avoid token limits
        const recentMessages = previousMessages.slice(-10);
        
        for (const msg of recentMessages) {
          if (msg.content && typeof msg.content === 'string') {
            history.push({
              role: msg.isUser ? 'user' : 'model',
              parts: [{ text: msg.content }],
            });
          }
        }
      }

      chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 600, // Further reduced for faster responses
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      });
      
      chatSessions.set(sessionKey, chat);
    }

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiResponse = response.text();

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Error in Gemini API route:', error);
    
    // Provide appropriate error responses
    let errorMessage = 'I apologize, but I\'m having trouble processing your request right now. Please try again later.';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'I apologize, but there seems to be an issue with my configuration. Please check that the API key is properly set up.';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'I\'m currently experiencing high demand. Please try again in a moment.';
      } else if (error.message.includes('safety')) {
        errorMessage = 'I understand your question, but I\'m not able to provide a response to that particular topic. Is there something else I can help you with?';
      }
    }
    
    return NextResponse.json({ response: errorMessage });
  }
}