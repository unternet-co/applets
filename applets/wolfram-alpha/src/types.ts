export interface WolframAlphaSubpod {
  img?: {
    src: string;
    alt: string;
    width: string;
    height: string;
  };
}

export interface WolframAlphaPod {
  title: string;
  subpods: WolframAlphaSubpod[];
}
