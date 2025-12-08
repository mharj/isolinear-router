import {clientUuidSchema} from '../lib/clientUuid';
import {serviceUuidSchema} from '../lib/serviceUuid';
import {targetPathSchema} from './TargetPath';
import {z} from 'zod';

export const servicePongControlPacketSchema = z.object({
	type: z.literal('pong'),
	ts: z.number(),
	uuid: serviceUuidSchema,
});

export const serviceRegisteredSchema = z.object({
	name: z.string(),
	status: z.string(),
	type: z.literal('service-register'),
	uuid: serviceUuidSchema,
});

export const serviceClientRegisteredControlPacketSchema = z.object({
	type: z.literal('registered'),
	targets: z.array(targetPathSchema),
	uuid: clientUuidSchema,
});

export type ServiceClientRegisteredControlPacket = z.infer<typeof serviceClientRegisteredControlPacketSchema>;

// union of all possible input control packets
export const serviceControlPacketSchema = z.discriminatedUnion('type', [
	servicePongControlPacketSchema,
	serviceRegisteredSchema,
	serviceClientRegisteredControlPacketSchema,
]);

/**
 * A packet sent from router to service
 */
export type ServiceControlPacket = z.infer<typeof serviceControlPacketSchema>;
