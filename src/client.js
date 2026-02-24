import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPEN_API_KEY,
  baseURL: "https://api.perplexity.ai",
  defaultHeaders: {
    "Accept": "application/json",
  },
  dangerouslyAllowBrowser: true,
});

export default client;