import {UUID} from '../types/UUID';
import {uuid} from './uuid';
import {z} from 'zod';

export type ServiceUUID = `service-${UUID}`;

export function generateServiceUUID(): ServiceUUID {
	return `service-${uuid()}`;
}

export const serviceUuidSchema = z.custom<ServiceUUID>((value: unknown) => {
	return typeof value === 'string' && value.startsWith('service-') && z.string().uuid().safeParse(value.slice(8)).success;
});

export function isServiceUUID(value: unknown): value is ServiceUUID {
	return serviceUuidSchema.safeParse(value).success;
}
