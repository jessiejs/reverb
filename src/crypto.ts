/*
 * Reverb
 *
 * ./src/crypto.ts
 *
 * The teeny tiny hash checker
 */

import { toHashString } from 'https://deno.land/std@0.184.0/crypto/to_hash_string.ts'; // TODO: Audit this for performance

const textEncoder = new TextEncoder(); // Let's put this here so we don't have to initialize it multiple times, to keep things speedy :)

// Returns the string digest of a string (ASYNC)
export async function hash(input: string | Uint8Array): Promise<string> {
	const inputAsUint8 =
		typeof input == 'string' ? textEncoder.encode(input) : input; // This is decently easy to read, it could be easier but Typescript stuff would make it a bit more muddy and hard to comprehend (and would cause slower output)

	return toHashString(await crypto.subtle.digest('SHA-256', inputAsUint8));
}

// Checks if a hash matches what is expected (ASYNC)
export async function checkHash(
	input: string | Uint8Array,
	expected: string,
): Promise<boolean> {
	return (await hash(input)) == expected; // Do we really need this helper function?
}
