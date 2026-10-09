const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const PREFERENCES_KEY = 'npat.preferences.v2';
const DIFFICULTIES = ['easy', 'tricky', 'surprise'];
const REGIONS = ['worldwide', 'Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania'];
const MAX_CATEGORIES = 8;
const MAX_TEAMS = 6;

const DEFAULT_CATEGORIES = [
  { key: 'name', label: 'Name', icon: '👤', hint: "A person's name" },
  { key: 'place', label: 'Place', icon: '📍', hint: 'City, country, landmark, or more' },
  { key: 'thing', label: 'Things', icon: '🎒', hint: 'An object or item' },
  { key: 'animal', label: 'Animal', icon: '🐾', hint: 'Wild or wonderful' },
];

function readPreferences() {
  try {
    return JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function normalizeCategories(value) {
  if (!Array.isArray(value) || !value.length) return DEFAULT_CATEGORIES.map((category) => ({ ...category }));
  const seen = new Set();
  const categories = value.slice(0, MAX_CATEGORIES).map((item, index) => {
    const rawKey = typeof item?.key === 'string' ? item.key : `custom-${index + 1}`;
    const isBuiltInKey = DEFAULT_CATEGORIES.some((category) => category.key === rawKey);
    let key = isBuiltInKey || /^custom-[a-z0-9-]{1,30}$/i.test(rawKey) ? rawKey : `custom-${index + 1}`;
    if (seen.has(key)) key = `custom-${index + 1}`;
    let suffix = 2;
    while (seen.has(key)) key = `custom-${index + 1}-${suffix++}`;
    seen.add(key);
    const defaultCategory = DEFAULT_CATEGORIES.find((category) => category.key === key);
    const label = String(item?.label || defaultCategory?.label || `Category ${index + 1}`).trim().slice(0, 28);
    return {
      key,
      label: label || `Category ${index + 1}`,
      icon: defaultCategory?.icon || '✨',
      hint: defaultCategory?.hint || 'Your own category',
    };
  });
  return categories.length ? categories : DEFAULT_CATEGORIES.map((category) => ({ ...category }));
}

function normalizeTeamNames(value) {
  const source = Array.isArray(value) ? value.slice(0, MAX_TEAMS) : [];
  while (source.length < 2) source.push(`Team ${source.length + 1}`);
  const names = [];
  const used = new Set();
  source.forEach((value, index) => {
    const proposed = String(value || '').trim().slice(0, 24) || `Team ${index + 1}`;
    let name = proposed;
    let suffix = 2;
    while (used.has(name.toLocaleLowerCase())) name = `${proposed} ${suffix++}`;
    used.add(name.toLocaleLowerCase());
    names.push(name);
  });
  return names;
}

function normalizeDuration(value) {
  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) ? Math.min(600, Math.max(10, seconds)) : 60;
}

function normalizeFavorites(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(normalizeDuration))].slice(0, 8);
}

function normalizeSavedIdeas(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).filter((idea) => (
    idea
    && LETTERS.includes(idea.letter)
    && typeof idea.word === 'string'
    && typeof idea.categoryKey === 'string'
  )).map((idea) => ({
    letter: idea.letter,
    categoryKey: idea.categoryKey.slice(0, 32),
    categoryLabel: String(idea.categoryLabel || idea.categoryKey).slice(0, 28),
    word: idea.word.slice(0, 80),
  }));
}

const initialPreferences = readPreferences();
let CATEGORIES = normalizeCategories(initialPreferences.categories);

const REGIONAL_IDEAS = {
  Asia: {
    name: ['Aarav', 'Aisha', 'Ananya', 'Arjun', 'Bao', 'Chandra', 'Devi', 'Farah', 'Haruto', 'Hiro', 'Indira', 'Jaya', 'Kenji', 'Lien', 'Meilin', 'Nikhil', 'Priya', 'Rina', 'Sora', 'Tenzin', 'Uma', 'Vivek', 'Wei', 'Xia', 'Yuki', 'Zain'],
    place: ['Ahmedabad', 'Amritsar', 'Bangkok', 'Beijing', 'Busan', 'Chennai', 'Delhi', 'Dhaka', 'Hanoi', 'Hong Kong', 'Islamabad', 'Jakarta', 'Kathmandu', 'Kuala Lumpur', 'Lahore', 'Manila', 'Mumbai', 'Osaka', 'Pune', 'Seoul', 'Tokyo', 'Ulaanbaatar', 'Vientiane', "Xi'an", 'Yangon'],
  },
  Africa: {
    name: ['Abena', 'Amina', 'Amara', 'Binta', 'Chidi', 'Dalia', 'Femi', 'Favour', 'Halima', 'Ife', 'Jamal', 'Kofi', 'Lindiwe', 'Mosi', 'Nala', 'Nia', 'Osei', 'Sade', 'Tandi', 'Zola'],
    place: ['Abuja', 'Accra', 'Addis Ababa', 'Bamako', 'Cairo', 'Dakar', 'Entebbe', 'Freetown', 'Gaborone', 'Harare', 'Ibadan', 'Johannesburg', 'Kigali', 'Lagos', 'Maputo', 'Nairobi', 'Ouagadougou', 'Pretoria', 'Rabat', 'Tunis', 'Windhoek', 'Zanzibar'],
  },
  Europe: {
    name: ['Alice', 'Amelie', 'Bruno', 'Clara', 'Daniel', 'Elena', 'Felix', 'Greta', 'Hugo', 'Ingrid', 'Jules', 'Katja', 'Luca', 'Marta', 'Nina', 'Oscar', 'Pierre', 'Sofia', 'Theo', 'Ursula', 'Viktor', 'Wolfgang', 'Xenia', 'Yvonne', 'Zoe'],
    place: ['Amsterdam', 'Athens', 'Berlin', 'Brussels', 'Copenhagen', 'Dublin', 'Edinburgh', 'Florence', 'Geneva', 'Helsinki', 'Istanbul', 'Lisbon', 'Madrid', 'Naples', 'Oslo', 'Paris', 'Rome', 'Stockholm', 'Tallinn', 'Utrecht', 'Vienna', 'Warsaw', 'Zagreb'],
  },
  'North America': {
    name: ['Ava', 'Benjamin', 'Chloe', 'Diego', 'Ethan', 'Grace', 'Hazel', 'Isaac', 'Jordan', 'Kevin', 'Liam', 'Maya', 'Noah', 'Olivia', 'Quinn', 'Riley', 'Sofia', 'Talia', 'Wyatt', 'Xavier', 'Yara', 'Zoe'],
    place: ['Austin', 'Boston', 'Chicago', 'Denver', 'Edmonton', 'Fresno', 'Guadalajara', 'Houston', 'Indianapolis', 'Jackson', 'Kansas City', 'Los Angeles', 'Miami', 'Nashville', 'Ottawa', 'Phoenix', 'Quebec City', 'Raleigh', 'Seattle', 'Toronto', 'Vancouver', 'Winnipeg', 'Yellowknife'],
  },
  'South America': {
    name: ['Ana', 'Beatriz', 'Camila', 'Diego', 'Esteban', 'Fernanda', 'Gabriela', 'Helena', 'Ines', 'Joao', 'Kiara', 'Lucia', 'Mateo', 'Nicolas', 'Otavio', 'Pablo', 'Rafael', 'Sofia', 'Talia', 'Valentina', 'Xiomara', 'Yasmin', 'Zoe'],
    place: ['Asuncion', 'Bogota', 'Caracas', 'Cordoba', 'Florianopolis', 'Guayaquil', 'Iquitos', 'La Paz', 'Montevideo', 'Natal', 'Olinda', 'Paramaribo', 'Quito', 'Rio de Janeiro', 'Santiago', 'Ushuaia', 'Valparaiso'],
  },
  Oceania: {
    name: ['Anika', 'Aroha', 'Bindi', 'Cora', 'Eli', 'Fia', 'Hemi', 'Iona', 'Jono', 'Kiri', 'Leilani', 'Moana', 'Niko', 'Ori', 'Pania', 'Quinn', 'Rangi', 'Sione', 'Tane', 'Whetu', 'Yara', 'Zane'],
    place: ['Auckland', 'Brisbane', 'Cairns', 'Darwin', 'Efate', 'Fiji', 'Gold Coast', 'Hobart', 'Invercargill', 'Jervis Bay', 'Kiribati', 'Lord Howe Island', 'Melbourne', 'Nadi', 'Oceania', 'Papeete', 'Queenstown', 'Rarotonga', 'Sydney', 'Townsville', 'Vanuatu', 'Wellington', 'Yasawa'],
  },
};

