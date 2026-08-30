(function setupPhonicsCoach(global) {
  function normalizeWord(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/’/g, "'")
      .replace(/^[^a-z]+|[^a-z']+$/g, '');
  }

  function makeElement(tag, className = '', text = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  class Coach {
    constructor({ root = './', speakWord = () => {}, onVisibility = () => {} } = {}) {
      this.root = new URL(root, document.baseURI);
      this.speakWord = speakWord;
      this.onVisibility = onVisibility;
      this.wordData = { sounds: {}, words: {} };
      this.wordShards = {};
      this.publicSounds = {};
      this.sources = {};
      this.activeSource = localStorage.getItem('phonics-audio-source') || '';
      this.audio = null;
      this.playRun = 0;
      this.showRun = 0;
      this.ready = this.load();
    }

    async fetchJson(path, fallback) {
      try {
        const response = await fetch(new URL(path, this.root), { cache: 'no-store' });
        return response.ok ? response.json() : fallback;
      } catch {
        return fallback;
      }
    }

    async load() {
      const [wordData, publicManifest, localManifest] = await Promise.all([
        this.fetchJson('assets/phonics/word-sounds.json', { sounds: {}, words: {} }),
        this.fetchJson('phonics/audio/manifest.json', { sounds: {} }),
        this.fetchJson('phonics/audio/local-manifest.json', {})
      ]);
      this.wordData = wordData;
      this.publicSounds = publicManifest.sounds || {};
      this.sources = localManifest.sources || {};
      const sourceIds = Object.keys(this.sources);
      if (!sourceIds.includes(this.activeSource)) {
        this.activeSource = localManifest.defaultSource || sourceIds[0] || '';
      }
      return this;
    }

    currentSounds() {
      return { ...this.publicSounds, ...(this.sources[this.activeSource]?.sounds || {}) };
    }

    async wordEntry(word) {
      if (this.wordData.words?.[word]) return this.wordData.words[word];
      const initial = word.charAt(0);
      if (!/^[a-z]$/.test(initial)) return null;
      if (!this.wordShards[initial]) {
        this.wordShards[initial] = this.fetchJson(`assets/phonics/words/${initial}.json`, {});
      }
      const shard = await this.wordShards[initial];
      return shard[word] || null;
    }

    audioUrl(soundId) {
      const path = this.currentSounds()[soundId];
      return path ? new URL(`phonics/${path}`, this.root).href : '';
    }

    stop() {
      this.playRun += 1;
      if (!this.audio) return;
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }

    playSound(soundId, button = null, runId = this.playRun) {
      return new Promise((resolve) => {
        const source = this.audioUrl(soundId);
        if (!source || runId !== this.playRun) {
          resolve(false);
          return;
        }
        if (this.audio) {
          this.audio.pause();
          this.audio.currentTime = 0;
        }
        const audio = new Audio(source);
        this.audio = audio;
        button?.classList.add('playing');
        const finish = (played) => {
          button?.classList.remove('playing');
          if (this.audio === audio) this.audio = null;
          resolve(played);
        };
        audio.addEventListener('ended', () => finish(true), { once: true });
        audio.addEventListener('error', () => finish(false), { once: true });
        audio.play().catch(() => finish(false));
      });
    }

    async playSequence(soundIds, buttons) {
      this.stop();
      const runId = this.playRun;
      for (let index = 0; index < soundIds.length; index += 1) {
        if (runId !== this.playRun) return;
        await this.playSound(soundIds[index], buttons[index], runId);
        if (runId !== this.playRun) return;
        await new Promise((resolve) => setTimeout(resolve, 85));
      }
    }

    hide(host) {
      this.showRun += 1;
      this.stop();
      host.hidden = true;
      host.replaceChildren();
      this.onVisibility(false);
    }

    async show(host, rawWord) {
      const showRun = ++this.showRun;
      host.hidden = false;
      host.replaceChildren(makeElement('div', 'phonics-coach-loading', 'Finding the sounds…'));
      this.onVisibility(true);
      await this.ready;
      if (showRun !== this.showRun) return;

      const word = normalizeWord(rawWord);
      const entry = await this.wordEntry(word);
      if (showRun !== this.showRun) return;
      const card = makeElement('div', 'phonics-coach-card');
      const head = makeElement('div', 'phonics-coach-head');
      head.append(makeElement('span', 'phonics-coach-kicker', 'Word helper'));

      const whole = makeElement('button', 'phonics-whole-word');
      whole.type = 'button';
      whole.setAttribute('aria-label', `Hear the word ${word}`);
      whole.textContent = `🔊 ${word || rawWord}`;
      whole.addEventListener('click', () => this.speakWord(rawWord));
      head.append(whole);

      const close = makeElement('button', 'phonics-coach-close', '×');
      close.type = 'button';
      close.setAttribute('aria-label', 'Close the word helper');
      close.addEventListener('click', () => this.hide(host));
      head.append(close);
      card.append(head);

      if (entry?.sounds?.length) {
        const lesson = makeElement('div', 'phonics-coach-lesson');
        const sounds = makeElement('div', 'phonics-sound-list');
        const soundButtons = entry.sounds.map((soundId) => {
          const meta = this.wordData.sounds?.[soundId] || { label: soundId, ipa: '' };
          const button = makeElement('button', 'phonics-sound-chip');
          button.type = 'button';
          button.disabled = !this.audioUrl(soundId);
          button.setAttribute('aria-label', `Hear ${meta.label}, ${meta.ipa}`);
          button.append(makeElement('strong', '', meta.label), makeElement('small', '', meta.ipa));
          button.addEventListener('click', () => {
            this.stop();
            this.playSound(soundId, button, this.playRun);
          });
          return button;
        });
        sounds.append(...soundButtons);

        const blend = makeElement('button', 'phonics-play-all', '▶ Sounds');
        blend.type = 'button';
        blend.disabled = soundButtons.every((button) => button.disabled);
        blend.addEventListener('click', () => this.playSequence(entry.sounds, soundButtons));
        sounds.append(blend);
        lesson.append(makeElement('span', 'phonics-coach-instruction', 'Tap each sound'), sounds);

        if (entry.chunks?.length) {
          const chunks = makeElement('div', 'phonics-spelling-chunks');
          chunks.append(makeElement('span', '', 'Spelling'));
          entry.chunks.forEach((chunk) => chunks.append(makeElement('b', '', chunk)));
          lesson.append(chunks);
        }
        card.append(lesson);
      } else {
        card.append(makeElement('p', 'phonics-tricky-word', 'This one is a tricky word—hear it as a whole.'));
      }

      if (Object.keys(this.sources).length > 1) {
        const sourceLabel = makeElement('label', 'phonics-source-picker');
        sourceLabel.append(makeElement('span', '', 'Sound set'));
        const select = document.createElement('select');
        select.setAttribute('aria-label', 'Choose a phonics sound set');
        Object.entries(this.sources).forEach(([id, source]) => {
          const option = document.createElement('option');
          option.value = id;
          option.textContent = source.label;
          option.selected = id === this.activeSource;
          select.append(option);
        });
        select.addEventListener('change', () => {
          this.stop();
          this.activeSource = select.value;
          localStorage.setItem('phonics-audio-source', this.activeSource);
          this.show(host, rawWord);
        });
        sourceLabel.append(select);
        card.append(sourceLabel);
      }

      host.replaceChildren(card);
    }
  }

  global.PhonicsCoach = {
    create(options) {
      return new Coach(options);
    }
  };
})(window);
