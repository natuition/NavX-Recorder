export type NmeaType = 'GGA' | "RMC" | "GSV" | "GST" | string;

export type GGA = {
  type: "GGA";
  time: Date;
  talkerId?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number; // m
  fixQuality?: number;
  numSatellites?: number;
  hdop?: number;
}

export type RMC = {
  type: "RMC";
  talkerId?: string;
  time: Date;
  state: string; // A: valid / V: invalid
  latitude?: number;
  longitude?: number;
  speed: number; // km/h
}

export type GsvSatellite = {
  prn: number | null;
  elevation: number | null;
  azimuth: number | null;
  snr: number | null; // Signal-to-noise ratio, dBHz
}

export type GSV = {
  type: "GSV";
  talkerId: string;         // ex: "GP", "GL", "GA"
  totalMessages: number;    // nombre total de trames GSV
  messageNumber: number;    // numéro de cette trame
  satellitesInView: number; // total visible
  satellites: GsvSatellite[];
}

export type NMEA = GGA | RMC | GSV;

export type SourceTableData = {
  metadata: string[];
  mountpoints: Mountpoint[];
};

export type Mountpoint = {
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
  distance?: number
};

export type Position = {
  latitude: number;
  longitude: number;
};

export type GNSSPosition = {
  nmeaType: NmeaType;
  latitude: number;
  longitude: number;
  altitude?: number;
  numSatellites?: number;
  hdop?: number;
  fixQuality: number;
  time: Date;
  speed?: number;
}