// Curated examples for every letter, including multiple options for tricky letters.
const WORD_BANK = {
  A: {
    name: ['Ava', 'Amelia', 'Aaron', 'Alice'],
    place: ['Athens', 'Argentina', 'Auckland', 'Alaska'],
    thing: ['Anchor', 'Apron', 'Album', 'Axe'],
    animal: ['Ant', 'Alligator', 'Alpaca', 'Armadillo'],
  },
  B: {
    name: ['Ben', 'Bella', 'Benjamin', 'Bailey'],
    place: ['Brazil', 'Berlin', 'Boston', 'Bali'],
    thing: ['Book', 'Basket', 'Button', 'Backpack'],
    animal: ['Bear', 'Beaver', 'Badger', 'Butterfly'],
  },
  C: {
    name: ['Chloe', 'Caleb', 'Clara', 'Cameron'],
    place: ['Canada', 'Cairo', 'Chile', 'Chicago'],
    thing: ['Candle', 'Camera', 'Cup', 'Compass'],
    animal: ['Cat', 'Camel', 'Cheetah', 'Crocodile'],
  },
  D: {
    name: ['David', 'Diana', 'Daniel', 'Daisy'],
    place: ['Dublin', 'Denmark', 'Delhi', 'Denver'],
    thing: ['Drum', 'Desk', 'Door', 'Dice'],
    animal: ['Dolphin', 'Deer', 'Donkey', 'Duck'],
  },
  E: {
    name: ['Ella', 'Ethan', 'Emma', 'Elias'],
    place: ['Egypt', 'Edinburgh', 'Ecuador', 'Estonia'],
    thing: ['Envelope', 'Eraser', 'Earring', 'Easel'],
    animal: ['Eagle', 'Elephant', 'Eel', 'Emu'],
  },
  F: {
    name: ['Finn', 'Fiona', 'Felix', 'Fatima'],
    place: ['France', 'Fiji', 'Florence', 'Finland'],
    thing: ['Feather', 'Fork', 'Flashlight', 'Flag'],
    animal: ['Fox', 'Frog', 'Falcon', 'Flamingo'],
  },
  G: {
    name: ['Grace', 'Gabriel', 'George', 'Gemma'],
    place: ['Greece', 'Ghana', 'Geneva', 'Guatemala'],
    thing: ['Guitar', 'Glass', 'Globe', 'Goggles'],
    animal: ['Giraffe', 'Goat', 'Goose', 'Gorilla'],
  },
  H: {
    name: ['Hugo', 'Hannah', 'Henry', 'Hazel'],
    place: ['Hawaii', 'Haiti', 'Helsinki', 'Honduras'],
    thing: ['Hammer', 'Hat', 'Helmet', 'Hanger'],
    animal: ['Horse', 'Hippo', 'Hedgehog', 'Hamster'],
  },
  I: {
    name: ['Iris', 'Isaac', 'Isabel', 'Imran'],
    place: ['India', 'Iceland', 'Istanbul', 'Ireland'],
    thing: ['Igloo', 'Inkpot', 'Iron', 'Instrument'],
    animal: ['Iguana', 'Ibex', 'Impala', 'Inchworm'],
  },
  J: {
    name: ['Jamie', 'Julia', 'Jordan', 'Jasper'],
    place: ['Japan', 'Jamaica', 'Jakarta', 'Johannesburg'],
    thing: ['Jacket', 'Jar', 'Jigsaw', 'Joystick'],
    animal: ['Jaguar', 'Jellyfish', 'Jackal', 'Jay'],
  },
  K: {
    name: ['Kai', 'Keira', 'Kevin', 'Kiran'],
    place: ['Kenya', 'Kyoto', 'Karachi', 'Kansas'],
    thing: ['Kite', 'Key', 'Kettle', 'Keyboard'],
    animal: ['Koala', 'Kangaroo', 'Kudu', 'Kingfisher'],
  },
  L: {
    name: ['Luna', 'Leo', 'Layla', 'Liam'],
    place: ['London', 'Lebanon', 'Lisbon', 'Los Angeles'],
    thing: ['Lantern', 'Ladder', 'Lock', 'Lunchbox'],
    animal: ['Lion', 'Lemur', 'Leopard', 'Llama'],
  },
  M: {
    name: ['Maya', 'Mateo', 'Mia', 'Marcus'],
    place: ['Mexico', 'Madrid', 'Mumbai', 'Morocco'],
    thing: ['Mirror', 'Mug', 'Map', 'Microphone'],
    animal: ['Monkey', 'Moose', 'Meerkat', 'Macaw'],
  },
  N: {
    name: ['Noah', 'Nadia', 'Nina', 'Nathan'],
    place: ['Nairobi', 'Norway', 'Naples', 'Nepal'],
    thing: ['Notebook', 'Necklace', 'Needle', 'Napkin'],
    animal: ['Newt', 'Narwhal', 'Nightingale', 'Numbat'],
  },
  O: {
    name: ['Owen', 'Olivia', 'Omar', 'Opal'],
    place: ['Oslo', 'Oman', 'Osaka', 'Ottawa'],
    thing: ['Oven', 'Ornament', 'Oar', 'Oilcan'],
    animal: ['Otter', 'Owl', 'Octopus', 'Ocelot'],
  },
  P: {
    name: ['Priya', 'Pablo', 'Penelope', 'Peter'],
    place: ['Peru', 'Paris', 'Portugal', 'Prague'],
    thing: ['Pillow', 'Pencil', 'Plate', 'Paintbrush'],
    animal: ['Penguin', 'Panda', 'Parrot', 'Panther'],
  },
  Q: {
    name: ['Quinn', 'Quentin', 'Quincy', 'Queenie', 'Quiana', 'Qasim'],
    place: ['Qatar', 'Quito', 'Quebec', 'Queensland', 'Qingdao', 'Quanzhou'],
    thing: ['Quilt', 'Quill', 'Quiver', 'Quadcopter', 'Quartz watch', 'Q-tip'],
    animal: ['Quail', 'Quokka', 'Quoll', 'Quetzal', 'Queen snake', 'Quagga'],
  },
  R: {
    name: ['Ravi', 'Rosa', 'Ruby', 'Ryan'],
    place: ['Rome', 'Rwanda', 'Rio de Janeiro', 'Rotterdam'],
    thing: ['Ruler', 'Radio', 'Rope', 'Rucksack'],
    animal: ['Rabbit', 'Raccoon', 'Rhino', 'Robin'],
  },
  S: {
    name: ['Sofia', 'Sam', 'Sara', 'Sebastian'],
    place: ['Spain', 'Seoul', 'Sweden', 'Sydney'],
    thing: ['Spoon', 'Scissors', 'Suitcase', 'Soap'],
    animal: ['Snake', 'Sheep', 'Seal', 'Squirrel'],
  },
  T: {
    name: ['Theo', 'Talia', 'Thomas', 'Tara'],
    place: ['Tokyo', 'Thailand', 'Toronto', 'Tunisia'],
    thing: ['Telescope', 'Towel', 'Teapot', 'Toothbrush'],
    animal: ['Tiger', 'Turtle', 'Toucan', 'Tapir'],
  },
  U: {
    name: ['Uma', 'Umar', 'Ulysses', 'Ursula'],
    place: ['Uganda', 'Ukraine', 'Uruguay', 'Utrecht'],
    thing: ['Umbrella', 'Uniform', 'Ukulele', 'Urn'],
    animal: ['Uakari', 'Urial', 'Uromastyx', 'Umbrellabird'],
  },
  V: {
    name: ['Vera', 'Victor', 'Valeria', 'Vincent'],
    place: ['Venice', 'Vietnam', 'Vienna', 'Venezuela'],
    thing: ['Vase', 'Violin', 'Vacuum', 'Vest'],
    animal: ['Vulture', 'Viper', 'Vicuna', 'Vole'],
  },
  W: {
    name: ['Will', 'Willa', 'William', 'Wendy'],
    place: ['Wales', 'Warsaw', 'Wellington', 'Washington'],
    thing: ['Watch', 'Wallet', 'Whistle', 'Wrench'],
    animal: ['Wolf', 'Whale', 'Walrus', 'Wombat'],
  },
  X: {
    name: ['Xander', 'Xavier', 'Ximena', 'Xia', 'Xenia', 'Xavi'],
    place: ['Xi\'an', 'Xiamen', 'Xalapa', 'Xinjiang', 'Xining', 'Xichang'],
    thing: ['Xylophone', 'X-ray', 'Xbox', 'X-Acto knife', 'X-ray film', 'Xylophone mallet'],
    animal: ['Xerus', 'Xenopus', 'X-ray tetra', 'Xoloitzcuintli', 'Xantus\'s hummingbird', 'Xenops'],
  },
  Y: {
    name: ['Yasmin', 'Yara', 'Yusuf', 'Yvonne'],
    place: ['Yemen', 'York', 'Yangon', 'Yellowstone'],
    thing: ['Yo-yo', 'Yarn', 'Yacht', 'Yardstick'],
    animal: ['Yak', 'Yellowhammer', 'Yabby', 'Yorkie'],
  },
  Z: {
    name: ['Zoe', 'Zara', 'Zain', 'Zachary', 'Zelda', 'Zubair'],
    place: ['Zambia', 'Zimbabwe', 'Zurich', 'Zanzibar', 'Zadar', 'Zibo'],
    thing: ['Zipper', 'Zither', 'Zeppelin', 'Zamboni', 'Zester', 'Zucchini'],
    animal: ['Zebra', 'Zebu', 'Zorilla', 'Zander', 'Zebra finch', 'Zokor'],
  },
};

