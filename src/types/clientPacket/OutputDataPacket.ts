import {serviceUuidSchema} from '../../lib/serviceUuid';
import {z} from 'zod';

export const registerDataPacketSchema = z.object({
	uuid: serviceUuidSchema,
	type: z.literal('register'),
	props: z.unknown(),
});

export type OutputDataPacket = unknown;
