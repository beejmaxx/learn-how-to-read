const DEFAULT_WORDS = ['cat', 'dog', 'sun', 'hat', 'red', 'map'];
const CONTENT_VERSION = '20260830-4';
const WORD_INFO = {
  cat: { emoji: '🐈', first: 'c', rhyme: 'hat' },
  dog: { emoji: '🐕', first: 'd', rhyme: 'log' },
  sun: { emoji: '☀️', first: 's', rhyme: 'fun' },
  hat: { emoji: '🎩', first: 'h', rhyme: 'cat' },
  red: { emoji: '🔴', first: 'r', rhyme: 'bed' },
  map: { emoji: '🗺️', first: 'm', rhyme: 'cap' },
  pig: { emoji: '🐖', first: 'p', rhyme: 'wig' },
  bed: { emoji: '🛏️', first: 'b', rhyme: 'red' },
  fox: { emoji: '🦊', first: 'f', rhyme: 'box' },
  bug: { emoji: '🐞', first: 'b', rhyme: 'rug' },
  dad: { emoji: '🐻', first: 'd', rhyme: 'sad' },
  nap: { emoji: '😴', first: 'n', rhyme: 'cap' }
};

const [BOOKS, AUDIO_LIBRARY, WORD_TIMINGS] = await Promise.all([
  fetch(`stories.json?v=${CONTENT_VERSION}`, { cache: 'no-store' }).then(response => {
    if (!response.ok) throw new Error('Could not load the story library');
    return response.json();
  }),
  fetch(`assets/audio/manifest.json?v=${CONTENT_VERSION}`, { cache: 'no-store' }).then(response => response.ok ? response.json() : { audio: {} }),
  fetch(`assets/audio/timings.json?v=${CONTENT_VERSION}`, { cache: 'no-store' }).then(response => response.ok ? response.json() : { timings: {} }).catch(() => ({ timings: {} }))
]);

const PHONICS = {
  a: ['a'], an: ['a', 'n'], and: ['a', 'n', 'd'],
  cat: ['c', 'at'], dog: ['d', 'og'], sun: ['s', 'un'], hat: ['h', 'at'],
  red: ['r', 'ed'], map: ['m', 'ap'], pig: ['p', 'ig'], dig: ['d', 'ig'],
  bed: ['b', 'ed'], fox: ['f', 'ox'], bug: ['b', 'ug'], dad: ['d', 'ad'],
  nap: ['n', 'ap'], can: ['c', 'an'], big: ['b', 'ig'], hot: ['h', 'ot'],
  run: ['r', 'un'], fit: ['f', 'it'], sit: ['s', 'it'], pat: ['p', 'at'],
  log: ['l', 'og'], fun: ['f', 'un'], cap: ['c', 'ap'], rug: ['r', 'ug'],
  sad: ['s', 'ad'], box: ['b', 'ox'], hop: ['h', 'op'], bench: ['ben', 'ch'],
  duck: ['d', 'uck'], pond: ['p', 'ond'], tree: ['tr', 'ee'],
  much: ['mu', 'ch'], six: ['s', 'ix'], last: ['l', 'ast'],
  moon: ['m', 'oo', 'n'], net: ['n', 'et'], boot: ['b', 'oot'],
  cup: ['c', 'up'], sock: ['s', 'ock'], milk: ['m', 'ilk'], peep: ['p', 'eep']
};

const LIBRARY_BOOKS = BOOKS.slice(0, 2);
const FIND_SETS = {
  cat: ['cat', 'can', 'cap', 'hat'], dog: ['dog', 'dig', 'log', 'dot'],
  hat: ['hat', 'cat', 'hot', 'hit'], red: ['red', 'bed', 'run', 'rid'],
  duck: ['duck', 'luck', 'dock', 'dig'], tree: ['tree', 'three', 'free', 'see'],
  pond: ['pond', 'sand', 'pod', 'dog'], cap: ['cap', 'cat', 'map', 'cup'],
  cup: ['cup', 'cap', 'cat', 'up'], milk: ['milk', 'silk', 'mill', 'mink'],
  sock: ['sock', 'rock', 'sack', 'so'], run: ['run', 'sun', 'ran', 'rug'],
  peep: ['peep', 'deep', 'keep', 'pee']
};

