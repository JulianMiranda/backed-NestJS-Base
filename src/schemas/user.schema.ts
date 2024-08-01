import * as mongoose from 'mongoose';
import { THEME } from 'src/enums/theme.enum';
import { schemaOptions } from '../utils/index';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, index: true },
    lastName: { type: String, index: true },

    email: String,
    phone: String,
    role: String,
    defaultImage: String,
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    status: { type: Boolean, default: true, index: true },
    isInTravel: { type: Boolean, default: false, index: true },
    acceptFastTravel: { type: Boolean, default: false, index: true },
    acceptScheduleTravel: { type: Boolean, default: false, index: true },
    acceptSharedTravel: { type: Boolean, default: false, index: true },
    acceptScheduleSharedTravel: { type: Boolean, default: false, index: true },
    reciveNotifications: { type: Boolean, default: true, index: true },
    notificationTokens: [{ type: String }],
    theme: {
      type: String,
      default: THEME.DEFAULT,
      enum: [THEME.DEFAULT, THEME.DARK, THEME.LIGHT],
    },

    favoritesPlaces: [
      {
        name: { type: String },
        place: {
          from: {
            name: String,
            address: String,
            coordinates: { latitude: Number, longitude: Number },
          },
          to: {
            name: String,
            address: String,
            coordinates: { latitude: Number, longitude: Number },
          },
        },
      },
    ],
    lastTravel: [
      {
        name: String,
        address: String,
        coordinates: { latitude: Number, longitude: Number },
      },
    ],
    ratingStars: {
      one: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      five: { type: Number, default: 0 },
    },
    ratingAvg: { type: Number, default: 0, index: true },
    location: {
      type: { type: String },
      coordinates: [],
    },
  },
  { ...schemaOptions },
);
UserSchema.index({ location: '2dsphere' });
export default UserSchema;
