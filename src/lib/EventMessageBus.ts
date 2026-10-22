import {IMessageBus} from '../interfaces/IMessageBus';

export class EventMessageBus<Input, Output> implements IMessageBus<Input, Output> {
	private subscribes = new Set<(message: any) => void>();
	public isConnected(): boolean {
		return true;
	}

	public publish(message: Output): void {
		this.subscribes.forEach((listener) => listener(message));
	}

	public subscribe(subscribeCallback: (message: Input) => void): void {
		this.subscribes.add(subscribeCallback);
	}

	public onConnected(connectedCallback: () => void): void {
		// Do nothing, always connected
	}

	public onDisconnected(disconnectedCallback: () => void): void {
		// Do nothing, always connected
	}
}

export class EventInputOutput<Input, Output> {
	private inputMessageBus = new EventMessageBus<Input, Output>();
	private outputMessageBus = new EventMessageBus<Output, Input>();
	constructor() {
		// Remove the circular subscription that was causing maximum call stack error
		// The original design tried to create a bidirectional message bus but created a circular reference
		// For now, just keep separate input and output buses without cross-subscription
	}

	public getInputMessageBus(): IMessageBus<Input, Output> {
		return this.inputMessageBus;
	}

	public getOutputMessageBus(): IMessageBus<Output, Input> {
		return this.outputMessageBus;
	}
}
