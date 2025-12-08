import {clientUuidSchema} from '../../lib/clientUuid';
import {registerDataPacketSchema} from './ClientInputDataPacket';
import {routerUuidSchema} from '../../lib/routerUuid';
import {targetPathSchema} from '../TargetPath';
import {z} from 'zod';

const asd = z.object({
	router: routerUuidSchema,
	targets: z.array(targetPathSchema),
	data: z.unknown(),
});