const suggestionBags = Object.create(null);

const elements = {
  bigLetter: document.querySelector('#big-letter'),
  letterNote: document.querySelector('#letter-note'),
  letterGrid: document.querySelector('#letter-grid'),
  pickRandom: document.querySelector('#pick-random'),
  letterMode: document.querySelector('#letter-mode'),
  gameMode: document.querySelector('#game-mode'),
  modeNote: document.querySelector('#mode-note'),
  roundState: document.querySelector('#round-state'),
  timerReadout: document.querySelector('#timer-readout'),
  timerDisplay: document.querySelector('#timer-display'),
  timerAnnouncement: document.querySelector('#timer-announcement'),
  timerTrackFill: document.querySelector('#timer-track-fill'),
  durationSelect: document.querySelector('#duration-select'),
  customDurationWrap: document.querySelector('#custom-duration-wrap'),
  customDuration: document.querySelector('#custom-duration'),
  favoriteDurations: document.querySelector('#favorite-durations'),
  saveDuration: document.querySelector('#save-duration'),
  playToggle: document.querySelector('#play-toggle'),
  playLabel: document.querySelector('#play-label'),
  playIcon: document.querySelector('#play-icon'),
  resetRound: document.querySelector('#reset-round'),
  gameStatus: document.querySelector('#game-status'),
  houseRuleNote: document.querySelector('#house-rule-note'),
  sheetLetter: document.querySelector('#sheet-letter'),
  turnIndicator: document.querySelector('#turn-indicator'),
  answerCount: document.querySelector('#answer-count'),
  answerTotal: document.querySelector('#answer-total'),
  answerProgress: document.querySelector('.answer-progress'),
  answerProgressFill: document.querySelector('#answer-progress-fill'),
  answerIntro: document.querySelector('#answer-intro'),
  answerRows: document.querySelector('#answer-rows'),
  answerForm: document.querySelector('#answer-form'),
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
  bankRegion: document.querySelector('#bank-region'),
  useBankLetter: document.querySelector('#use-bank-letter'),
  useBankLetterLabel: document.querySelector('#use-bank-letter-label'),
  openSettings: document.querySelector('#open-settings'),
  settingsDialog: document.querySelector('#settings-dialog'),
  closeSettings: document.querySelector('#close-settings'),
  settingsForm: document.querySelector('#settings-form'),
  cancelSettings: document.querySelector('#cancel-settings'),
  categoryEditor: document.querySelector('#category-editor'),
  categoryCount: document.querySelector('#category-count'),
  addCategory: document.querySelector('#add-category'),
  teamSettings: document.querySelector('#team-settings'),
  teamEditor: document.querySelector('#team-editor'),
  teamCount: document.querySelector('#team-count'),
  addTeam: document.querySelector('#add-team'),
  houseRules: document.querySelector('#house-rules'),
  houseRuleNote: document.querySelector('#house-rule-note'),
  savedIdeasList: document.querySelector('#saved-ideas-list'),
  savedIdeasCount: document.querySelector('#saved-ideas-count'),
  createRoomCode: document.querySelector('#create-room-code'),
  roomCodeOutput: document.querySelector('#room-code-output'),
  copyRoomLink: document.querySelector('#copy-room-link'),
  joinRoomCode: document.querySelector('#join-room-code'),
  joinRoom: document.querySelector('#join-room'),
  roomMessage: document.querySelector('#room-message'),
  scoreboardDialog: document.querySelector('#scoreboard-dialog'),
  closeScoreboard: document.querySelector('#close-scoreboard'),
  scoreboardSubtitle: document.querySelector('#scoreboard-subtitle'),
  scoreboardBody: document.querySelector('#scoreboard-body'),
  nextGroupRound: document.querySelector('#next-group-round'),
};

const initialDuration = normalizeDuration(initialPreferences.duration);
const game = {
  selectedLetter: null,
  bankLetter: 'A',
  state: 'idle',
  duration: initialDuration,
  remaining: initialDuration,
  deadline: null,
  ticker: null,
  mode: initialPreferences.mode === 'group' ? 'group' : 'solo',
  difficulty: DIFFICULTIES.includes(initialPreferences.difficulty) ? initialPreferences.difficulty : 'surprise',
  region: REGIONS.includes(initialPreferences.region) ? initialPreferences.region : 'worldwide',
  teamNames: normalizeTeamNames(initialPreferences.teamNames),
  teamIndex: 0,
  groupRound: null,
  matchScores: [],
  houseRules: String(initialPreferences.houseRules || '').slice(0, 300),
  favoriteDurations: normalizeFavorites(initialPreferences.favoriteDurations),
  savedIdeas: normalizeSavedIdeas(initialPreferences.savedIdeas),
  lastTimerAnnouncement: null,
};

game.matchScores = game.teamNames.map((name) => ({ name, points: 0, rounds: 0 }));

function getAnswerInputs() {
  return [...elements.answerRows.querySelectorAll('.answer-input')];
}

function getDurationFromControls() {
  if (elements.durationSelect.value !== 'custom') {
    return normalizeDuration(elements.durationSelect.value);
  }
  return normalizeDuration(elements.customDuration.value || 75);
}

function setDurationControl(seconds) {
  const value = normalizeDuration(seconds);
  const preset = [...elements.durationSelect.options].some((option) => option.value === String(value));
  elements.durationSelect.value = preset ? String(value) : 'custom';
  elements.customDuration.value = String(value);
  elements.customDurationWrap.hidden = preset;
}

function savePreferences() {
  const preferences = {
    mode: game.mode,
    difficulty: game.difficulty,
    region: game.region,
    duration: getDurationFromControls(),
    categories: CATEGORIES.map(({ key, label }) => ({ key, label })),
    teamNames: game.teamNames,
    houseRules: game.houseRules,
    favoriteDurations: game.favoriteDurations,
    savedIdeas: game.savedIdeas,
  };
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    elements.gameStatus.textContent = 'Settings could not be saved on this device.';
  }
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function isRoundLocked() {
  return game.state === 'running' || game.state === 'paused';
}

