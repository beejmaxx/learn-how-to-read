const SOUNDS = [
  { id: 's', label: 's', sound: 'sss', ipa: '/s/', word: 'sun', emoji: '☀️', cue: 'Teeth close. Let the air slide out.', group: 'start' },
  { id: 'a', label: 'a', sound: 'a', ipa: '/æ/', word: 'apple', emoji: '🍎', cue: 'Open wide with a little smile.', group: 'start' },
  { id: 't', label: 't', sound: 't', ipa: '/t/', word: 'top', emoji: '🪀', cue: 'Tap your tongue just behind your teeth.', group: 'start' },
  { id: 'p', label: 'p', sound: 'p', ipa: '/p/', word: 'pig', emoji: '🐷', cue: 'Press your lips, then puff the air.', group: 'start' },
  { id: 'i', label: 'i', sound: 'i', ipa: '/ɪ/', word: 'igloo', emoji: '🧊', cue: 'Relax your mouth and make a quick sound.', group: 'start' },
  { id: 'n', label: 'n', sound: 'nnn', ipa: '/n/', word: 'nest', emoji: '🪹', cue: 'Tongue up. Let the sound hum through your nose.', group: 'start' },
  { id: 'm', label: 'm', sound: 'mmm', ipa: '/m/', word: 'moon', emoji: '🌙', cue: 'Close your lips and hum.', group: 'more' },
  { id: 'd', label: 'd', sound: 'd', ipa: '/d/', word: 'dog', emoji: '🐶', cue: 'Tap your tongue and turn your voice on.', group: 'more' },
  { id: 'g', label: 'g', sound: 'g', ipa: '/ɡ/', word: 'goat', emoji: '🐐', cue: 'Make the sound at the back of your mouth.', group: 'more' },
  { id: 'o', label: 'o', sound: 'o', ipa: '/ɑ/', word: 'octopus', emoji: '🐙', cue: 'Round your mouth a little and open.', group: 'more' },
  { id: 'c', label: 'c', sound: 'k', ipa: '/k/', word: 'cat', emoji: '🐱', cue: 'A quick puff from the back of your mouth.', group: 'more' },
  { id: 'k', label: 'k', sound: 'k', ipa: '/k/', word: 'kite', emoji: '🪁', cue: 'This is the same sound as c in cat.', group: 'more' },
  { id: 'e', label: 'e', sound: 'e', ipa: '/ɛ/', word: 'egg', emoji: '🥚', cue: 'Open your mouth gently for a quick sound.', group: 'more' },
  { id: 'u', label: 'u', sound: 'u', ipa: '/ʌ/', word: 'up', emoji: '☝️', cue: 'Relax your mouth and make a short sound.', group: 'more' },
  { id: 'b', label: 'b', sound: 'b', ipa: '/b/', word: 'bed', emoji: '🛏️', cue: 'Press your lips, then turn your voice on.', group: 'more' },
  { id: 'f', label: 'f', sound: 'fff', ipa: '/f/', word: 'fish', emoji: '🐟', cue: 'Top teeth touch your bottom lip. Blow.', group: 'more' },
  { id: 'h', label: 'h', sound: 'hhh', ipa: '/h/', word: 'hat', emoji: '🎩', cue: 'Breathe warm air onto your hand.', group: 'more' },
  { id: 'r', label: 'r', sound: 'rrr', ipa: '/ɹ/', word: 'red', emoji: '🔴', cue: 'Curl your tongue back without touching.', group: 'more' },
  { id: 'l', label: 'l', sound: 'lll', ipa: '/l/', word: 'log', emoji: '🪵', cue: 'Touch your tongue just behind your teeth.', group: 'more' },
  { id: 'j', label: 'j', sound: 'j', ipa: '/dʒ/', word: 'jam', emoji: '🍓', cue: 'Stop the air, then let it buzz out.', group: 'more' },
  { id: 'v', label: 'v', sound: 'vvv', ipa: '/v/', word: 'van', emoji: '🚐', cue: 'Top teeth touch your bottom lip. Turn your voice on.', group: 'more' },
  { id: 'w', label: 'w', sound: 'w', ipa: '/w/', word: 'web', emoji: '🕸️', cue: 'Round your lips, then open them quickly.', group: 'more' },
  { id: 'y', label: 'y', sound: 'y', ipa: '/j/', word: 'yes', emoji: '👍', cue: 'Lift the middle of your tongue and use your voice.', group: 'more' },
  { id: 'z', label: 'z', sound: 'zzz', ipa: '/z/', word: 'zip', emoji: '🤐', cue: 'Make the s sound and turn your voice on.', group: 'more' },
  { id: 'sh', label: 'sh', sound: 'shhh', ipa: '/ʃ/', word: 'ship', emoji: '🚢', cue: 'Two letters make one quiet sound.', group: 'pairs' },
  { id: 'ch', label: 'ch', sound: 'ch', ipa: '/tʃ/', word: 'chick', emoji: '🐥', cue: 'Two letters make one quick sound.', group: 'pairs' },
  { id: 'th', label: 'th', tileNote: 'thin', sound: 'quiet th', ipa: '/θ/', word: 'thumb', emoji: '👍', cue: 'Tongue peeks between your teeth. Blow.', group: 'pairs' },
  { id: 'thv', label: 'th', tileNote: 'this', sound: 'buzzy th', ipa: '/ð/', word: 'this', emoji: '☝️', cue: 'Tongue peeks between your teeth. Turn your voice on.', group: 'pairs' },
  { id: 'ng', label: 'ng', sound: 'nggg', ipa: '/ŋ/', word: 'ring', emoji: '💍', cue: 'Hum the sound at the back of your mouth.', group: 'pairs' },
  { id: 'zh', label: 'zh', sound: 'zhhh', ipa: '/ʒ/', word: 'treasure', emoji: '💎', cue: 'Make a soft buzzing sh sound.', group: 'pairs' },
  { id: 'ai', label: 'ai', sound: 'ai', ipa: '/eɪ/', word: 'rain', emoji: '🌧️', cue: 'Start open, then lift your tongue a little.', group: 'long' },
  { id: 'ee', label: 'ee', sound: 'ee', ipa: '/iː/', word: 'feet', emoji: '🦶', cue: 'Smile gently and hold the sound.', group: 'long' },
  { id: 'igh', label: 'igh', sound: 'igh', ipa: '/aɪ/', word: 'night', emoji: '🌙', cue: 'Open your mouth, then glide into a smile.', group: 'long' },
  { id: 'oa', label: 'oa', sound: 'oa', ipa: '/oʊ/', word: 'boat', emoji: '⛵', cue: 'Round your lips and let the sound glide.', group: 'long' },
  { id: 'oo', label: 'oo', tileNote: 'moon', sound: 'long oo', ipa: '/uː/', word: 'moon', emoji: '🌙', cue: 'Round your lips and hold the sound.', group: 'long' },
  { id: 'yoo', label: 'u', tileNote: 'cube', sound: 'yoo', ipa: '/juː/', word: 'cube', emoji: '🧊', cue: 'Say y, then glide into long oo.', group: 'long' },
  { id: 'oo_short', label: 'oo', tileNote: 'book', sound: 'short oo', ipa: '/ʊ/', word: 'book', emoji: '📖', cue: 'Round your lips loosely for a quick sound.', group: 'vowels' },
  { id: 'ar', label: 'ar', sound: 'ar', ipa: '/ɑr/', word: 'car', emoji: '🚗', cue: 'Open wide, then curl into r.', group: 'vowels' },
  { id: 'or', label: 'or', sound: 'or', ipa: '/ɔr/', word: 'fork', emoji: '🍴', cue: 'Round your mouth, then curl into r.', group: 'vowels' },
  { id: 'ur', label: 'ur', sound: 'ur', ipa: '/ɝ/', word: 'bird', emoji: '🐦', cue: 'Keep your mouth relaxed and curl into r.', group: 'vowels' },
  { id: 'ow', label: 'ow', sound: 'ow', ipa: '/aʊ/', word: 'cow', emoji: '🐄', cue: 'Open wide, then round your lips.', group: 'vowels' },
  { id: 'oi', label: 'oi', sound: 'oi', ipa: '/ɔɪ/', word: 'coin', emoji: '🪙', cue: 'Start rounded, then glide into a smile.', group: 'vowels' },
  { id: 'air', label: 'air', sound: 'air', ipa: '/ɛr/', word: 'chair', emoji: '🪑', cue: 'Start with e, then curl into r.', group: 'vowels' },
  { id: 'ear', label: 'ear', sound: 'ear', ipa: '/ɪr/', word: 'ear', emoji: '👂', cue: 'Start with i, then curl into r.', group: 'vowels' },
  { id: 'ure', label: 'ure', sound: 'ure', ipa: '/ʊr/', word: 'pure', emoji: '✨', cue: 'Start with short oo, then curl into r.', group: 'vowels' },
  { id: 'schwa', label: 'ə', tileNote: 'about', sound: 'schwa', ipa: '/ə/', word: 'about', emoji: '💭', cue: 'A tiny relaxed vowel in an unstressed syllable.', group: 'vowels' },
  { id: 'qu', label: 'qu', sound: 'kw', ipa: '/kw/', word: 'queen', emoji: '👑', cue: 'A quick k sound followed by w.', group: 'extras' },
  { id: 'x', label: 'x', sound: 'ks', ipa: '/ks/', word: 'fox', emoji: '🦊', cue: 'Two quick sounds together: k, then s.', group: 'extras' }
];

