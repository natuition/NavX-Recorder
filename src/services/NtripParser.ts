import type { Mountpoint } from "../utils/types";

type NtripParseResult = {
  metadata: string[];
  mountpoints: Mountpoint[];
};

export class NtripParser {
  /**
   * Parse la sourcetable NTRIP pour extraire les metadata et mountpoints associés
   */
  public static parse(data: string): NtripParseResult {
    const lines = data.split("\n");
    const mountpoints: Mountpoint[] = [];
    const metadata: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("STR;")) {
        const mountpoint = this.parseMountpointLine(trimmedLine);
        if (mountpoint) {
          mountpoints.push(mountpoint);
        }
      }

      if (trimmedLine.startsWith("CAS;") || trimmedLine.startsWith("NET;")) {
        metadata.push(trimmedLine);
      }
    }

    return { metadata, mountpoints };
  }

  /**
   * Parse une ligne de sourcetable NTRIP
   */
  private static parseMountpointLine(line: string): Mountpoint | null {
    const parts = line.split(";");
    if (parts.length < 18 || parts[0] !== "STR") {
      return null;
    }

    try {
      return {
        mountpoint: parts[1],
        identifier: parts[2],
        format: parts[3],
        formatDetails: parts[4],
        carrier: parseInt(parts[5]) || 0,
        navSystem: parts[6],
        network: parts[7],
        country: parts[8],
        latitude: parseFloat(parts[9]) || 0,
        longitude: parseFloat(parts[10]) || 0,
        nmea: parts[11] === "1",
        solution: parseInt(parts[12]) || 0,
        generator: parts[13],
        compressionEncryption: parts[14],
        authentication: parts[15],
        fee: parts[16] === "Y",
        bitrate: parseInt(parts[17]) || 0,
        misc: parts[18] || "",
      };
    } catch (error) {
      console.warn(
        "Erreur lors du parsing de la ligne mountpoint:",
        line,
        error
      );
      return null;
    }
  }
}
