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
    const { message, chatId, userId, previousMessages = [], systemPrompt } = await request.json();
    
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
      // Use custom system prompt if provided, otherwise use minimal default
      const defaultSystemPrompt = `You are Harmony by Ranbir. Be extremely concise. Answer directly with essential info only. Max 2-3 sentences. No verbose explanations. Use minimal tables if needed. 

IMPORTANT CHART CAPABILITIES: You CAN create visual charts! When users ask for charts/graphs, provide JSON data in code blocks using the EXACT chart type they request.

Chart Examples:
- Line chart: {"type": "line", "data": [{"x": "A", "y": 10}, {"x": "B", "y": 20}], "xKey": "x", "yKey": "y"}
- Bar chart: {"type": "bar", "data": [{"category": "A", "value": 10}], "xKey": "category", "yKey": "value"}
- Pie chart: {"type": "pie", "data": [{"name": "A", "value": 30}], "xKey": "name", "yKey": "value"}
- Scatter chart: {"type": "scatter", "data": [{"x": 1, "y": 2}], "xKey": "x", "yKey": "y"}
- Area chart: {"type": "area", "data": [{"x": "A", "y": 10}], "xKey": "x", "yKey": "y"}

Never say you cannot draw or create charts. Always use the requested chart type.`;
      
      const finalSystemPrompt = systemPrompt || defaultSystemPrompt;
      
      // Build chat history from previous messages
      const history = [
        {
          role: 'user',
          parts: [{ text: finalSystemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Hi! I\'m Harmony by Ranbir. I can create charts and graphs for you! Just ask for line, bar, pie, scatter, or area charts. How can I help?' }],
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
          maxOutputTokens: systemPrompt && (systemPrompt.includes('ALGORITHM MODE') || systemPrompt.includes('AUTO MODE')) ? 800 : 300, // More tokens for algorithm and auto modes
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
    let errorMessage = 'Error. Try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'API key issue.';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'High demand. Try later.';
      } else if (error.message.includes('safety')) {
        errorMessage = 'Can\'t answer that. Try something else.';
      }
    }
    
    return NextResponse.json({ response: errorMessage });
  }
}