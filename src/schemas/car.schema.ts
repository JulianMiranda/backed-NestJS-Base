import * as mongoose from 'mongoose';
import { schemaOptions } from '../utils/index';

const CarSchema = new mongoose.Schema(
  {
    carPlate: String,
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    carBrand: String,
    carModel: String,
    carYear: String,
    carType: String,
    color: String,
    vin: String,
    haveAirConditioning: Boolean,
    verified: { type: Boolean, default: false },
    passengers: Number,
  },
  { ...schemaOptions },
);
export default CarSchema;
