const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CATEGORIES = [
  { key: 'name', label: 'Name', icon: '👤' },
  { key: 'place', label: 'Place', icon: '📍' },
  { key: 'thing', label: 'Things', icon: '🎒' },
  { key: 'animal', label: 'Animal', icon: '🐾' },
];

const WORD_BANK = {
  A: { name: 'Ava', place: 'Athens', thing: 'Anchor', animal: 'Ant' },
  B: { name: 'Ben', place: 'Brazil', thing: 'Book', animal: 'Bear' },
  C: { name: 'Chloe', place: 'Canada', thing: 'Candle', animal: 'Cat' },
  D: { name: 'David', place: 'Dublin', thing: 'Drum', animal: 'Dolphin' },
  E: { name: 'Ella', place: 'Egypt', thing: 'Envelope', animal: 'Eagle' },
  F: { name: 'Finn', place: 'France', thing: 'Feather', animal: 'Fox' },
  G: { name: 'Grace', place: 'Greece', thing: 'Guitar', animal: 'Giraffe' },
  H: { name: 'Hugo', place: 'Hawaii', thing: 'Hammer', animal: 'Horse' },
  I: { name: 'Iris', place: 'India', thing: 'Igloo', animal: 'Iguana' },
  J: { name: 'Jamie', place: 'Japan', thing: 'Jacket', animal: 'Jaguar' },
  K: { name: 'Kai', place: 'Kenya', thing: 'Kite', animal: 'Koala' },
  L: { name: 'Luna', place: 'London', thing: 'Lantern', animal: 'Lion' },
  M: { name: 'Maya', place: 'Mexico', thing: 'Mirror', animal: 'Monkey' },
  N: { name: 'Noah', place: 'Nairobi', thing: 'Notebook', animal: 'Newt' },
  O: { name: 'Owen', place: 'Oslo', thing: 'Oven', animal: 'Otter' },
  P: { name: 'Priya', place: 'Peru', thing: 'Pillow', animal: 'Penguin' },
  Q: { name: 'Quinn', place: 'Qatar', thing: 'Quilt', animal: 'Quail' },
  R: { name: 'Ravi', place: 'Rome', thing: 'Ruler', animal: 'Rabbit' },
  S: { name: 'Sofia', place: 'Spain', thing: 'Spoon', animal: 'Snake' },
  T: { name: 'Theo', place: 'Tokyo', thing: 'Telescope', animal: 'Tiger' },
  U: { name: 'Uma', place: 'Uganda', thing: 'Umbrella', animal: 'Uakari' },
  V: { name: 'Vera', place: 'Venice', thing: 'Vase', animal: 'Vulture' },
  W: { name: 'Will', place: 'Wales', thing: 'Watch', animal: 'Wolf' },
  X: { name: 'Xander', place: "Xi'an", thing: 'Xylophone', animal: 'Xerus' },
  Y: { name: 'Yasmin', place: 'Yemen', thing: 'Yo-yo', animal: 'Yak' },
  Z: { name: 'Zoe', place: 'Zambia', thing: 'Zipper', animal: 'Zebra' },
};

const elements = {
  bigLetter: document.querySelector('#big-letter'),
  letterNote: document.querySelector('#letter-note'),
  letterGrid: document.querySelector('#letter-grid'),
  pickRandom: document.querySelector('#pick-random'),
  roundState: document.querySelector('#round-state'),
  timerReadout: document.querySelector('#timer-readout'),
  timerDisplay: document.querySelector('#timer-display'),
  timerTrackFill: document.querySelector('#timer-track-fill'),
  durationSelect: document.querySelector('#duration-select'),
  customDurationWrap: document.querySelector('#custom-duration-wrap'),
  customDuration: document.querySelector('#custom-duration'),
  playToggle: document.querySelector('#play-toggle'),
  playLabel: document.querySelector('#play-label'),
  playIcon: document.querySelector('#play-icon'),
  resetRound: document.querySelector('#reset-round'),
  gameStatus: document.querySelector('#game-status'),
  sheetLetter: document.querySelector('#sheet-letter'),
  answerCount: document.querySelector('#answer-count'),
  answerProgressFill: document.querySelector('#answer-progress-fill'),
  answerIntro: document.querySelector('#answer-intro'),
  answerInputs: CATEGORIES.map(({ key }) => document.querySelector(`#answer-${key}`)),
  ideasToggle: document.querySelector('#ideas-toggle'),
  ideasToggleLetter: document.querySelector('#ideas-toggle-letter'),
  ideasPreview: document.querySelector('#ideas-preview'),
  wordBankDialog: document.querySelector('#word-bank-dialog'),
  openWordBank: document.querySelector('#open-word-bank'),
  closeWordBank: document.querySelector('#close-word-bank'),
  bankLetterGrid: document.querySelector('#bank-letter-grid'),
  bankBigLetter: document.querySelector('#bank-big-letter'),
  bankHeadingLetter: document.querySelector('#bank-heading-letter'),
  bankSamples: document.querySelector('#bank-samples'),
  useBankLetter: document.querySelector('#use-bank-letter'),
  useBankLetterLabel: document.querySelector('#use-bank-letter-label'),
};