function isSetupLocked() {
  return isRoundLocked() || Boolean(game.groupRound && !game.groupRound.scored);
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

function renderAnswerRows() {
  elements.answerRows.replaceChildren();
  CATEGORIES.forEach((category) => {
    const row = document.createElement('div');
    row.className = 'answer-row';
    row.dataset.category = category.key;

    const icon = document.createElement('span');
    icon.className = `category-icon ${category.key.startsWith('custom-') ? 'icon-custom' : `icon-${category.key}`}`;
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = category.icon;

    const copy = document.createElement('div');
    copy.className = 'category-copy';
    const label = document.createElement('label');
    label.htmlFor = `answer-${category.key}`;
    label.textContent = category.label;
    const hint = document.createElement('span');
    hint.textContent = category.hint;
    copy.append(label, hint);

    const inputWrap = document.createElement('div');
    inputWrap.className = 'answer-input-wrap';
    const input = document.createElement('input');
    input.className = 'answer-input';
    input.id = `answer-${category.key}`;
    input.name = category.key;
    input.type = 'text';
    input.placeholder = `Type a ${category.label.toLocaleLowerCase()}…`;
    input.disabled = true;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('aria-describedby', `feedback-${category.key}`);
    const feedback = document.createElement('span');
    feedback.className = 'input-feedback';
    feedback.id = `feedback-${category.key}`;
    feedback.textContent = 'Starts with —';
    inputWrap.append(input, feedback);
    row.append(icon, copy, inputWrap);
    elements.answerRows.append(row);
    input.addEventListener('input', () => {
      updateAnswerFeedback();
      updateGameStatus();
    });
  });

  elements.answerTotal.textContent = String(CATEGORIES.length);
  elements.answerProgress.setAttribute('aria-valuemax', String(CATEGORIES.length));
}

function hasValidStartingLetter(answer) {
  const value = answer.trim();
  return Boolean(game.selectedLetter && value && value[0].toLocaleUpperCase() === game.selectedLetter);
}

function selectedAnswerCount() {
  return CATEGORIES.reduce((count, category) => {
    const input = document.querySelector(`#answer-${category.key}`);
    return count + (input && hasValidStartingLetter(input.value) ? 1 : 0);
  }, 0);
}

function updateAnswerFeedback() {
  CATEGORIES.forEach(({ key }) => {
    const input = document.querySelector(`#answer-${key}`);
    if (!input) return;
    const row = input.closest('.answer-row');
    const feedback = document.querySelector(`#feedback-${key}`);
    const answer = input.value.trim();

    row.classList.remove('is-valid', 'is-invalid');
    if (!answer) {
      feedback.textContent = `Starts with ${game.selectedLetter || '—'}`;
    } else if (hasValidStartingLetter(answer)) {
      row.classList.add('is-valid');
      feedback.textContent = 'Looks good';
    } else {
      row.classList.add('is-invalid');
      feedback.textContent = game.selectedLetter ? `Try a word starting with ${game.selectedLetter}` : 'Pick a letter first';
    }
  });

  const count = selectedAnswerCount();
  const total = CATEGORIES.length;
  elements.answerCount.textContent = String(count);
  elements.answerProgressFill.style.width = `${total ? (count / total) * 100 : 0}%`;
  elements.answerProgress.setAttribute('aria-valuenow', String(count));

  if (game.state === 'idle' || game.state === 'ready') {
    elements.answerIntro.textContent = 'Start the timer to unlock your answer sheet.';
  } else if (game.state === 'running') {
    elements.answerIntro.textContent = count === total
      ? `All ${total} categories have an answer. Give them one last check.`
      : `Find an answer for each category. Every answer starts with ${game.selectedLetter}.`;
  } else if (game.state === 'paused') {
    elements.answerIntro.textContent = `Round paused. You have ${count} of ${total} valid answer${count === 1 ? '' : 's'} so far.`;
  } else {
    elements.answerIntro.textContent = `Time is up! You had ${count} of ${total} valid answer${count === 1 ? '' : 's'} for ${game.selectedLetter}.`;
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

  const shouldAnnounce = game.state === 'running'
    && (game.remaining === 0 || game.remaining <= 10 || game.remaining % 15 === 0);
  if (shouldAnnounce && game.lastTimerAnnouncement !== game.remaining) {
    const seconds = game.remaining;
    elements.timerAnnouncement.textContent = seconds === 0
      ? 'Time is up.'
      : `${seconds} second${seconds === 1 ? '' : 's'} remaining.`;
    game.lastTimerAnnouncement = seconds;
  }
  if (game.state !== 'running') game.lastTimerAnnouncement = null;
}

function getCurrentTeamNames() {
  return game.groupRound?.teamNames || game.teamNames;
}

function getCurrentTeamName() {
  return getCurrentTeamNames()[game.teamIndex] || game.teamNames[0] || 'Team 1';
}

function updateGameStatus() {
  const count = selectedAnswerCount();
  if (game.state === 'idle') {
    elements.gameStatus.textContent = game.mode === 'group'
      ? `${game.teamNames[0]} will start. Pick a letter, then pass the device between teams.`
      : 'Pick a letter, or let us choose one for you.';
  } else if (game.state === 'ready') {
    elements.gameStatus.textContent = game.mode === 'group'
      ? game.groupRound
        ? `Pass the device to ${getCurrentTeamName()}, then start their turn.`
        : `${game.teamNames[0]} starts this group round. Choose a letter and start when ready.`
      : `Letter ${game.selectedLetter} is ready. Start your timer when you are.`;
  } else if (game.state === 'running') {
    elements.gameStatus.textContent = game.mode === 'group'
      ? `${getCurrentTeamName()}'s turn — every answer starts with ${game.selectedLetter}.`
      : count === CATEGORIES.length
        ? 'A full set! Give your answers one last check.'
        : `Clock is ticking—every answer starts with ${game.selectedLetter}.`;
  } else if (game.state === 'paused') {
    elements.gameStatus.textContent = 'Paused. Your answers are safe; resume when you are ready.';
  } else if (game.mode === 'group' && game.groupRound) {
    const teamNames = getCurrentTeamNames();
    elements.gameStatus.textContent = game.teamIndex < teamNames.length - 1
      ? `${getCurrentTeamName()} is done. Pass to ${teamNames[game.teamIndex + 1]} for the same letter.`
      : 'Every team has played. Open the scoreboard to compare answers.';
  } else {
    elements.gameStatus.textContent = `Time is up! You got ${count} valid answer${count === 1 ? '' : 's'}.`;
  }
}

function getAllowedLetters() {
  if (game.difficulty === 'easy') return [...'ACDEGHILMNOPRST'];
  if (game.difficulty === 'tricky') return [...'B F J K Q U V W X Y Z'.replaceAll(' ', '')];
  return LETTERS;
}

function updateModeNote() {
  const group = game.mode === 'group';
  elements.modeNote.textContent = group
    ? `Pass-and-play for ${game.teamNames.length} teams. Everyone gets the same letter and timer; answers stay on this device.`
    : 'Solo play gives you one timed answer sheet. Switch to pass-and-play for a group.';
  elements.teamSettings.hidden = !group;
}

function updateGameUI() {
  const hasLetter = Boolean(game.selectedLetter);
  const locked = isSetupLocked();
  const teamNames = getCurrentTeamNames();

  elements.bigLetter.textContent = game.selectedLetter || '?';
  elements.bigLetter.classList.toggle('is-picked', hasLetter);
  elements.letterNote.textContent = hasLetter ? `Keep every answer on ${game.selectedLetter}.` : 'Pick any letter to begin.';
  elements.sheetLetter.textContent = hasLetter ? `with ${game.selectedLetter}` : 'your letter?';

  document.querySelectorAll('.game-key').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.letter === game.selectedLetter));
    button.disabled = locked;
  });
  elements.pickRandom.disabled = locked;
  elements.letterMode.disabled = locked;
  elements.gameMode.disabled = locked;
  elements.durationSelect.disabled = locked;
  elements.customDuration.disabled = locked;
  elements.saveDuration.disabled = locked;
  elements.openSettings.disabled = locked;

  elements.roundState.dataset.state = game.state;
  if (game.state === 'running') {
    elements.roundState.textContent = 'IN PLAY';
    elements.playLabel.textContent = 'Pause round';
    elements.playIcon.textContent = 'Ⅱ';
  } else if (game.state === 'paused') {
    elements.roundState.textContent = 'PAUSED';
    elements.playLabel.textContent = 'Resume round';
    elements.playIcon.textContent = '→';
  } else if (game.state === 'finished' && game.mode === 'group' && game.groupRound) {
    const hasNextTeam = game.teamIndex < teamNames.length - 1 && !game.groupRound.scored;
    elements.roundState.textContent = hasNextTeam ? 'TURN DONE' : 'ROUND DONE';
    elements.playLabel.textContent = hasNextTeam ? 'Next team' : 'View scoreboard';
    elements.playIcon.textContent = hasNextTeam ? '→' : '✦';
  } else if (game.state === 'finished') {
    elements.roundState.textContent = "TIME'S UP";
    elements.playLabel.textContent = 'Play again';
    elements.playIcon.textContent = '↻';
  } else {
    elements.roundState.textContent = game.mode === 'group' && game.groupRound
      ? `TEAM ${game.teamIndex + 1} UP`
      : 'READY';
    elements.playLabel.textContent = game.mode === 'group' && game.groupRound
      ? `Start ${getCurrentTeamName()}`
      : game.mode === 'group' ? 'Start group round' : 'Start round';
    elements.playIcon.textContent = '→';
  }

  elements.ideasToggle.disabled = !hasLetter;
  elements.ideasToggleLetter.textContent = hasLetter ? `See ${game.selectedLetter} ideas` : 'See ideas';
  elements.turnIndicator.hidden = game.mode !== 'group';
  elements.turnIndicator.textContent = game.mode === 'group'
    ? game.groupRound
      ? `Pass-and-play · ${getCurrentTeamName()}${game.state === 'running' ? ' is up' : ' plays next'}`
      : `Pass-and-play · ${game.teamNames.join(' vs ')}`
    : '';
  elements.houseRuleNote.hidden = !game.houseRules;
  elements.houseRuleNote.textContent = game.houseRules ? `House rule: ${game.houseRules}` : '';

  getAnswerInputs().forEach((input) => {
    input.disabled = !isRoundLocked() || game.state === 'finished' || !hasLetter;
  });

  updateModeNote();
  renderDurationFavorites();
  updateAnswerFeedback();
  updateTimerDisplay();
  updateGameStatus();
  updateBankAction();
}

