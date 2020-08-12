import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  recordButton(){
    console.log("recordButton");
  }
  recordingReplyButton(){
    console.log("recordingReplyButton");
  }
  reveerseCheckboxButton(){
    console.log("reveerseCheckboxButton");
  }
  playButton(){
    console.log("playButton");
  }
  stopButton(){
    console.log("stopButton");
  }
  resetButton(){
    console.log("resetButton");
  }
  stepButton(){
    console.log("stepbutton");
  }
  zoomOutButton(){
    console.log("zoomOutButton");
  }
  zoomInButton(){
    console.log("zoomInButton");
  }
  resetZoomButton(){
    console.log("resetZoomButton");
  }
  zoomTofitButton(){
    console.log("zoomTofitButton ");
  }
  simulationSpeed(value){
console.log("simulation speed",value);
  }
}
