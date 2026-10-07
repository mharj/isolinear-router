import {z} from 'zod';

export const uuidSchema = z.uuid().transform<`${string}-${string}-${string}-${string}`>((val) => val as `${string}-${string}-${string}-${string}`);

export type UUID = z.infer<typeof uuidSchema>;

export function isUUID(value: unknown) {
	return uuidSchema.safeParse(value).success;
}
