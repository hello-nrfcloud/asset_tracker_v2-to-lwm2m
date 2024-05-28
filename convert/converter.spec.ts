import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import AIR_PRESS from './examples/nrfcloud/deviceToCloud/AIR_PRESS.json'
import AIR_QUAL from './examples/nrfcloud/deviceToCloud/AIR_QUAL.json'
import BUTTON from './examples/nrfcloud/deviceToCloud/BUTTON.json'
import HUMID from './examples/nrfcloud/deviceToCloud/HUMID.json'
import TEMP from './examples/nrfcloud/deviceToCloud/TEMP.json'
import battery from './examples/BATTERY.json'
import solar from './examples/SOLAR.json'
import {
	LwM2MObjectID,
	type BatteryAndPower_14202,
	type ButtonPress_14220,
	type Environment_14205,
	type LwM2MObjectInstance,
	type SolarCharge_14210,
} from '@hello.nrfcloud.com/proto-map/lwm2m'
import { converter } from './converter.js'

void describe('convert()', () => {
	void describe('should convert devices messages to LwM2M objects', () => {
		for (const [message, expected] of [
			[
				solar,
				<SolarCharge_14210>{
					ObjectID: LwM2MObjectID.SolarCharge_14210,
					ObjectVersion: '1.0',
					Resources: {
						0: 3.123456,
						99: solar.ts,
					},
				},
			],
			[
				battery,
				<BatteryAndPower_14202>{
					ObjectID: LwM2MObjectID.BatteryAndPower_14202,
					ObjectVersion: '1.0',
					Resources: {
						0: 94,
						99: battery.ts,
					},
				},
			],
			[
				AIR_PRESS,
				<Environment_14205>{
					ObjectID: LwM2MObjectID.Environment_14205,
					ObjectVersion: '1.0',
					Resources: {
						2: 1023.1,
						99: AIR_PRESS.ts,
					},
				},
			],
			[
				AIR_QUAL,
				<Environment_14205>{
					ObjectID: LwM2MObjectID.Environment_14205,
					ObjectVersion: '1.0',
					Resources: {
						10: 177,
						99: AIR_QUAL.ts,
					},
				},
			],
			[
				TEMP,
				<Environment_14205>{
					ObjectID: LwM2MObjectID.Environment_14205,
					ObjectVersion: '1.0',
					Resources: {
						0: 25.73,
						99: TEMP.ts,
					},
				},
			],
			[
				HUMID,
				<Environment_14205>{
					ObjectID: LwM2MObjectID.Environment_14205,
					ObjectVersion: '1.0',
					Resources: {
						1: 23.16,
						99: HUMID.ts,
					},
				},
			],
			[
				BUTTON,
				<ButtonPress_14220>{
					ObjectID: LwM2MObjectID.ButtonPress_14220,
					ObjectVersion: '1.0',
					Resources: {
						0: 1,
						99: BUTTON.ts,
					},
				},
			],
		] as [message: Record<string, any>, expected: LwM2MObjectInstance][]) {
			void it(`should convert ${JSON.stringify(message)} to ${JSON.stringify(
				expected,
			)} and validate it`, () => {
				const converted = converter(message)
				assert.deepEqual(converted, expected)
			})
		}
	})
	// TODO: Shadow
	// TODO: Config
})