const BLENDS = [
  { word: 'sat', emoji: '🧒', parts: ['s', 'a', 't'] },
  { word: 'pin', emoji: '📍', parts: ['p', 'i', 'n'] },
  { word: 'tap', emoji: '👆', parts: ['t', 'a', 'p'] },
  { word: 'nap', emoji: '😴', parts: ['n', 'a', 'p'] },
  { word: 'mat', emoji: '🟫', parts: ['m', 'a', 't'] },
  { word: 'map', emoji: '🗺️', parts: ['m', 'a', 'p'] },
  { word: 'dog', emoji: '🐶', parts: ['d', 'o', 'g'] },
  { word: 'cat', emoji: '🐱', parts: ['c', 'a', 't'] },
  { word: 'bed', emoji: '🛏️', parts: ['b', 'e', 'd'] },
  { word: 'sun', emoji: '☀️', parts: ['s', 'u', 'n'] },
  { word: 'fish', emoji: '🐟', parts: ['f', 'i', 'sh'] },
  { word: 'chat', emoji: '💬', parts: ['ch', 'a', 't'] }
];

const QUESTIONS = [
  { word: 'sun', emoji: '☀️', answer: 's', choices: ['s', 'm', 'f'] },
  { word: 'apple', emoji: '🍎', answer: 'a', choices: ['a', 'o', 'i'] },
  { word: 'pig', emoji: '🐷', answer: 'p', choices: ['p', 'b', 't'] },
  { word: 'moon', emoji: '🌙', answer: 'm', choices: ['m', 'n', 's'] },
  { word: 'dog', emoji: '🐶', answer: 'd', choices: ['d', 'g', 'b'] },
  { word: 'cat', emoji: '🐱', answer: 'c', choices: ['c', 't', 'f'] },
  { word: 'fish', emoji: '🐟', answer: 'f', choices: ['f', 's', 'h'] },
  { word: 'hat', emoji: '🎩', answer: 'h', choices: ['h', 'r', 'n'] },
  { word: 'red', emoji: '🔴', answer: 'r', choices: ['r', 'l', 'd'] },
  { word: 'log', emoji: '🪵', answer: 'l', choices: ['l', 'r', 'm'] },
  { word: 'kite', emoji: '🪁', answer: 'k', choices: ['k', 'g', 't'] },
  { word: 'egg', emoji: '🥚', answer: 'e', choices: ['e', 'a', 'u'] }
];

