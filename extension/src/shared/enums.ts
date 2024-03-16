export const enum PageScriptAction {
  PLAY_SOUND,
  SEARCH_TEXT,
  DEFINE_WORD,
  WORD_VIEWED,
}

// Note: set `string` initializers using as `string` key as well.
export const enum BackgroundAction {
  PLAY_ERROR = 'PLAY_ERROR',
  PLAY_OKAY = 'PLAY_OKAY',
}
