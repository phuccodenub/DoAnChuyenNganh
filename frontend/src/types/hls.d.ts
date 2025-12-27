declare module 'hls.js' {
  export enum Events {
    MEDIA_ATTACHED = 'hlsMediaAttached',
    MANIFEST_PARSED = 'hlsManifestParsed',
    LEVEL_LOADED = 'hlsLevelLoaded',
    LEVEL_SWITCHED = 'hlsLevelSwitched',
    FRAG_LOADING = 'hlsFragLoading',
    FRAG_LOADED = 'hlsFragLoaded',
    FRAG_PARSING_INIT_SEGMENT = 'hlsFragParsingInitSegment',
    FRAG_PARSING_USERDATA = 'hlsFragParsingUserdata',
    FRAG_PARSED = 'hlsFragParsed',
    BUFFER_APPENDING = 'hlsBufferAppending',
    BUFFER_APPENDED = 'hlsBufferAppended',
    ERROR = 'hlsError',
  }

  export enum ErrorTypes {
    NETWORK_ERROR = 'networkError',
    MEDIA_ERROR = 'mediaError',
    MUX_ERROR = 'muxError',
    OTHER_ERROR = 'otherError',
  }

  export interface HlsConfig {
    debug?: boolean;
    enableWorker?: boolean;
    lowLatencyMode?: boolean;
    backBufferLength?: number;
    maxBufferLength?: number;
    maxMaxBufferLength?: number;
    maxBufferSize?: number;
    maxBufferHole?: number;
    highBufferWatchdogPeriod?: number;
    nudgeOffset?: number;
    nudgeMaxRetry?: number;
    maxFragLoadingTimeOut?: number;
    maxMaxFragLoadingTimeOut?: number;
    fragLoadingTimeOut?: number;
    manifestLoadingTimeOut?: number;
    levelLoadingTimeOut?: number;
    fragLoadingTimeOutRetry?: number;
    manifestLoadingTimeOutRetry?: number;
    levelLoadingTimeOutRetry?: number;
    fragLoadingTimeOutRetryDelay?: number;
    manifestLoadingTimeOutRetryDelay?: number;
    levelLoadingTimeOutRetryDelay?: number;
    startFragPrefetch?: boolean;
    testBandwidth?: boolean;
    progressive?: boolean;
    abrEwmaDefaultEstimate?: number;
    abrEwmaSlowVoD?: number;
    abrEwmaFastVoD?: number;
    abrEwmaDefaultVoD?: number;
    abrBandWidthFactor?: number;
    abrBandWidthUpFactor?: number;
    abrMaxWithRealBitrate?: boolean;
    maxStarvationDelay?: number;
    maxLoadingDelay?: number;
    minAutoBitrate?: number;
    emeEnabled?: boolean;
    widevineLicenseUrl?: string;
    drmSystemOptions?: Record<string, any>;
    requestMediaKeySystemAccessFunc?: (keySystem: string, supportedConfigurations: MediaKeySystemConfiguration[]) => Promise<MediaKeySystemAccess>;
    [key: string]: any;
  }

  export interface Level {
    url: string;
    bitrate?: number;
    width?: number;
    height?: number;
    name?: string;
    codecs?: string;
    audioCodec?: string;
    videoCodec?: string;
    details?: LevelDetails;
  }

  export interface LevelDetails {
    totalduration?: number;
    targetduration?: number;
    fragments?: Fragment[];
    [key: string]: any;
  }

  export interface Fragment {
    relurl?: string;
    url?: string;
    [key: string]: any;
  }

  export default class Hls {
    static isSupported(): boolean;
    static Events: typeof Events;
    static ErrorTypes: typeof ErrorTypes;
    
    config: HlsConfig;
    levels: Level[];
    currentLevel: number;
    
    constructor(config?: HlsConfig);
    
    loadSource(url: string): void;
    attachMedia(media: HTMLMediaElement): void;
    detachMedia(): void;
    destroy(): void;
    
    on(event: Events, callback: (event: string, data: any) => void): void;
    off(event: Events, callback: (event: string, data: any) => void): void;
    once(event: Events, callback: (event: string, data: any) => void): void;
  }
}

