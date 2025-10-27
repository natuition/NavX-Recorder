// GPS position data
export interface GpsPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
}

export interface AutoMountpointConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  maxDistance?: number; // Distance maximum en km (par défaut: 50km)
  sendGpsToServer?: boolean; // Option pour envoyer les coordonnées GPS au caster
  wsUrl?: string; // Optional full WebSocket URL (ws:// or wss://) to use for the sourcetable request via proxy
}

// NTRIP Mountpoint information
export interface MountpointInfo {
  mountpoint: string;
  identifier: string;
  format: string;
  formatDetails: string;
  carrier: number;
  navSystem: string;
  network: string;
  country: string;
  latitude: number;
  longitude: number;
  nmea: boolean;
  solution: number;
  generator: string;
  compressionEncryption: string;
  authentication: string;
  fee: boolean;
  bitrate: number;
  misc: string;
  distance?: number; // Distance calculée depuis la position actuelle
}

// NTRIP configuration
export interface NtripConfig {
  host: string;
  port: number;
  mountpoint: string;
  username: string;
  password: string;
  sendGpsToServer?: boolean; // Option pour envoyer les coordonnées GPS au caster
  wsUrl?: string; // Optional full WebSocket URL (ws:// or wss://) to connect through a proxy
}