const GROUPS = {
  start: { label: 'Start here', note: 'Six sounds that can make lots of little words.' },
  more: { label: 'More sounds', note: 'Add new sounds when the first set feels familiar.' },
  pairs: { label: 'Letter pairs', note: 'Sometimes two letters work together as one sound.' },
  long: { label: 'Long vowels', note: 'Vowel sounds that often use two or more letters.' },
  vowels: { label: 'More vowels', note: 'The rest of the common English vowel sounds.' },
  extras: { label: 'Sound teams', note: 'Useful letter teams that make two quick sounds.' }
};

const app = document.querySelector('#app');
const homeButton = document.querySelector('[data-action="home"]');
const audioSourceControl = document.querySelector('[data-audio-source-control]');
const audioSourceSelect = document.querySelector('[data-audio-source]');
let audioManifest = { sounds: {}, words: {} };
let publicSounds = {};
let localSoundSources = {};
let currentAudio = null;
let playToken = 0;
let phonicsCoach = null;
let state = {
  screen: 'home',
  group: 'start',
  selectedSound: 's',
  blendIndex: Number(localStorage.getItem('phonics-blend-index')) || 0,
  questionIndex: Number(localStorage.getItem('phonics-question-index')) || 0,
  stars: Number(localStorage.getItem('phonics-stars')) || 0,
  answered: false,
  feedback: '',
  audioSource: localStorage.getItem('phonics-audio-source') || ''
};

