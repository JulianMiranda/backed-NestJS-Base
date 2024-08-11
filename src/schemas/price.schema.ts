import * as mongoose from 'mongoose';
import { schemaOptions } from '../utils/index';

export const PriceSchema = new mongoose.Schema(
  {
    mlc: { type: Number, default: 1 },
    mn: { type: Number, default: 1 },
    usd: { type: Number, default: 1 },
  },
  { ...schemaOptions },
);
