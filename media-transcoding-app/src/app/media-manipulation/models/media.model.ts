export enum MediaManipulationType {
    WebAssembly,
    JavaScript
}

export enum MediaFormat {
    webm,
    mp4,
    mov
}
export enum MediaResolution {
    '640x360',
    '960x540',
    '1280x720'
    // '1920x1080'
}

export interface iMedia {
    inputMediaFile: Uint8Array;
    inputMediaFileName: string;
    // inputMediaFormat: MediaFormat;
    resolution: MediaResolution;
    bitrate: Number;
    framerate: Number;
    keyframerate: Number;
    title: String;
    outputFileName: String;
    outputFileType: MediaFormat;    
}

export const initialMedia: iMedia = {
    inputMediaFile: null,
    inputMediaFileName: '',
    // inputMediaFormat: null,
    resolution: MediaResolution['640x360'],
    bitrate: 600,
    framerate: 24,
    keyframerate: 48,
    title: "Title",
    outputFileName: "Output",
    outputFileType: MediaFormat.mp4
}
