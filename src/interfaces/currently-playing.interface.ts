export interface CurrentlyPlayingInterface {
  context: null;
  currently_playing_type: string;
  is_playing: boolean;
  item: Item;
  progress_ms: number;
  timestamp: number;
}

export interface Item {
  album: Album;
  artists: Artist[];
  available_markets: AvailableMarket[];
  disc_number: number;
  duration_ms: number;
  explicit: false
  external_ids: object;
  external_urls: object;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: null | string;
  track_number: number;
  type: string;
  uri: string;
}

export interface Album {
  album_type: string;
  artists: Artist[];
  available_markets: AvailableMarket[];
  external_urls: object;
  href: string;
  id: string;
  images: Array<{height: number, url: string, width: number}>;
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface Artist {
  external_urls: object;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface AvailableMarket {
  [x: number]: string;
}
