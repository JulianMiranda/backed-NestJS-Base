export class GeoUtils {
  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Radio de la Tierra en metros

    const lat1Rad = this.toRadians(lat1);
    const lon1Rad = this.toRadians(lon1);
    const lat2Rad = this.toRadians(lat2);
    const lon2Rad = this.toRadians(lon2);

    const dlat = lat2Rad - lat1Rad;
    const dlon = lon2Rad - lon1Rad;

    const a =
      Math.sin(dlat / 2) * Math.sin(dlat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(dlon / 2) *
        Math.sin(dlon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return distance;
  }
  static calculateCostForDistance(distance: number): number {
    const metersInKilometer = 1000;
    const kilometers = distance / metersInKilometer;

    let costPerKilometer: number;

    if (kilometers <= 3) {
      costPerKilometer = 1;
    } else if (kilometers <= 6) {
      costPerKilometer = 0.9;
    } else if (kilometers <= 10) {
      costPerKilometer = 0.85;
    } else if (kilometers <= 20) {
      costPerKilometer = 0.75;
    } else {
      costPerKilometer = 0.5;
    }

    const cost = kilometers * costPerKilometer;
    if (cost < 1.45) return 1.45;
    return parseFloat(cost.toFixed(2));
  }
}