const GAMES = [
  { id: 'find', name: 'Find the Word', icon: '👀', color: 'peach', note: 'Hear a word, then spot it.' },
  { id: 'build', name: 'Build a Word', icon: '🧩', color: 'sky', note: 'Put the sounds in order.' },
  { id: 'sound', name: 'First Sound', icon: '👂', color: 'butter', note: 'Match a picture to its first sound.' },
  { id: 'rhyme', name: 'Rhyme Time', icon: '🎵', color: 'mint', note: 'Find two words that sound alike.' },
  { id: 'story', name: 'Tiny Stories', icon: '📖', color: 'lilac', note: 'Choose the missing word in a little sentence.' }
];

const state = {
  screen: 'library',
  game: null,
  round: 0,
  rounds: 3,
  prompt: null,
  built: '',
  words: load('little-words', DEFAULT_WORDS),
  kept: load('little-kept', []),
  completed: load('little-books-done', []),
  book: null,
  page: 0,
  bookWords: null,
  findQueue: []
};

const app = document.querySelector('#app');
const dialog = document.querySelector('#grownup-dialog');
const wordList = document.querySelector('#word-list');
let playingAudio = null;
let highlightFrame = null;

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}

function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
function sample(items, count) { return shuffle(items).slice(0, count); }
function playableWords() {
  const source = state.bookWords || state.words;
  const known = source.filter(word => WORD_INFO[word]);
  return known.length >= 3 ? known : DEFAULT_WORDS;
}

function speak(text) {
  if (state.book?.narrated === false) return;
  const recorded = AUDIO_LIBRARY.audio[text.trim().toLowerCase()];
  if (recorded) {
    playRecorded(recorded);
    return;
  }
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices.find(voice => /Samantha|Ava|Serena|Karen|Daniel|Moira|Tessa/i.test(voice.name))
    || voices.find(voice => /^en[-_]/i.test(voice.lang))
    || null;
  utterance.rate = 0.92;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}

function clearWordHighlight() {
  cancelAnimationFrame(highlightFrame);
  highlightFrame = null;
  document.querySelectorAll('.read-word.is-speaking').forEach(word => {
    word.classList.remove('is-speaking');
    word.removeAttribute('aria-current');
  });
}

function stopPlayback() {
  window.speechSynthesis?.cancel();
  clearWordHighlight();
  if (playingAudio) {
    playingAudio.pause();
    playingAudio.currentTime = 0;
    playingAudio = null;
  }
}

function playRecorded(source, onFrame = null) {
  stopPlayback();
  playingAudio = new Audio(source);
  const audio = playingAudio;
  const tick = () => {
    if (playingAudio !== audio || audio.paused || audio.ended) return;
    onFrame?.(audio.currentTime);
    highlightFrame = requestAnimationFrame(tick);
  };
  audio.addEventListener('ended', clearWordHighlight, { once: true });
  audio.play().then(() => {
    if (onFrame) highlightFrame = requestAnimationFrame(tick);
  }).catch(() => {});
}

function readCurrentPage() {
  if (state.book?.narrated === false) return;
  const key = `story:${state.book.id}:${state.page}`;
  const recorded = AUDIO_LIBRARY.audio[key];
  const timings = WORD_TIMINGS.timings[key];
  if (recorded) playRecorded(recorded, currentTime => highlightSpokenWord(currentTime, timings));
  else speak(state.book.pages[state.page]);
}

function highlightSpokenWord(currentTime, timings = []) {
  let active = -1;
  for (let index = 0; index < timings.length; index += 1) {
    if (currentTime >= timings[index][0] && currentTime < timings[index][1]) {
      active = index;
      break;
    }
  }
  document.querySelectorAll('.read-word').forEach((word, index) => {
    const isSpeaking = index === active;
    word.classList.toggle('is-speaking', isSpeaking);
    if (isSpeaking) word.setAttribute('aria-current', 'true');
    else word.removeAttribute('aria-current');
  });
}

