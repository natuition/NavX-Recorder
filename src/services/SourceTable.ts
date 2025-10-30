import { Distance } from "../utils/Distance.ts";
import { NtripParser } from "./NtripParser.ts";
import type { Mountpoint, Position } from "../utils/types.ts";

export class SourceTable {
  private readonly metadata: string[];
  private readonly mountpoints: Mountpoint[];

  public constructor(data: string) {
    const { mountpoints, metadata } = NtripParser.parse(data);
    this.mountpoints = mountpoints;
    this.metadata = metadata;
  }

  public getMountpoints(): Mountpoint[] {
    return this.mountpoints;
  }

  public getMetadata(): string[] {
    return this.metadata;
  }

  /**
   * Trouve les mountpoints les plus proches de la position donnée
   * @param position Position actuelle avec latitude et longitude
   * @param maxDistance Distance maximale en kilomètres (par défaut 50 km)
   * @param maxResults Nombre maximal de résultats à retourner (par défaut 5)
   */
  public findNearestMountpoints(
    position: Position,
    maxDistance: number = 50,
    maxResults: number = 5
  ): Mountpoint[] {
    // Calculer la distance pour chaque mountpoint
    const mountpointsWithDistance = this.mountpoints.map((mp) => ({
      ...mp,
      distance: Distance.haversine(
        position.latitude,
        position.longitude,
        mp.latitude,
        mp.longitude
      ),
    }));

    // Filtrer par distance maximale et trier par distance croissante
    const nearestMountpoints = mountpointsWithDistance
      .filter((mp) => mp.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxResults);

    return nearestMountpoints;
  }
}
