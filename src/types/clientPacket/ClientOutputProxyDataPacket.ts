import {routerUuidSchema} from '../../lib/routerUuid';
import {targetPathSchema} from '../TargetPath';
import {z} from 'zod';

export const outputProxyDataPacketSchema = z.object({
	router: routerUuidSchema,
	targets: z.array(targetPathSchema),
	data: z.unknown(),
});