function library() {
  stopPlayback();
  state.screen = 'library';
  state.book = null;
  state.bookWords = null;
  app.innerHTML = `
    <section class="library-hero">
      <div>
        <p class="eyebrow">Our first read-along</p>
        <h1>Four little books.<br>Lots to explore.</h1>
        <p class="hero-copy">Read together, tap words to sound them out, then play with words from the story.</p>
        <span class="tiny-note"><span aria-hidden="true">☝️</span> Tap a book to begin</span>
      </div>
      <div class="hero-stack" aria-hidden="true">
        <img class="stack-cover" src="assets/pages/duck-cup/page-9.webp" alt="">
        <img class="stack-cover" src="assets/covers/duck-cup.webp" alt="">
        <img class="stack-cover" src="assets/covers/red-hat.webp" alt="">
      </div>
    </section>
    <section aria-labelledby="shelf-title">
      <div class="shelf-heading">
        <div><p class="eyebrow">Our little shelf</p><h2 id="shelf-title">Choose a story</h2></div>
        <p>${state.completed.filter(id => LIBRARY_BOOKS.some(book => book.id === id)).length} of ${LIBRARY_BOOKS.length + 2} explored</p>
      </div>
      <div class="book-grid">
        ${LIBRARY_BOOKS.map(book => `
          <button class="book-card" data-book="${book.id}">
            <span class="book-cover-wrap">
              <img class="book-cover" src="${book.cover}" alt="Cover of ${book.title}">
              <span class="book-level">${book.level}</span>
              ${state.completed.includes(book.id) ? '<span class="book-done">✓ read</span>' : ''}
            </span>
            <span class="book-info">
              <h3>${book.title}</h3>
              <p>Focus: ${book.focus}</p>
              <span class="word-chips">${book.words.map(word => `<span class="word-chip">${word}</span>`).join('')}</span>
            </span>
          </button>`).join('')}
        <a class="book-card" href="books/little-bear/">
          <span class="book-cover-wrap">
            <img class="book-cover" src="books/little-bear/pages/page-001.jpg" alt="Cover of Little Bear">
            <span class="book-level">Classic read-along</span>
          </span>
          <span class="book-info">
            <h3>Little Bear</h3>
            <p>Two-page book · tap every word</p>
            <span class="word-chips"><span class="word-chip">bear</span><span class="word-chip">moon</span><span class="word-chip">wish</span></span>
          </span>
        </a>
        <a class="book-card" href="books/frog-and-toad/">
          <span class="book-cover-wrap">
            <img class="book-cover" src="books/frog-and-toad/pages/page-001.jpg" alt="Cover of Frog and Toad Are Friends">
            <span class="book-level">Classic read-along</span>
          </span>
          <span class="book-info">
            <h3>Frog and Toad Are Friends</h3>
            <p>Five stories · tap every word</p>
            <span class="word-chips"><span class="word-chip">frog</span><span class="word-chip">toad</span><span class="word-chip">friend</span></span>
          </span>
        </a>
      </div>
    </section>`;
}

function openBook(id) {
  state.screen = 'reader';
  state.book = BOOKS.find(book => book.id === id);
  state.page = 0;
  state.bookWords = state.book.words;
  renderReader();
}

function wordButtons(sentence) {
  let wordIndex = 0;
  return sentence.replace(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g, spoken => {
    const button = `<button class="read-word" data-speak="${spoken.toLowerCase()}" data-word-index="${wordIndex}">${spoken}</button>`;
    wordIndex += 1;
    return button;
  });
}

