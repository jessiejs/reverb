# Reverb

Reverb is a super-light database that lets you magically repair timelines and fix exploits in the future.

Reverb is so simple that everything can be described in this README (which hopefully is not overly verbose).

but first...

## ⚠ Disclaimer

Reverb is suitable for the following:

-   Small apps that won't ever need to get massive
-   Apps where integrity and transparency is critical
-   Apps where you want to undo things with ease

## Concepts

### The Timeline

Reverb is a "timeline manager".

This means that Reverb has a single, immutable timeline, that has a chronological series of events.

### Events

There are two types of events:

-   State Modifiers
-   Timeline Modifiers

State Modifiers modify the current state of the database, for example "add a user", "private a post".

Timeline Modifiers modify the previous timeline events (including previous timeline modifers)

An example timeline may look like this:

1. Create post (State Modifier)
2. Private post (State Modifier)
3. Undo "Private post" (Timeline Modifier)
4. Undo "Undo "Private post"" (Timeline Modifier)

Reverb auto-magically computes the "pure timeline" by going through the timeline modifiers in reverse -- so the pure timeline would look something like this:

1. Create post (State Modifier)
2. Private post (State Modifier)

Then it iterates through all the state modifiers and computes the final state.

1. Create post.

    ```json
    {
    	"posts": [
    		{
    			"name": "post",
    			"isPrivate": false
    		}
    	]
    }
    ```

1. Private post.

    ```json
    {
    	"posts": [
    		{
    			"name": "post",
    			"isPrivate": true
    		}
    	]
    }
    ```

---

That's it.

Reverb is as simple as that.

## Example

You can access examples in [the examples folder](./example).
