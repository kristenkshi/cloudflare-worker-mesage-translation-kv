// Replace these with your Google Cloud Translation API credentials
const GOOGLE_TRANSLATION_API_KEY = 'YOUR_GOOGLE_TRANSLATION_API_KEY';

// Replace 'KV_NAMESPACE' with your Workers KV namespace
const KV_NAMESPACE = 'KV_NAMESPACE';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const data = await request.json();

  // Check if the POST request contains the 'message' field
  if (!data.message) {
    return new Response('Missing message', { status: 400 });
  }

  const originalMessage = data.message;

  // Get the language of the original message
  const originalLanguage = await detectLanguage(originalMessage);

  // Translate the message to English and Chinese
  const [englishTranslation, chineseTranslation] = await Promise.all([
    translateText(originalMessage, originalLanguage, 'en'),
    translateText(originalMessage, originalLanguage, 'zh-CN'),
  ]);

  // Store the information in Workers KV
  await storeTranslations(originalMessage, originalLanguage, englishTranslation, chineseTranslation);

  return new Response(
    JSON.stringify({
      originalMessage,
      originalLanguage,
      englishTranslation,
      chineseTranslation,
    }),
    { status: 200 }
  );
}

async function detectLanguage(text) {
  const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATION_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      q: text,
    }),
  });
  const data = await response.json();
  return data.data.detections[0][0].language;
}

async function translateText(text, sourceLanguage, targetLanguage) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATION_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
    }),
  });
  const data = await response.json();
  return data.data.translations[0].translatedText;
}

async function storeTranslations(originalMessage, originalLanguage, englishTranslation, chineseTranslation) {
  const kvStore = await KV_NAMESPACE.get('translations', { type: 'json' }) || {};
  kvStore[originalMessage] = {
    originalLanguage,
    englishTranslation,
    chineseTranslation,
  };
  await KV_NAMESPACE.put('translations', JSON.stringify(kvStore));
}
