import * as R from "radashi";
import * as v from "valibot";

export const ParticipantRawSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  address: v.string(),
  zip_code: v.nullable(v.pipe(v.number(), v.integer())),
  phone: v.string(),
  wishes: v.string(),
});

export const SecretSantaRawSchema = v.object({
  deadline: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
  budget: v.string(),
  is_active: v.boolean(),
  gift_giver: v.nullable(ParticipantRawSchema),
  gift_receiver: v.nullable(ParticipantRawSchema),
});

export const ParticipantSchema = v.strictObject({
  ...v.entriesFromObjects([
    v.pick(ParticipantRawSchema, ["id", "address", "phone", "wishes"]),
  ]),
  zipCode: ParticipantRawSchema.entries.zip_code,
});

export const SecretSantaSchema = v.strictObject({
  ...v.entriesFromObjects([
    v.pick(SecretSantaRawSchema, ["deadline", "budget"]),
  ]),
  isActive: SecretSantaRawSchema.entries.is_active,
  giftGiver: v.nullable(ParticipantSchema),
  giftReceiver: v.nullable(ParticipantSchema),
});

export const ParticipantUpdateRawSchema = v.omit(ParticipantRawSchema, ["id"]);

export type ParticipantRaw = v.InferOutput<typeof ParticipantRawSchema>;
export type SecretSantaRaw = v.InferOutput<typeof SecretSantaRawSchema>;
export type SecretSanta = v.InferOutput<typeof SecretSantaSchema>;
export type Participant = v.InferOutput<typeof ParticipantSchema>;
export type ParticipantUpdateRaw = v.InferOutput<
  typeof ParticipantUpdateRawSchema
>;

export const toSecretSanta = (r: SecretSantaRaw): SecretSanta =>
  v.parse(SecretSantaSchema, {
    ...R.pick(r, ["deadline", "budget"]),
    isActive: r.is_active,
    giftGiver: r.gift_giver && {
      ...R.pick(r.gift_giver, ["id", "address", "phone", "wishes"]),
      zipCode: r.gift_giver.zip_code,
    },
    giftReceiver: r.gift_receiver && {
      ...R.pick(r.gift_receiver, ["id", "address", "phone", "wishes"]),
      zipCode: r.gift_receiver.zip_code,
    },
  });

export const fromParticipant = (p: Participant): ParticipantUpdateRaw =>
  v.parse(ParticipantUpdateRawSchema, {
    ...R.pick(p, ["address", "phone", "wishes"]),
    zip_code: p.zipCode,
  });
