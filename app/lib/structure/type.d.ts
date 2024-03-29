export type HexColor = `#${string}`;
export type NamedColor = 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow' | 'black' | 'white';
export type Color = NamedColor | HexColor;
export type SimpleRichContentLabel = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
export type RichContentLabel = SimpleRichContentLabel | 'ul' | 'li' | 'ol' | 'code' | 'embed' | 'image' | 'link' | 'hashTag' | 'inlinePanel' | string;

export type ContentState = {
  element?: HTMLElement;
  id?: string;
  path?: string;
} & Record<string, any>;

export type ContentData = ({ text: string; }
  | {
    value?: string;
    bold?: boolean;
    underline?: boolean;
    italic?: boolean;
    color?: Color;
    background?: Color;
  }) & Record<string, string>;

export type Content = {
  label: RichContentLabel;
  state?: ContentState;
  data?: ContentData;
  content?: Content[],
};

// todo:
// state & path needs to be completely separated?
// react would be confused -> self reference issue..

// Init, content => sync + content & state ==> update? => state + => sync content => react render..