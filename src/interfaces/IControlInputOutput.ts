import {ServiceControlPacket} from '../types/ServiceControlPacket';
import {RouterControlPacket} from '../types/RouterControlPacket';

export interface IControlInputOutput {
	controlInput(packet: ServiceControlPacket[]): void;
	controlOutput(): RouterControlPacket[];
}
