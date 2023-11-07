/* import { MAPBOX_API_KEY } from '../config/config'; */

const mapboxStaticImage = (coordinates: any) => {
  const { longitude, latitude } = coordinates;
  const lon = longitude;
  const lat = latitude;
  const mapTheme = 'streets-v11'; // 'dark-v10'
  const url = `https://api.mapbox.com/styles/v1/mapbox/${mapTheme}/static/`;
  const marker = 'pin-s+2db89c';
  const zoom = 14;
  const width = 600;
  const height = 400;

  return `${url}${marker}(${lon},${lat})/${lon},${lat},${zoom}/${width}x${height}?access_token=${process.env.MAPBOX_API_KEY}`;
};

export const schemaOptions = {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;

      if (ret.textSearch) delete ret.textSearch;
      if (ret.fromLocation) {
        ret.coordinates = ret.fromLocation.travelPoint.coordinates;
        ret.mapImageFrom = mapboxStaticImage(
          ret.fromLocation.travelPoint.coordinates,
        );
        delete ret.location;
      }
      if (ret.toLocation) {
        ret.coordinates = ret.fromLocation.travelPoint.coordinates;
        ret.mapImageTo = mapboxStaticImage(
          ret.toLocation.travelPoint.coordinates,
        );
        delete ret.location;
      }
    },
  },
};

export const format = (documents) => {
  if (Array.isArray(documents)) {
    return documents.map((doc) => {
      doc.id = doc._id;
      delete doc._id;
      delete doc.__v;
      return doc;
    });
  }

  documents.id = documents._id;
  delete documents._id;
  delete documents.__v;
  return documents;
};
