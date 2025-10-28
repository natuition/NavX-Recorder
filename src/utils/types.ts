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

export type PositionGPS = {
  latitude: number;
  longitude: number;
  altitude?: number;
  numSatellites?: number;
  hdop?: number;
  fixQuality?: number;
  time?: string
}