function showWordCoach(word) {
  const coach = document.querySelector('#word-coach');
  if (!coach) return;
  const clean = word.toLowerCase().replace(/’/g, "'").replace(/[^a-z']/g, '');
  const chunks = PHONICS[clean];
  const wholeWord = state.book?.narrated === false
    ? `<span class="coach-whole coach-whole-muted">${word}</span>`
    : `<button class="coach-whole" data-coach-speak="${word}">🔊 ${word}</button>`;
  if (!chunks) {
    coach.innerHTML = `<span class="coach-label">Look at the whole word</span>${wholeWord}`;
  } else {
    coach.innerHTML = `
      <span class="coach-label">Sound it out</span>
      <span class="sound-chunks" aria-label="${chunks.join(', ')}">${chunks.map(chunk => `<span>${chunk}</span>`).join('<b aria-hidden="true">+</b>')}</span>
      <span class="coach-arrow" aria-hidden="true">→</span>
      ${wholeWord}`;
  }
  coach.hidden = false;
}

function renderReader() {
  const book = state.book;
  const isFinish = state.page === book.pages.length;
  const hasNarration = book.narrated !== false;
  const progress = isFinish ? 'Finished!' : `Page ${state.page + 1} of ${book.pages.length}`;
  app.innerHTML = `
    <section class="reader-wrap">
      <div class="reader-top">
        <button class="back-button" data-action="library" aria-label="Back to books">←</button>
        <div class="reader-title"><strong>${book.title}</strong><span>${progress}</span></div>
        ${isFinish || !hasNarration ? '<span></span>' : '<button class="sound-button" data-action="read-page" aria-label="Read this page aloud">🔊</button>'}
      </div>
      <div class="reader-card">
        <div class="reader-picture"><img src="${book.pictures?.[state.page] || book.cover}" alt="Illustration for page ${Math.min(state.page + 1, book.pages.length)} of ${book.title}"></div>
        <div class="reader-page ${isFinish ? 'reader-finish' : ''} ${!isFinish && book.pages[state.page].length > 115 ? 'reader-page-dense' : ''}">
          ${isFinish ? `
            <div class="finish-star" aria-hidden="true">⭐</div>
            <h2>You read a book!</h2>
            <p>Now those story words can become a little game.</p>
            <div class="finish-actions">
              <button class="button secondary" data-action="library">Back to the shelf</button>
              <button class="button primary" data-action="book-games">Play with these words</button>
            </div>` : `
            <p class="reader-sentence">${wordButtons(book.pages[state.page])}</p>
            <p class="reader-help">${hasNarration ? 'Tap any word to hear it and sound it out' : 'Tap any word to break it into sounds'}</p>
            <div class="word-coach" id="word-coach" hidden></div>
            <div class="reader-controls">
              <button class="page-button" data-action="prev-page" ${state.page === 0 ? 'disabled' : ''}>← Back</button>
              ${hasNarration ? '<button class="read-aloud" data-action="read-page">🔊 Read it</button>' : ''}
              <button class="page-button next" data-action="next-page">${state.page === book.pages.length - 1 ? 'Finish' : 'Next →'}</button>
            </div>`}
        </div>
      </div>
    </section>`;
}

function changePage(direction) {
  stopPlayback();
  state.page = Math.max(0, Math.min(state.book.pages.length, state.page + direction));
  if (state.page === state.book.pages.length && !state.completed.includes(state.book.id)) {
    state.completed.push(state.book.id);
    save('little-books-done', state.completed);
    speak('You read a book!');
  }
  renderReader();
}

function gamesHome() {
  state.screen = 'games';
  state.game = null;
  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">Pick one and play</p>
      <h1>Let’s play<br>with words!</h1>
      <p class="hero-copy">Five tiny games for curious new readers. There are no timers and trying again is always okay.</p>
      <span class="tiny-note"><span aria-hidden="true">🔊</span> Games can read the instructions aloud</span>
    </section>
    <section class="game-grid" aria-label="Reading games">
      ${GAMES.map(game => `
        <button class="game-card ${game.color}" data-game="${game.id}">
          ${state.kept.includes(game.id) ? '<span class="kept-badge">♥ kept</span>' : ''}
          <span class="game-icon" aria-hidden="true">${game.icon}</span>
          <h2>${game.name}</h2>
          <p>${game.note}</p>
          <span class="card-arrow" aria-hidden="true">→</span>
        </button>`).join('')}
    </section>`;
}

function startGame(id) {
  state.screen = 'play';
  state.game = id;
  state.round = 0;
  state.rounds = id === 'find' ? 8 : 3;
  if (id === 'find') state.findQueue = shuffle(state.book?.findWords || Object.keys(FIND_SETS));
  newRound();
}

function makePrompt() {
  const words = playableWords();
  const answer = sample(words, 1)[0];
  const info = WORD_INFO[answer];
  if (state.game === 'find') {
    const findAnswer = state.findQueue[state.round % state.findQueue.length] || answer;
    const choiceCount = state.round < 2 ? 3 : 4;
    const choices = (FIND_SETS[findAnswer] || [findAnswer, ...words.filter(word => word !== findAnswer)]).slice(0, choiceCount);
    return { answer: findAnswer, choices: shuffle(choices), spoken: `Can you find the word, ${findAnswer}?` };
  }
  if (state.game === 'build') {
    return { answer, choices: shuffle(answer.split('')), spoken: `Let's build the word, ${answer}. Tap the letters in order.` };
  }
  if (state.game === 'sound') {
    const letters = shuffle([info.first, ...sample('b c d f h m p r s t'.split(' ').filter(l => l !== info.first), 2)]);
    return { answer: info.first, word: answer, emoji: info.emoji, choices: letters, spoken: `${answer}. What sound does ${answer} start with?` };
  }
  if (state.game === 'rhyme') {
    const wrong = sample(['top', 'fin', 'mug', 'jet', 'sit'].filter(w => w !== info.rhyme), 2);
    return { answer: info.rhyme, word: answer, choices: shuffle([info.rhyme, ...wrong]), spoken: `Which word rhymes with ${answer}?` };
  }
  const stories = {
    cat: ['The ___ can nap.', 'cat'], dog: ['The ___ can run.', 'dog'], sun: ['The ___ is hot.', 'sun'],
    hat: ['I put on my ___.', 'hat'], red: ['The dot is ___.', 'red'], map: ['We look at the ___.', 'map'],
    pig: ['The ___ is pink.', 'pig'], bed: ['I sleep in a ___.', 'bed'], fox: ['The ___ can hop.', 'fox'],
    bug: ['A ___ is on the rug.', 'bug'], dad: ['My ___ can nap.', 'dad'], nap: ['It is time for a ___.', 'nap']
  };
  const others = sample(words.filter(word => word !== answer), 2);
  return { answer, sentence: stories[answer][0], choices: shuffle([answer, ...others]), spoken: `${stories[answer][0].replace('___', 'blank')} Which word belongs in the blank?` };
}

function newRound() {
  state.built = '';
  state.prompt = makePrompt();
  renderGame();
  setTimeout(() => speak(state.prompt.spoken), 250);
}

function gameTitle() { return GAMES.find(game => game.id === state.game).name; }

function renderGame() {
  const p = state.prompt;
  const dots = Array.from({ length: state.rounds }, (_, i) => `<span class="round-dot ${i < state.round ? 'done' : ''}"></span>`).join('');
  let content = '';

  if (state.game === 'find') content = `
    <p class="play-kicker">Word ${state.round + 1} of ${state.rounds} · listen, then look</p>
    <div class="prompt">Can you find “${p.answer}”?</div>
    ${choices(p.choices)}`;

  if (state.game === 'build') content = `
    <p class="play-kicker">Tap the letters in order</p>
    <div class="prompt">Build “${p.answer}”</div>
    <div class="built-word">${p.answer.split('').map((_, i) => `<span class="built-slot">${state.built[i] || ''}</span>`).join('')}</div>
    <div class="choices letter-choices">${p.choices.map((letter, i) => `<button class="choice" data-letter="${letter}" data-index="${i}">${letter}</button>`).join('')}</div>`;

  if (state.game === 'sound') content = `
    <div class="big-emoji" aria-hidden="true">${p.emoji}</div>
    <p class="play-kicker">${p.word}</p>
    <div class="prompt">What sound comes first?</div>
    ${choices(p.choices, 'letter-choices')}`;

  if (state.game === 'rhyme') content = `
    <p class="play-kicker">Listen for the matching ending</p>
    <div class="prompt">What rhymes with “${p.word}”?</div>
    ${choices(p.choices)}`;

  if (state.game === 'story') content = `
    <p class="play-kicker">Choose the missing word</p>
    <div class="sentence">${p.sentence.replace('___', '<span class="blank">___</span>')}</div>
    ${choices(p.choices)}`;

  app.innerHTML = `
    <section class="play-wrap">
      <div class="play-header">
        <button class="back-button" data-action="games">← Games</button>
        <div class="round-dots" aria-label="Round ${state.round + 1} of ${state.rounds}">${dots}</div>
        <button class="sound-button" data-action="repeat" aria-label="Repeat the instruction">🔊</button>
      </div>
      <div class="play-card">
        <p class="eyebrow">${gameTitle()}</p>
        ${content}
        <div class="feedback" role="status"></div>
      </div>
    </section>`;
}

function choices(items, extra = '') {
  return `<div class="choices ${extra}">${items.map(item => `<button class="choice" data-answer="${item}">${item}</button>`).join('')}</div>`;
}

function answer(button, value) {
  if (value === state.prompt.answer) {
    button.classList.add('correct');
    document.querySelector('.feedback').textContent = sample(['You found it!', 'Nice looking!', 'That’s it!', 'Great trying!'], 1)[0];
    speak(`${value}. You found it!`);
    setTimeout(next, 850);
  } else {
    button.classList.remove('try-again');
    void button.offsetWidth;
    button.classList.add('try-again');
    document.querySelector('.feedback').textContent = 'Good try. Have another look.';
    speak('Good try. Have another look.');
  }
}

function addLetter(button, letter) {
  const expected = state.prompt.answer[state.built.length];
  if (letter === expected) {
    state.built += letter;
    button.disabled = true;
    button.classList.add('correct');
    speak(letter);
    if (state.built === state.prompt.answer) {
      document.querySelector('.feedback').textContent = `You built ${state.prompt.answer}!`;
      speak(`You built ${state.prompt.answer}!`);
      setTimeout(next, 850);
    } else renderBuiltSlots();
  } else {
    button.classList.add('try-again');
    document.querySelector('.feedback').textContent = `Listen for ${expected}.`;
    speak(`Listen for ${expected}.`);
  }
}

function renderBuiltSlots() {
  document.querySelectorAll('.built-slot').forEach((slot, i) => { slot.textContent = state.built[i] || ''; });
}

function next() {
  state.round += 1;
  if (state.round >= state.rounds) finish(); else newRound();
}

function finish() {
  const kept = state.kept.includes(state.game);
  app.innerHTML = `
    <section class="play-wrap">
      <div class="play-card">
        <div class="finish-star" aria-hidden="true">⭐</div>
        <p class="eyebrow">All done</p>
        <h1 class="prompt">Lovely playing!</h1>
        <p class="finish-copy">That was a tiny taste of <strong>${gameTitle()}</strong>. You can keep it as a favorite or try a different game.</p>
        <div class="finish-actions">
          <button class="button secondary" data-action="games">Try another game</button>
          <button class="button primary keep ${kept ? 'active' : ''}" data-action="keep">${kept ? '♥ Game kept' : '♡ Keep this game'}</button>
        </div>
      </div>
    </section>`;
  speak('Lovely playing!');
}

function toggleKeep(button) {
  const index = state.kept.indexOf(state.game);
  if (index >= 0) state.kept.splice(index, 1); else state.kept.push(state.game);
  save('little-kept', state.kept);
  button.classList.toggle('active');
  button.textContent = state.kept.includes(state.game) ? '♥ Game kept' : '♡ Keep this game';
}

document.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.game) startGame(target.dataset.game);
  if (target.dataset.book) openBook(target.dataset.book);
  if (target.dataset.speak) {
    showWordCoach(target.dataset.speak);
    if (state.book?.narrated !== false) speak(target.dataset.speak);
  }
  if (target.dataset.coachSpeak) speak(target.dataset.coachSpeak);
  if (target.dataset.action === 'library') library();
  if (target.dataset.action === 'games') { state.bookWords = null; gamesHome(); }
  if (target.dataset.action === 'repeat') speak(state.prompt.spoken);
  if (target.dataset.action === 'read-page') readCurrentPage();
  if (target.dataset.action === 'next-page') changePage(1);
  if (target.dataset.action === 'prev-page') changePage(-1);
  if (target.dataset.action === 'book-games') gamesHome();
  if (target.dataset.action === 'grownups') {
    wordList.value = state.words.join(', ');
    dialog.showModal();
  }
  if (target.dataset.action === 'keep') toggleKeep(target);
  if (target.dataset.answer) answer(target, target.dataset.answer);
  if (target.dataset.letter) addLetter(target, target.dataset.letter);
});

document.querySelector('#save-words').addEventListener('click', event => {
  event.preventDefault();
  const words = wordList.value.toLowerCase().split(',').map(word => word.trim()).filter(Boolean).slice(0, 12);
  state.words = words.length ? words : DEFAULT_WORDS;
  save('little-words', state.words);
  dialog.close();
});

library();
