import {UUID} from '../types/UUID';
import {uuid} from './uuid';
import {z} from 'zod';

export type RouterUUID = `router-${UUID}`;

export function generateRouterUUID(): RouterUUID {
	return `router-${uuid()}`;
}

export const routerUuidSchema = z.custom<RouterUUID>((value: unknown) => {
	return typeof value === 'string' && value.startsWith('router-') && z.string().uuid().safeParse(value.slice(7)).success;
});

export function isRouterUUID(value: unknown): value is RouterUUID {
	return routerUuidSchema.safeParse(value).success;
}
