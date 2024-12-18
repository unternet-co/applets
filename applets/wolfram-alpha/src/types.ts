export interface WolframAlphaSubpod {
  img?: {
    src: string;
    alt: string;
    title: string;
    width: string;
    height: string;
  };
  plaintext?: string;
}

export interface WolframAlphaPod {
  title: string;
  subpods: WolframAlphaSubpod[];
}
