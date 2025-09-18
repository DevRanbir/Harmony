import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate a short, descriptive title (3-6 words max) for a chat conversation that starts with this message: "${message}"

Rules:
- Keep it under 50 characters
- Make it descriptive but concise
- Don't use quotes or special characters
- Focus on the main topic or intent
- Examples: "Weather in Paris", "Python Tutorial Help", "Recipe for Pasta"

Title:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();

    // Clean up the title
    title = title.replace(/^["']|["']$/g, ''); // Remove quotes
    title = title.replace(/^Title:\s*/i, ''); // Remove "Title:" prefix
    title = title.slice(0, 50); // Ensure max length

    return NextResponse.json({ title });

  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}