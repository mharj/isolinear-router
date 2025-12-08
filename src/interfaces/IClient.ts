import {OutputDataPacket} from '../types/clientPacket/OutputDataPacket';

export interface IClient {
	sendPacket(packet: OutputDataPacket): Promise<boolean>;
}
