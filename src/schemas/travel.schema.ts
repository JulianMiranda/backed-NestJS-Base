import * as mongoose from 'mongoose';
import { TRAVELSTATE } from 'src/enums/travelstate.enum';
import { schemaOptions } from '../utils/index';
import { TRAVELTYPE } from 'src/enums/traveltype.enum';
import { PAYMENTCURRENCY } from 'src/enums/payment.enum';

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
    payment: {
      currency: {
        type: String,
        enum: ['MLC', 'MN', 'USD'],
        required: true,
        default: PAYMENTCURRENCY.MN,
      },
      type: {
        type: String,
        enum: ['cash', 'transfer'],
        required: true,
      },
    },
    type: {
      type: String,
      enum: [
        TRAVELTYPE.FAST,
        TRAVELTYPE.SCHEDULE,
        TRAVELTYPE.FASTSHARED,
        TRAVELTYPE.SCHEDULESHARED,
      ],
      index: true,
      default: TRAVELTYPE.FAST,
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
    date: { type: Date, default: new Date() },
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
