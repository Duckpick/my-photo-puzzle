import { useEffect, useRef, useState } from "react"

const STORAGE_KEY = "duckpick_template_save_v1"
const SETTING_KEY = "duckpick_template_setting_v1"
const LAST_SCREEN_KEY = "duckpick_template_last_screen_v1"

const GAME_TITLE = "3 Second Memory Trap"

const GAME_CONFIG = {
  maxWidth: 390,
  baseHeight: 844,
  startStage: 1,
  memorizeSeconds: 3,
  questionSeconds: 3,
  hideDelayMs: 300,
  minCards: 2,
  maxCards: 5,
  cardStageMap: [
    { max: 3, count: 2 },
    { max: 7, count: 3 },
    { max: 12, count: 4 },
    { max: 999, count: 5 },
  ],
}

const CONTACT_EMAIL = "gameduckman@gmail.com"

function loadJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function getDefaultLanguage() {
  const saved = loadJson(SETTING_KEY)
  if (saved?.language) return saved.language
  return navigator.language.startsWith("ko") ? "ko" : "en"
}


const COLORS = ["red", "blue", "yellow", "green", "purple"]
const COLOR_HEX = {
  red: "#E74C3C",
  blue: "#3498DB",
  yellow: "#D6A900",
  green: "#2ECC71",
  purple: "#8E44AD",
}
const DIFFICULTY_CONFIG = [
  {
    minStage: 1,
    maxStage: 1,
    cardCount: 2,
    maxCategories: 1,
    colorVariants: 1,
    tutorial: "basic",
    allowedQuestionTypes: ["number_count", "alphabet_count"],
    tricks: { count: 0, pool: [] },
  },
  {
    minStage: 2,
    maxStage: 2,
    cardCount: 3,
    maxCategories: 1,
    forceCategory: "number",
    colorVariants: 1,
    tutorial: "scale",
    allowedQuestionTypes: ["number_max", "number_min"],
    tricks: { count: 1, pool: ["scale"] },
  },
  {
    minStage: 3,
    maxStage: 3,
    cardCount: 3,
    maxCategories: 2,
    colorVariants: 2,
    tutorial: "color",
    allowedQuestionTypes: ["color_count"],
    tricks: { count: 1, pool: ["color"] },
  },
  {
    minStage: 4,
    maxStage: 4,
    cardCount: 3,
    maxCategories: 2,
    colorVariants: 2,
    tutorial: "zero",
    allowedQuestionTypes: ["number_count", "alphabet_count"],
    tricks: { count: 1, pool: ["zero"] },
  },
  {
    minStage: 5,
    maxStage: 9,
    cardCount: 3,
    maxCategories: 2,
    colorVariants: 2,
    allowedQuestionTypes: [
      "color_count",
      "category_count",
      "number_max",
      "number_min",
      "odd_count",
"even_count",
    ],
    tricks: {
      count: 1,
      pool: ["scale", "rotation", "zero", "color"],
    },
  },
  {
    minStage: 10,
    maxStage: 19,
    cardCount: 4,
    maxCategories: 2,
    colorVariants: 3,
    allowedQuestionTypes: [
      "color_count",
      "category_count",
      "number_max",
      "number_min",
      "odd_count",
"even_count",
    ],
    tricks: {
      count: 2,
      pool: ["scale", "rotation", "zero", "color"],
    },
  },
  {
    minStage: 20,
    maxStage: 29,
    cardCount: 4,
    maxCategories: 2,
    colorVariants: 4,
    allowedQuestionTypes: [
      "color_count",
      "category_count",
      "number_max",
      "number_min",
      "odd_count",
      "even_count",
    ],
    tricks: {
      count: 3,
      pool: ["scale", "rotation", "zero", "color"],
    },
  },
  
  {
    minStage: 30,
    maxStage: 49,
    cardCount: 5,
    maxCategories: 2,
    colorVariants: 4,
    allowedQuestionTypes: [
      "color_count",
      "category_count",
      "number_max",
      "number_min",
      "odd_count",
      "even_count",
    ],
    tricks: {
      count: 3,
      pool: ["scale", "rotation", "zero", "color"],
    },
  },
  
  {
    minStage: 50,
    maxStage: 999,
    cardCount: 6,
    maxCategories: 2,
    colorVariants: 5,
    allowedQuestionTypes: [
      "color_count",
      "category_count",
      "number_max",
      "number_min",
      "odd_count",
      "even_count",
    ],
    tricks: {
      count: 3,
      pool: ["scale", "rotation", "zero", "color"],
    },
  },
]

function getDifficulty(stage) {
  return (
    DIFFICULTY_CONFIG.find(
      (item) => stage >= item.minStage && stage <= item.maxStage
    ) ?? DIFFICULTY_CONFIG[0]
  )
}

function pickTricks(stage) {
  const difficulty = getDifficulty(stage)
  const pool = [...difficulty.tricks.pool]
  const count = Math.min(difficulty.tricks.count, pool.length)

  const selected = []

  while (selected.length < count) {
    const index = Math.floor(Math.random() * pool.length)
    const trick = pool.splice(index, 1)[0]
    selected.push(trick)
  }

  return selected
}

function applyTricks(cards, selectedTricks) {
  let nextCards = [...cards]

  if (selectedTricks.includes("scale") && nextCards.length > 0) {
    const targetIndex = Math.floor(Math.random() * nextCards.length)

    nextCards[targetIndex] = {
      ...nextCards[targetIndex],
      scale: 1.8,
      tricks: [...nextCards[targetIndex].tricks, "scale"],
    }
  }
  if (selectedTricks.includes("rotation") && nextCards.length > 0) {
    const targetIndex = Math.floor(Math.random() * nextCards.length)
  
    const rotateValue =
      (Math.random() < 0.5 ? -1 : 1) *
      (6 + Math.floor(Math.random() * 10))
  
    nextCards[targetIndex] = {
      ...nextCards[targetIndex],
      rotate: rotateValue,
      tricks: [...nextCards[targetIndex].tricks, "rotation"],
    }
  }

  return nextCards
}

function generateCards(stage) {
  const difficulty = getDifficulty(stage)
  const cardCount = difficulty.cardCount
  const maxCategories = difficulty.maxCategories
  const colorVariants = difficulty.colorVariants ?? COLORS.length

  const selectedColors = [...COLORS]
    .sort(() => Math.random() - 0.5)
    .slice(0, colorVariants)

    const CATEGORY_POOL = ["number", "alphabet"]

    const selectedCategories = difficulty.forceCategory
    ? [difficulty.forceCategory]
    : CATEGORY_POOL
        .sort(() => Math.random() - 0.5)
        .slice(0, maxCategories)

  const cards = []

  for (let i = 0; i < cardCount; i++) {
    const category =
      selectedCategories[Math.floor(Math.random() * selectedCategories.length)]

    const color =
      selectedColors[Math.floor(Math.random() * selectedColors.length)]

    if (category === "number") {
      cards.push({
        id: i,
        category: "number",
        type: "number",
        value: Math.floor(Math.random() * 9) + 1,
        color,
        scale: 1,
        tricks: [],
      })
    }

    if (category === "alphabet") {
      const charCode = 65 + Math.floor(Math.random() * 26)

      cards.push({
        id: i,
        category: "alphabet",
        type: "alphabet",
        value: String.fromCharCode(charCode),
        color,
        scale: 1,
        tricks: [],
      })
    }

  }

  const selectedTricks = pickTricks(stage)
  const trickedCards = applyTricks(cards, selectedTricks)

  return trickedCards
}