try {
  const response = await fetch('audio/manifest.json?v=20260830-1', { cache: 'no-store' });
  if (response.ok) audioManifest = await response.json();
} catch {}
publicSounds = { ...audioManifest.sounds };

// A private, git-ignored manifest can replace generated phoneme clips on localhost.
// GitHub Pages keeps using the public manifest when this file is absent.
try {
  const response = await fetch('audio/local-manifest.json', { cache: 'no-store' });
  if (response.ok) {
    const localManifest = await response.json();
    if (localManifest.sources) {
      localSoundSources = localManifest.sources;
      const availableSources = Object.keys(localSoundSources);
      const preferredSource = availableSources.includes(state.audioSource)
        ? state.audioSource
        : localManifest.defaultSource;
      applySoundSource(preferredSource || availableSources[0]);
      populateSoundSourcePicker();
    } else {
      audioManifest = {
        ...audioManifest,
        ...localManifest,
        sounds: { ...audioManifest.sounds, ...localManifest.sounds },
        words: { ...audioManifest.words, ...localManifest.words }
      };
    }
  }
} catch {}

function applySoundSource(sourceId) {
  const source = localSoundSources[sourceId];
  if (!source) return;
  state.audioSource = sourceId;
  audioManifest.sounds = { ...publicSounds, ...source.sounds };
  localStorage.setItem('phonics-audio-source', sourceId);
  if (audioSourceSelect) audioSourceSelect.value = sourceId;
}

function populateSoundSourcePicker() {
  if (!audioSourceControl || !audioSourceSelect) return;
  audioSourceSelect.replaceChildren(...Object.entries(localSoundSources).map(([id, source]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = source.label;
    option.selected = id === state.audioSource;
    return option;
  }));
  audioSourceControl.hidden = false;
}

function soundById(id) { return SOUNDS.find(sound => sound.id === id); }
function soundsForGroup(group) { return SOUNDS.filter(sound => sound.group === group); }
function wait(milliseconds) { return new Promise(resolve => setTimeout(resolve, milliseconds)); }

function stopAppAudio() {
  playToken += 1;
  window.speechSynthesis?.cancel();
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}

function stopAudio() {
  phonicsCoach?.stop();
  stopAppAudio();
}

function playFile(source, token = playToken) {
  return new Promise(resolve => {
    if (!source || token !== playToken) { resolve(false); return; }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const audio = new Audio(source);
    currentAudio = audio;
    const done = played => {
      if (currentAudio === audio) currentAudio = null;
      resolve(played);
    };
    audio.addEventListener('ended', () => done(true), { once: true });
    audio.addEventListener('error', () => done(false), { once: true });
    audio.play().catch(() => done(false));
  });
}

async function playSound(id, element = null) {
  stopAudio();
  const token = playToken;
  element?.classList.add('playing');
  await playFile(audioManifest.sounds[id], token);
  element?.classList.remove('playing');
}

