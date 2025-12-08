import {UUID} from '../types/UUID';
import {v4 as uuidV4} from 'uuid';

export function uuid(): UUID {
	return uuidV4() as UUID;
}

export function generateClientUUID(): `client-${UUID}` {
	return `client-${uuid()}`;
}