function createZeroQuestion(cards, t) {
  const categories = [...new Set(cards.map(c => c.category))]
  const candidates = []

  if (categories.includes("number")) {
    const existing = new Set(
      cards.filter(c => c.category === "number").map(c => c.value)
    )

    for (let n = 0; n <= 9; n++) {
      if (!existing.has(n)) {
        candidates.push({
          text: t.questionCard.replace("{icon}", n),
          answer: 0,
        })
      }
    }
  }

  if (categories.includes("alphabet")) {
    const existing = new Set(
      cards.filter(c => c.category === "alphabet").map(c => c.value)
    )

    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i)

      if (!existing.has(letter)) {
        candidates.push({
          text: t.questionCard.replace("{icon}", letter),
          answer: 0,
        })
      }
    }
  }

  if (candidates.length === 0) return null

  const picked = candidates[Math.floor(Math.random() * candidates.length)]
  const optionSet = new Set([0])

  while (optionSet.size < 4) {
    optionSet.add(Math.floor(Math.random() * 6))
  }

  return {
    text: picked.text,
    answer: 0,
    options: [...optionSet].sort(() => Math.random() - 0.5),
  }
}

function generateQuestion(cards, t, stage) {
  const langKey = t === TEXT.ko ? "ko" : "en"
  const difficulty = getDifficulty(stage)
const allowedQuestionTypes = difficulty.allowedQuestionTypes ?? []

  const categories = [...new Set(cards.map(c => c.category))]

  const possibleQuestions = []

  const availableColors = [...new Set(cards.map(c => c.color))]

  if (allowedQuestionTypes.includes("color_count")) {
    availableColors.forEach(color => {
      possibleQuestions.push({
        type: "color_count",
        color,
      })
    })
  }

  if (allowedQuestionTypes.includes("category_count")) {
    if (categories.includes("number")) {
      possibleQuestions.push({ type: "category_count", category: "number" })
    }

    if (categories.includes("alphabet")) {
      possibleQuestions.push({ type: "category_count", category: "alphabet" })
    }
  }

  // 🔥 숫자 문제
  if (categories.includes("number")) {
    const numberCards = cards.filter(c => c.category === "number")

    // 단일 개수
    numberCards.forEach(card => {
      if (allowedQuestionTypes.includes("number_count")) {
        possibleQuestions.push({
          type: "number_count",
          value: card.value,
        })
      }
    })

    // 비교 (2개 이상일 때만)
    if (numberCards.length >= 2) {
      if (allowedQuestionTypes.includes("number_max")) {
        possibleQuestions.push({ type: "number_max" })
      }
      
      if (allowedQuestionTypes.includes("number_min")) {
        possibleQuestions.push({ type: "number_min" })
      }
      const oddEvenChance =
      stage >= 20
        ? 0.3
        : stage >= 10
        ? 0.2
        : 0.12
    
    if (
      allowedQuestionTypes.includes("odd_count") &&
      Math.random() < oddEvenChance
    ) {
      possibleQuestions.push({ type: "odd_count" })
    }
    
    if (
      allowedQuestionTypes.includes("even_count") &&
      Math.random() < oddEvenChance
    ) {
      possibleQuestions.push({ type: "even_count" })
    }

    }
  }

  // 🔥 알파벳 문제
  if (categories.includes("alphabet")) {
    const alphabetCards = cards.filter(c => c.category === "alphabet")

    alphabetCards.forEach(card => {
      if (allowedQuestionTypes.includes("alphabet_count")) {
        possibleQuestions.push({
          type: "alphabet_count",
          value: card.value,
        })
      }
    })
  }
  const hasZeroTrick = cards.some(c => c.tricks.includes("zero"))

  if (hasZeroTrick) {
    const zeroQuestion = createZeroQuestion(cards, t)
    if (zeroQuestion) return zeroQuestion
  }

  // 🔥 문제 선택
  const picked =
    possibleQuestions[Math.floor(Math.random() * possibleQuestions.length)]

  let answer = null
  let text = ""

  if (picked.type === "color_count") {
    const colorText = COLOR_TEXT[langKey]?.[picked.color] ?? picked.color

    answer = cards.filter(c => c.color === picked.color).length

    text = t.questionColorOnly.replace("{color}", colorText)
  }

  if (picked.type === "category_count") {
    answer = cards.filter(c => c.category === picked.category).length

    text =
      picked.category === "number"
        ? t.questionCategoryNumber
        : t.questionCategoryAlphabet
  }

  // =========================
  // 숫자
  // =========================

  if (picked.type === "number_count") {
    answer = cards.filter(c => c.value === picked.value).length
    text = t.questionCard.replace("{icon}", picked.value)
  }

  if (picked.type === "number_max") {
    const nums = cards.filter(c => c.category === "number").map(c => c.value)
    answer = Math.max(...nums)

    text = langKey === "ko"
      ? "가장 큰 숫자는?"
      : "What is the largest number?"
  }

  if (picked.type === "number_min") {
    const nums = cards.filter(c => c.category === "number").map(c => c.value)
    answer = Math.min(...nums)

    text = langKey === "ko"
      ? "가장 작은 숫자는?"
      : "What is the smallest number?"
  }

  if (picked.type === "odd_count") {
    answer = cards.filter(
      c =>
        c.category === "number" &&
        c.value % 2 === 1
    ).length
  
    text =
      langKey === "ko"
        ? "홀수 숫자는 몇 개 있었나요?"
        : "How many odd numbers were there?"
  }
  
  if (picked.type === "even_count") {
    answer = cards.filter(
      c =>
        c.category === "number" &&
        c.value % 2 === 0
    ).length
  
    text =
      langKey === "ko"
        ? "짝수 숫자는 몇 개 있었나요?"
        : "How many even numbers were there?"
  }

  // =========================
  // 알파벳
  // =========================

  if (picked.type === "alphabet_count") {
    answer = cards.filter(c => c.value === picked.value).length
    text = t.questionCard.replace("{icon}", picked.value)
  }

  // =========================
  // 보기 생성
  // =========================

  const optionSet = new Set([answer])

  while (optionSet.size < 4) {
    if (typeof answer === "number") {
      const fake = Math.max(0, answer + Math.floor(Math.random() * 7) - 3)
      optionSet.add(fake)
    } else {
      const fake = String.fromCharCode(65 + Math.floor(Math.random() * 26))
      optionSet.add(fake)
    }
  }

  const options = [...optionSet].sort(() => Math.random() - 0.5)

  return {
    text,
    answer,
    options,
  }
}

const COLOR_TEXT = {
  ko: {
    red: "빨간",
    blue: "파란",
    yellow: "노란",
    green: "초록",
    purple: "보라",
  },
  en: {
    red: "red",
    blue: "blue",
    yellow: "yellow",
    green: "green",
    purple: "purple",
  },
}

