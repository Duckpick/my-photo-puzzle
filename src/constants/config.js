export const STORAGE_KEY = "duckpick_photo_puzzle_save_v1"
export const SETTING_KEY = "duckpick_photo_puzzle_setting_v1"
export const PUZZLE_SETTING_KEY = "duckpick_photo_puzzle_last_setting_v1"

export const GAME_TITLE = "My Photo Puzzle"
export const CONTACT_EMAIL = "gameduckman@gmail.com"

export const IMAGE_PATHS = {
  logo: "/img/logo/duckpick_logo.png",
  duckMain: "/img/duck/duck_success.png",
}

export const APP_CONFIG = {
  maxWidth: 390,
  baseHeight: 844,
}

export const SCREEN = {
  MAIN: "main",
  SETUP: "setup",
  PLAY: "play",
  RESULT: "result",
}

export const PHOTO_MODE = {
  SINGLE: "single",
  MULTIPLE: "multiple",
}

export const PUZZLE_TYPES = [
  {
    id: "square",
    ko: "네모",
    en: "Square",
  },
  {
    id: "classic",
    ko: "클래식",
    en: "Classic",
  },
]

export const PIECE_OPTIONS = [2, 4, 6, 8, 10, 12, 16, 20]

export const TIME_OPTIONS = [
  {
    id: "10sec",
    ko: "10초",
    en: "10 Sec",
    seconds: 10,
  },
  {
    id: "20sec",
    ko: "20초",
    en: "20 Sec",
    seconds: 20,
  },
  {
    id: "30sec",
    ko: "30초",
    en: "30 Sec",
    seconds: 30,
  },
  {
    id: "60",
    seconds: 60,
    ko: "1분",
    en: "1 min",
  },
  {
    id: "180",
    seconds: 180,
    ko: "3분",
    en: "3 min",
  },
  {
    id: "300",
    seconds: 300,
    ko: "5분",
    en: "5 min",
  },
  {
    id: "600",
    seconds: 600,
    ko: "10분",
    en: "10 min",
  },
  {
    id: "1200",
    seconds: 1200,
    ko: "20분",
    en: "20 min",
  },
  {
    id: "1800",
    seconds: 1800,
    ko: "30분",
    en: "30 min",
  },
  {
    id: "3600",
    seconds: 3600,
    ko: "60분",
    en: "60 min",
  },
  {
    id: "infinite",
    seconds: null,
    ko: "무한",
    en: "No Limit",
  },
]

export const HINT_TYPES = [
  {
    id: "popup",
    ko: "원본 보기",
    en: "Original",
  },
  {
    id: "background",
    ko: "배경 답지",
    en: "Faint Background Guide",
  },
  {
    id: "off",
    ko: "힌트 끄기",
    en: "Hint Off",
  },
]

export const PLAY_MODES = [
  {
    id: "free",
    ko: "자유 모드",
    en: "Free Mode",
  },
  {
    id: "challenge",
    ko: "도전 모드",
    en: "Challenge Mode",
  },
]

export const DEFAULT_PUZZLE_SETTINGS = {
  puzzleType: "square",
  pieceCount: 4,
  timeLimit: "infinite",
  hintType: "popup",
  playMode: "free",
}