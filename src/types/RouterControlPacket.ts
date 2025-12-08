import {ClientUUID} from '../lib/clientUuid';
import {RouterUUID} from '../lib/routerUuid';
import {ServiceUUID} from '../lib/serviceUuid';

export type RouterPingControlPacket = {
	type: 'ping';
	service: ServiceUUID;
	ts: number;
};

// router to announce packet
export type RouterAnnounceControlPacket = {
	type: 'discovery';
	uuid: RouterUUID;
};

export type RouterClientRegisterControlPacket<Props = unknown> = {
	type: 'register';
	uuid: ClientUUID;
	props: Props;
};

/**
 * A packet sent from router to service
 */
export type RouterControlPacket = RouterPingControlPacket | RouterAnnounceControlPacket | RouterClientRegisterControlPacket;
