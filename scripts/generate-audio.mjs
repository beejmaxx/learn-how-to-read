import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) throw new Error('OPENAI_API_KEY is required');

const MODEL = 'gpt-audio-1.5';
const VOICE = 'marin';
const OUTPUT_DIR = path.resolve('assets/audio');

const books = JSON.parse(await readFile(path.resolve('stories.json'), 'utf8'));
const stories = books.map(book => book.pages);

const wordMeta = {
  cat: ['hat', 'The cat can nap.'], dog: ['log', 'The dog can run.'], sun: ['fun', 'The sun is hot.'],
  hat: ['cat', 'I put on my hat.'], red: ['bed', 'The dot is red.'], map: ['cap', 'We look at the map.'],
  pig: ['wig', 'The pig is pink.'], bed: ['red', 'I sleep in a bed.'], fox: ['box', 'The fox can hop.'],
  bug: ['rug', 'A bug is on the rug.'], dad: ['sad', 'My dad can nap.'], nap: ['cap', 'It is time for a nap.']
};

const phonemes = {
  a: 'the short a phoneme in apple', b: 'the b phoneme in bat', c: 'the hard c phoneme in cat',
  d: 'the d phoneme in dog', f: 'the f phoneme in fish', g: 'the hard g phoneme in gum',
  h: 'the h phoneme in hat', i: 'the short i phoneme in pig', m: 'the m phoneme in map',
  n: 'the n phoneme in nap', p: 'the p phoneme in pig', r: 'the r phoneme in red',
  s: 'the unvoiced s phoneme in sun', t: 'the t phoneme in top', u: 'the short u phoneme in sun'
};

const phrases = new Map();
const add = text => phrases.set(text.trim().toLowerCase(), { key: text.trim().toLowerCase(), text, kind: 'speech' });

for (const sentence of stories.flat()) add(sentence);
for (const word of new Set(stories.flat().flatMap(sentence => sentence.toLowerCase().match(/[a-z']+/g) || []))) add(word);

for (const [word, [rhyme, storySentence]] of Object.entries(wordMeta)) {
  add(`Can you find the word, ${word}?`);
  add(`Let's build the word, ${word}. Tap the letters in order.`);
  add(`${word}. What sound does ${word} start with?`);
  add(`Which word rhymes with ${word}?`);
  add(`${storySentence.replace(word, 'blank')} Which word belongs in the blank?`);
  add(`${word}. You found it!`);
  add(`You built ${word}!`);
  add(rhyme);
}

[
  'Good try. Have another look.', 'You found it!', 'Nice looking!', "That's it!", 'Great trying!',
  'Lovely playing!', 'You read a book!'
].forEach(add);

for (const [letter, description] of Object.entries(phonemes)) {
  phrases.set(`phoneme:${letter}`, { key: `phoneme:${letter}`, text: description, kind: 'phoneme' });
}

function filenameFor(item) {
  const slug = item.key.replace(/^phoneme:/, 'sound-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 42) || 'audio';
  const hash = createHash('sha1').update(`${MODEL}:${VOICE}:${item.key}`).digest('hex').slice(0, 8);
  return `${slug}-${hash}.mp3`;
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

async function generate(item, index, total) {
  const filename = filenameFor(item);
  const destination = path.join(OUTPUT_DIR, filename);
  if (await exists(destination)) {
    console.log(`[${index + 1}/${total}] cached ${item.key}`);
    return [item.key, `assets/audio/${filename}`];
  }

  const developer = item.kind === 'phoneme'
    ? 'Produce only the requested English phoneme sound once. Do not say the letter name, example word, description, or anything else. Keep it crisp and natural for a four-year-old learning phonics.'
    : 'You are a warm, patient story reader speaking to one four-year-old child. Read the supplied text exactly as written and say nothing else. Sound natural, clear, gently expressive, and unhurried. Avoid a sing-song baby voice. Preserve each word without paraphrasing.';
  const user = item.kind === 'phoneme' ? `Make only ${item.text}.` : item.text;

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          modalities: ['text', 'audio'],
          audio: { voice: VOICE, format: 'mp3' },
          messages: [
            { role: 'developer', content: developer },
            { role: 'user', content: user }
          ]
        })
      });
      if (!response.ok) throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 400)}`);
      const result = await response.json();
      const audio = result.choices?.[0]?.message?.audio?.data;
      if (!audio) throw new Error('The response did not contain audio data');
      await writeFile(destination, Buffer.from(audio, 'base64'));
      console.log(`[${index + 1}/${total}] generated ${item.key}`);
      return [item.key, `assets/audio/${filename}`];
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1200));
    }
  }
  throw lastError;
}

await mkdir(OUTPUT_DIR, { recursive: true });
const all = [...phrases.values()];
const limit = Number(process.env.AUDIO_LIMIT || all.length);
const queue = all.slice(0, limit);
const results = [];
let cursor = 0;

async function worker() {
  while (cursor < queue.length) {
    const index = cursor++;
    results[index] = await generate(queue[index], index, queue.length);
  }
}

await Promise.all(Array.from({ length: Math.min(6, queue.length) }, worker));
const manifest = Object.fromEntries(results.filter(Boolean));
await writeFile(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify({ model: MODEL, voice: VOICE, audio: manifest }, null, 2));
console.log(`Wrote ${results.length} clips with ${MODEL}/${VOICE}.`);
