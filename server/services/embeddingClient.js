// Thin wrapper around Mistral AI's embeddings endpoint.
// Kept separate from scoringService so swapping providers later (or adding
// retry/backoff for rate limits) doesn't touch the scoring logic itself.
//
// Provider history for this project:
// 1. Tried Groq's embeddings endpoint — 404 model_not_found, appears to be
//    limited/beta access, not generally available.
// 2. Tried OpenAI — blocked on billing (embeddings require a payment method
//    on file even though usage cost is near-zero).
// 3. Landed on Mistral AI — genuinely free tier, no credit card required
//    (just phone verification), OpenAI-compatible request/response shape.

const MISTRAL_EMBEDDINGS_URL = 'https://api.mistral.ai/v1/embeddings';
const EMBEDDING_MODEL = 'mistral-embed';

/**
 * @param {string} text
 * @returns {Promise<number[]>} embedding vector
 */
async function getEmbedding(text) {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY is not set in environment');
  }

  // Guard against sending excessively long resumes/descriptions —
  // embedding models have token limits, and this is plenty of signal.
  const trimmedText = text.slice(0, 8000);

  const response = await fetch(MISTRAL_EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: [trimmedText],
      model: EMBEDDING_MODEL,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Mistral embeddings request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

module.exports = { getEmbedding };