import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will
// define in the next step.
if (getUserMediaSupported()) {
  console.warn('getUserMedia() is fully supported by your browser');
} else {
  console.warn('getUserMedia() is not supported by your browser');
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
