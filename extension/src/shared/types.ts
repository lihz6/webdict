export interface Pron {
  lang: 'en' | 'zh-han' | 'zh-han_*' | 'zh-yue' | 'zh-yue_*' | string;
  pron: [string, string, string];
  mean: string;
}

export interface Entry {
  word: string;
  data: Pron[];
}

export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  [key: string]: number;
}

export interface WordData {
  word: string;
  data: {
    [mark: string]: string[];
  };
}

export namespace PageScriptData {
  export type Search = { text: string; lang: 'zh' | 'en' };
  export type Define = { word: string; data: any; type: 'all' | 'own' };
  export type Playme = { code: string };
  export type Viewed = Entry;
}

export namespace BackgroundData {
  export type OnPlayError = PageScriptData.Playme;
}

export interface Fetcher {
  search(data: PageScriptData.Search): Promise<WordData[]>;
  playme(data: PageScriptData.Playme): Promise<void>;
  define(data: PageScriptData.Define): void;
  viewed(data: PageScriptData.Viewed): void;
}
