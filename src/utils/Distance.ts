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


  /**
   * Calcule une distance en mètres entre deux points GPS
   * Précision : ~cm sur des distances < 1 km
   */
  public static equirectangular(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = φ2 - φ1;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const x = Δλ * Math.cos((φ1 + φ2) / 2);
    const y = Δφ;
    return Math.sqrt(x * x + y * y) * R;
  }

  private static D2R(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
