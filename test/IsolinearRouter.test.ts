import {describe, it, expect, vi} from 'vitest';
import {generateServiceUUID} from '../src/lib/serviceUuid';
import {IClient} from '../src/interfaces/IClient';
import {ServiceControlPacket} from '../src/types/ServiceControlPacket';
import {IsolinearRouter} from '../src/IsolinearRouter';
import {RouterControlPacket} from '../src/types/RouterControlPacket';
import {EventInputOutput} from '../src/lib/EventMessageBus';

const eventMessageBus = new EventInputOutput<ServiceControlPacket[], RouterControlPacket[]>();

const router = new IsolinearRouter(eventMessageBus.getInputMessageBus());

const sendPacket = vi.fn();

const mockupClient: IClient = {
	sendPacket,
};

const serviceUuid = generateServiceUUID();

/* class TestService implements IService {
	public name = 'unit-test';
	private controlInputCallback: undefined | ((message: ServiceControlPacket) => void);
	private dataInputCallback: (message: ClientInputDataPacket) => void = () => {};
	public uuid = generateServiceUUID();
	sendControlOutput(message: ServiceControlPacket): void {
 		switch (message.type) {
			case 'ping':
				this.controlInputCallback?.({type: 'pong', ts: message.ts, uuid: this.uuid});
				break;
			case 'register':
				this.controlInputCallback?.({type: 'registered', uuid: message.uuid, targets: [`/${this.uuid}`]});
				break;
		} 
	}

	serviceDataOutput(message: unknown): void {
		switch (message.type) {
			case 'register':
				break;
		} 
	}

	onControlInput(callback: (message: RouterControlPacket) => void): void {
		throw new Error('Method not implemented.');
	}

	onServiceDataInput(callback: (message: ClientInputDataPacket) => void): void {
		throw new Error('Method not implemented.');
	}
}
 */

const registerServicePayload: ServiceControlPacket = {
	name: 'unit-test',
	status: 'online',
	type: 'service-register',
	uuid: serviceUuid,
};

describe('UUID tests', () => {
	it('should create and validate service UUID', async () => {
		router.controlInput([registerServicePayload]);
		const clientUuid = router.registerClient(mockupClient);
		const services = router.listServices();
		expect(services[0]).to.be.eql({name: 'unit-test', uuid: serviceUuid});

		router.onControlOutput((packet) => {
			console.log(packet);
		});
		router.dataInput(clientUuid, [{type: 'register', uuid: serviceUuid, props: {}}]);
		// cleanup
		expect(router.unregisterClient(clientUuid)).to.be.true;
	});
});
