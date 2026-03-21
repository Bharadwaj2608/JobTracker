import api from './api';

export const streamChat = async (message, history, onChunk, onDone) => {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/ai/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jt_token')}`,
      },
      body: JSON.stringify({ message, conversationHistory: history }),
    }
  );

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') { onDone?.(); return; }
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) onChunk(parsed.text);
        } catch {}
      }
    }
  }
  onDone?.();
};

export const analyseResume = (formData) =>
  api.post('/ai/analyse-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });