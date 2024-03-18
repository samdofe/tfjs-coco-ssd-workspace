/**
 * @anuglar imports
 * **/
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CommonModule} from "@angular/common";

/**
 * TensorFlow imports
 * **/
import * as cocoSsd from '@tensorflow-models/coco-ssd';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  @ViewChild('webcam') webcamElementRef!: ElementRef;
  title = 'web-app';
  model: any;
  hideButton= false;
  hideDemos = true;
  children= [];
  predictionsLabel = '';
  predictionsLabelStyles = {};
  highlighterStyles= {};

  async ngOnInit(){
    // Before we can use COCO-SSD class we must wait for it to finish
    // loading. Machine Learning models can be large and take a moment
    // to get everything needed to run.
    cocoSsd.load().then((loadedModel) => {
      this.model = loadedModel;
      // Show demo section now model is ready to use.
      this.hideDemos = false;
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
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      this.webcamElementRef.nativeElement.srcObject = stream;
      this.hideDemos = false;
    });
  }
  predictWebcam(){
    // Now let's start classifying a frame in the stream.
    this.model.detect(this.webcamElementRef.nativeElement).then( (predictions:any)=> {
      // Now lets loop through predictions and draw them to the live view if
      // they have a high confidence score.
      predictions.forEach((prediction: any) => {
        // If we are over 66% sure we are sure we classified it right, draw it!
        if(prediction.score > 0.66){
          this.predictionsLabel = `${prediction.class} - with ${Math.round(parseFloat(prediction.score) * 100)} % confidence.`;
          const labelStyles = {
            'margin-left': `${prediction.bbox[0]}px`,
            'margin-top': `${prediction.bbox[1] - 10}px`,
            'width': `${prediction.bbox[2] - 10}px`,
            'top': '0px',
            'left': '0px'
          };

          this.predictionsLabelStyles = {...labelStyles};

          const highlighterStyles = {
            'left': `${prediction.bbox[0]}px`,
            'top': `${prediction.bbox[1]}px`,
            'width': `${prediction.bbox[2]}px`,
            'height': `${prediction.bbox[3]}px`
          };

          this.highlighterStyles = {...highlighterStyles};

        }
      })

      // Call this function again to keep predicting when the browser is ready.
      window.requestAnimationFrame(() => this.predictWebcam());
    });
  }
}
