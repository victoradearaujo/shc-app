import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/lib/mastra';

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_ASSISTANT_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Assistant is disabled' }, { status: 403 });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    const agent = mastra.getAgent('assistantAgent');
    const result = await agent.generate(messages);

    return NextResponse.json({ reply: result.text });
  } catch (error) {
    console.error('Assistant error:', error);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
