/* eslint-disable no-unused-expressions */
import 'mocha';
import * as chai from 'chai';
import * as clientUuid from '../src/lib/clientUuid';
import * as routerUuid from '../src/lib/routerUuid';
import * as serviceUuid from '../src/lib/serviceUuid';

const expect = chai.expect;

describe('UUID tests', () => {
	it('should create and validate service UUID', async () => {
		const uuid = serviceUuid.generateServiceUUID();
		expect(serviceUuid.isServiceUUID(uuid)).to.be.true;
	});
	it('should create and validate client UUID', async () => {
		const uuid = clientUuid.generateClientUUID();
		expect(clientUuid.isClientUUID(uuid)).to.be.true;
	});
	it('should create and validate router UUID', async () => {
		const uuid = routerUuid.generateRouterUUID();
		expect(routerUuid.isRouterUUID(uuid)).to.be.true;
	});
});
