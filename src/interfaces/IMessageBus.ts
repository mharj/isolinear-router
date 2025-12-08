export interface IMessageBus<Input, Output> {
	publish(message: Output): void;
	isConnected(): boolean;
	subscribe(subscribeCallback: (message: Input) => void): void;
	onConnected(connectedCallback: () => void): void;
	onDisconnected(disconnectedCallback: () => void): void;
}
