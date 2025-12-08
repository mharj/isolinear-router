/* eslint-disable no-unused-expressions */
import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import {generateServiceUUID} from '../src/lib/serviceUuid';
import {IClient} from '../src/interfaces/IClient';
import {IService} from '../src/interfaces/IService';
import {ServiceControlPacket} from '../src/types/ServiceControlPacket';
import {IsolinearRouter} from '../src/IsolinearRouter';
import {RouterControlPacket} from '../src/types/RouterControlPacket';
import {ClientInputDataPacket} from '../src/types/clientPacket/ClientInputDataPacket';
import {EventInputOutput} from '../src/lib/EventMessageBus';

const eventMessageBus = new EventInputOutput<ServiceControlPacket[], RouterControlPacket[]>();

const expect = chai.expect;

const router = new IsolinearRouter(eventMessageBus.getInputMessageBus());

const sendPacket = sinon.spy();

const mockupClient: IClient = {
	sendPacket,
};

const serviceUuid = generateServiceUUID();

class TestService implements IService {
	public name = 'unit-test';
	private controlInputCallback: undefined | ((message: ServiceControlPacket) => void);
	private dataInputCallback: (message: ClientInputDataPacket) => void;
	public uuid = generateServiceUUID();
	serviceControlOutput(message: RouterControlPacket): void {
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
		/* switch (message.type) {
			case 'register':
				break;
		} */
	}

	onServiceControlInput(callback: (message: ServiceControlPacket) => void): void {
		throw new Error('Method not implemented.');
	}

	onServiceDataInput(callback: (message: ClientInputDataPacket) => void): void {
		throw new Error('Method not implemented.');
	}
}

/* const testService: IService = {
    uuid: serviceUuid,
    onServiceControlOutput: (output) => {
        console.log(output);
    },
    onServiceDataOutput: (output) => {
        console.log(output);
    },
    serviceControlInput: function (message: { type: 'pong'; ts: number; uuid: `service-${string}-${string}-${string}-${string}`; } | { type: 'service-register'; status: string; uuid: `service-${string}-${string}-${string}-${string}`; name: string; } | { type: 'registered'; uuid: `client-${string}-${string}-${string}-${string}`; targets: `/${string}-${string}-${string}-${string}`[]; }): void {
        throw new Error('Function not implemented.');
    },
    serviceDataInput: function (message: { type: 'register'; uuid: `service-${string}-${string}-${string}-${string}`; props?: unknown; }): void {
        throw new Error('Function not implemented.');
    }
}; */

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
		expect(services[0]).to.be.eql({name: 'unit-test', status: 'online'});

		router.onControlOutput((packet) => {
			console.log(packet);
		});
		router.dataInput([{type: 'register', uuid: serviceUuid, props: {}}]);
		// cleanup
		expect(router.unregisterClient(clientUuid)).to.be.true;
	});
});
