const CONFIG = window.BOOK_CONFIG;
if (!CONFIG) throw new Error('Missing BOOK_CONFIG');
const TOTAL_PAGES = CONFIG.totalPages;
const SOURCE_WIDTH = CONFIG.width;
const SOURCE_HEIGHT = CONFIG.height;
const chapters = CONFIG.chapters;
const storageKey = (suffix) => `${CONFIG.id}-${suffix}`;
document.documentElement.style.setProperty('--page-ratio', `${SOURCE_WIDTH} / ${SOURCE_HEIGHT}`);
document.documentElement.style.setProperty('--page-width-factor', String(SOURCE_WIDTH / SOURCE_HEIGHT));

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
const autoSpeakToggle = document.querySelector('#autoSpeakToggle');
const phoneLayout = matchMedia('(max-width: 650px)');

const pagePath = (page) => `pages/page-${String(page).padStart(3, '0')}.jpg`;
const requestedPage = Number(new URLSearchParams(location.search).get('page'));
let currentPage = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= TOTAL_PAGES
  ? requestedPage
  : Number(localStorage.getItem(storageKey('page'))) || 1;
let wordData = { pages: {} };
let reading = false;
let readingRun = 0;
autoSpeakToggle.checked = localStorage.getItem(storageKey('auto-speak')) === 'true';

fetch(`words.json?v=${CONFIG.version}`, { cache: 'no-store' })
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
  const spokenWord = CONFIG.pronunciations?.[word] || (word === 'I' ? 'eye' : word);
  const utterance = new SpeechSynthesisUtterance(spokenWord);
  utterance.rate = .72;
  utterance.pitch = 1.08;
  utterance.voice = bestVoice();
  speechSynthesis.speak(utterance);
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
  button.addEventListener('click', () => {
    selectWord(button);
    speakWord(word.text);
  });
  return button;
}

function renderFrame(frame, page) {
  frame.hidden = false;
  frame.dataset.page = page;
  const image = frame.querySelector('img');
  const layer = frame.querySelector('.word-layer');
  image.src = pagePath(page);
  image.alt = `${CONFIG.title}, page ${page} of ${TOTAL_PAGES}`;
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

function visibleWordButtons() {
  return [...document.querySelectorAll('.page-frame:not([hidden]) .word-hit')]
    .filter((button) => cleanWord(button.dataset.word));
}

function selectWord(button, pronounce = false) {
  document.querySelectorAll('.word-hit.selected').forEach((word) => word.classList.remove('selected'));
  if (!button) return;
  button.classList.add('selected');
  button.focus({ preventScroll: true });
  if (pronounce) speakWord(button.dataset.word);
}

function moveWord(direction) {
  let words = visibleWordButtons();
  const selected = document.querySelector('.word-hit.selected');
  const selectedIndex = words.indexOf(selected);
  const targetIndex = selectedIndex < 0 ? (direction > 0 ? 0 : words.length - 1) : selectedIndex + direction;

  if (words[targetIndex]) {
    selectWord(words[targetIndex], autoSpeakToggle.checked);
    return;
  }

  for (let attempt = 0; attempt < TOTAL_PAGES; attempt += 1) {
    if ((direction > 0 && next.disabled) || (direction < 0 && previous.disabled)) return;
    turn(direction);
    words = visibleWordButtons();
    if (words.length) {
      selectWord(direction > 0 ? words[0] : words[words.length - 1], autoSpeakToggle.checked);
      return;
    }
  }
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
  localStorage.setItem(storageKey('page'), String(currentPage));
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
autoSpeakToggle.addEventListener('change', () => {
  localStorage.setItem(storageKey('auto-speak'), String(autoSpeakToggle.checked));
});

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
  if (event.target.matches('input[type="range"]')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    moveWord(1);
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    moveWord(-1);
  } else if (event.key === ' ') {
    if (event.target === autoSpeakToggle) return;
    const selected = document.querySelector('.word-hit.selected');
    if (!selected) return;
    event.preventDefault();
    speakWord(selected.dataset.word);
  } else if (event.key === 'PageDown') turn(1);
  else if (event.key === 'PageUp') turn(-1);
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