function playWord(word) {
  stopAudio();
  const clean = String(word).trim().toLowerCase();
  const recording = audioManifest.words[clean];
  if (recording) return playFile(recording, playToken);
  if ('speechSynthesis' in window && clean) {
    const utterance = new SpeechSynthesisUtterance(clean === 'i' ? 'eye' : clean);
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices.find(voice => /Samantha|Ava|Serena|Karen|Daniel|Moira|Tessa/i.test(voice.name))
      || voices.find(voice => /^en[-_]/i.test(voice.lang))
      || null;
    utterance.rate = .76;
    speechSynthesis.speak(utterance);
  }
  return Promise.resolve(false);
}

phonicsCoach = window.PhonicsCoach?.create({
  root: '../',
  speakWord: playWord,
  stopWord: stopAppAudio,
  returnFocus: () => document.querySelector('[data-word-lookup-form] input')?.focus({ preventScroll: true })
});

async function playBlend() {
  stopAudio();
  const token = playToken;
  const blend = BLENDS[state.blendIndex];
  const buttons = [...document.querySelectorAll('.phoneme-button')];
  const wholeWord = document.querySelector('.whole-word');
  for (let index = 0; index < blend.parts.length; index += 1) {
    if (token !== playToken) return;
    buttons.forEach(button => button.classList.remove('active'));
    buttons[index]?.classList.add('active');
    await playFile(audioManifest.sounds[blend.parts[index]], token);
    if (token !== playToken) return;
    await wait(110);
  }
  buttons.forEach(button => button.classList.remove('active'));
  wholeWord?.classList.add('active');
  await playFile(audioManifest.words[blend.word], token);
  wholeWord?.classList.remove('active');
}

function home() {
  stopAudio();
  state.screen = 'home';
  homeButton.hidden = true;
  app.innerHTML = `
    <section class="home-hero">
      <div>
        <p class="eyebrow">A phonics playground</p>
        <h1>Hear it.<br>Stretch it.<br>Blend it.</h1>
        <p class="hero-copy">Small, playful steps from letter sounds to real words—made for a brand-new reader and a grown-up to explore together.</p>
        <span class="hero-note"><span aria-hidden="true">🔊</span> Pure sounds, not letter names</span>
      </div>
      <div class="sound-flower" aria-hidden="true">
        <span class="flower-center">s</span><span class="petal"></span><span class="petal"></span><span class="petal"></span><span class="petal"></span><span class="petal"></span>
      </div>
    </section>
    <section class="word-lookup-panel" aria-labelledby="word-lookup-title">
      <div class="word-lookup-copy">
        <p class="eyebrow">While you read</p>
        <h2 id="word-lookup-title">Look up any word</h2>
        <p>Type a word from the book. Hear it, then tap each sound that builds it.</p>
      </div>
      <form class="word-lookup-form" data-word-lookup-form>
        <label for="wordLookupInput">Word from your book</label>
        <div>
          <input id="wordLookupInput" name="word" type="text" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="40" placeholder="Try bench" required>
          <button class="primary-button" type="submit">Show sounds</button>
        </div>
      </form>
      <div class="phonics-coach-host lookup-coach" id="lookupCoach" aria-live="polite" hidden></div>
    </section>
    <section class="activity-grid" aria-label="Phonics activities">
      <button class="activity-card explore" data-screen="explore">
        <span class="activity-icon" aria-hidden="true">👂</span>
        <h2>Meet the Sounds</h2>
        <p>Hear a sound, see a letter, and find it in a word.</p>
        <span class="card-arrow" aria-hidden="true">→</span>
      </button>
      <button class="activity-card blend" data-screen="blend">
        <span class="activity-icon" aria-hidden="true">🧩</span>
        <h2>Blend a Word</h2>
        <p>Push three sounds together to make a little word.</p>
        <span class="card-arrow" aria-hidden="true">→</span>
      </button>
      <button class="activity-card first" data-screen="first">
        <span class="activity-icon" aria-hidden="true">🌱</span>
        <h2>First Sound</h2>
        <p>Listen to a word and choose the sound at its start.</p>
        <span class="card-arrow" aria-hidden="true">→</span>
      </button>
    </section>`;
}

