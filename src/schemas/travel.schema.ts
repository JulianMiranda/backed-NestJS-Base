import * as mongoose from 'mongoose';
import { TRAVELSTATE } from 'src/enums/travelstate.enum';
import { schemaOptions } from '../utils/index';

const TravelSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      enum: [
        TRAVELSTATE.ORDER,
        TRAVELSTATE.TAKED,
        TRAVELSTATE.CANCELLED,
        TRAVELSTATE.COMPLETED,
      ],
      index: true,
      default: TRAVELSTATE.ORDER,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    cost: { type: Number, set: setPrice, default: 0, index: true },

    currency: { type: String, default: 'USD' },
    status: { type: Boolean, default: true, index: true },
    fromLocation: {
      type: { type: String },

      travelPoint: {
        name: { type: String },
        address: { type: String },
        coordinates: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
      },
    },

    toLocation: {
      type: { type: String },
      travelPoint: {
        name: { type: String },
        address: { type: String },
        coordinates: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
      },
    },
  },
  { ...schemaOptions },
);
/* TravelSchema.index({location: '2dsphere'}); */
function setPrice(price: number) {
  return price.toFixed(2);
}
export default TravelSchema;
