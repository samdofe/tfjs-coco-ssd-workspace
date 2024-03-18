/**
 * @anuglar imports
 * **/
import {Component, effect, ElementRef, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CommonModule} from "@angular/common";

/**
 * TensorFlow imports
 * **/
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import {IStyles} from "./app.models";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private model!: cocoSsd.ObjectDetection;
  @ViewChild('webcam') webcamElementRef!: ElementRef;
  title = 'web-app';
  hideButton= false;
  hideDemos = true;
  predictionsLabel = '';
  predictionsLabelStyles: IStyles = { 'display' : 'none'};
  highlighterStyles: IStyles= {};

  constructor() {
    effect(() => {
      // Before we can use COCO-SSD class we must wait for it to finish
      // loading. Machine Learning models can be large and take a moment
      // to get everything needed to run.
      cocoSsd.load().then((loadedModel: cocoSsd.ObjectDetection) => {
        this.model = loadedModel;
        // Show demo section now model is ready to use.
        this.hideDemos = false;
      });
    });
  }
  enableCam():void {
    // Only continue if the COCO-SSD has finished loading.
    if (!this.model) {
      return;
    }
    // Hide the button once clicked.
    this.hideButton = true;
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.webcamElementRef.nativeElement.srcObject = stream;
        this.hideDemos = false;
    });
  }
  predictWebcam(){
    // Now let's start classifying a frame in the stream.
    this.model.detect(this.webcamElementRef.nativeElement)
      .then( (predictions:cocoSsd.DetectedObject[])=> {
        // Now lets loop through predictions and draw them to the live view if
        // they have a high confidence score.
        predictions.forEach((prediction: cocoSsd.DetectedObject) => {
          // If we are over 66% sure we are sure we classified it right, draw it!
          if(prediction.score > 0.66){
            this.predictionsLabel = `${prediction.class} - with ${Math.round(parseFloat(prediction.score.toString()) * 100)} % confidence.`;
            const { bbox } = prediction;
            const labelStyles = {
              'margin-left': `${bbox[0]}px`,
              'margin-top': `${bbox[1] - 10}px`,
              'width': `${bbox[2] - 10}px`,
              'top': '0px',
              'left': '0px'
            };

            this.predictionsLabelStyles = {...labelStyles};

            const highlighterStyles = {
              'left': `${bbox[0]}px`,
              'top': `${bbox[1]}px`,
              'width': `${bbox[2]}px`,
              'height': `${bbox[3]}px`
            };

            this.highlighterStyles = {...highlighterStyles};

          }
        })

        // Call this function again to keep predicting when the browser is ready.
        window.requestAnimationFrame(() => this.predictWebcam());
    });
  }
}