function updateBankAction() {
  const disabled = isSetupLocked();
  elements.useBankLetter.disabled = disabled;
  elements.useBankLetter.title = disabled ? 'Finish this group round before changing letters.' : '';
}

function clearAnswers() {
  getAnswerInputs().forEach((input) => {
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
  if (isSetupLocked() || !LETTERS.includes(letter)) return;
  game.selectedLetter = letter;
  game.duration = getDurationFromControls();
  game.remaining = game.duration;
  game.state = 'ready';
  game.deadline = null;
  game.groupRound = null;
  game.teamIndex = 0;
  clearAnswers();
  updateGameUI();
  savePreferences();
}

function pickRandomLetter() {
  const allowed = getAllowedLetters();
  const available = allowed.filter((letter) => letter !== game.selectedLetter);
  const pool = available.length ? available : allowed;
  const letter = pool[Math.floor(Math.random() * pool.length)];
  chooseLetter(letter);
}

function recordCurrentGroupAnswers() {
  if (!game.groupRound) return;
  game.groupRound.answers[game.teamIndex] = Object.fromEntries(CATEGORIES.map(({ key }) => {
    const input = document.querySelector(`#answer-${key}`);
    return [key, input ? input.value.trim() : ''];
  }));
}

function tick() {
  if (game.state !== 'running' || game.deadline === null) return;
  game.remaining = Math.max(0, Math.ceil((game.deadline - Date.now()) / 1000));
  updateTimerDisplay();

  if (game.remaining <= 0) {
    stopTicker();
    if (game.mode === 'group') recordCurrentGroupAnswers();
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
      if (game.mode === 'group') recordCurrentGroupAnswers();
      game.state = 'finished';
      updateGameUI();
      return;
    }
    game.state = 'running';
    beginTicker();
    updateGameUI();
    return;
  }

  if (game.state === 'finished' && game.mode === 'group' && game.groupRound) {
    const teamNames = getCurrentTeamNames();
    if (game.teamIndex < teamNames.length - 1 && !game.groupRound.scored) {
      game.teamIndex += 1;
      game.remaining = game.duration;
      clearAnswers();
      game.state = 'ready';
      updateGameUI();
      elements.playToggle.focus();
      return;
    }
    openGroupScoreboard();
    return;
  }

  if (!game.selectedLetter) {
    const allowed = getAllowedLetters();
    game.selectedLetter = allowed[Math.floor(Math.random() * allowed.length)];
  }

  game.duration = getDurationFromControls();
  game.remaining = game.duration;
  clearAnswers();
  if (game.mode === 'group' && !game.groupRound) {
    game.teamIndex = 0;
    game.groupRound = {
      letter: game.selectedLetter,
      teamNames: [...game.teamNames],
      answers: [],
      scored: false,
      results: null,
    };
  }
  game.state = 'running';
  game.lastTimerAnnouncement = null;
  beginTicker();
  updateGameUI();
  const firstInput = getAnswerInputs()[0];
  if (firstInput) firstInput.focus();
}

function resetRound() {
  stopTicker();
  game.deadline = null;
  game.duration = getDurationFromControls();
  game.remaining = game.duration;
  game.state = game.selectedLetter ? 'ready' : 'idle';
  game.groupRound = null;
  game.teamIndex = 0;
  clearAnswers();
  updateGameUI();
}

function applyDurationChange() {
  if (isSetupLocked()) return;
  game.duration = getDurationFromControls();
  game.remaining = game.duration;
  if (game.state === 'finished') {
    game.state = game.selectedLetter ? 'ready' : 'idle';
    clearAnswers();
  }
  savePreferences();
  updateGameUI();
}

function renderDurationFavorites() {
  elements.favoriteDurations.replaceChildren();
  elements.favoriteDurations.hidden = game.favoriteDurations.length === 0;
  game.favoriteDurations.forEach((seconds) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'favorite-duration-chip';
    button.textContent = seconds >= 60 && seconds % 60 === 0
      ? `${seconds / 60} min`
      : `${seconds} sec`;
    button.setAttribute('aria-label', `Use saved timer: ${seconds} seconds`);
    button.disabled = isSetupLocked();
    button.addEventListener('click', () => {
      if (isSetupLocked()) return;
      setDurationControl(seconds);
      applyDurationChange();
    });
    elements.favoriteDurations.append(button);
  });
  const saved = game.favoriteDurations.includes(getDurationFromControls());
  elements.saveDuration.textContent = saved ? '★ Saved timer' : '☆ Save this timer';
  elements.saveDuration.setAttribute('aria-pressed', String(saved));
}

function toggleFavoriteDuration() {
  if (isSetupLocked()) return;
  const duration = getDurationFromControls();
  if (game.favoriteDurations.includes(duration)) {
    game.favoriteDurations = game.favoriteDurations.filter((item) => item !== duration);
  } else if (game.favoriteDurations.length < 8) {
    game.favoriteDurations.push(duration);
  } else {
    elements.gameStatus.textContent = 'You can save up to eight favorite timer lengths.';
    return;
  }
  savePreferences();
  renderDurationFavorites();
}