function renderExplore() {
  stopAudio();
  state.screen = 'explore';
  homeButton.hidden = false;
  if (!soundsForGroup(state.group).some(sound => sound.id === state.selectedSound)) {
    state.selectedSound = soundsForGroup(state.group)[0].id;
  }
  const selected = soundById(state.selectedSound);
  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <div><p class="eyebrow">Listen and copy</p><h1>Meet the Sounds</h1></div>
        <p class="screen-intro">Choose one sound at a time. Say it together, then notice how your mouth moves.</p>
      </div>
      <div class="sound-tabs" role="tablist" aria-label="Sound sets">
        ${Object.entries(GROUPS).map(([id, group]) => `<button class="sound-tab ${state.group === id ? 'active' : ''}" data-group="${id}" role="tab" aria-selected="${state.group === id}">${group.label}</button>`).join('')}
      </div>
      <div class="explore-layout">
        <div class="sound-grid" aria-label="${GROUPS[state.group].label}">
          ${soundsForGroup(state.group).map(sound => `<button class="sound-tile ${sound.id === selected.id ? 'selected' : ''}" data-sound-select="${sound.id}" aria-label="Sound ${sound.sound}"><span>${sound.label}</span>${sound.tileNote ? `<small>${sound.tileNote}</small>` : ''}</button>`).join('')}
        </div>
        <article class="sound-detail">
          <div class="big-sound">${selected.label}</div>
          <div class="sound-spelling">${selected.sound} <span aria-hidden="true">·</span> ${selected.ipa}</div>
          <p class="example"><span class="example-emoji" aria-hidden="true">${selected.emoji}</span>${selected.label} is for ${selected.word}</p>
          <p class="mouth-cue">${selected.cue}</p>
          <div class="detail-actions">
            <button class="primary-button" data-play-sound="${selected.id}">🔊 Hear ${selected.sound}</button>
            <button class="secondary-button" data-play-word="${selected.word}">Hear “${selected.word}”</button>
          </div>
          <p class="keyboard-hint">Keyboard: ← → changes the sound · Space plays it</p>
        </article>
      </div>
    </section>`;
}

function renderBlend() {
  stopAudio();
  state.screen = 'blend';
  homeButton.hidden = false;
  state.blendIndex = (state.blendIndex + BLENDS.length) % BLENDS.length;
  const blend = BLENDS[state.blendIndex];
  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <div><p class="eyebrow">Sound by sound</p><h1>Blend a Word</h1></div>
        <p class="screen-intro">Tap each sound first. Then choose “Blend it” to hear the sounds slide into a whole word.</p>
      </div>
      <article class="lesson-card">
        <div class="lesson-count"><span>Word ${state.blendIndex + 1} of ${BLENDS.length}</span><span>No rush</span></div>
        <div class="word-picture" aria-hidden="true">${blend.emoji}</div>
        <h2>What word do these sounds make?</h2>
        <div class="blend-row">
          ${blend.parts.map(part => `<button class="phoneme-button" data-play-sound="${part}" aria-label="Hear ${soundById(part).sound}">${soundById(part).label}</button>`).join('')}
          <span class="blend-arrow" aria-hidden="true">→</span>
          <span class="whole-word">${blend.word}</span>
        </div>
        <div class="lesson-actions">
          <button class="primary-button" data-action="blend">🔊 Blend it</button>
          <button class="secondary-button" data-action="next-blend">Next word →</button>
        </div>
      </article>
    </section>`;
}

function currentQuestion() { return QUESTIONS[state.questionIndex % QUESTIONS.length]; }

function renderFirstSound() {
  stopAudio();
  state.screen = 'first';
  homeButton.hidden = false;
  const question = currentQuestion();
  app.innerHTML = `
    <section class="screen">
      <div class="screen-heading">
        <div><p class="eyebrow">Listen closely</p><h1>First Sound</h1></div>
        <p class="screen-intro">Say the whole word slowly. Which sound can you hear right at the beginning?</p>
      </div>
      <article class="lesson-card">
        <div class="lesson-count"><span>Try ${state.questionIndex % QUESTIONS.length + 1} of ${QUESTIONS.length}</span><span class="stars" aria-label="${state.stars} stars">${'★'.repeat(Math.min(state.stars, 5))}${'☆'.repeat(Math.max(0, 5 - state.stars))}</span></div>
        <div class="question-picture" aria-hidden="true">${question.emoji}</div>
        <div class="question-word"><strong>${question.word}</strong><button class="speaker-button" data-play-word="${question.word}" aria-label="Hear ${question.word}">🔊</button></div>
        <h2>What sound starts “${question.word}”?</h2>
        <div class="answer-grid">
          ${question.choices.map(choice => `<button class="answer-button" data-answer="${choice}" aria-label="Choose ${soundById(choice).sound}">${soundById(choice).label}</button>`).join('')}
        </div>
        <p class="feedback" role="status">${state.feedback}</p>
        ${state.answered ? '<button class="primary-button next-question" data-action="next-question">Next one →</button>' : ''}
      </article>
    </section>`;
}

