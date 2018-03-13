import { Component, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { iMedia, MediaFormat, MediaResolution, MediaManipulationType, initialMedia } from './models/media.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

import { MediaManipulationService } from '../media-manipulation.service';

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
  //private _ffmpegFinishedStream = new Subject<any>();
  //private _workerLoadedStream = new Subject<any>();

  constructor(
    public sanatizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private _zone: NgZone,
    private _mediaManipulationService: MediaManipulationService
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
      outputFileType: ['mp4', Validators.required],
      browser: '',
      testRunIndex: 0
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
          inputMediaFile:  new Uint8Array(arrayBuffer)do
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
    this.ffmpegCmd = `-i ${this.mediaForm.get('inputMediaFileName').value} -s ${this.mediaForm.get('resolution').value} -c:v libx264 -b:v ${this.mediaForm.get('bitrate').value}k -r ${this.mediaForm.get('framerate').value} -x264opts keyint=${this.mediaForm.get('keyframerate').value}:min-keyint=${this.mediaForm.get('keyframerate').value}:no-scenecut -preset medium -metadata title='${this.mediaForm.get('title').value}' -strict -2  ${this.mediaForm.get('outputFileName').value}.${this.mediaForm.get('outputFileType').value}`
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
    // this.worker = new Worker(this.mediaManipulationState.path[this.mediaManipulationType[this.benchTypeIndex]]);
    this.worker.onmessage = (event) => {
      var message = event.data;
      if (message.type == "ready") {
        this.isWorkerLoaded = true;
        // console.log("worker is running");
        // console.log(this.mediaManipulationState.type);
        // this._workerLoadedStream.next({ msg: this.mediaManipulationState.type });
        // this.startRunning();
        //this.worker.postMessage({
        //  type: "command",
        //  arguments: ["-help"]
        //});
      } else if (message.type === 'stdout') {        
        // this.writeOnTerminal(message.data + '\n');
      } else if (message.type === 'start') {
        this.terminal = '';        
        this.writeOnTerminal('Worker has received command\n');
      } else if (message.type === 'done') {
        // manipulate for testing
        //this.mediaForm.patchValue({
        //  inputMediaFile: null
        //});
        // this.ffmpegCmd = '';
        this.stopRunning();
        //console.log('time');
        //console.log(message.time);
        const buffers = message.data;
        let err = true;
        if (buffers && buffers.length) {
          buffers && buffers.forEach((file) => {            
            this.ffMpegOutputFiles.push(this.getDownloadLink(file.data, file.name));
            err = false;
          });
        } else {          
          console.error('no buffer');
        }
        this.testResult.TestTime = message.time;
        console.log("test finished - done ------------------");
        console.log(this.testResult);
        //this._ffmpegFinishedStream.next({
        //  'error': err,
        //  'time': message.time
        //});
        //this._mediaManipulationService.addTestResult(this.testResult).subscribe(res => {
        //  console.log('post result');
        //  console.log(res);
        //});
      } else if (message.type === 'benchresult') {
        // this.mediaForm.patchValue({
        //   inputMediaFile: null
        // });
        // this.ffmpegCmd = '';
        // console.log('benchresult');
        this.stopRunning();
        //console.log('time');
        //console.log(message.time);
        //console.log('benchmark result ########');
        //console.log(message.benchmarkData);
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

      this.testResult.FileName = this.mediaForm.get('inputMediaFileName').value;
      this.testResult.Browser = this.mediaForm.get('browser').value;
      this.testResult.Resolution = this.mediaForm.get('resolution').value;
      this.testResult.TestRunIndex = this.mediaForm.get('testRunIndex').value;
      this.testResult.TestType = this.mediaManipulationState.type;

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
    oReq.open("GET", `${addr}`, true);
    oReq.responseType = "arraybuffer";    

    oReq.onload = (oEvent) => {
      var arrayBuffer = oReq.response;
      if (arrayBuffer) {
        // console.log('success');
        cb(arrayBuffer)
        // return new Uint8Array(arrayBuffer);
      } else {
        // console.log('sample video request went wrong');
        return null;
      }
      
    };
  
    oReq.send(null);
  }

  //benchConfig = {
  //  'source': [
  //    {
  //      'name': 'blade-runner_15_h1080p.mov',
  //      'path': 'public/video/blade-runner_15_h1080p.mov',
  //      'fileDuration': 15
  //    },
  //    {
  //      'name': 'blade-runner_30_h1080p.mov',
  //      'path': 'public/video/blade-runner_30_h1080p.mov',
  //      'fileDuration': 30
  //    },
  //    {
  //      'name': 'blade-runner_60_h1080p.mov',
  //      'path': 'public/video/blade-runner_60_h1080p.mov',
  //      'fileDuration': 60
  //    }
  //  ],
  //  'n': 15
  //};
  testResult = {
    FileName: "",    
    TestRunIndex: null,
    TestType: null,
    Resolution: null,
    Browser: `Chrome`,
    ComputerType: 'Surface Pro 2',
    TestTime: null,
    FileDuration: null
  }
  sampleVideo = null;
  benchTypeIndex = 0;
  resolutionIndex = 0;
  testRunIndex = 1;
  videoSrcIndex = 0;

  //setupBenchmark() {
  //  if (this.benchTypeIndex < this.mediaManipulationType.length) {
  //    if (this.worker) {
  //      this.worker.terminate();
  //    }
  //    this.isWorkerLoaded = false;     
  //    this.mediaManipulationState.type = MediaManipulationType[this.benchTypeIndex];      
  //    this.initWorker();
      
  //  } else {
  //    console.log("############################### finaly done! ################################################");
  //  }    
  //}
 
  //runBenchmark(): void {   
  //  this.startRunning();    
  //  // console.log('start running benchmark');    
    
  //  // get the test sample video
  //  this.getVideoSrcAndRunTest(this.videoSrcIndex, this.testRunIndex, this.resolutionIndex);
  //};
  //getVideoSrcAndRunTest(videoSrcIndex, testRunIndex, resolutionIndex) {
  //  // console.log("getVideoSrcAndRunTest");
  //  this.sampleVideo = null;
  //  this.retrieveSampleVideo(this.benchConfig.source[this.videoSrcIndex].path, (ab) => {     
  //    this.sampleVideo = new Uint8Array(ab);
  //    // start the testrun
  //    this.singleTestRun(this.benchConfig.source[this.videoSrcIndex].name, this.mediaResolution[this.resolutionIndex], this.sampleVideo);
  //  });   
  //}
  //singleTestRun(name, resolution, sampleVideo) {
  //  // console.log('single run');
  //  //console.log(name);
  //  //console.log(resolution);
  //  this.ffMpegOutputFiles = [];
  //  const args = this.parseArguments(`-i ${name} -s ${resolution} -c:v libx264 -b:v 600k -r 24 -x264opts keyint=48:min-keyint=48:no-scenecut -preset medium -metadata title='Title' -strict -2 Output.mp4`);
  //  this.worker.postMessage({
  //    type: "command",
  //    arguments: args,
  //    files: [
  //      {
  //        "name": name,
  //        "data": sampleVideo
  //      }
  //    ]
  //  });
  //}

  ngAfterViewInit() {
    //this._terminalStream.asObservable().subscribe(message => {
    //  this._zone.run(() => {
    //    this.terminal += message; 
    // }); 
    //});   
    this.initWorker();
    //this._workerLoadedStream.asObservable().subscribe(msg => {
    //  this.sampleVideo = null;
    //  // this.benchTypeIndex = 0;
    //  this.resolutionIndex = 0;
    //  this.testRunIndex = 1;
    //  this.videoSrcIndex = 0;

    //  this.testResult.TestType = msg.msg;
    //  this.testResult.Resolution = this.resolutionIndex;
    //  this.testResult.TestRunIndex = this.testRunIndex;
    //  this.testResult.FileName = this.benchConfig.source[this.videoSrcIndex].name;
    //  this.testResult.FileDuration = this.benchConfig.source[this.videoSrcIndex].fileDuration;
    //  // console.log("############################################################################ after init start testing with " + msg.msg);
    //  this.runBenchmark();
    //});
    //this._ffmpegFinishedStream.asObservable().subscribe(result => {
    //  //console.log(' ###<<<<<<<<<<<<<<<<<<<<<<< test finished >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>### ');
    //  //console.log(result);     
    //    this.testResult.Resolution = this.resolutionIndex;
    //    this.testResult.TestRunIndex = this.testRunIndex;
    //    this.testResult.FileName = this.benchConfig.source[this.videoSrcIndex].name;
    //    this.testResult.FileDuration = this.benchConfig.source[this.videoSrcIndex].fileDuration;
    //    this.testResult.TestTime = result.time;

    //    this._mediaManipulationService.addTestResult(this.testResult).subscribe(res => {
    //      //console.log('post result');
    //      //console.log(res);
    //    });

    //    this.resolutionIndex += 1;
    //    if (this.resolutionIndex < this.mediaResolution.length) {
    //      this.singleTestRun(this.benchConfig.source[this.videoSrcIndex].name, this.mediaResolution[this.resolutionIndex], this.sampleVideo);
    //    } else {
    //      this.resolutionIndex = 0;
    //      this.testRunIndex += 1;
    //      if (this.testRunIndex <= this.benchConfig.n) {
    //        //console.log(' ### next round on n times ### ');
    //        //console.log(this.testRunIndex);
    //        this.singleTestRun(this.benchConfig.source[this.videoSrcIndex].name, this.mediaResolution[this.resolutionIndex], this.sampleVideo);
    //      } else {
    //        this.testRunIndex = 1;
    //        // console.log("test round finished next video");
    //        this.videoSrcIndex += 1;
    //        if (this.videoSrcIndex < this.benchConfig.source.length) {
    //          //console.log('next video');
    //          //console.log(this.videoSrcIndex);
    //          //console.log(this.benchConfig.source[this.videoSrcIndex].name);
    //          this.getVideoSrcAndRunTest(this.videoSrcIndex, this.testRunIndex, this.resolutionIndex);
    //        } else {
    //          // console.log("########################## All done ################################ start next technologie");
    //          this.benchTypeIndex += 1;
    //          this.setupBenchmark();
    //        }
    //      }
    //    }     
    //});
  }
}