const game = {
  selectedLetter: null,
  bankLetter: 'A',
  state: 'idle',
  duration: 60,
  remaining: 60,
  deadline: null,
  ticker: null,
};

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function getDurationFromControls() {
  if (elements.durationSelect.value !== 'custom') {
    return Number(elements.durationSelect.value) || 60;
  }

  const value = Number.parseInt(elements.customDuration.value, 10);
  if (!Number.isFinite(value)) return 75;
  return Math.min(600, Math.max(10, value));
}

function isRoundLocked() {
  return game.state === 'running' || game.state === 'paused';
}

function makeLetterButtons(container, className, onChoose) {
  container.replaceChildren();
  LETTERS.forEach((letter) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `letter-key ${className}`;
    button.textContent = letter;
    button.dataset.letter = letter;
    button.setAttribute('aria-label', `Choose letter ${letter}`);
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => onChoose(letter));
    container.append(button);
  });
}

function selectedAnswerCount() {
  return CATEGORIES.reduce((count, category) => {
    const input = document.querySelector(`#answer-${category.key}`);
    const answer = input.value.trim();
    const startsCorrectly = game.selectedLetter && answer && answer[0].toLocaleUpperCase() === game.selectedLetter;
    return count + (startsCorrectly ? 1 : 0);
  }, 0);
}

function updateAnswerFeedback() {
  CATEGORIES.forEach(({ key }) => {
    const input = document.querySelector(`#answer-${key}`);
    const row = input.closest('.answer-row');
    const feedback = document.querySelector(`#feedback-${key}`);
    const answer = input.value.trim();

    row.classList.remove('is-valid', 'is-invalid');
    if (!answer) {
      feedback.textContent = `Starts with ${game.selectedLetter || '—'}`;
      return;
    }

    if (game.selectedLetter && answer[0].toLocaleUpperCase() === game.selectedLetter) {
      row.classList.add('is-valid');
      feedback.textContent = 'Looks good';
    } else {
      row.classList.add('is-invalid');
      feedback.textContent = game.selectedLetter ? `Try a word starting with ${game.selectedLetter}` : 'Pick a letter first';
    }
  });

  const count = selectedAnswerCount();
  elements.answerCount.textContent = String(count);
  elements.answerProgressFill.style.width = `${(count / CATEGORIES.length) * 100}%`;

  if (game.state === 'idle' || game.state === 'ready') {
    elements.answerIntro.textContent = 'Start the timer to unlock your answer sheet.';
  } else if (game.state === 'running') {
    elements.answerIntro.textContent = count === CATEGORIES.length
      ? 'A full set! Give your answers one last check.'
      : `Find one for all four categories. Every answer starts with ${game.selectedLetter}.`;
  } else if (game.state === 'paused') {
    elements.answerIntro.textContent = `Round paused. You have ${count} of 4 valid answer${count === 1 ? '' : 's'} so far.`;
  } else {
    elements.answerIntro.textContent = `Time is up! You had ${count} of 4 valid answer${count === 1 ? '' : 's'} for ${game.selectedLetter}.`;
  }
}

function updateTimerDisplay() {
  elements.timerDisplay.textContent = formatTime(game.remaining);
  elements.timerDisplay.setAttribute('aria-label', `${formatTime(game.remaining)} remaining`);
  const progress = game.duration > 0 ? Math.max(0, Math.min(1, game.remaining / game.duration)) : 0;
  elements.timerTrackFill.style.width = `${progress * 100}%`;

  const urgent = game.state === 'running' && game.remaining <= 10;
  elements.timerReadout.classList.toggle('is-urgent', urgent);
  elements.timerTrackFill.classList.toggle('is-urgent', urgent);
}

function updateGameStatus() {
  const count = selectedAnswerCount();
  if (game.state === 'idle') {
    elements.gameStatus.textContent = 'Pick a letter, or let us choose one for you.';
  } else if (game.state === 'ready') {
    elements.gameStatus.textContent = `Letter ${game.selectedLetter} is ready. Start your timer when you are.`;
  } else if (game.state === 'running') {
    elements.gameStatus.textContent = count === 4
      ? 'Four for four! Keep checking your letter.'
      : `Clock is ticking—every answer starts with ${game.selectedLetter}.`;
  } else if (game.state === 'paused') {
    elements.gameStatus.textContent = 'Paused. Your answers are safe; resume when you are ready.';
  } else {
    elements.gameStatus.textContent = `Time is up! You got ${count} valid answer${count === 1 ? '' : 's'}.`;
  }
}

