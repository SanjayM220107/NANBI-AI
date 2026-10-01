import { Scheme, UserProfile } from '../data/schemes';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export async function askGeminiAssistant(
  prompt: string,
  language: 'ta' | 'en',
  userProfile?: UserProfile,
  selectedScheme?: Scheme | null,
  history: ChatMessage[] = []
): Promise<{ success: boolean; text: string }> {
  try {
    const formattedHistory = history.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        language,
        userProfile,
        selectedScheme,
        conversationHistory: formattedHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success !== false,
      text:
        data.text ||
        (language === 'ta'
          ? 'AI சேவை தற்போது கிடைக்கவில்லை. தயவுசெய்து கீழே உள்ள திட்ட பட்டியலைப் பயன்படுத்தவும்.'
          : 'AI assistance is temporarily unavailable. You can still browse the scheme list below.'),
    };
  } catch (error) {
    console.warn('Gemini chat request failed:', error);
    return {
      success: false,
      text:
        language === 'ta'
          ? 'AI சேவை தற்போது கிடைக்கவில்லை. தயவுசெய்து கீழே உள்ள திட்ட பட்டியலைப் பயன்படுத்தவும்.'
          : 'AI assistance is temporarily unavailable. You can still browse the scheme list below.',
    };
  }
}
