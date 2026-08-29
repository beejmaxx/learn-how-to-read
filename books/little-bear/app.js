const TOTAL_PAGES = 67;
const SOURCE_WIDTH = 584;
const SOURCE_HEIGHT = 754;
const chapters = [
  { title: 'Cover', page: 1 },
  { title: 'Contents', page: 9 },
  { title: 'What Will Little Bear Wear?', page: 13 },
  { title: 'Birthday Soup', page: 24 },
  { title: 'Little Bear Goes to the Moon', page: 38 },
  { title: "Little Bear’s Wish", page: 52 },
  { title: 'The End', page: 65 },
];

const previous = document.querySelector('#previousButton');
const next = document.querySelector('#nextButton');
const slider = document.querySelector('#pageSlider');
const counter = document.querySelector('#pageCount');
const chaptersButton = document.querySelector('#chaptersButton');
const chapterPanel = document.querySelector('#chapterPanel');
const chapterList = document.querySelector('#chapterList');
const closeChaptersButton = document.querySelector('#closeChaptersButton');
const backdrop = document.querySelector('#panelBackdrop');
const fullscreenButton = document.querySelector('#fullscreenButton');
const stage = document.querySelector('#pageStage');
const leftPage = document.querySelector('#leftPage');
const rightPage = document.querySelector('#rightPage');
const readButton = document.querySelector('#readButton');
const wordCoach = document.querySelector('#wordCoach');
const coachWord = document.querySelector('#coachWord');
const coachChunks = document.querySelector('#coachChunks');
const closeWordCoach = document.querySelector('#closeWordCoach');
const phoneLayout = matchMedia('(max-width: 650px)');

const pagePath = (page) => `pages/page-${String(page).padStart(3, '0')}.jpg`;
const requestedPage = Number(new URLSearchParams(location.search).get('page'));
let currentPage = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= TOTAL_PAGES
  ? requestedPage
  : Number(localStorage.getItem('little-bear-page')) || 1;
let wordData = { pages: {} };
let reading = false;
let readingRun = 0;

fetch('words.json?v=20260830-5', { cache: 'no-store' })
  .then((response) => response.ok ? response.json() : Promise.reject(new Error('OCR data unavailable')))
  .then((data) => {
    wordData = data;
    renderPages();
  })
  .catch(() => {
    readButton.hidden = true;
  });

function visiblePages() {
  if (phoneLayout.matches || currentPage === 1) return [currentPage];
  const left = currentPage % 2 === 0 ? currentPage : currentPage - 1;
  return [left, left + 1].filter((page) => page >= 1 && page <= TOTAL_PAGES);
}

function preload(page) {
  if (page < 1 || page > TOTAL_PAGES) return;
  const nearby = new Image();
  nearby.src = pagePath(page);
}

function cleanWord(text) {
  return text.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9'’-]+$/g, '');
}

function chunksFor(text) {
  const word = cleanWord(text).toLowerCase();
  if (!word) return [];
  const known = {
    bear: ['b', 'ear'], little: ['lit', 'tle'], mother: ['moth', 'er'], birthday: ['birth', 'day'],
    soup: ['s', 'oup'], moon: ['m', 'oon'], snow: ['sn', 'ow'], something: ['some', 'thing'],
    went: ['w', 'ent'], cold: ['c', 'old'], chair: ['ch', 'air'], wish: ['w', 'ish'],
  };
  if (known[word]) return known[word];
  const parts = word.match(/(?:tch|dge|igh|air|ear|tion|sh|ch|th|wh|ph|ck|ng|ee|ea|oo|ou|ow|ai|ay|oi|oy|[aeiouy]+|[^aeiouy]+)/g) || [word];
  return parts.length > 1 ? parts : [word];
}

function bestVoice() {
  const voices = speechSynthesis.getVoices();
  return voices.find((voice) => /Samantha|Ava|Serena|Karen|Moira|Google US English/i.test(voice.name))
    || voices.find((voice) => /^en[-_](US|GB|AU)/i.test(voice.lang))
    || voices.find((voice) => /^en/i.test(voice.lang));
}

function speakWord(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  reading = false;
  readButton.classList.remove('playing');
  readButton.textContent = '▶ Read pages';
  clearHighlights();
  const word = cleanWord(text);
  if (!word) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = .72;
  utterance.pitch = 1.08;
  utterance.voice = bestVoice();
  speechSynthesis.speak(utterance);
  coachWord.textContent = word;
  coachChunks.textContent = chunksFor(word).join(' · ');
  wordCoach.hidden = false;
}

function wordButton(word, page) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'word-hit';
  button.dataset.page = page;
  button.dataset.word = word.text;
  button.setAttribute('aria-label', `Hear the word ${cleanWord(word.text)}`);
  button.style.left = `${(word.x / SOURCE_WIDTH) * 100}%`;
  button.style.top = `${(word.y / SOURCE_HEIGHT) * 100}%`;
  button.style.width = `${Math.max((word.w / SOURCE_WIDTH) * 100, 1.2)}%`;
  button.style.height = `${Math.max((word.h / SOURCE_HEIGHT) * 100, 1.4)}%`;
  button.addEventListener('click', () => speakWord(word.text));
  return button;
}

function renderFrame(frame, page) {
  frame.hidden = false;
  frame.dataset.page = page;
  const image = frame.querySelector('img');
  const layer = frame.querySelector('.word-layer');
  image.src = pagePath(page);
  image.alt = `Little Bear, scanned page ${page} of ${TOTAL_PAGES}`;
  layer.replaceChildren(...(wordData.pages[String(page)] || []).map((word) => wordButton(word, page)));
}

