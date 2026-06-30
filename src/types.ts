export interface CramSession {
  id: string;
  title: string;
  createdAt: string;
  fileName: string;
  fileSize: string;
  cheatSheet: string;
  presetId: string;
}

export interface PresetPrompt {
  id: string;
  label: string;
  icon: string;
  description: string;
  systemInstruction: string;
}

export interface CramCard {
  id: string;
  title: string;
  content: string[];
  type: 'concepts' | 'formulas' | 'topics' | 'tricks' | 'general';
}
