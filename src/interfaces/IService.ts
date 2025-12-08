import {ClientInputDataPacket} from '../types/clientPacket/ClientInputDataPacket';
import {OutputDataPacket} from '../types/clientPacket/OutputDataPacket';
import {RouterControlPacket} from '../types/RouterControlPacket';
import {ServiceControlPacket} from '../types/ServiceControlPacket';
import {ServiceUUID} from '../lib/serviceUuid';

export interface IService {
	uuid: ServiceUUID;
	name: string;
	onControlInput(callback: (message: RouterControlPacket) => void): void;
	sendControlOutput(message: ServiceControlPacket): void;
	serviceDataOutput(message: OutputDataPacket): void;
	onServiceDataInput(callback: (message: ClientInputDataPacket) => void): void;
}
