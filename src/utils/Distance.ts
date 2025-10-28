export class Distance {
  /**
   * Calcule la distance entre deux points GPS en kilomètres selon la formule de Haversine
   */
  public static haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = Distance.D2R(lat2 - lat1);
    const dLon = Distance.D2R(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(Distance.D2R(lat1)) *
        Math.cos(Distance.D2R(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static D2R(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