function renderPages() {
  const pages = visiblePages();
  if (pages.length === 1) {
    leftPage.hidden = true;
    renderFrame(rightPage, pages[0]);
  } else {
    renderFrame(leftPage, pages[0]);
    renderFrame(rightPage, pages[1]);
  }
  counter.textContent = pages.length === 1 ? `${pages[0]} of ${TOTAL_PAGES}` : `${pages[0]}–${pages[1]} of ${TOTAL_PAGES}`;
  slider.value = currentPage;
  previous.disabled = currentPage === 1;
  next.disabled = phoneLayout.matches ? currentPage === TOTAL_PAGES : pages.includes(TOTAL_PAGES);
  readButton.disabled = !pages.some((page) => (wordData.pages[String(page)] || []).length);
  pages.forEach((page) => {
    preload(page - 2);
    preload(page + 2);
  });
}

function stopReading() {
  readingRun += 1;
  reading = false;
  speechSynthesis?.cancel();
  clearHighlights();
  readButton.classList.remove('playing');
  readButton.textContent = '▶ Read pages';
}

function showPage(page, updateHistory = true) {
  stopReading();
  currentPage = Math.max(1, Math.min(TOTAL_PAGES, page));
  localStorage.setItem('little-bear-page', String(currentPage));
  renderPages();
  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set('page', currentPage);
    history.replaceState({ page: currentPage }, '', url);
  }
}

function turn(direction) {
  if (phoneLayout.matches) showPage(currentPage + direction);
  else if (direction > 0) showPage(currentPage === 1 ? 2 : currentPage + 2);
  else showPage(currentPage <= 2 ? 1 : currentPage - 2);
}

function clearHighlights() {
  document.querySelectorAll('.word-hit.speaking').forEach((element) => element.classList.remove('speaking'));
}

function speakPageAt(index, pages, runId) {
  if (!reading || runId !== readingRun || index >= pages.length) {
    stopReading();
    return;
  }
  const page = pages[index];
  const words = wordData.pages[String(page)] || [];
  const spoken = words.map((word) => cleanWord(word.text)).filter(Boolean);
  if (!spoken.length) {
    speakPageAt(index + 1, pages, runId);
    return;
  }
  const text = spoken.join(' ');
  const starts = [];
  let cursor = 0;
  spoken.forEach((word) => {
    starts.push(cursor);
    cursor += word.length + 1;
  });
  const buttons = [...document.querySelectorAll(`.word-hit[data-page="${page}"]`)].filter((button) => cleanWord(button.dataset.word));
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = .78;
  utterance.pitch = 1.04;
  utterance.voice = bestVoice();
  utterance.onboundary = (event) => {
    if (event.name !== 'word') return;
    let wordIndex = starts.findLastIndex((start) => start <= event.charIndex);
    wordIndex = Math.max(0, wordIndex);
    clearHighlights();
    buttons[wordIndex]?.classList.add('speaking');
  };
  utterance.onend = () => speakPageAt(index + 1, pages, runId);
  utterance.onerror = stopReading;
  speechSynthesis.speak(utterance);
}

function toggleReading() {
  if (reading) {
    stopReading();
    return;
  }
  const pages = visiblePages().filter((page) => (wordData.pages[String(page)] || []).length);
  if (!pages.length) return;
  speechSynthesis.cancel();
  clearHighlights();
  wordCoach.hidden = true;
  reading = true;
  readingRun += 1;
  const runId = readingRun;
  readButton.classList.add('playing');
  readButton.textContent = '■ Stop';
  speakPageAt(0, pages, runId);
}

previous.addEventListener('click', () => turn(-1));
next.addEventListener('click', () => turn(1));
slider.addEventListener('input', () => showPage(Number(slider.value)));
readButton.addEventListener('click', toggleReading);
closeWordCoach.addEventListener('click', () => { wordCoach.hidden = true; });

function setChaptersOpen(isOpen) {
  chapterPanel.hidden = !isOpen;
  backdrop.hidden = !isOpen;
  chaptersButton.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) closeChaptersButton.focus();
}

chapters.forEach((chapter) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'chapter-card';
  button.innerHTML = `<img src="${pagePath(chapter.page)}" alt="" loading="lazy" /><span><strong>${chapter.title}</strong><span>Scan ${chapter.page}</span></span>`;
  button.addEventListener('click', () => {
    showPage(chapter.page);
    setChaptersOpen(false);
  });
  chapterList.append(button);
});

chaptersButton.addEventListener('click', () => setChaptersOpen(true));
closeChaptersButton.addEventListener('click', () => setChaptersOpen(false));
backdrop.addEventListener('click', () => setChaptersOpen(false));

fullscreenButton.addEventListener('click', async () => {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen();
});

document.addEventListener('fullscreenchange', () => {
  const isFullscreen = Boolean(document.fullscreenElement);
  fullscreenButton.textContent = isFullscreen ? '×' : '⛶';
  fullscreenButton.setAttribute('aria-label', isFullscreen ? 'Exit full screen' : 'Enter full screen');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown') turn(1);
  else if (event.key === 'ArrowLeft' || event.key === 'PageUp') turn(-1);
  else if (event.key === 'Home') showPage(1);
  else if (event.key === 'End') showPage(TOTAL_PAGES);
  else if (event.key === 'Escape' && !chapterPanel.hidden) setChaptersOpen(false);
});

let touchStartX = 0;
stage.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
stage.addEventListener('touchend', (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) >= 45) turn(distance < 0 ? 1 : -1);
}, { passive: true });

phoneLayout.addEventListener('change', renderPages);
speechSynthesis?.addEventListener?.('voiceschanged', bestVoice);
renderPages();
