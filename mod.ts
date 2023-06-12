/*
 * Reverb
 *
 * The lightest timeline manager
 */

// Represents a data storage system
export type ReverbDataStore<Event> = {
	getEvents(): Promise<{ data: Event; time: number }[]>;
	putEvent(data: Event): void;
};

// An event type
export enum EventEffect {
	TimelineModifier,
	StateModifier
};

// Manages a Reverb database
export class ReverbDB<Event, State> {
	private store: ReverbDataStore<Event>;
	private defaultState: State;
	private currentStateEvents: Event[];
	private _events: Event[];
	private _state: State;
	private getEffectType:(event:Event)=>EventEffect;
	private getTimelineEffect:(event:Event,events:Event[])=>Event[];
	private getStateEffect:(event:Event,state:State)=>State;

	public initialized:Promise<void>;

	public get events() {
		return this._events;
	}

	public get state() {
		return this._state;
	}

	public constructor({
		store,
		defaultState,
		getEffectType,
		getTimelineEffect,
		getStateEffect
	}: {
		store: ReverbDataStore<Event>;
		defaultState: State;
		getEffectType(event:Event):EventEffect;
		getTimelineEffect(event:Event,events:Event[]):Event[];
		getStateEffect(event:Event,state:State):State;
	}) {
		this.store = store;
		this.defaultState = defaultState;
		this._state = defaultState;
		this.currentStateEvents = [];
		this._events = [];
		this.initialized = this.getEvents();

		this.getEffectType = getEffectType;
		this.getTimelineEffect = getTimelineEffect;
		this.getStateEffect = getStateEffect;
	}

	public async getEvents() {
		this._events = (await this.store.getEvents())
			.toSorted((a, b) => a.time - b.time)
			.map((event) => event.data);
		this.recomputeState();
	}

	public do(event: Event) {
		this.store.putEvent(event);
		this._events.push(event);
		this.recomputeState();
	}

	public get pureEvents() {
		let pureEvents:Event[] = [];
		let pureEventQueue:Event[] = structuredClone(this._events);

		while (pureEventQueue.length > 0) {
			const event = pureEventQueue.pop();

			if (!event) {
				throw new Error("Unreachable, only here for Typescript purposes");
			}

			switch (this.getEffectType(event)) {
				case EventEffect.TimelineModifier:
					pureEventQueue = this.getTimelineEffect(event,structuredClone(pureEventQueue));
					break;
				case EventEffect.StateModifier:
					pureEvents = [...pureEvents,event];
					break;
			}
		}

		return pureEvents;
	}

	private recomputeState() {
		const pureEvents = this.pureEvents;

		if (this._events.slice(0,this.currentStateEvents.length) != this.currentStateEvents) {
			this.currentStateEvents = [];
			this._state = this.defaultState;
		}

		while (this.currentStateEvents.length < pureEvents.length) {
			const event = this.pureEvents[this.currentStateEvents.length];
			this._state = this.getStateEffect(event,structuredClone(this._state));
			this.currentStateEvents.push(event);
		}
	}
}

export const id = {
	get new() {
		const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
		let out = "";

		for (let i = 0; i < 32; i++) {
			out += chars[Math.floor(Math.random() * (chars.length - 0.001))];
		}

		return out;
	}
};