function chooseAnswer(button, answer) {
  if (state.answered) return;
  const question = currentQuestion();
  playSound(answer, button);
  if (answer === question.answer) {
    state.answered = true;
    state.stars += 1;
    state.feedback = `Yes! ${soundById(answer).sound} starts ${question.word}.`;
    localStorage.setItem('phonics-stars', state.stars);
    button.classList.add('correct');
    document.querySelectorAll('.answer-button').forEach(choice => { choice.disabled = true; });
    document.querySelector('.feedback').textContent = state.feedback;
    const next = document.createElement('button');
    next.className = 'primary-button next-question';
    next.dataset.action = 'next-question';
    next.textContent = 'Next one →';
    document.querySelector('.lesson-card').append(next);
  } else {
    state.feedback = `Good try. Listen to ${question.word} once more.`;
    button.classList.add('try-again');
    document.querySelector('.feedback').textContent = state.feedback;
    setTimeout(() => button.classList.remove('try-again'), 350);
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.screen === 'explore') renderExplore();
  if (button.dataset.screen === 'blend') renderBlend();
  if (button.dataset.screen === 'first') renderFirstSound();
  if (button.dataset.action === 'home') home();
  if (button.dataset.group) {
    state.group = button.dataset.group;
    state.selectedSound = soundsForGroup(state.group)[0].id;
    renderExplore();
  }
  if (button.dataset.soundSelect) {
    state.selectedSound = button.dataset.soundSelect;
    renderExplore();
    playSound(state.selectedSound, document.querySelector(`[data-sound-select="${state.selectedSound}"]`));
  }
  if (button.dataset.playSound) playSound(button.dataset.playSound, button);
  if (button.dataset.playWord) playWord(button.dataset.playWord);
  if (button.dataset.action === 'blend') playBlend();
  if (button.dataset.action === 'next-blend') {
    state.blendIndex = (state.blendIndex + 1) % BLENDS.length;
    localStorage.setItem('phonics-blend-index', state.blendIndex);
    renderBlend();
  }
  if (button.dataset.answer) chooseAnswer(button, button.dataset.answer);
  if (button.dataset.action === 'next-question') {
    state.questionIndex = (state.questionIndex + 1) % QUESTIONS.length;
    state.answered = false;
    state.feedback = '';
    localStorage.setItem('phonics-question-index', state.questionIndex);
    renderFirstSound();
  }
});

document.addEventListener('submit', event => {
  if (!event.target.matches('[data-word-lookup-form]')) return;
  event.preventDefault();
  const input = event.target.elements.word;
  const host = document.querySelector('#lookupCoach');
  if (!input.value.trim() || !host) return;
  phonicsCoach?.show(host, input.value.trim());
});

audioSourceSelect?.addEventListener('change', event => {
  stopAudio();
  applySoundSource(event.target.value);
});

document.addEventListener('keydown', event => {
  if (state.screen !== 'explore') return;
  const interactive = event.target.closest('button, a');
  const groupSounds = soundsForGroup(state.group);
  const index = groupSounds.findIndex(sound => sound.id === state.selectedSound);
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    state.selectedSound = groupSounds[(index + 1) % groupSounds.length].id;
    renderExplore();
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    state.selectedSound = groupSounds[(index - 1 + groupSounds.length) % groupSounds.length].id;
    renderExplore();
  } else if (event.key === ' ' && !interactive) {
    event.preventDefault();
    playSound(state.selectedSound);
  }
});

home();
