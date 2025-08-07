export interface StyleProps {
  left: string;
  top: string;
  color?: string;
  'font-size'?: string;
  width?: string;
}

interface BaseStyleElement {
  style: StyleProps;
}

export interface StateLabelElement extends BaseStyleElement {
  type: 'state-label';
  entity: string;
  prefix?: string;
}

export interface ImageElement extends BaseStyleElement {
  type: 'image';
  entity: string;
  image: string;
}

export interface ConditionalElement extends BaseStyleElement {
  type: 'conditional';
  conditions: Array<{
    entity: string;
    state: string;
  }>;
  elements: Array<PictureElement>;
}

export type PictureElement = StateLabelElement | ImageElement | ConditionalElement;

export interface PictureElementsConfig {
  type: 'picture-elements';
  image?: string;
  elements: PictureElement[];
}
