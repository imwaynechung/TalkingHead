export async function generateSpeech(text, options = {}) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const {
    model = 'gpt-4o-audio-preview',
    voice = 'alloy',
    speed = 1.0
  } = options;

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        speed,
        response_format: 'mp3'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return audioUrl;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

export const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy (Neutral)' },
  { id: 'echo', name: 'Echo (Male)' },
  { id: 'fable', name: 'Fable (British Male)' },
  { id: 'onyx', name: 'Onyx (Deep Male)' },
  { id: 'nova', name: 'Nova (Female)' },
  { id: 'shimmer', name: 'Shimmer (Soft Female)' }
];
