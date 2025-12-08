import {UUID} from '../types/UUID';
import {uuid} from './uuid';
import {z} from 'zod';

export type ClientUUID = `client-${UUID}`;

export function generateClientUUID(): ClientUUID {
	return `client-${uuid()}`;
}

export const clientUuidSchema = z.custom<ClientUUID>((value: unknown) => {
	return typeof value === 'string' && value.startsWith('client-') && z.string().uuid().safeParse(value.slice(7)).success;
});

export function isClientUUID(value: unknown): value is ClientUUID {
	return clientUuidSchema.safeParse(value).success;
}
