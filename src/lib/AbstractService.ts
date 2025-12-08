import {ClientInputProxyDataPacket} from '../types/clientPacket/ClientInputProxyDataPacket';
import {IMessageBus} from '../interfaces/IMessageBus';
import {OutputDataPacket} from '../types/clientPacket/OutputDataPacket';
import {RouterControlPacket} from '../types/RouterControlPacket';
import {ServiceControlPacket} from '../types/ServiceControlPacket';
import {ServiceUUID} from './serviceUuid';

type ControlMessageBus = IMessageBus<RouterControlPacket[], ServiceControlPacket[]>;
type DataMessageBus = IMessageBus<ClientInputProxyDataPacket[], OutputDataPacket[]>;

export abstract class AbstractService {
	abstract uuid: ServiceUUID;
	abstract name: string;
	private controlMessageBus: ControlMessageBus;
	private dataMessageBus: DataMessageBus;
	constructor(controlMessageBus: ControlMessageBus, dataMessageBus: DataMessageBus) {
		this.controlMessageBus = controlMessageBus;
		this.dataMessageBus = dataMessageBus;
		this.controlMessageBus.subscribe(this.handleRouterControlPackets.bind(this));
		this.dataMessageBus.subscribe(this.handleRouterDataPackets.bind(this));
	}

	public sendServiceControlPackets(packets: ServiceControlPacket[]) {
		this.controlMessageBus.publish(packets);
	}

	public sendServiceDataPackets(packets: OutputDataPacket[]) {
		this.dataMessageBus.publish(packets);
	}

	abstract handleRouterControlPackets(packets: RouterControlPacket[]): void;
	abstract handleRouterDataPackets(packets: ClientInputProxyDataPacket[]): void;
}
