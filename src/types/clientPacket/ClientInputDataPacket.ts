import {serviceUuidSchema} from '../../lib/serviceUuid';
import {z} from 'zod';

export const registerDataPacketSchema = z.object({
	uuid: serviceUuidSchema,
	type: z.literal('register'),
	props: z.unknown(),
});

export const clientDataPacketSchema = z.object({
	uuid: serviceUuidSchema,
	type: z.literal('data'),
	dtype: z.string(), // client<=>service internal packet type (transparent for router)
	data: z.unknown(),
});

export type RegisterDataPacket = z.infer<typeof registerDataPacketSchema>;

export const clientInputDataPacketSchema = z.discriminatedUnion('type', [registerDataPacketSchema, clientDataPacketSchema]);

/**
 * A packet sent from client to router
 */
export type ClientInputDataPacket = z.infer<typeof clientInputDataPacketSchema>;
