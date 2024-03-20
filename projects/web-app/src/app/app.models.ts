import * as cocoSsd from '@tensorflow-models/coco-ssd';
export interface IStyles {
  [K:string]: string;
}

export interface IPrediction extends cocoSsd.DetectedObject {
  label: string;
  labelStyles: IStyles;
  highlighterStyles: IStyles
}
