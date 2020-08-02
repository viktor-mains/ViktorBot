import test from 'tape';
import { toDDHHMMSS } from './helpers';

test('toDDHHMMSS returns unknown duration if null', t => {
	t.equal(toDDHHMMSS(null), null);
	t.end();
});

test('toDDHHMMSS formats correctly', t => {
	const now = new Date(2021, 1, 10, 23, 30, 50);
	const pairs = [
		[new Date(2020, 0, 2), '1y 1mo 9d 23h 30m 50s '],
		[new Date(2021, 1, 9), '1d 23h 30m 50s '],
	] as const;

	for (const [date, expected] of pairs) {
		t.equal(toDDHHMMSS(date, now), expected);
	}

	t.end();
});
