import {ServiceUUID} from '../lib/serviceUuid';
import {z} from 'zod';

export const targetPathSchema = z.custom<`/${ServiceUUID}`>((value: unknown) => {
	return typeof value === 'string' && value.startsWith('/service-') && z.string().uuid().safeParse(value.slice(9)).success;
});

export type TargetPath = z.infer<typeof targetPathSchema>;