function normalizeAnswer(value) {
  return String(value || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function calculateGroupScores() {
  const round = game.groupRound;
  if (!round || round.scored) return round?.results || [];
  const answersByCategory = new Map();

  CATEGORIES.forEach(({ key }) => {
    const counts = new Map();
    round.teamNames.forEach((_, teamIndex) => {
      const answer = round.answers[teamIndex]?.[key] || '';
      if (!hasValidStartingLetterFor(answer, round.letter)) return;
      const normalized = normalizeAnswer(answer);
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    });
    answersByCategory.set(key, counts);
  });

  round.results = round.teamNames.map((teamName, teamIndex) => {
    const categories = CATEGORIES.map(({ key, label }) => {
      const answer = round.answers[teamIndex]?.[key] || '';
      if (!hasValidStartingLetterFor(answer, round.letter)) {
        return { key, label, answer, points: 0, status: answer ? `Must start with ${round.letter}` : 'No answer', unique: false };
      }
      const count = answersByCategory.get(key).get(normalizeAnswer(answer)) || 1;
      const unique = count === 1;
      return {
        key,
        label,
        answer,
        points: unique ? 10 : 5,
        status: unique ? 'Nobody else had it!' : 'Shared answer',
        unique,
      };
    });
    return { teamName, categories, points: categories.reduce((sum, item) => sum + item.points, 0) };
  });

  round.results.forEach(({ teamName, points }) => {
    let total = game.matchScores.find((item) => item.name === teamName);
    if (!total) {
      total = { name: teamName, points: 0, rounds: 0 };
      game.matchScores.push(total);
    }
    total.points += points;
    total.rounds += 1;
  });
  round.scored = true;
  return round.results;
}

function hasValidStartingLetterFor(answer, letter) {
  const value = String(answer || '').trim();
  return Boolean(value && value[0].toLocaleUpperCase() === letter);
}

function addText(parent, tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  node.textContent = text;
  parent.append(node);
  return node;
}

function openGroupScoreboard() {
  if (!game.groupRound) return;
  const results = calculateGroupScores();
  elements.scoreboardBody.replaceChildren();
  elements.scoreboardSubtitle.textContent = `Letter ${game.groupRound.letter} · Unique valid answers earn 10 points; shared answers earn 5.`;

  const standings = document.createElement('section');
  standings.className = 'scoreboard-standings';
  addText(standings, 'h3', '', 'Match scoreboard');
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent = 'Cumulative group scores';
  table.append(caption);
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Team', 'This round', 'Match total'].forEach((label) => addText(headerRow, 'th', '', label).setAttribute('scope', 'col'));
  thead.append(headerRow);
  table.append(thead);
  const tbody = document.createElement('tbody');
  [...game.matchScores].sort((a, b) => b.points - a.points).forEach((entry) => {
    const row = document.createElement('tr');
    addText(row, 'th', '', entry.name).setAttribute('scope', 'row');
    const roundResult = results.find((result) => result.teamName === entry.name);
    addText(row, 'td', '', roundResult ? `${roundResult.points} pts` : '—');
    addText(row, 'td', 'score-total', `${entry.points} pts`);
    tbody.append(row);
  });
  table.append(tbody);
  standings.append(table);
  elements.scoreboardBody.append(standings);

  const details = document.createElement('div');
  details.className = 'scoreboard-details';
  results.forEach((result) => {
    const card = document.createElement('article');
    card.className = 'score-team-card';
    const cardHeading = document.createElement('div');
    cardHeading.className = 'score-team-heading';
    addText(cardHeading, 'h3', '', result.teamName);
    addText(cardHeading, 'strong', '', `${result.points} pts`);
    card.append(cardHeading);
    const list = document.createElement('ul');
    result.categories.forEach((item) => {
      const line = document.createElement('li');
      const label = document.createElement('span');
      label.className = 'score-category';
      label.textContent = item.label;
      const value = document.createElement('span');
      value.className = item.unique ? 'score-answer is-unique' : 'score-answer';
      value.textContent = item.answer || '—';
      const note = document.createElement('span');
      note.className = item.unique ? 'score-note is-unique' : 'score-note';
      note.textContent = `${item.unique ? '✦ ' : ''}${item.status} · +${item.points}`;
      line.append(label, value, note);
      list.append(line);
    });
    card.append(list);
    details.append(card);
  });
  elements.scoreboardBody.append(details);
  updateGameUI();
  if (!elements.scoreboardDialog.open) elements.scoreboardDialog.showModal();
}

function finishGroupSeries() {
  game.groupRound = null;
  game.teamIndex = 0;
  game.duration = getDurationFromControls();
  game.remaining = game.duration;
  game.state = game.selectedLetter ? 'ready' : 'idle';
  clearAnswers();
  updateGameUI();
  elements.playToggle.focus();
}

function renderIdeaPreview() {
  elements.ideasPreview.replaceChildren();
  if (!game.selectedLetter) return;

  const suggestions = getFreshWordSet(game.selectedLetter, game.region);
  CATEGORIES.forEach(({ key, label }) => {
    const chip = document.createElement('div');
    chip.className = 'idea-chip';
    addText(chip, 'span', '', label);
    const idea = document.createElement('strong');
    idea.textContent = suggestions[key] || `Try a ${label.toLocaleLowerCase()} starting with ${game.selectedLetter}`;
    chip.append(idea);
    if (suggestions[key]) {
      chip.append(createSaveIdeaButton({
        letter: game.selectedLetter,
        categoryKey: key,
        categoryLabel: label,
        word: suggestions[key],
      }));
    }
    elements.ideasPreview.append(chip);
  });
}

function getFreshWordSet(letter, region = game.region) {
  const bagKey = `${region}|${letter}`;
  const bags = suggestionBags[bagKey] || (suggestionBags[bagKey] = {});
  const suggestions = {};
  DEFAULT_CATEGORIES.forEach(({ key }) => {
    const regionalOptions = REGIONAL_IDEAS[region]?.[key]?.filter((word) => word[0].toLocaleUpperCase() === letter) || [];
    const options = regionalOptions.length > 1 ? regionalOptions : WORD_BANK[letter][key];
    const bag = bags[key]?.length ? bags[key] : options.slice();
    const [word] = bag.splice(Math.floor(Math.random() * bag.length), 1);
    bags[key] = bag;
    suggestions[key] = word;
  });
  return suggestions;
}

function ideaId(idea) {
  return `${idea.letter}|${idea.categoryKey}|${normalizeAnswer(idea.word)}`;
}

function isIdeaSaved(idea) {
  const id = ideaId(idea);
  return game.savedIdeas.some((saved) => ideaId(saved) === id);
}

function updateSaveButton(button, idea, isSaved = isIdeaSaved(idea)) {
  button.textContent = isSaved ? '★' : '☆';
  button.setAttribute('aria-pressed', String(isSaved));
  button.setAttribute('aria-label', `${isSaved ? 'Remove saved' : 'Save'} ${idea.word}, ${idea.categoryLabel}, ${idea.letter}`);
  button.title = isSaved ? 'Remove from saved ideas' : 'Save this idea';
}

function createSaveIdeaButton(idea) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'save-idea-button';
  button.dataset.ideaId = ideaId(idea);
  updateSaveButton(button, idea);
  button.addEventListener('click', () => {
    const saved = toggleSavedIdea(idea);
    document.querySelectorAll('.save-idea-button').forEach((candidate) => {
      if (candidate.dataset.ideaId === ideaId(idea)) updateSaveButton(candidate, idea, saved);
    });
    renderSavedIdeas();
  });
  return button;
}

function toggleSavedIdea(idea) {
  if (isIdeaSaved(idea)) {
    game.savedIdeas = game.savedIdeas.filter((saved) => ideaId(saved) !== ideaId(idea));
  } else if (game.savedIdeas.length < 100) {
    game.savedIdeas.push({ ...idea });
  }
  savePreferences();
  return isIdeaSaved(idea);
}

function renderSavedIdeas() {
  elements.savedIdeasList.replaceChildren();
  elements.savedIdeasCount.textContent = String(game.savedIdeas.length);
  if (!game.savedIdeas.length) {
    addText(elements.savedIdeasList, 'p', 'empty-saved-ideas', 'Star an idea in a hint or the word bank to keep it here.');
    return;
  }
  game.savedIdeas.forEach((idea) => {
    const row = document.createElement('div');
    row.className = 'saved-idea-row';
    const copy = document.createElement('div');
    addText(copy, 'strong', '', idea.word);
    addText(copy, 'span', '', `${idea.categoryLabel} · ${idea.letter}`);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'saved-idea-remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${idea.word} from saved ideas`);
    remove.addEventListener('click', () => {
      game.savedIdeas = game.savedIdeas.filter((saved) => ideaId(saved) !== ideaId(idea));
      savePreferences();
      document.querySelectorAll('.save-idea-button').forEach((candidate) => {
        if (candidate.dataset.ideaId === ideaId(idea)) updateSaveButton(candidate, idea, false);
      });
      renderSavedIdeas();
    });
    row.append(copy, remove);
    elements.savedIdeasList.append(row);
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

  const suggestions = getFreshWordSet(letter, game.region);
  elements.bankSamples.replaceChildren();
  DEFAULT_CATEGORIES.forEach(({ key, label, icon }) => {
    const row = document.createElement('div');
    row.className = 'bank-sample-row';
    const iconElement = document.createElement('span');
    iconElement.className = 'bank-sample-icon';
    iconElement.setAttribute('aria-hidden', 'true');
    iconElement.textContent = icon;
    const copy = document.createElement('div');
    copy.className = 'bank-sample-copy';
    addText(copy, 'span', '', label);
    addText(copy, 'strong', '', suggestions[key]);
    row.append(iconElement, copy, createSaveIdeaButton({
      letter,
      categoryKey: key,
      categoryLabel: label,
      word: suggestions[key],
    }));
    elements.bankSamples.append(row);
  });
  updateBankAction();
}

function openWordBank() {
  const startingLetter = game.selectedLetter || game.bankLetter || 'A';
  elements.bankRegion.value = game.region;
  updateBank(startingLetter);
  if (!elements.wordBankDialog.open) elements.wordBankDialog.showModal();
}

function isEditableTarget(target) {
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function handleKeyboardShortcuts(event) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) return;
  if (elements.settingsDialog.open || elements.wordBankDialog.open || elements.scoreboardDialog.open) return;
  if (event.key === ' ' && !event.target.closest('button, a')) {
    event.preventDefault();
    startOrToggleRound();
    return;
  }
  const letter = event.key.toLocaleUpperCase();
  if (/^[A-Z]$/.test(letter) && !isSetupLocked()) chooseLetter(letter);
}

function updateMode() {
  if (isSetupLocked()) {
    elements.gameMode.value = game.mode;
    return;
  }
  const nextMode = elements.gameMode.value === 'group' ? 'group' : 'solo';
  if (nextMode !== game.mode) {
    game.mode = nextMode;
    game.groupRound = null;
    game.teamIndex = 0;
    game.matchScores = game.teamNames.map((name) => ({ name, points: 0, rounds: 0 }));
    if (game.state === 'finished') game.state = game.selectedLetter ? 'ready' : 'idle';
    clearAnswers();
    savePreferences();
  }
  updateGameUI();
}

function renderCategoryEditor(categories = CATEGORIES) {
  elements.categoryEditor.replaceChildren();
  categories.forEach((category, index) => {
    const row = document.createElement('div');
    row.className = 'editor-row category-editor-row';
    row.dataset.categoryKey = category.key;
    const label = document.createElement('label');
    label.className = 'sr-only';
    label.htmlFor = `category-name-${index}`;
    label.textContent = `Category ${index + 1} name`;
    const input = document.createElement('input');
    input.className = 'category-name-input';
    input.id = `category-name-${index}`;
    input.type = 'text';
    input.maxLength = 28;
    input.required = true;
    input.value = category.label;
    input.placeholder = 'Category name';
    const remove = document.createElement('button');
    remove.className = 'remove-editor-row';
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove ${category.label} category`);
    remove.disabled = categories.length <= 1;
    row.append(label, input, remove);
    elements.categoryEditor.append(row);
  });
  elements.categoryCount.textContent = `${categories.length} / ${MAX_CATEGORIES}`;
  elements.addCategory.disabled = categories.length >= MAX_CATEGORIES;
}

function currentCategoriesFromEditor() {
  return [...elements.categoryEditor.querySelectorAll('.category-editor-row')].map((row) => {
    const category = CATEGORIES.find((item) => item.key === row.dataset.categoryKey);
    return {
      key: row.dataset.categoryKey,
      label: row.querySelector('.category-name-input').value.trim(),
      icon: category?.icon || '✨',
      hint: category?.hint || 'Your own category',
    };
  });
}

function renderTeamEditor(teamNames = game.teamNames) {
  elements.teamEditor.replaceChildren();
  teamNames.forEach((name, index) => {
    const row = document.createElement('div');
    row.className = 'editor-row team-editor-row';
    const label = document.createElement('label');
    label.className = 'sr-only';
    label.htmlFor = `team-name-${index}`;
    label.textContent = `Team ${index + 1} name`;
    const input = document.createElement('input');
    input.className = 'team-name-input';
    input.id = `team-name-${index}`;
    input.type = 'text';
    input.maxLength = 24;
    input.required = true;
    input.value = name;
    input.placeholder = `Team ${index + 1}`;
    const remove = document.createElement('button');
    remove.className = 'remove-editor-row';
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove ${name}`);
    remove.disabled = teamNames.length <= 2;
    row.append(label, input, remove);
    elements.teamEditor.append(row);
  });
  elements.teamCount.textContent = `${teamNames.length} / ${MAX_TEAMS}`;
  elements.addTeam.disabled = teamNames.length >= MAX_TEAMS;
}

function currentTeamsFromEditor() {
  return [...elements.teamEditor.querySelectorAll('.team-name-input')].map((input) => input.value.trim());
}

function openSettings() {
  if (isSetupLocked()) return;
  renderCategoryEditor();
  renderTeamEditor();
  elements.houseRules.value = game.houseRules;
  renderSavedIdeas();
  updateModeNote();
  if (!elements.settingsDialog.open) elements.settingsDialog.showModal();
}

function saveSettingsFromDialog(event) {
  event.preventDefault();
  if (isSetupLocked()) return;
  const categoryInputs = [...elements.categoryEditor.querySelectorAll('.category-name-input')];
  const teamInputs = [...elements.teamEditor.querySelectorAll('.team-name-input')];
  const emptyInput = [...categoryInputs, ...teamInputs].find((input) => !input.value.trim());
  if (emptyInput) {
    emptyInput.setCustomValidity('Please enter a name.');
    emptyInput.reportValidity();
    emptyInput.addEventListener('input', () => emptyInput.setCustomValidity(''), { once: true });
    return;
  }

  const oldCategories = JSON.stringify(CATEGORIES.map(({ key, label }) => ({ key, label })));
  const oldTeams = JSON.stringify(game.teamNames);
  const nextCategories = currentCategoriesFromEditor();
  CATEGORIES = normalizeCategories(nextCategories);
  game.teamNames = normalizeTeamNames(teamInputs.map((input) => input.value));
  game.houseRules = elements.houseRules.value.trim().slice(0, 300);

  if (oldTeams !== JSON.stringify(game.teamNames)) {
    game.matchScores = game.teamNames.map((name) => ({ name, points: 0, rounds: 0 }));
  }
  if (oldCategories !== JSON.stringify(CATEGORIES.map(({ key, label }) => ({ key, label }))) || oldTeams !== JSON.stringify(game.teamNames)) {
    game.groupRound = null;
    game.teamIndex = 0;
    if (game.state === 'finished') game.state = game.selectedLetter ? 'ready' : 'idle';
    clearAnswers();
  }

  renderAnswerRows();
  savePreferences();
  updateGameUI();
  elements.settingsDialog.close();
}

function addCategoryRow() {
  const categories = currentCategoriesFromEditor();
  if (categories.length >= MAX_CATEGORIES) return;
  const key = `custom-${Date.now().toString(36)}-${categories.length + 1}`;
  categories.push({ key, label: `Category ${categories.length + 1}`, icon: '✨', hint: 'Your own category' });
  renderCategoryEditor(categories);
  elements.categoryEditor.querySelector('.category-editor-row:last-child input').focus();
}

function removeCategoryRow(button) {
  const categories = currentCategoriesFromEditor();
  if (categories.length <= 1) return;
  const row = button.closest('.category-editor-row');
  renderCategoryEditor(categories.filter((category) => category.key !== row.dataset.categoryKey));
}

function addTeamRow() {
  const names = currentTeamsFromEditor();
  if (names.length >= MAX_TEAMS) return;
  names.push(`Team ${names.length + 1}`);
  renderTeamEditor(names);
  elements.teamEditor.querySelector('.team-editor-row:last-child input').focus();
}

function removeTeamRow(button) {
  const names = currentTeamsFromEditor();
  if (names.length <= 2) return;
  const index = [...elements.teamEditor.querySelectorAll('.team-editor-row')].indexOf(button.closest('.team-editor-row'));
  names.splice(index, 1);
  renderTeamEditor(names);
}

function bytesToBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function base64UrlToText(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function createRoomConfig() {
  const categories = elements.settingsDialog.open
    ? normalizeCategories(currentCategoriesFromEditor())
    : CATEGORIES;
  const teamNames = elements.settingsDialog.open
    ? normalizeTeamNames(currentTeamsFromEditor())
    : game.teamNames;
  const houseRules = elements.settingsDialog.open
    ? elements.houseRules.value.trim().slice(0, 300)
    : game.houseRules;
  return {
    version: 1,
    letter: game.selectedLetter,
    duration: getDurationFromControls(),
    difficulty: game.difficulty,
    region: game.region,
    mode: game.mode,
    teamNames,
    categories: categories.map(({ key, label }) => ({ key, label })),
    houseRules,
  };
}

function createRoomCode() {
  if (isSetupLocked()) return;
  if (!game.selectedLetter) {
    const allowed = getAllowedLetters();
    chooseLetter(allowed[Math.floor(Math.random() * allowed.length)]);
  }
  const code = `NPAT1-${bytesToBase64Url(JSON.stringify(createRoomConfig()))}`;
  const inviteUrl = new URL(window.location.href);
  inviteUrl.hash = `room=${code}`;
  elements.roomCodeOutput.value = code;
  elements.copyRoomLink.disabled = false;
  elements.roomMessage.textContent = 'Room code ready. Copy the invite link or share the code; everyone can start from this setup.';
  game.lastInviteUrl = inviteUrl.toString();
}

function extractRoomCode(value) {
  let candidate = value.trim();
  try {
    if (/^https?:/iu.test(candidate)) {
      const url = new URL(candidate);
      candidate = new URLSearchParams(url.hash.slice(1)).get('room') || url.searchParams.get('room') || candidate;
    }
  } catch {
    // Treat malformed URLs as a raw code and show the normal validation message.
  }
  candidate = candidate.replace(/^#?room=/iu, '').trim();
  return candidate;
}

function applyRoomCode(rawValue) {
  if (isSetupLocked()) throw new Error('Finish the current round before joining a new room.');
  const code = extractRoomCode(rawValue);
  if (!code.startsWith('NPAT1-')) throw new Error('That room code is not valid. Paste the full code or invite link.');
  let payload;
  try {
    payload = JSON.parse(base64UrlToText(code.slice('NPAT1-'.length)));
  } catch {
    throw new Error('That room code could not be read. Check that it was copied completely.');
  }
  if (!payload || payload.version !== 1 || !LETTERS.includes(payload.letter)) {
    throw new Error('That room code is missing a valid starting letter.');
  }

  CATEGORIES = normalizeCategories(payload.categories);
  game.mode = payload.mode === 'group' ? 'group' : 'solo';
  game.difficulty = DIFFICULTIES.includes(payload.difficulty) ? payload.difficulty : 'surprise';
  game.region = REGIONS.includes(payload.region) ? payload.region : 'worldwide';
  game.teamNames = normalizeTeamNames(payload.teamNames);
  game.houseRules = String(payload.houseRules || '').slice(0, 300);
  game.selectedLetter = payload.letter;
  game.duration = normalizeDuration(payload.duration);
  game.remaining = game.duration;
  game.state = 'ready';
  game.groupRound = null;
  game.teamIndex = 0;
  game.matchScores = game.teamNames.map((name) => ({ name, points: 0, rounds: 0 }));
  elements.gameMode.value = game.mode;
  elements.letterMode.value = game.difficulty;
  elements.bankRegion.value = game.region;
  setDurationControl(game.duration);
  renderAnswerRows();
  renderCategoryEditor();
  renderTeamEditor();
  elements.houseRules.value = game.houseRules;
  elements.roomCodeOutput.value = '';
  elements.copyRoomLink.disabled = true;
  game.lastInviteUrl = null;
  clearAnswers();
  savePreferences();
  updateGameUI();
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const temporary = document.createElement('textarea');
  temporary.value = value;
  temporary.style.position = 'fixed';
  temporary.style.opacity = '0';
  document.body.append(temporary);
  temporary.select();
  const copied = document.execCommand('copy');
  temporary.remove();
  if (!copied) throw new Error('Copy was not available. Select and copy the text instead.');
}

function updateBankAction() {
  const disabled = isSetupLocked();
  elements.useBankLetter.disabled = disabled;
  elements.useBankLetter.title = disabled ? 'Finish this group round before changing letters.' : '';
}

function applyRoomCodeFromUrl() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const code = params.get('room');
  if (!code) return;
  try {
    applyRoomCode(code);
    elements.gameStatus.textContent = 'Room setup loaded. Your team can now play pass-and-play on this device.';
  } catch (error) {
    elements.gameStatus.textContent = error.message;
  }
}

function initialize() {
  elements.gameMode.value = game.mode;
  elements.letterMode.value = game.difficulty;
  elements.bankRegion.value = game.region;
  setDurationControl(game.duration);
  renderAnswerRows();
  renderCategoryEditor();
  renderTeamEditor();
  makeLetterButtons(elements.letterGrid, 'game-key', chooseLetter);
  makeLetterButtons(elements.bankLetterGrid, 'bank-key', updateBank);
  updateGameUI();

  elements.answerForm.addEventListener('submit', (event) => event.preventDefault());
  elements.pickRandom.addEventListener('click', pickRandomLetter);
  elements.gameMode.addEventListener('change', updateMode);
  elements.letterMode.addEventListener('change', () => {
    if (isSetupLocked()) return;
    game.difficulty = DIFFICULTIES.includes(elements.letterMode.value) ? elements.letterMode.value : 'surprise';
    savePreferences();
  });
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
  elements.saveDuration.addEventListener('click', toggleFavoriteDuration);
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
  elements.bankRegion.addEventListener('change', () => {
    game.region = REGIONS.includes(elements.bankRegion.value) ? elements.bankRegion.value : 'worldwide';
    savePreferences();
    updateBank(game.bankLetter);
  });
  elements.useBankLetter.addEventListener('click', () => {
    if (isSetupLocked()) return;
    chooseLetter(game.bankLetter);
    elements.wordBankDialog.close();
  });

  elements.openSettings.addEventListener('click', openSettings);
  elements.closeSettings.addEventListener('click', () => elements.settingsDialog.close());
  elements.cancelSettings.addEventListener('click', () => elements.settingsDialog.close());
  elements.settingsDialog.addEventListener('click', (event) => {
    if (event.target === elements.settingsDialog) elements.settingsDialog.close();
  });
  elements.settingsForm.addEventListener('submit', saveSettingsFromDialog);
  elements.addCategory.addEventListener('click', addCategoryRow);
  elements.categoryEditor.addEventListener('click', (event) => {
    const remove = event.target.closest('.remove-editor-row');
    if (remove) removeCategoryRow(remove);
  });
  elements.addTeam.addEventListener('click', addTeamRow);
  elements.teamEditor.addEventListener('click', (event) => {
    const remove = event.target.closest('.remove-editor-row');
    if (remove) removeTeamRow(remove);
  });
  elements.createRoomCode.addEventListener('click', createRoomCode);
  elements.copyRoomLink.addEventListener('click', async () => {
    try {
      await copyText(game.lastInviteUrl || elements.roomCodeOutput.value);
      elements.roomMessage.textContent = 'Invite link copied. Send it to your group to share the setup.';
    } catch (error) {
      elements.roomMessage.textContent = error.message;
    }
  });
  elements.joinRoom.addEventListener('click', () => {
    try {
      applyRoomCode(elements.joinRoomCode.value);
      elements.roomMessage.textContent = 'Room setup loaded. Pass-and-play teams can start on this device.';
      elements.joinRoomCode.value = '';
    } catch (error) {
      elements.roomMessage.textContent = error.message;
    }
  });
  elements.joinRoomCode.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      elements.joinRoom.click();
    }
  });

  elements.closeScoreboard.addEventListener('click', () => elements.scoreboardDialog.close());
  elements.scoreboardDialog.addEventListener('click', (event) => {
    if (event.target === elements.scoreboardDialog) elements.scoreboardDialog.close();
  });
  elements.nextGroupRound.addEventListener('click', () => {
    elements.scoreboardDialog.close();
    finishGroupSeries();
  });
  document.addEventListener('keydown', handleKeyboardShortcuts);
  applyRoomCodeFromUrl();
}

initialize();