const TEXT = {
  ko: {
    questionLabel: "문제",
    cardReview: "카드 확인",
confirm: "확인",
fail: "실패!",
    success: "정답!",
successDone: "성공!",
next: "다음 단계",
    memo: "카드를 기억하세요!",
    mainTitleShort: "초",
mainTitleMain: "기억 트랩",
reachedStage: "도달 단계",
correct: "정답",
selected: "선택",
retry: "다시하기",
timeout: "시간초과",
    questionCard: "{icon} 카드는 몇 개 있었나요?",
    questionColor: "{color} {icon} 카드는 몇 개 있었나요?",
    questionColorOnly: "{color} 카드는 몇 개 있었나요?",
questionCategoryNumber: "숫자 카드는 몇 개 있었나요?",
questionCategoryAlphabet: "알파벳 카드는 몇 개 있었나요?",
    mainTitle: "3초 기억 트랩",
    mainDesc: "3초 안에 기억하고 함정에 속지 마세요",
stage: "단계",
gameArea: "순간 기억력으로 함정을 돌파하세요",
bestScoreLabel: "최고 기록",
    title: GAME_TITLE,
    subtitle: "새 게임을 여기에 넣으세요.",
    start: "게임 시작",
    result: "결과",
    main: "메인으로",
    share: "공유",
    reset: "초기화",
    setting: "설정",
    rule: "게임 규칙",
    recordReset: "기록 초기화",
    sound: "사운드",
    bgm: "배경음",
    language: "언어",
    volume: "볼륨",
    close: "닫기",
    ad: "Advertisement",
    privacy: "개인정보처리방침",
    contact: "문의",
    support: "후원",
    aboutTitle: "게임 소개",
    aboutText:
      "3 Second Memory Trap은 짧은 시간 안에 카드를 기억하고 다양한 시각 함정을 구분하는 두뇌 기억 게임입니다. 단계가 올라갈수록 카드 수와 트릭이 증가하며 집중력과 순간 기억력을 테스트합니다.",
    resetConfirm: "저장된 기록을 초기화할까요?",
    rules: [
      "1. 카드를 빠르게 기억하세요.",
      "2. 화면이 바뀌면 문제를 정확히 읽으세요.",
      "3. 크기, 색깔 등으로 착각을 유도합니다.",
      "4. 보이는 것보다 문제 조건이 더 중요합니다.",
      "5. 없는 카드(0개)가 정답일 수도 있습니다.",
    ],
  },
  en: {
    questionLabel: "Question",
    cardReview: "Check Cards",
confirm: "Confirm",
fail: "Fail!",
    success: "Correct!",
successDone: "Clear!",
next: "Next",
    memo: "Memorize the cards!",
    mainTitleShort: " sec",
mainTitleMain: "Memory Trap",
reachedStage: "Stage",
correct: "Correct",
selected: "Your Answer",
retry: "Retry",
timeout: "Timeout",
    questionCard: "How many {icon} cards were there?",
    questionColor: "How many {color} {icon} cards were there?",
    questionColorOnly: "How many {color} cards were there?",
questionCategoryNumber: "How many number cards were there?",
questionCategoryAlphabet: "How many alphabet cards were there?",
    title: GAME_TITLE,
    mainTitle: "3 Second Memory Game",
    mainDesc: "Easy to play, hard to get right",
stage: "Stage",
gameArea: "Break through traps with instant memory",
bestScoreLabel: "Best Score",
    subtitle: "Put your new game here.",
    start: "Start Game",
    result: "Result",
    main: "Main",
    share: "Share",
    reset: "Reset",
    setting: "Settings",
    rule: "Rules",
    recordReset: "Reset Record",
    sound: "Sound",
    bgm: "BGM",
    language: "Language",
    volume: "Volume",
    close: "Close",
    ad: "Ad Area",
    privacy: "Privacy Policy",
    contact: "Contact",
    support: "Support",
    aboutTitle: "About",
    aboutText:
      "3 Second Memory Trap is a fast-paced brain memory game where players memorize cards and survive visual traps within seconds. As the stage increases, more cards and tricky visual effects appear to challenge your focus and memory.",
    resetConfirm: "Reset saved data?",
    rules: [
      "1. Memorize the cards quickly.",
      "2. Read the question carefully.",
      "3. Size and color may trick you.",
      "4. Focus on the condition, not appearance.",
      "5. The answer can be zero.",
    ],
  },
}

export default function App() {
  const savedData = loadJson(STORAGE_KEY, {})
  const savedSetting = loadJson(SETTING_KEY, {})

  const [page, setPage] = useState(window.location.pathname)
  const [screen, setScreen] = useState("main")
  const [popup, setPopup] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)

  const [language, setLanguage] = useState(savedSetting.language ?? getDefaultLanguage())
  const [soundOn, setSoundOn] = useState(savedSetting.soundOn ?? true)
  const [bgmOn, setBgmOn] = useState(savedSetting.bgmOn ?? false)
  const [volume, setVolume] = useState(savedSetting.volume ?? 0.3)

  const [bestScore, setBestScore] = useState(savedData.bestScore ?? 0)
  const [lastScore, setLastScore] = useState(savedData.lastScore ?? 0)

  const [stage, setStage] = useState(1)
const [cards, setCards] = useState([])
const [questionCards, setQuestionCards] = useState([])
const [reviewMode, setReviewMode] = useState(false)
const [hideCards, setHideCards] = useState(false)
const [question, setQuestion] = useState(null)
const [options, setOptions] = useState([])
const [selectedAnswer, setSelectedAnswer] = useState(null)
const [answerLocked, setAnswerLocked] = useState(false)
const [timeLeft, setTimeLeft] = useState(5)
const [questionTimeLeft, setQuestionTimeLeft] = useState(0)

  const clickSoundRef = useRef(null)
  const correctSoundRef = useRef(null)
const wrongSoundRef = useRef(null)

if (!clickSoundRef.current) {
  clickSoundRef.current = new Audio("/sound/click.wav")
}

if (!correctSoundRef.current) {
  correctSoundRef.current = new Audio("/sound/correct.wav")
}

