import {clientDataPacketSchema, registerDataPacketSchema} from './ClientInputDataPacket';
import {clientUuidSchema} from '../../lib/clientUuid';
import {routerUuidSchema} from '../../lib/routerUuid';
import {z} from 'zod';

/**
 * A packet information for service to know which client and router to send data to
 */
const clientRouteExtension = {
	client: clientUuidSchema,
	router: routerUuidSchema,
};

const proxyRegisterDataPacketSchema = registerDataPacketSchema.extend(clientRouteExtension);

const proxyClientDataPacketSchema = clientDataPacketSchema.extend(clientRouteExtension);

export const proxyClientInputDataPacketSchema = z.discriminatedUnion('type', [proxyRegisterDataPacketSchema, proxyClientDataPacketSchema]);

/**
 * A internal packet sent from router to service with client uuid
 */
export type ClientInputProxyDataPacket = z.infer<typeof proxyClientInputDataPacketSchema>;
