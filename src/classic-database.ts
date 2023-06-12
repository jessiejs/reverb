import { ReverbDataStore } from '../mod.ts';
import { hash } from './crypto.ts';

export class ClassicDatabase<Event> implements ReverbDataStore<Event> {
	private path: string;

	public constructor(path: string) {
		this.path = path;

		try {
			Deno.mkdirSync(path);
		} catch {}
	}

	async getEvents(): Promise<{ data: Event; time: number }[]> {
		const events: { data: Event; time: number }[] = [];

		for await (const file of Deno.readDir(this.path)) {
			const contents = JSON.parse(
				await Deno.readTextFile(`${this.path}/${file.name}`),
			) as {
				data: Event;
				time: number;
			};

			events.push(contents);
		}

		return events;
	}

	public putEvent(data: Event): void {
		(async () => {
			Deno.writeTextFile(
				`${this.path}/${await hash(
					JSON.stringify({
						data,
						time: new Date().getTime(),
					}),
				)}`,
				JSON.stringify({
					data,
					time: new Date().getTime(),
				}),
			);
		})();
	}
}
