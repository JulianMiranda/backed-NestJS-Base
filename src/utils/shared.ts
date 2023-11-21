export interface Viaje {
  origen: Coordenadas;
  destino: Coordenadas;
}

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export function calcularDistanciaHaversina(
  coord1: Coordenadas,
  coord2: Coordenadas,
): number {
  const R = 6371; // Radio de la Tierra en kilómetros

  const dLat = (coord2.latitud - coord1.latitud) * (Math.PI / 180);
  const dLon = (coord2.longitud - coord1.longitud) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitud * (Math.PI / 180)) *
      Math.cos(coord2.latitud * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distancia = R * c;
  return distancia;
}

export async function sonViajesSimilares(
  viajeExistente: Viaje,
  nuevoViaje: Viaje,
): Promise<boolean> {
  const latitudTolerancia = 0.05; // Ajusta según tus necesidades, en grados

  // Calcular el vector del primer viaje
  const vectorViajeExistente = {
    latitud: viajeExistente.destino.latitud - viajeExistente.origen.latitud,
    longitud: viajeExistente.destino.longitud - viajeExistente.origen.longitud,
  };

  // Calcular el vector entre el origen del primer viaje y el origen del segundo viaje
  const vectorOrigenNuevoDesdeOrigenExistente = {
    latitud: nuevoViaje.origen.latitud - viajeExistente.origen.latitud,
    longitud: nuevoViaje.origen.longitud - viajeExistente.origen.longitud,
  };

  // Calcular la distancia perpendicular desde el origen del segundo viaje
  // hasta la línea que representa el vector del primer viaje
  const distanciaPerpendicularOrigen =
    Math.abs(
      vectorOrigenNuevoDesdeOrigenExistente.latitud *
        vectorViajeExistente.longitud -
        vectorOrigenNuevoDesdeOrigenExistente.longitud *
          vectorViajeExistente.latitud,
    ) /
    Math.sqrt(
      vectorViajeExistente.latitud ** 2 + vectorViajeExistente.longitud ** 2,
    );

  // Calcular el vector entre el destino del primer viaje y el destino del segundo viaje
  const vectorDestinoNuevoDesdeDestinoExistente = {
    latitud: nuevoViaje.destino.latitud - viajeExistente.destino.latitud,
    longitud: nuevoViaje.destino.longitud - viajeExistente.destino.longitud,
  };

  const distanciaPerpendicularDestino =
    Math.abs(
      vectorDestinoNuevoDesdeDestinoExistente.latitud *
        vectorViajeExistente.longitud -
        vectorDestinoNuevoDesdeDestinoExistente.longitud *
          vectorViajeExistente.latitud,
    ) /
    Math.sqrt(
      vectorViajeExistente.latitud ** 2 + vectorViajeExistente.longitud ** 2,
    );

  if (
    distanciaPerpendicularOrigen <= latitudTolerancia &&
    distanciaPerpendicularDestino <= latitudTolerancia
  ) {
    return true;
  }

  return false;
}

export async function obtenerViajesSimilares(
  nuevoViaje: Viaje,
  arrayDeViajes: Viaje[],
): Promise<Viaje[]> {
  const viajesSimilares: Viaje[] = [];

  for (const viajeExistente of arrayDeViajes) {
    let viajeGrande: Viaje;
    let viajeMenor: Viaje;

    if (await viajeMasLargo(nuevoViaje, viajeExistente)) {
      viajeGrande = nuevoViaje;
      viajeMenor = viajeExistente;
    } else {
      viajeGrande = viajeExistente;
      viajeMenor = nuevoViaje;
    }

    if (await sonViajesSimilares(viajeGrande, viajeMenor)) {
      viajesSimilares.push(viajeExistente);
    }
  }

  return viajesSimilares;
}

export async function viajeMasLargo(
  nuevoViaje: Viaje,
  viajeExistente: Viaje,
): Promise<boolean> {
  // Calcular distancias entre los puntos del nuevo viaje y del viaje existente
  const distanciaOrigen = calcularDistanciaHaversina(
    viajeExistente.origen,
    nuevoViaje.origen,
  );
  const distanciaDestino = calcularDistanciaHaversina(
    viajeExistente.destino,
    nuevoViaje.destino,
  );

  // Calcular distancias entre los destinos del nuevo viaje y del viaje existente
  const distanciaDestinoViajeExistente = calcularDistanciaHaversina(
    viajeExistente.origen,
    viajeExistente.destino,
  );
  const distanciaDestinoNuevoViaje = calcularDistanciaHaversina(
    nuevoViaje.origen,
    nuevoViaje.destino,
  );

  // Compara la distancia desde el origen del nuevo viaje al destino del viaje existente
  // con la distancia desde el origen del viaje existente al destino del nuevo viaje
  if (
    distanciaOrigen <= distanciaDestinoViajeExistente &&
    distanciaDestino <= distanciaDestinoNuevoViaje
  ) {
    return true;
  }

  return false;
}
