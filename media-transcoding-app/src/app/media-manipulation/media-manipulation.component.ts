import { Component, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { iMedia, MediaFormat, MediaResolution, MediaManipulationType, initialMedia } from './models/media.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

import * as _ from "lodash";

@Component({
  selector: 'app-media-manipulation',
  templateUrl: './media-manipulation.component.html',
  styleUrls: ['./media-manipulation.component.scss']
})
export class MediaManipulationComponent implements AfterViewInit {

  // basic states
  mediaManipulationState: any = {
    type: MediaManipulationType[0],
    path: {
      WebAssembly: 'public/wasm/worker-asm.js',
      JavaScript: 'public/js/worker-asm.js'
    }
  }
  // media input form
  mediaForm: FormGroup;
  mediaFormat: Array<string> = [];
  mediaResolution: Array<string> = [];
  mediaManipulationType: Array<string> =[];
  @ViewChild('inputFile') nativeInputFile: ElementRef;
  ffmpegCmd: string = '';
  // terminal + worker connection
  worker: Worker = null;
  isWorkerLoaded: boolean = false;
  terminal: string = '';
  private _terminalStream: Subject<string> = new Subject<string>();
  isRunning: boolean = false;
  ffMpegOutputFiles = [];
  // benchmark
  sampleVideo_60s: Uint8Array;
  sampleVideo_120s: Uint8Array;
  sampleVideo_180s: Uint8Array;

  constructor(
    public sanatizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private _zone: NgZone
  ) { 
    this.createMediaForm();
    // create arrays for select box
    this.mediaFormat = this.createEnumArray(MediaFormat);
    this.mediaResolution = this.createEnumArray(MediaResolution);
    this.mediaManipulationType = this.createEnumArray(MediaManipulationType)
    this.logCommandChange();
  }
  // helper
  createEnumArray(inputEnum): Array<string> {
    let result = [];
    _.forEach(inputEnum, (val, key) => {     
      if (_.isNumber(val)) {
        result.push(key);
      }
    });
    return result;    
  }
  createMediaForm() {
    this.mediaForm = this._formBuilder.group({
      inputMediaFile: [null, Validators.required],
      // inputMediaFormat: ['', Validators.required],
      inputMediaFileName: ['', Validators.required],
      title: 'Title',
      resolution: '640x360',
      bitrate: 600,
      framerate: 24,
      keyframerate: 48,
      outputFileName: 'Output',
      outputFileType: ['mp4', Validators.required]
    });    
  }
  // media file select input
  onNativeInputFileSelect($event): void {    
    if ($event.target.files[0].name) {
      const name = $event.target.files[0].name;
      this.mediaForm.patchValue({
        inputMediaFileName: name
      });
      this.setCommand();
    }
    
    let reader: FileReader = new FileReader();

    reader.onerror = (error) => {
      console.error('Array buffer');
      console.error(error);      
      this.mediaForm.patchValue({
        inputMediaFile: null
      });
      this.setCommand();
    }
    reader.onloadend = (event) => {   
      let arrayBuffer = reader.result; 
      if (arrayBuffer) {       
        this.mediaForm.patchValue({
          inputMediaFile:  new Uint8Array(arrayBuffer)
        });         
      }
    }
    reader.readAsArrayBuffer($event.target.files[0]);       
  }
  selectMediaFile(event) {    
    this.nativeInputFile.nativeElement.click();
  }
  // lissen to changes in media form
  logCommandChange() {    
    this.mediaForm.valueChanges.forEach(
      (value) => this.setCommand()
    );   
  }
  // set the ffmpeg command
  setCommand() {
    this.ffmpegCmd = `-i ${this.mediaForm.get('inputMediaFileName').value} -s ${this.mediaForm.get('resolution').value} -c:v libx264 -b:v ${this.mediaForm.get('bitrate').value}k -r ${this.mediaForm.get('framerate').value} -x264opts keyint=${this.mediaForm.get('keyframerate').value}:min-keyint=${this.mediaForm.get('keyframerate').value}:no-scenecut -preset medium -metadata title='${this.mediaForm.get('title').value}' -vf showinfo -benchmark -strict -2  ${this.mediaForm.get('outputFileName').value}.${this.mediaForm.get('outputFileType').value}`
  }
  /**
   * Terminal and worker connection
   */
  isReady(): boolean {
    return !this.isRunning && this.isWorkerLoaded && (this.mediaForm.status === 'VALID');
  }
  startRunning(): void {
    this.isRunning = true;
  }
  stopRunning(): void {
    this.isRunning = false;
  }

  writeOnTerminal = (text: string): void => {
    if (text) {
      this._terminalStream.next(text);      
    }
  }

  getDownloadLink(fileData, fileName) {
    if (fileName.match(/\.jpeg|\.gif|\.jpg|\.png/)) {
      var blob = new Blob([fileData]);
      const src = window.URL.createObjectURL(blob);

      return {'type': 'img', 'src': src, 'name': fileName };
    }
    else {      
      const blob = new Blob([fileData]);
      const src = window.URL.createObjectURL(blob);
      const download = fileName;
      return {'type': 'video', 'src': src, 'name': fileName, 'download': download };
    }
  }

  parseArguments(text: string): Array<string> {
    text = text.replace(/\s+/g, ' ');
    let args = [];
    // Allow double quotes to not split args.
    text.split('"').forEach(function(t, i) {
      t = t.trim();
      if ((i % 2) === 1) {
        args.push(t);
      } else {
        args = args.concat(t.split(" "));
      }
    });
    return args;
  }

  mediaManipulationTypeChangeDisabled() : boolean {
    return !(!this.isRunning && this.isWorkerLoaded);
  }
  mediaManipulationTypeChange(event) {  
    this.worker.terminate();
    this.isWorkerLoaded = false;    
    this.initWorker();
  }

  initWorker() {   
    this.worker = new Worker(this.mediaManipulationState.path[this.mediaManipulationState.type]);
    this.worker.onmessage = (event) => {
      var message = event.data;
      if (message.type == "ready") {
        this.isWorkerLoaded = true;
        this.startRunning();
        this.worker.postMessage({
          type: "command",
          arguments: ["-help"]
        });
      } else if (message.type === 'stdout') {        
        this.writeOnTerminal(message.data + '\n');
      } else if (message.type === 'start') {
        this.terminal = '';        
        this.writeOnTerminal('Worker has received command\n');
      } else if (message.type === 'done') {
        this.mediaForm.patchValue({
          inputMediaFile: null
        });
        this.ffmpegCmd = '';
        this.stopRunning();
        console.log('time');
        console.log(message.time);
        const buffers = message.data;
        if (buffers && buffers.length) {
          buffers && buffers.forEach((file) => {            
            this.ffMpegOutputFiles.push(this.getDownloadLink(file.data, file.name));
          });
        } else {
          console.error('no buffer');
        } 
      } else if (message.type === 'benchresult') {
        // this.mediaForm.patchValue({
        //   inputMediaFile: null
        // });
        // this.ffmpegCmd = '';
        console.log('benchresult');
        this.stopRunning();
        console.log('time');
        console.log(message.time);
        console.log('benchmark result ########');
        console.log(message.benchmarkData);
        const buffers = message.data;
        if (buffers && buffers.length) {
          buffers && buffers.forEach((file) => {            
            this.ffMpegOutputFiles.push(this.getDownloadLink(file.data, file.name));
          });
        } else {
          console.error('no buffer');
        }
      }
    };
  }

  runCommand(): void {
    if (this.isReady()) {
      this.startRunning();
      this.ffMpegOutputFiles = [];
      const args = this.parseArguments(this.ffmpegCmd);
      this.worker.postMessage({
        type: "command",
        arguments: args,
        files: [
          {
            "name": this.mediaForm.get('inputMediaFileName').value,            
            "data": this.mediaForm.get('inputMediaFile').value
          }
        ]
      });
    }
  }

  /**
   * Benchmarking
   */

  retrieveSampleVideo(addr: string, cb) {
    let oReq = new XMLHttpRequest();
    oReq.open("GET", `public/javascript/${addr}`, true);
    oReq.responseType = "arraybuffer";    

    oReq.onload = (oEvent) => {
      var arrayBuffer = oReq.response;
      if (arrayBuffer) {
        console.log('bla');
        cb(arrayBuffer)
        // return new Uint8Array(arrayBuffer);
      } else {
        console.log('bla wronbg');
        return null;
      }
      
    };
  
    oReq.send(null);
  }
  isBenchmarkReady(): boolean {
    if (this.sampleVideo_60s && this.sampleVideo_120s && this.sampleVideo_180s) {
      return true;
    } else {
      return false;
    }
  }

  runBenchmark(): void {  
    // setup
    this.startRunning();    
    console.log('run benchmark');
    // // build arguments
    // // -i bigbuckbunny.webm -s 640x360 -c:v libx264 -b:v 600k -r 24 -x264opts keyint=48:min-keyint=48:no-scenecut -preset medium -metadata title='Title' -vf showinfo -benchmark -strict -2  Output.mp4
    // const args = this.parseArguments("-i blade-runner-2049_60_1080p.webm -s 640x360 -c:v libx264 -b:v 600k -r 24 -x264opts keyint=48:min-keyint=48:no-scenecut -preset medium -metadata title='Title' -vf showinfo -benchmark -strict -2 Output.mp4");
    // console.log('run benchmark args');
    // console.log(args)
    // if (this.sampleVideo_60s) {
    //   this.worker.postMessage({
    //     type: "benchmark",
    //     arguments: args,
    //     files: [
    //       {
    //         "name": "blade-runner-2049_60_1080p.webm",
    //         "data": this.sampleVideo_60s
    //       }
    //     ]
    //   });
    // } else {
    //   console.error('no sample data');
    // }    
  }

  ngAfterViewInit() {
    this._terminalStream.asObservable().subscribe(message => {
      this._zone.run(() => {      
        this.terminal += message; 
     }); 
    });
    //  this.retrieveSampleVideo("blade-runner-2049_60_h1080p.mov", (ab) => {
    //   this.sampleVideo_60s = new Uint8Array(ab);
    // });
    // this.retrieveSampleVideo("blade-runner-2049_120_h1080p.mov", (ab) => {
    //   this.sampleVideo_120s = new Uint8Array(ab);
    // });
    // this.retrieveSampleVideo("blade-runner-2049_180_h1080p.mov", (ab) => {
    //   this.sampleVideo_180s = new Uint8Array(ab);
    // });
    this.initWorker();
  }

}