if (!wrongSoundRef.current) {
  wrongSoundRef.current = new Audio("/sound/wrong.wav")
}



  const t = TEXT[language]
  const isMobile = window.innerWidth <= 420
  const scale = isMobile ? 1 : Math.min(1, window.innerHeight / 844)

  const playClick = () => {
    if (!soundOn) return
    const s = clickSoundRef.current.cloneNode()
    s.volume = volume
    s.play().catch(() => {})
  }
  const playCorrect = () => {
    if (!soundOn) return
    const s = correctSoundRef.current.cloneNode()
    s.volume = volume
    s.play().catch(() => {})
  }
  
  const playWrong = () => {
    if (!soundOn) return
    const s = wrongSoundRef.current.cloneNode()
    s.volume = volume
    s.play().catch(() => {})
  }

  useEffect(() => {
    saveJson(STORAGE_KEY, {
      bestScore,
      lastScore,
    })
  }, [bestScore, lastScore])

  useEffect(() => {
    saveJson(SETTING_KEY, {
      language,
      soundOn,
      bgmOn,
      volume,
    })
  }, [language, soundOn, bgmOn, volume])

  useEffect(() => {
    if (screen !== "memorize") return
  
    setTimeLeft(GAME_CONFIG.memorizeSeconds)


  let hideTimer = null
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          setHideCards(true)

          hideTimer = setTimeout(() => {
            const q = generateQuestion(cards, t, stage)
            setQuestion(q)
            setOptions(q.options)
            setQuestionCards(cards)
            setCards([])
            setQuestionTimeLeft(GAME_CONFIG.questionSeconds)
            setScreen("question")
          }, GAME_CONFIG.hideDelayMs)
          
          return 0
        }
  
        return prev - 1
      })
    }, 1000)
  
    return () => {
      clearInterval(timer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [screen])

  useEffect(() => {
    if (screen !== "question") return
    setAnswerLocked(false)
  
    let isActive = true
  
    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (!isActive) return prev
  
        if (prev <= 0) {
          clearInterval(timer)
  
          if (!isActive) return 0
          playWrong()
          setSelectedAnswer(t.timeout)
          setAnswerLocked(true)
          setLastScore(Math.max(0, stage - 1))
          setBestScore((prevBest) => Math.max(prevBest, Math.max(0, stage - 1)))
          setScreen("result")
  
          return 0
        }
  
        return prev - 1
      })
    }, 1000)
  
    return () => {
      isActive = false
      clearInterval(timer)
    }
  }, [screen])

  useEffect(() => {
    const handlePopState = () => {
      setPage(window.location.pathname)
      window.scrollTo(0, 0)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const goPage = (path) => {
    window.history.pushState({}, "", path)
    setPage(path)
    window.scrollTo(0, 0)
  }

  const goHome = () => {
    window.history.pushState({}, "", "/")
    setPage("/")
    window.scrollTo(0, 0)
  }

  const resetData = () => {
    const ok = confirm(t.resetConfirm)
    if (!ok) return

    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LAST_SCREEN_KEY)

    setBestScore(0)
    setLastScore(0)
    setScreen("main")
  }

  const startGame = () => {
    playClick()

    setStage(GAME_CONFIG.startStage)
  
    const newCards = generateCards(stage)
  
    setCards(newCards)
    setQuestionCards(newCards)
    setTimeLeft(GAME_CONFIG.memorizeSeconds) // 핵심
    setQuestionTimeLeft(0)
    setQuestion(null)
    setOptions([])
    setSelectedAnswer(null)
    setAnswerLocked(false)
    setHideCards(false)
    setScreen("memorize")
  }

  const koMessages = [
    `🧠 최고 기록: ${bestScore}단계\n\n3초 안에 기억하고 함정을 피할 수 있을까?`,
    `🔥 ${bestScore}단계 돌파!\n\n이거 생각보다 진짜 헷갈림`,
    `👀 3초 보고 다 기억 가능?\n\n${bestScore}단계까지 생존 성공`,
    `⚠️ 단순 기억게임 아님\n\n함정 때문에 계속 틀림`,
    `🧩 갈수록 뇌가 꼬이는 기억 트랩\n\n최고 기록 ${bestScore}단계`,
  ]
  
  const enMessages = [
    `🧠 Best Score: Stage ${bestScore}\n\nCan you survive the 3-second memory trap?`,
    `🔥 Reached Stage ${bestScore}!\n\nThis gets confusing really fast`,
    `👀 Think you can remember all cards in 3 seconds?`,
    `⚠️ Looks easy. Actually brutal.`,
    `🧩 A fast brain memory trap game\n\nBest Score: Stage ${bestScore}`,
  ]
  
  const randomMessage =
    language === "ko"
      ? koMessages[Math.floor(Math.random() * koMessages.length)]
      : enMessages[Math.floor(Math.random() * enMessages.length)]

  const shareTextResult = async () => {
    const shareUrl = window.location.origin
    const message =
  `${GAME_TITLE}\n\n${randomMessage}\n\n👉 ${shareUrl}`

    try {
      if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        await navigator.share({
          title: GAME_TITLE,
          text: message,
        })
        return
      }
    } catch {
      return
    }

    await navigator.clipboard.writeText(message)
    alert(language === "ko" ? "복사되었습니다." : "Copied!")
  }

  const CommonFooter = () => (
    <div style={styles.siteFooter}>
      <div style={styles.footerTitle}>{t.aboutTitle}</div>
      <div style={styles.footerText}>{t.aboutText}</div>

      <div style={styles.footerLinks}>
        <button style={styles.footerLinkBtn} onClick={() => goPage("/privacy")}>
          {t.privacy}
        </button>
        <button style={styles.footerLinkBtn} onClick={() => goPage("/contact")}>
          {t.contact}
        </button>
        <button style={styles.footerLinkBtn} onClick={() => goPage("/support")}>
          {t.support}
        </button>
      </div>
    </div>
  )

  if (page === "/privacy") {
    return (
      <div style={styles.page}>
        <div style={styles.app}>
          <button style={styles.backBtn} onClick={goHome}>← Home</button>
          <div style={styles.infoPage}>
            <div style={styles.infoPageTitle}>
              {language === "ko" ? "개인정보처리방침" : "Privacy Policy"}
            </div>
            <p>
              {language === "ko"
                ? "본 사이트는 사용자의 개인정보를 직접 수집하지 않습니다."
                : "This site does not directly collect personal information."}
            </p>
            <p>
              {language === "ko"
                ? "본 사이트는 Google AdSense를 사용할 수 있으며, 광고 제공을 위해 쿠키가 사용될 수 있습니다."
                : "This site may use Google AdSense, which may use cookies to serve ads."}
            </p>
            <p>Google Ads Policy: https://policies.google.com/technologies/ads</p>
            <p>Contact: {CONTACT_EMAIL}</p>
            <div style={styles.footerLinks}>
  <button style={styles.footerLinkBtn} onClick={() => goPage("/privacy")}>
    {t.privacy}
  </button>
  <button style={styles.footerLinkBtn} onClick={() => goPage("/contact")}>
    {t.contact}
  </button>
  <button style={styles.footerLinkBtn} onClick={() => goPage("/support")}>
    {t.support}
  </button>
</div>
          </div>
        </div>
      </div>
    )
  }

  if (page === "/contact") {
    return (
      <div style={styles.page}>
        <div style={styles.app}>
          <button style={styles.backBtn} onClick={goHome}>← Home</button>
          <div style={styles.infoPage}>
            <div style={styles.infoPageTitle}>{t.contact}</div>
            <p>
              {language === "ko"
                ? `${GAME_TITLE} 관련 문의, 오류 제보, 광고 및 기타 요청은 아래 이메일로 연락할 수 있습니다.`
                : `For questions, bug reports, advertising inquiries, or other requests related to ${GAME_TITLE}, please contact us by email.`}
            </p>
            <p>Email: {CONTACT_EMAIL}</p>
            <div style={styles.footerLinks}>
  <button style={styles.footerLinkBtn} onClick={() => goPage("/privacy")}>
    {t.privacy}
  </button>
  <button style={styles.footerLinkBtn} onClick={() => goPage("/contact")}>
    {t.contact}
  </button>
  <button style={styles.footerLinkBtn} onClick={() => goPage("/support")}>
    {t.support}
  </button>
</div>
          </div>
        </div>
      </div>
    )
  }

  if (page === "/support") {
    return (
      <div style={styles.page}>
        <div style={styles.app}>
          <button style={styles.backBtn} onClick={goHome}>← Home</button>
          <div style={styles.infoPage}>
            <div style={styles.infoPageTitle}>{t.support}</div>
            <p>
              {language === "ko"
                ? "현재 별도의 결제나 후원 기능은 제공하지 않습니다."
                : "This site currently does not provide payment or donation features."}
            </p>
            <div style={styles.footerLinks}>
  <button style={styles.footerLinkBtn} onClick={() => goPage("/privacy")}>
    {t.privacy}
  </button>
  <button style={styles.footerLinkBtn} onClick={() => goPage("/contact")}>
    {t.contact}
  </button>
  <button style={styles.footerLinkBtn} onClick={() => goPage("/support")}>
    {t.support}
  </button>
</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {!isMobile && <div style={styles.sideAd}>{t.ad}</div>}

      <div style={{ ...styles.app, transform: `scale(${scale})` }}>
        {screen === "main" && (
          
          <>
<div style={styles.mainTopBar}>
  <div style={styles.brandBox}>
  <img
  src="/img/logo/duckpick_logo.png"
  style={{
    width: "34px",
    height: "34px",
    objectFit: "contain",
  }}
/>
  <div style={styles.brandText}>DuckPick Studio</div>
  </div>

  <div style={styles.topRightBtns}>
  <button
    style={styles.circleBtn}
    onClick={() => {
      playClick()
      setPopup("rule")
    }}
  >
    !
  </button>

  <button
    style={styles.circleBtn}
    onClick={() => {
      playClick()
      setPopup("setting")
    }}
  >
    ⚙
  </button>
</div>
</div>

<div style={styles.mainHero}>
  <div style={styles.mainBigTitle}>
    <span style={styles.mainTitleNumber}>3</span>{t.mainTitleShort}
  </div>
  <div style={styles.mainTitleText}>
    {t.mainTitleMain}
  </div>
  <div style={styles.mainDescText}>
    {t.mainDesc}
  </div>
</div>

<div style={styles.recordCard}>
  <div style={styles.recordIcon}>🏆</div>

  <div style={styles.recordTextBox}>
    <div style={styles.recordLabel}>
      {t.bestScoreLabel}
    </div>

    <div style={styles.recordValue}>
      {bestScore}
      <span style={styles.recordUnit}> {t.stage}</span>
    </div>
  </div>
</div>

<button style={styles.startBtnYellow} onClick={startGame}>
{t.start}
</button>

            <div style={styles.adBox}>{t.ad}</div>
            <CommonFooter />
          </>
        )}

{screen === "memorize" && (
  <>
    <div style={styles.memorizeWrap}>
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
        <div style={styles.topBrand}>
  <img
    src="/img/logo/duckpick_logo.png"
    style={{
      width: "24px",
      height: "24px",
      objectFit: "contain",
    }}
  />

  <span>DuckPick</span>
</div>
        </div>
        <div style={styles.topRight}>
          {t.stage} {stage}
        </div>
      </div>

      <div style={styles.timerWrap}>
  <div style={styles.timerText}>
    ⏱ {timeLeft}s
  </div>

  <div style={styles.timerBarBg}>
    <div
      style={{
        ...styles.timerBar,
        width: `${(timeLeft / GAME_CONFIG.memorizeSeconds) * 100}%`,
      }}
    />
  </div>
</div>

<div
style={{
  ...styles.cardRow,
}}
>
        {cards.map((c) => (
          <div
            key={c.id}
            style={{
              ...(hideCards ? styles.cardBoxHidden : styles.cardBox),
            }}
          >
<span
style={{
  fontSize: `${language === "en" ? 40 : 42}px`,
  fontWeight: "900",
  color: COLOR_HEX[c.color] ?? "#333",
  fontFamily: "Pretendard, sans-serif",
  transform: `
  scale(${c.scale ?? 1})
  rotate(${c.rotate ?? 0}deg)
`,

  maxWidth: "85px",
  textAlign: "center",
  display: "block",

  whiteSpace: language === "en" ? "nowrap" : "normal",
  wordBreak: "keep-all",
  overflowWrap: "normal",
}}
>
  {c.type === "number" && c.value}
  {c.type === "alphabet" && c.value}
</span>
          </div>
        ))}
        </div>
  
        <div style={styles.memoBox}>
  {t.memo}
</div>
      </div>
    </>
  )}


{screen === "question" && question && (
  <>
<div style={styles.questionWrap}>

<div style={styles.topBar}>
  <div style={styles.topLeft}>
  <div style={styles.topBrand}>
  <img
    src="/img/logo/duckpick_logo.png"
    style={{
      width: "24px",
      height: "24px",
      objectFit: "contain",
    }}
  />

  <span>DuckPick</span>
</div>
  </div>
  <div style={styles.topRight}>
    {t.stage} {stage}
  </div>
</div>
  
<div style={styles.timerWrap}>
  <div style={styles.timerText}>
    ⏱ {questionTimeLeft}s
  </div>

  <div style={styles.timerBarBg}>
    <div
      style={{
        ...styles.timerBar,
        width: `${(questionTimeLeft / GAME_CONFIG.questionSeconds) * 100}%`,
      }}
    />
  </div>
</div>

<div style={styles.questionTitle}>{t.questionLabel}</div>

<div style={styles.questionText}>
  {question.text}
</div>

<div
style={{
  ...styles.cardRow,
}}
>
  {questionCards.map((c) => (
    <div key={c.id} style={styles.cardBoxHidden}>
      <span style={styles.cardIcon}>?</span>
    </div>
  ))}
</div>

  <div style={styles.optionBox}>
        {options.map((opt, idx) => (
          <button
  key={idx}
  style={{
    ...styles.optionBtn,
    transform: selectedAnswer === opt ? "scale(0.95)" : "scale(1)",
    background:
      selectedAnswer !== null
        ? opt === question.answer
          ? "linear-gradient(180deg, #4cd964, #2ecc71)" // 정답 초록
          : opt === selectedAnswer
          ? "linear-gradient(180deg, #ff5e57, #e74c3c)" // 오답 빨강
          : styles.optionBtn.background
        : styles.optionBtn.background,
    color:
      selectedAnswer !== null &&
      (opt === question.answer || opt === selectedAnswer)
        ? "#111"
        : "#fff",
  }}
  onClick={() => {
    if (answerLocked) return
  
    setAnswerLocked(true)
    setSelectedAnswer(opt)

    if (opt === question.answer) {
      playCorrect()
      const nextStage = stage + 1
      const clearStage = stage
    
      setLastScore(clearStage)
      setBestScore((prev) => Math.max(prev, clearStage))
    
      setStage(nextStage)
      setSelectedAnswer(null)
      setAnswerLocked(true)
      setScreen("success")
    } else {
      playWrong()
      setQuestionTimeLeft(0)
      setAnswerLocked(true)
      setLastScore(Math.max(0, stage - 1))
      setBestScore((prev) => Math.max(prev, Math.max(0, stage - 1)))
      setSelectedAnswer(opt)
      setScreen("result")
    }
            }}
          >
            {opt}
          </button>
        ))}
      </div>

    </div>
  </>
)}

{screen === "success" && (
  <>
    <div style={styles.resultWrap}>
      <div style={styles.topBar}>
        <div style={styles.topLeft}><div style={styles.topBrand}>
  <img
    src="/img/logo/duckpick_logo.png"
    style={{
      width: "24px",
      height: "24px",
      objectFit: "contain",
    }}
  />

  <span>DuckPick</span>
</div></div>
        <div style={styles.topRight}>{t.stage} {stage - 1}</div>
      </div>

      <div style={styles.successText}>
        {t.success}
      </div>

      <div style={styles.successEmoji}>
      <img
  src="/img/duck/duck_success.png"
  style={{
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "20px",
  }}
/>
</div>

      <div style={styles.successBox}>
        {stage - 1}{t.stage} {t.successDone}
      </div>

      <button
        style={styles.resultPrimaryBtn}
        onClick={() => {
          const newCards = generateCards(stage)
          setCards(newCards)
          setQuestionCards([])
          setHideCards(false)
          setQuestion(null)
          setOptions([])
          setSelectedAnswer(null)
          setTimeLeft(GAME_CONFIG.memorizeSeconds)
          setQuestionTimeLeft(0)
          setAnswerLocked(false)
          setScreen("memorize")
        }}
      >
        {t.next}
      </button>
    </div>
  </>
)}

{screen === "result" && (
  <>
    <div style={styles.resultWrap}>
      <div style={styles.topBar}>
        <div style={styles.topLeft}><div style={styles.topBrand}>
  <img
    src="/img/logo/duckpick_logo.png"
    style={{
      width: "24px",
      height: "24px",
      objectFit: "contain",
    }}
  />

  <span>DuckPick</span>
</div></div>
        <div style={styles.topRight}>{t.result}</div>
      </div>

      {!reviewMode ? (
        <>
          <div style={styles.resultMainText}>
            {t.fail}
          </div>

          <div style={styles.resultDuck}>
          <img
  src="/img/duck/duck_fail.png"
  style={{
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "20px",
  }}
/>
</div>

          <div style={styles.resultInfoBox}>
            <div style={styles.resultInfoRow}>
              <span>{t.reachedStage}</span>
              <strong style={{ color: "#ff6b6b", fontSize: "18px" }}>
  {Math.max(0, stage - 1)}{t.stage}
</strong>
            </div>

            <div style={styles.resultInfoRow}>
              <span>{t.bestScoreLabel}</span>
              <strong>{bestScore}{t.stage}</strong>
            </div>

            <div style={styles.resultDivider} />

            <div style={styles.resultInfoRow}>
              <span>{t.correct}</span>
              <strong style={{ color: "#ffd447", fontSize: "18px" }}>
  {question?.answer ?? "-"}
</strong>
            </div>

            <div style={styles.resultInfoRow}>
              <span>{t.selected}</span>
              <strong style={{ color: "#ff6b6b", fontSize: "18px" }}>
  {selectedAnswer ?? "-"}
</strong>
            </div>
          </div>

          <button
            style={styles.reviewBtn}
            onClick={() => {
              playClick()
              setReviewMode(true)
            }}
          >
            {t.cardReview}
          </button>

          <div style={styles.resultButtonRow}>
            <button
              style={styles.resultHalfBtnYellow}
              onClick={() => {
                playClick()
                setStage(GAME_CONFIG.startStage)
                setCards([])
                setQuestionCards([])
                setQuestion(null)
                setOptions([])
                setSelectedAnswer(null)
                setAnswerLocked(false)
                setHideCards(false)
                setReviewMode(false)
                setTimeLeft(GAME_CONFIG.memorizeSeconds)
                setQuestionTimeLeft(0)
                setScreen("main")
              }}
            >
              {t.retry}
            </button>

            <button
              style={styles.resultHalfBtnDark}
              onClick={() => {
                playClick()
                shareTextResult()
              }}
            >
              {t.share}
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={styles.questionTitle}>{t.questionLabel}</div>

<div style={styles.questionText}>
  {question?.text}
</div>

<div
style={{
  ...styles.cardRow,
}}
>
  {questionCards.map((c) => (
    <div key={c.id} style={styles.cardBox}>
<span
style={{
  fontSize: `${language === "en" ? 40 : 42}px`,
  fontWeight: "900",
  color: COLOR_HEX[c.color] ?? "#333",
  fontFamily: "Pretendard, sans-serif",
  transform: `
  scale(${c.scale ?? 1})
  rotate(${c.rotate ?? 0}deg)
`,

  maxWidth: "85px",
  textAlign: "center",
  display: "block",

  whiteSpace: language === "en" ? "nowrap" : "normal",
  wordBreak: "keep-all",
  overflowWrap: "normal",
}}
>
  {c.type === "number" && c.value}
  {c.type === "alphabet" && c.value}
</span>
    </div>
  ))}
</div>

<button
  style={styles.resultPrimaryBtn}
            onClick={() => {
              playClick()
              setReviewMode(false)
            }}
          >
            {t.confirm}
          </button>
        </>
      )}

      <div style={styles.adBox}>{t.ad}</div>
    </div>
  </>
)}

        {popup && (
          <div style={styles.popupDim}>
            <div style={styles.popupBox}>
              <div style={styles.popupTitle}>
                {popup === "rule" ? t.rule : t.setting}
              </div>

              <div style={styles.popupText}>
                {popup === "rule" ? (
                  <>
                    {t.rules.map((rule) => (
                      <div key={rule}>{rule}</div>
                    ))}
                  </>
                ) : (
                  <>

                    <button style={styles.popupBtn} onClick={() => { playClick(); resetData() }}>
                      {t.recordReset}
                    </button>

                    <button
                      style={styles.popupBtn}
                      onClick={async () => {
                        playClick()
                        if (installPrompt) {
                          installPrompt.prompt()
                          await installPrompt.userChoice
                          setInstallPrompt(null)
                          return
                        }

                        alert(
                          language === "ko"
                            ? "브라우저 메뉴에서 '홈 화면에 추가'를 선택하세요."
                            : "Use your browser menu and choose 'Add to Home Screen'."
                        )
                      }}
                    >
                      {language === "ko" ? "홈화면 추가" : "Add to Home"}
                    </button>

                    <div style={styles.settingRow}>
                      {t.sound}
                      <button
                        onClick={() => { playClick(); setSoundOn(!soundOn) }}
                        style={soundOn ? styles.onBtn : styles.offBtn}
                      >
                        {soundOn ? "ON" : "OFF"}
                      </button>
                    </div>

                    <div style={styles.settingRow}>
                      {t.bgm}
                      <button
                        onClick={() => { playClick(); setBgmOn(!bgmOn) }}
                        style={bgmOn ? styles.onBtn : styles.offBtn}
                      >
                        {bgmOn ? "ON" : "OFF"}
                      </button>
                    </div>

                    <div style={styles.settingRow}>
                      {t.language}
                      <button
                        onClick={() => { playClick(); setLanguage(language === "ko" ? "en" : "ko") }}
                        style={styles.langBtn}
                      >
                        {language === "ko" ? "한국어 🇰🇷" : "English 🇺🇸"}
                      </button>
                    </div>

                    <div style={styles.settingRow}>
                      {t.volume}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                      />
                    </div>
                  </>
                )}
              </div>

              <button style={styles.popupCloseBtn} onClick={() => { playClick(); setPopup(null) }}>
                {t.close}
              </button>
            </div>
          </div>
        )}
      </div>

      {!isMobile && <div style={styles.sideAd}>{t.ad}</div>}
    </div>
  )
}

const styles = {
  memorizeWrap: {
    textAlign: "center",
    marginTop: "px",
  },
  
  memorizeTimer: {
    marginBottom: "20px",
  },

  timerWrap: {
    marginBottom: "20px",
  },
  
  timerText: {
    fontSize: "14px",
    color: "#f6c343",
    marginBottom: "6px",
  },
  
  timerBarBg: {
    width: "100%",
    height: "10px",
    background: "#222",
    borderRadius: "10px",
    overflow: "hidden",
  },
  
  timerBar: {
    height: "100%",
    background: "linear-gradient(90deg, #ffd84d, #f6c343)",
    transition: "width 0.9s linear",
  },
  
  cardRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "30px",
    margin: "0 auto",
  },
  cardBox: {
    width: "90px",
    height: "120px",
    borderRadius: "12px",
    background: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBoxHidden: {
    width: "90px",
    height: "120px",
    borderRadius: "12px",
    background: "linear-gradient(180deg, #f5f5f5, #dcdcdc)",
    border: "1px solid rgba(255,255,255,0.7)",
    opacity: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  
  cardIcon: {
    fontSize: "44px",
    color: "#777",
    fontWeight: "900",
  },
  page: {
    width: "100vw",
    minHeight: "100vh",
    background: "#111",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    color: "white",
    fontFamily: "Pretendard, sans-serif",
  },

  app: {
    position: "relative",
    width: "390px",
    minWidth: "390px",
    flexShrink: 0,
    minHeight: "844px",
    transformOrigin: "top center",
    background: "radial-gradient(circle at top, #222b48 0%, #10131f 42%, #050608 100%)",
    padding: "18px",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  mainHeader: {
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, #182230 0%, #0b1018 100%)",
    border: "1px solid #2f3a4a",
  },

  row1: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.14)",
    paddingBottom: "8px",
  },

  profileRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  logoBox: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: "#f6c343",
    color: "#111",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },

  nicknameText: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
  },

  editNameBtn: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: "1px solid #555",
    background: "#1a1a1a",
    color: "#fff",
    fontSize: "14px",
  },

  rightGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  iconBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "1px solid #555",
    background: "#1a1a1a",
    color: "#fff",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  row2: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    justifyContent: "space-between",
  },

  scoreText: {
    fontSize: "15px",
    color: "#f6c343",
    fontWeight: "bold",
  },

  resetBtn: {
    border: "1px solid #444",
    background: "#1a1a1a",
    color: "#f6c343",
    padding: "8px 12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  gameBox: {
    marginTop: "18px",
    padding: "28px 16px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, #202938 0%, #0d1118 100%)",
    border: "1px solid #2f3a4a",
    textAlign: "center",
  },

  gameTitle: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#f6c343",
    marginBottom: "10px",
  },

  stageText: {
    fontSize: "14px",
    color: "#aaa",
    marginTop: "6px",
  },

  gameSubtitle: {
    fontSize: "15px",
    color: "#ccc",
  },
  startBtnYellow: {
    width: "100%",
    marginTop: "40px",
    padding: "20px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, #ffd84d, #f6c343)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#1f2430",
    fontSize: "20px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
  },

  startBtn: {
    width: "100%",
    marginTop: "14px",
    padding: "16px",
    borderRadius: "14px",
    background: "linear-gradient(180deg, #38d85a 0%, #138528 100%)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 18px rgba(40,167,69,0.45)",
  },

  adBox: {
    marginTop: "80px",
    height: "100px",
    background: "#222",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#777",
    fontSize: "14px",
  },

  sideAd: {
    width: "160px",
    height: "600px",
    margin: "20px 16px",
    background: "#222",
    borderRadius: "12px",
    border: "1px solid #333",
    color: "#777",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },
  resultBigIcon: {
    fontSize: "64px",
    marginBottom: "10px",
  },
  
  resultMainText: {
    fontSize: "42px",
    fontWeight: "900",
    color: "#ff5e57",
    marginBottom: "16px",  // ← 여기 핵심 (기존 10 → 16)
    textShadow: "0 4px 12px rgba(255,94,87,0.4)",
  },
  resultFailTitle: {
    fontSize: "32px",
    marginBottom: "10px",
  },
  
  resultStageText: {
    fontSize: "20px",
    marginBottom: "6px",
  },
  
  resultBestText: {
    fontSize: "16px",
    color: "#aaa",
    marginBottom: "20px",
  },
  
  resultInfoText: {
    marginBottom: "20px",
  },
  
  resultSelectedText: {
    marginBottom: "30px",
  },

  resultStageBox: {
    marginTop: "20px",
    marginBottom: "10px",
  },
  
  resultStageValue: {
    fontSize: "52px",
    fontWeight: "bold",
    color: "#ffd447",
  },
  
  resultStageLabel: {
    fontSize: "14px",
    color: "#aaa",
  },
  
  resultBestBox: {
    marginBottom: "20px",
  },
  
  resultBestValue: {
    fontSize: "28px",
    fontWeight: "bold",
  },
  
  resultBestLabel: {
    fontSize: "13px",
    color: "#aaa",
  },
  resultWrap: {
    textAlign: "center",
    paddingTop: "0px",
    minHeight: "720px",
  },
  resultCardWrap: {
    display: "grid",
    justifyContent: "center",
    gap: "22px",
    marginTop: "20px",
    marginBottom: "20px",
  },

  resultTitle: {
    fontSize: "38px",
    color: "#f6c343",
    fontWeight: "bold",
  },

  resultScore: {
    fontSize: "72px",
    fontWeight: "bold",
    color: "#fff",
    marginTop: "20px",
  },

  resultSub: {
    color: "#aaa",
    fontSize: "16px",
    marginTop: "8px",
  },
  resultPrimaryBtn: {
    width: "100%",
    padding: "18px",
    borderRadius: "20px",
    background: "linear-gradient(180deg, #ffd84d, #f6c343)",
    border: "none",
    color: "#111",
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "28px",
  },
  
  resultSecondaryBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, #263346, #101722)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
  },

  resultActionBox: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "30px",
  },

  nextBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "#28a745",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
  },

  shareBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "#222",
    border: "1px solid #f6c343",
    color: "#f6c343",
    fontSize: "16px",
    fontWeight: "bold",
  },

  popupDim: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "60px",
    zIndex: 999999,
    overflowY: "auto",
  },

  popupBox: {
    width: "320px",
    padding: "18px",
    borderRadius: "16px",
    background: "linear-gradient(180deg, #182230 0%, #080b10 100%)",
    border: "1px solid #f6c343",
    color: "#fff",
    boxSizing: "border-box",
    margin: "12px auto 24px",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
  },

  popupTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#f6c343",
    marginBottom: "14px",
    textAlign: "center",
  },

  popupText: {
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#ddd",
  },

  popupBtn: {
    width: "100%",
    padding: "13px",
    marginBottom: "10px",
    borderRadius: "10px",
    border: "1px solid #444",
    background: "#1a1a1a",
    color: "#f6c343",
    fontSize: "15px",
    fontWeight: "bold",
  },

  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    fontSize: "14px",
  },

  onBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: "bold",
  },

  offBtn: {
    background: "#222",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: "bold",
  },

  langBtn: {
    background: "#222",
    color: "#f6c343",
    border: "1px solid #444",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: "bold",
  },

  popupCloseBtn: {
    width: "100%",
    marginTop: "16px",
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: "#28a745",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
  },

  siteFooter: {
    marginTop: "80px",
    padding: "16px 12px",
    borderRadius: "14px",
    background: "#0b1018",
    border: "1px solid #2f3a4a",
    textAlign: "center",
  },

  footerTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#f6c343",
    marginBottom: "8px",
  },

  footerText: {
    fontSize: "12px",
    lineHeight: "1.6",
    color: "#bbb",
    marginBottom: "12px",
  },

  footerLinks: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  footerLinkBtn: {
    marginTop: "4px",
    border: "1px solid #444",
    background: "#1a1a1a",
    color: "#f6c343",
    padding: "7px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  backBtn: {
    marginBottom: "18px",
    border: "1px solid #444",
    background: "#1a1a1a",
    color: "#f6c343",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "bold",
  },

  infoPage: {
    padding: "18px",
    borderRadius: "16px",
    background: "#0b1018",
    border: "1px solid #2f3a4a",
    color: "#ddd",
    lineHeight: "1.7",
    fontSize: "14px",
  },

  infoPageTitle: {
    color: "#f6c343",
    fontSize: "24px",
    marginBottom: "16px",
  },

  optionBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "#1c2430",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "bold",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  questionWrap: {
    textAlign: "center",
    marginTop: "0px",
  },
  
  questionTimer: {
    marginBottom: "10px",
  },
  
  optionBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    justifyContent: "center",
    marginTop: "26px",
  },
  gameArea: {
    marginTop: "14px",
    height: "180px",
    borderRadius: "18px",
    background: "#0b1018",
    border: "1px solid #2f3a4a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#aaa",
    fontSize: "15px",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "-6px",
    marginBottom: "20px",
  },
  
  topLeft: {
    fontSize: "14px",
    color: "#aaa",
  },
  
  topRight: {
    fontSize: "14px",
    background: "#1a1a1a",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid #333",
  },
  mainTopBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0px",
    marginBottom: "34px",
  },
  
  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  
  brandIcon: {
    fontSize: "28px",
  },
  
  brandText: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#fff",
  },
  topRightBtns: {
    display: "flex",
    gap: "8px",
  },
  
  circleBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(40,40,70,0.7)",
    color: "#fff",
    fontSize: "18px",
  },
  
  settingCircleBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(40,40,70,0.7)",
    color: "#fff",
    fontSize: "20px",
  },
  mainHero: {
    textAlign: "center",
    marginTop: "40px",
    marginBottom: "34px",
  },
  
  mainBigTitle: {
    fontSize: "64px",
    fontWeight: "900",
    color: "#fff",
    lineHeight: "1",
  },
  
  mainTitleNumber: {
    color: "#ffd447",
    fontSize: "100px",
    marginRight: "6px",
  },
  
  mainTitleText: {
    fontSize: "42px",
    fontWeight: "900",
    color: "#fff",
    marginTop: "6px",
  },
  
  mainDescText: {
    fontSize: "17px",
    color: "#fff",
    lineHeight: "1.6",
    marginTop: "22px",
  },
  recordCard: {
    marginTop: "28px",
    padding: "28px 18px",
    borderRadius: "22px",
    background: "#151b24",
    border: "1px solid #2f3a4a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
  },
  
  recordIcon: {
    fontSize: "56px",
  },
  
  recordTextBox: {
    textAlign: "left",
    minWidth: "120px",
  },
  
  recordLabel: {
    fontSize: "18px",
    color: "#fff",
    marginBottom: "14px",
  },
  
  recordValue: {
    fontSize: "42px",
    fontWeight: "bold",
    color: "#ffd447",
  },
  
  recordUnit: {
    fontSize: "17px",
    color: "#fff",
  },
  memoText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#aaa",
  },
  successText: {
    fontSize: "42px",   // 실패랑 동일
    fontWeight: "900",
    color: "#4cd964",
    marginTop: "30px",
    marginBottom: "16px", // 글씨 → 오리 간격
    textShadow: "0 4px 12px rgba(76,217,100,0.4)",
  },
  
  successEmoji: {
    marginTop: "0px",
    marginBottom: "0px",
  },
  
  successBox: {
    marginTop: "0px",   // 실패랑 동일
    marginBottom: "20px",
    padding: "18px",
    borderRadius: "18px",
    background: "#151b24",
    border: "1px solid #2f3a4a",
    fontSize: "26px",
    fontWeight: "bold",
    color: "#fff",
  },
  resultHighlight: {
    color: "#ffd447",
    fontWeight: "bold",
  },
  resultInfoBox: {
    marginTop: "0px",
    marginBottom: "14px",
    padding: "20px",
    borderRadius: "18px",
    background: "#151b24",
    border: "1px solid #2f3a4a",
  },
  
  resultInfoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    fontSize: "18px",
  },
  resultSpacer: {
    height: "90px",
  },
  resultSpacerSmall: {
    height: "34px",
  },
  resultDuck: {
    marginTop: "8px",
    marginBottom: "0px",
  },
  
  resultDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.14)",
    margin: "10px 0",
  },
  
  reviewBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "18px",
    background: "#f5f5f5",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#111",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "14px",
  },
  
  resultButtonRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  
  resultHalfBtnYellow: {
    padding: "16px",
    borderRadius: "18px",
    background: "linear-gradient(180deg, #ffd84d, #f6c343)",
    border: "none",
    color: "#111",
    fontSize: "18px",
    fontWeight: "bold",
  },
  
  resultHalfBtnDark: {
    padding: "16px",
    borderRadius: "18px",
    background: "#6f55d9",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
  },
  memoBox: {
    marginTop: "42px",
    padding: "16px 22px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "800",
    textAlign: "center",
  },
  questionTitle: {
    display: "inline-block",
    marginBottom: "14px",
    padding: "8px 22px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.14)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "900",
  },
  
  questionText: {
    fontSize: "22px",
    marginBottom: "24px",
    color: "#fff",
    fontWeight: "900",
    lineHeight: "1.5",
    textAlign: "center",
  },
  topBrand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#aaa",
    fontWeight: "bold",
  },
}