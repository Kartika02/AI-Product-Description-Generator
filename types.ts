
export interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
