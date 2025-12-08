import {z} from 'zod';

export const uuidSchema = z.string().uuid() as z.ZodType<`${string}-${string}-${string}-${string}`, z.ZodTypeDef, `${string}-${string}-${string}-${string}`>;

export type UUID = z.infer<typeof uuidSchema>;

export function isUUID(value: unknown) {
	return uuidSchema.safeParse(value).success;
}
