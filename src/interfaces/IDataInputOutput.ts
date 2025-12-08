import {ClientInputDataPacket} from '../types/clientPacket/ClientInputDataPacket';
import {OutputDataPacket} from '../types/clientPacket/OutputDataPacket';

export interface IDataInputOutput {
	dataInput(packet: ClientInputDataPacket[]): void;
	dataOutput(): OutputDataPacket[];
}