function updateGameUI() {
  const hasLetter = Boolean(game.selectedLetter);
  const locked = isRoundLocked();

  elements.bigLetter.textContent = game.selectedLetter || '?';
  elements.bigLetter.classList.toggle('is-picked', hasLetter);
  elements.letterNote.textContent = hasLetter ? `Keep every answer on ${game.selectedLetter}.` : 'Pick any letter to begin.';
  elements.sheetLetter.textContent = hasLetter ? `with ${game.selectedLetter}` : 'your letter?';

  document.querySelectorAll('.game-key').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.letter === game.selectedLetter));
    button.disabled = locked;
  });
  elements.pickRandom.disabled = locked;

  elements.roundState.dataset.state = game.state;
  if (game.state === 'running') {
    elements.roundState.textContent = 'IN PLAY';
    elements.playLabel.textContent = 'Pause round';
    elements.playIcon.textContent = 'Ⅱ';
  } else if (game.state === 'paused') {
    elements.roundState.textContent = 'PAUSED';
    elements.playLabel.textContent = 'Resume round';
    elements.playIcon.textContent = '→';
  } else if (game.state === 'finished') {
    elements.roundState.textContent = "TIME'S UP";
    elements.playLabel.textContent = 'Play again';
    elements.playIcon.textContent = '↻';
  } else {
    elements.roundState.textContent = 'READY';
    elements.playLabel.textContent = 'Start round';
    elements.playIcon.textContent = '→';
  }

  elements.durationSelect.disabled = locked;
  elements.customDuration.disabled = locked;
  elements.ideasToggle.disabled = !hasLetter;
  elements.ideasToggleLetter.textContent = hasLetter ? `See ${game.selectedLetter} ideas` : 'See ideas';

  elements.answerInputs.forEach((input) => {
    const shouldBeDisabled = !locked || game.state === 'finished' || !hasLetter;
    if (input.disabled !== shouldBeDisabled) input.disabled = shouldBeDisabled;
  });

  updateAnswerFeedback();
  updateTimerDisplay();
  updateGameStatus();
  updateBankAction();
}

function updateBankAction() {
  const disabled = isRoundLocked();
  elements.useBankLetter.disabled = disabled;
  elements.useBankLetter.title = disabled ? 'Pause or finish the round before changing letters.' : '';
}

function clearAnswers() {
  elements.answerInputs.forEach((input) => {
    input.value = '';
    input.closest('.answer-row').classList.remove('is-valid', 'is-invalid');
  });
  elements.ideasPreview.hidden = true;
  elements.ideasToggle.setAttribute('aria-expanded', 'false');
  elements.ideasPreview.replaceChildren();
  elements.ideasToggle.querySelector('.ideas-plus').textContent = '+';
}

function stopTicker() {
  if (game.ticker !== null) {
    window.clearInterval(game.ticker);
    game.ticker = null;
  }
}

function chooseLetter(letter) {
  if (isRoundLocked()) return;
  game.selectedLetter = letter;
  game.duration = getDurationFromControls();
  game.remaining = game.duration;
  game.state = 'ready';
  game.deadline = null;
  clearAnswers();
  updateGameUI();
}

function pickRandomLetter() {
  const available = LETTERS.filter((letter) => letter !== game.selectedLetter);
  const letter = available[Math.floor(Math.random() * available.length)];
  chooseLetter(letter);
}

function tick() {
  if (game.state !== 'running' || game.deadline === null) return;
  game.remaining = Math.max(0, Math.ceil((game.deadline - Date.now()) / 1000));
  updateTimerDisplay();

  if (game.remaining <= 0) {
    stopTicker();
    game.state = 'finished';
    game.deadline = null;
    game.remaining = 0;
    updateGameUI();
  }
}

function beginTicker() {
  stopTicker();
  game.deadline = Date.now() + game.remaining * 1000;
  game.ticker = window.setInterval(tick, 150);
  tick();
}

function startOrToggleRound() {
  if (game.state === 'running') {
    game.remaining = Math.max(0, Math.ceil((game.deadline - Date.now()) / 1000));
    stopTicker();
    game.deadline = null;
    game.state = 'paused';
    updateGameUI();
    return;
  }

  if (game.state === 'paused') {
    if (game.remaining <= 0) {
      game.state = 'finished';
      updateGameUI();
      return;
    }
    game.state = 'running';
    beginTicker();
    updateGameUI();
    return;
  }

  if (!game.selectedLetter) {
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    game.selectedLetter = letter;
  }

  game.duration = getDurationFromControls();
  game.remaining = game.duration;
  clearAnswers();
  game.state = 'running';
  beginTicker();
  updateGameUI();
  elements.answerInputs[0].focus();
}

