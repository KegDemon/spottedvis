export interface AudioAnalysisInterface {
  bars: Bar[];
  beats: Beat[];
  meta: Meta;
  sections: Section[];
  segments: Segment[];
  tatums: Tatum[];
  track: Track;
}

export interface Bar {
  confidence: number;
  duration: number;
  start: number;
}

export interface Beat {
  confidence: number;
  duration: number;
  start: number;
}

export interface Meta {
  analysis_time: number;
  analyzer_version: string;
  detailed_status: string;
  input_process: string;
  platform: string;
  status_code: number;
  timestamp: number;
}

export interface Section {
  confidence: number;
  duration: number;
  key: number;
  key_confidence: number;
  loudness: number;
  mode: number;
  mode_confidence: number;
  start: number;
  tempo: number;
  tempo_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
}

export interface Segment {
  confidence: number;
  duration: number;
  loudness_max: number;
  loudness_max_time: number;
  loudness_start: number;
  pitches: number[];
  start: number;
  timbre: number[];
}

export interface Tatum {
  confidence: number;
  duration: number;
  start: number;
}

export interface Track {
  analysis_channels: number;
  analysis_sample_rate: number;
  code_version: number;
  codestring: string;
  duration: number;
  echoprint_version: number;
  echoprintstring: string;
  end_of_fade_in: number;
  key: number;
  key_confidence: number;
  loudness: number;
  mode: number;
  mode_confidence: number;
  num_samples: number;
  offset_seconds: number;
  rhythm_version: number;
  rhythmstring: string;
  sample_md5: string;
  start_of_fade_out: number;
  synch_version: number;
  synchstring: string;
  tempo: number;
  tempo_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
  window_seconds: number;
}
