import { EventEffect, ReverbDB, ReverbDataStore, id } from '../mod.ts';
import { ClassicDatabase } from '../src/classic-database.ts';

type TestEvent = (
	| {
			type: 'increment';
	  }
	| {
			type: 'undo';
			undoId: string;
	  }
) & { id: string };

type TestState = {
	count:number
};

const dataStore: ReverbDataStore<TestEvent> = new ClassicDatabase('./database');

const db = new ReverbDB<TestEvent,TestState>({
	defaultState:{
		count:-1
	},
	getEffectType:event => {
		switch (event.type) {
			case "increment":
				return EventEffect.StateModifier;
			case "undo":
				return EventEffect.TimelineModifier;
		}
	},
	getStateEffect:(event,state) => {
		if (event.type == "increment") {
			state.count++;
			return state;
		}
		throw new Error("Not a state modifier, but a " + event.type);
	},
	getTimelineEffect:(event,timeline) => {
		if (event.type == "undo") {
			return timeline.filter(ev => ev.id != event.undoId);
		}
		throw new Error("Not a timeline modifier");
	},
	store:dataStore
});

await db.initialized;

const inc1 = id.new;
const inc2 = id.new;

db.do({
	type:"increment",
	id:inc1
});

db.do({
	type:"increment",
	id:inc2
});

console.log(db.state);

db.do({
	type:"undo",
	id:id.new,
	undoId:inc2
});

console.log(db.state);