function resetRound() {
  stopTicker();
  game.deadline = null;
  game.duration = getDurationFromControls();
  game.remaining = game.duration;
  game.state = game.selectedLetter ? 'ready' : 'idle';
  clearAnswers();
  updateGameUI();
}

function applyDurationChange() {
  if (isRoundLocked()) return;
  game.duration = getDurationFromControls();
  game.remaining = game.duration;
  if (game.state === 'finished') {
    game.state = game.selectedLetter ? 'ready' : 'idle';
    clearAnswers();
  }
  updateGameUI();
}

function renderIdeaPreview() {
  elements.ideasPreview.replaceChildren();
  if (!game.selectedLetter) return;

  CATEGORIES.forEach(({ key, label }) => {
    const chip = document.createElement('div');
    chip.className = 'idea-chip';
    const category = document.createElement('span');
    category.textContent = label;
    const idea = document.createElement('strong');
    idea.textContent = WORD_BANK[game.selectedLetter][key];
    chip.append(category, idea);
    elements.ideasPreview.append(chip);
  });
}

function updateBank(letter) {
  game.bankLetter = letter;
  elements.bankBigLetter.textContent = letter;
  elements.bankHeadingLetter.textContent = letter;
  elements.useBankLetterLabel.textContent = letter;
  elements.bankLetterGrid.querySelectorAll('.letter-key').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.letter === letter));
  });

  elements.bankSamples.replaceChildren();
  CATEGORIES.forEach(({ key, label, icon }) => {
    const row = document.createElement('div');
    row.className = 'bank-sample-row';
    const iconElement = document.createElement('span');
    iconElement.className = 'bank-sample-icon';
    iconElement.setAttribute('aria-hidden', 'true');
    iconElement.textContent = icon;
    const copy = document.createElement('div');
    copy.className = 'bank-sample-copy';
    const category = document.createElement('span');
    category.textContent = label;
    const answer = document.createElement('strong');
    answer.textContent = WORD_BANK[letter][key];
    copy.append(category, answer);
    row.append(iconElement, copy);
    elements.bankSamples.append(row);
  });

  updateBankAction();
}

function openWordBank() {
  const startingLetter = game.selectedLetter || game.bankLetter || 'A';
  updateBank(startingLetter);
  if (!elements.wordBankDialog.open) elements.wordBankDialog.showModal();
}

makeLetterButtons(elements.letterGrid, 'game-key', chooseLetter);
makeLetterButtons(elements.bankLetterGrid, 'bank-key', updateBank);
updateBank('A');
updateGameUI();

// Keep the answer sheet from submitting or refreshing the page.
document.querySelector('#answer-form').addEventListener('submit', (event) => event.preventDefault());

elements.pickRandom.addEventListener('click', pickRandomLetter);
elements.playToggle.addEventListener('click', startOrToggleRound);
elements.resetRound.addEventListener('click', resetRound);
elements.durationSelect.addEventListener('change', () => {
  elements.customDurationWrap.hidden = elements.durationSelect.value !== 'custom';
  applyDurationChange();
});
elements.customDuration.addEventListener('input', () => {
  if (elements.durationSelect.value === 'custom' && elements.customDuration.value !== '') applyDurationChange();
});
elements.customDuration.addEventListener('change', () => {
  const duration = getDurationFromControls();
  elements.customDuration.value = String(duration);
  applyDurationChange();
});

elements.answerInputs.forEach((input) => {
  input.addEventListener('input', () => {
    updateAnswerFeedback();
    updateGameStatus();
  });
});

elements.ideasToggle.addEventListener('click', () => {
  if (!game.selectedLetter) return;
  const isOpening = elements.ideasPreview.hidden;
  if (isOpening) renderIdeaPreview();
  elements.ideasPreview.hidden = !isOpening;
  elements.ideasToggle.setAttribute('aria-expanded', String(isOpening));
  elements.ideasToggle.querySelector('.ideas-plus').textContent = isOpening ? '−' : '+';
});

elements.openWordBank.addEventListener('click', openWordBank);
elements.closeWordBank.addEventListener('click', () => elements.wordBankDialog.close());
elements.wordBankDialog.addEventListener('click', (event) => {
  if (event.target === elements.wordBankDialog) elements.wordBankDialog.close();
});
elements.useBankLetter.addEventListener('click', () => {
  if (isRoundLocked()) return;
  chooseLetter(game.bankLetter);
  elements.wordBankDialog.close();
});
