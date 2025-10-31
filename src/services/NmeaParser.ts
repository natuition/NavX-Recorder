import type { GGA, GSV, GsvSatellite, NMEA, NmeaType, RMC } from "../types";

/**
 * Parse NMEA sentences from GPS data
 */
export class NmeaParser {
  static parse(data: string): NMEA[] | null {
    const parsed: NMEA[] = [];
    const lines = data.split("\n");
    for (const line of lines) {
      const sentence = line.trim();
      const parsedSentence = NmeaParser.parseSentence(sentence);

      if (parsedSentence) {
        parsed.push(parsedSentence);
      }

    }
    return parsed.length > 0 ? parsed : null;
  }

  /**
   * Parse a single NMEA sentence
   */
  static parseSentence(sentence: string): NMEA | null {
    if (!sentence.startsWith("$")) {
      return null;
    }

    const { fields, type } = NmeaParser.sanitizeSentence(sentence)

    switch (type) {
      case "GGA":
        return NmeaParser.parseGGA(fields);
      case "RMC":
        return NmeaParser.parseRMC(fields);
      case "GSV":
        // Need improvements
        return NmeaParser.parseGSV(fields);
      case "GST":
        // Not implemented
        return null;
      default:
        return null;
    }
  }

  static sanitizeSentence(sentence: string): { type: NmeaType, fields: string[] } {
    // Remove $ and checksum
    const parts = sentence.substring(1).split("*");

    const data = parts[0];
    const fields = data.split(",");
    const header = fields[0];
    const type = header.slice(2, 5);

    return { type, fields };
  }

  /**
   * Parse GGA sentence (Fix data)
   */
  private static parseGGA(fields: string[]): GGA {
    const header = fields[0];

    const talkerId = header.slice(0, 2);
    const lat = NmeaParser.parseCoordinate(fields[2], fields[3]);
    const lon = NmeaParser.parseCoordinate(fields[4], fields[5]);
    const fixQuality = parseInt(fields[6]) || 0;
    const numSats = parseInt(fields[7]) || 0;
    const hdop = parseFloat(fields[8]) || 0;
    const altitude = parseFloat(fields[9]) || 0;
    const time = NmeaParser.nmeaTimeToDate(fields[1])

    return {
      type: "GGA",
      talkerId,
      latitude: lat,
      longitude: lon,
      altitude,
      fixQuality,
      numSatellites: numSats,
      hdop,
      time,
    };
  }

  /**
   * Parse RMC sentence (Recommended minimum)
   */
  private static parseRMC(fields: string[]): RMC {
    const header = fields[0];

    const talkerId = header.slice(0, 2);
    const lat = NmeaParser.parseCoordinate(fields[3], fields[4]);
    const lon = NmeaParser.parseCoordinate(fields[5], fields[6]);

    return {
      type: "RMC",
      state: fields[2],
      talkerId,
      latitude: lat,
      longitude: lon,
      speed: NmeaParser.knotsToKmH(Number.parseFloat(fields[7])),
      time: NmeaParser.nmeaTimeToDate(fields[1]),
    };
  }

  /**
   * Parse GSV sentence (Satellites in view)
   * TODO: improve validation, some fields are NaN
   */
  private static parseGSV(fields: string[]): GSV {
    const talkerId = fields[0].slice(0, 2); // ex: "GP", "GL"
    const totalMessages = parseInt(fields[1], 10);
    const messageNumber = parseInt(fields[2], 10);
    const satellitesInView = parseInt(fields[3], 10);

    const satellites: GsvSatellite[] = [];

    // Chaque satellite a 4 champs : PRN, élévation, azimut, SNR
    for (let i = 4; i < fields.length; i += 4) {
      const prn = fields[i] ? parseInt(fields[i], 10) : null;
      const elevation = fields[i + 1] ? parseInt(fields[i + 1], 10) : null;
      const azimuth = fields[i + 2] ? parseInt(fields[i + 2], 10) : null;
      const snr = fields[i + 3] ? parseInt(fields[i + 3], 10) : null;

      // Ignore les entrées incomplètes en fin de trame
      if (!isNaN(prn as number)) {
        satellites.push({ prn, elevation, azimuth, snr });
      }
    }

    return {
      type: 'GSV',
      talkerId,
      totalMessages,
      messageNumber,
      satellitesInView,
      satellites,
    };
  }

  /**
   * Parse coordinate from NMEA format (DDMM.MMMM) to decimal degrees
   */
  private static parseCoordinate(
    value: string,
    direction: string
  ): number | undefined {
    if (!value || !direction) return undefined;

    const degrees = parseFloat(value.substring(0, value.indexOf(".") - 2));
    const minutes = parseFloat(value.substring(value.indexOf(".") - 2));
    let decimal = degrees + minutes / 60;

    if (direction === "S" || direction === "W") {
      decimal = -decimal;
    }

    return decimal;
  }

  static nmeaTimeToDate(nmeaTime: string): Date {
    // Vérifie la validité
    if (!/^\d{6}(\.\d+)?$/.test(nmeaTime)) {
      throw new Error(`Invalide NMEA time format : ${nmeaTime}`);
    }

    const hours = parseInt(nmeaTime.slice(0, 2), 10);
    const minutes = parseInt(nmeaTime.slice(2, 4), 10);
    const seconds = parseFloat(nmeaTime.slice(4)); // inclut .ss

    // Utilise la date du jour en UTC
    const now = new Date();
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours,
      minutes,
      Math.floor(seconds),
      Math.round((seconds % 1) * 1000)
    ));

    return date;
  }

  static knotsToKmH(knots: number): number {
    return knots * 1.852;
  }
}
