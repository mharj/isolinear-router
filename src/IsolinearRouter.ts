import type {ILoggerLike, ISetLogger} from '@avanio/logger-like';
import {ServiceControlPacket, serviceControlPacketSchema, ServiceClientRegisteredControlPacket} from './types/ServiceControlPacket';
import {ClientUUID, generateClientUUID} from './lib/clientUuid';
import {IClient} from './interfaces/IClient';
import {IService} from './interfaces/IService';
import {ClientInputDataPacket, clientInputDataPacketSchema} from './types/clientPacket/ClientInputDataPacket';
import {RouterControlPacket, RouterClientRegisterControlPacket} from './types/RouterControlPacket';
import {OutputDataPacket} from './types/clientPacket/OutputDataPacket';
import {Service} from './types/Service';
import {TargetPath} from './types/TargetPath';
import {UUID} from './types/UUID';
import {ServiceUUID} from './lib/serviceUuid';
import {IMessageBus} from './interfaces/IMessageBus';
import {generateRouterUUID} from './lib/routerUuid';
import {ClientInputProxyDataPacket} from './types/clientPacket/ClientInputProxyDataPacket';

export class IsolinearRouter implements ISetLogger {
	private registeredServices = new Map<UUID, IService>();
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
		this.messageBus.subscribe((data) => {
			console.log('subscribe', data);
		});
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
		packets.forEach((packet) => this.handleDataInput(uuid, packet));
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
					// this.registeredServices.set(packet.uuid, {name: packet.name, status: packet.status});
					break;
				}
				default: {
					this.handleUnknownPackage(packet);
				}
			}
		} catch (e) {
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
