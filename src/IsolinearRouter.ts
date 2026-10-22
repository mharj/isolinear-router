import type {ILoggerLike, ISetLogger} from '@avanio/logger-like';
import type {IClient} from './interfaces/IClient';
import type {IMessageBus} from './interfaces/IMessageBus';
import type {IService} from './interfaces/IService';
import {type ClientUUID, generateClientUUID} from './lib/clientUuid';
import {generateRouterUUID} from './lib/routerUuid';
import type {ServiceUUID} from './lib/serviceUuid';
import {type ClientInputDataPacket, clientInputDataPacketSchema} from './types/clientPacket/ClientInputDataPacket';
import type {ClientInputProxyDataPacket} from './types/clientPacket/ClientInputProxyDataPacket';
import type {OutputDataPacket} from './types/clientPacket/OutputDataPacket';
import type {RouterControlPacket} from './types/RouterControlPacket';
import {type ServiceClientRegisteredControlPacket, type ServiceControlPacket, serviceControlPacketSchema} from './types/ServiceControlPacket';
import type {TargetPath} from './types/TargetPath';
import type {UUID} from './types/UUID';

export interface IServiceReg {
	name: string;
	uuid: ServiceUUID;
}

export class IsolinearRouter implements ISetLogger {
	private registeredServices = new Map<UUID, IServiceReg>();
	private routerPaths = new Map<TargetPath, Set<IClient>>();
	private currentClients = new Map<ClientUUID, IClient>();
	private outputControlCallbacks = new Set<(output: RouterControlPacket[]) => void>();
	private outputDataCallbacks = new Set<(output: OutputDataPacket[]) => void>();
	private logger: ILoggerLike | undefined;
	private messageBus: IMessageBus<ServiceControlPacket[], RouterControlPacket[]>;
	private routerUuid = generateRouterUUID();
	constructor(messageBus: IMessageBus<ServiceControlPacket[], RouterControlPacket[]>, logger?: ILoggerLike) {
		this.messageBus = messageBus;
		this.logger = logger;
		this.handleControlInput = this.handleControlInput.bind(this);
		this.handleDataInput = this.handleDataInput.bind(this);
		// Note: comment out logging for now as it might cause issues with circular subscription
		// this.messageBus.subscribe((data) => {
		// 	console.log('subscribe', data);
		// });
		if (this.messageBus.isConnected()) {
			this.messageBus.publish([{type: 'discovery', uuid: this.routerUuid}]);
		}
		this.messageBus.onConnected(() => {
			// send discovery message when (re-)connected
			this.messageBus.publish([{type: 'discovery', uuid: this.routerUuid}]);
		});
	}

	public setLogger(logger: ILoggerLike) {
		this.logger = logger;
	}

	public dataInput(uuid: ClientUUID, packets: ClientInputDataPacket[]) {
		for (const packet of packets) {
			this.handleDataInput(uuid, packet);
		}
	}

	public controlInput(packets: ServiceControlPacket[]) {
		packets.forEach(this.handleControlInput);
	}

	public onControlOutput(callback: (output: RouterControlPacket[]) => void) {
		this.outputControlCallbacks.add(callback);
	}

	public onDataOutput(callback: (output: OutputDataPacket[]) => void) {
		this.outputDataCallbacks.add(callback);
	}

	public registerService(service: IService) {
		this.registeredServices.set(service.uuid, service);
		this.logger?.info(`Service ${service.uuid} registered`);
	}

	public registerClient(client: IClient): ClientUUID {
		const uuid = generateClientUUID();
		this.currentClients.set(uuid, client);
		this.logger?.info(`Client ${uuid} registered`);
		return uuid;
	}

	public unregisterClient(uuid: ClientUUID): boolean {
		const client = this.currentClients.get(uuid);
		if (!client) {
			return false;
		}
		// remove client from all target paths
		this.routerPaths.forEach((clients) => {
			clients.delete(client);
		});
		// remove client from current client list
		this.currentClients.delete(uuid);
		this.logger?.info(`Client ${uuid} unregistered`);
		return true;
	}

	public listServices(): {uuid: ServiceUUID; name: string}[] {
		return Array.from(this.registeredServices.values()).map(({uuid, name}) => ({uuid, name}));
	}

	private handleControlInput(packet: ServiceControlPacket) {
		if (!serviceControlPacketSchema.safeParse(packet).success) {
			console.log(`Invalid control packet ${JSON.stringify(packet)}`);
			return;
		}
		try {
			switch (packet.type) {
				case 'pong': {
					const service = this.registeredServices.get(packet.uuid);
					if (service) {
						console.log(`Pong from ${service.name} delay: ${packet.ts - Date.now()}`);
					}
					break;
				}
				case 'registered': {
					return this.handleInputRegisteredControlPacket(packet);
				}
				case 'service-register': {
					// Register the service properly when we receive a service-register packet
					this.registeredServices.set(packet.uuid, {name: packet.name, uuid: packet.uuid});
					break;
				}
				default: {
					this.handleUnknownPackage(packet);
				}
			}
		} catch (_e) {
			this.logger?.error(`Error handling control packet ${JSON.stringify(packet)}`);
		}
	}

	private handleDataInput(clientUuid: ClientUUID, packet: ClientInputDataPacket) {
		if (!clientInputDataPacketSchema.safeParse(packet).success) {
			console.log(`Invalid data packet ${JSON.stringify(packet)}`);
			return;
		}
		const service = this.registeredServices.get(packet.uuid);
		const client = this.currentClients.get(clientUuid);
		if (service && client) {
			const data: ClientInputProxyDataPacket = {...packet, router: this.routerUuid, client: clientUuid};
			this.logger?.info(`Data to ${service.name}`, data);
		}
	}

	private handleUnknownPackage(packet: ServiceControlPacket): never {
		throw new Error(`Unknown control packet type ${packet.type}`);
	}

	private handleInputRegisteredControlPacket(packet: ServiceClientRegisteredControlPacket) {
		const client = this.currentClients.get(packet.uuid);
		if (client) {
			packet.targets.forEach((target) => {
				// get the set of clients for this target path
				let clients = this.routerPaths.get(target);
				// if there are no clients for this target path, create a new set and attach it to the map
				if (!clients) {
					clients = new Set();
					this.routerPaths.set(target, clients);
				}
				clients.add(client);
			});
		}
	}
}
