import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import AIR_PRESS from './examples/nrfcloud/deviceToCloud/AIR_PRESS.json'
import AIR_QUAL from './examples/nrfcloud/deviceToCloud/AIR_QUAL.json'
import BUTTON from './examples/nrfcloud/deviceToCloud/BUTTON.json'
import DEVICE from './examples/nrfcloud/deviceToCloud/DEVICE-deviceInfo.json'
import GNSS from './examples/nrfcloud/deviceToCloud/GNSS.json'
import HUMID from './examples/nrfcloud/deviceToCloud/HUMID.json'
import RSRP from './examples/nrfcloud/deviceToCloud/RSRP.json'
import TEMP from './examples/nrfcloud/deviceToCloud/TEMP.json'
import battery from './examples/BATTERY.json'
import deviceWithEnergyEstimate from './examples/DEVICE-networkInfo-with-eest.json'
import solar from './examples/SOLAR.json'
import {
	LwM2MObjectID,
	type BatteryAndPower_14202,
	type ButtonPress_14220,
	type ConnectionInformation_14203,
	type DeviceInformation_14204,
	type Environment_14205,
	type Geolocation_14201,
	type LwM2MObjectInstance,
} from '@hello.nrfcloud.com/proto-map/lwm2m'
import { converter } from './converter.js'

void describe('convert()', () => {
	void describe('should convert devices messages to LwM2M objects', () => {
		for (const [message, expected] of [
			[
				solar,
				<BatteryAndPower_14202>{
					ObjectID: LwM2MObjectID.BatteryAndPower_14202,
					ObjectVersion: '1.0',
					Resources: {
						1: 3.123456,
						99: new Date(solar.ts),
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
						99: new Date(battery.ts),
					},
				},
			],
			[
				deviceWithEnergyEstimate,
				<ConnectionInformation_14203>{
					ObjectID: LwM2MObjectID.ConnectionInformation_14203,
					ObjectVersion: '1.0',
					Resources: {
						1: 20,
						0: 'LTE-M',
						2: -99,
						3: 30401,
						5: 24201,
						4: 21679616,
						6: '100.74.127.55',
						11: 7,
						99: new Date(deviceWithEnergyEstimate.ts),
					},
				},
			],
			[
				RSRP,
				<ConnectionInformation_14203>{
					ObjectID: LwM2MObjectID.ConnectionInformation_14203,
					ObjectVersion: '1.0',
					Resources: {
						2: -96,
						99: new Date(RSRP.ts),
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
						99: new Date(AIR_PRESS.ts),
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
						99: new Date(AIR_QUAL.ts),
					},
				},
			],
			[
				DEVICE,
				<DeviceInformation_14204>{
					ObjectID: LwM2MObjectID.DeviceInformation_14204,
					ObjectVersion: '1.0',
					Resources: {
						0: '350457794611739',
						1: '8931080620054223678',
						2: 'mfw_nrf9160_1.3.3',
						4: 'thingy91_nrf9160',
						3: '0.0.0-development',
						99: new Date(DEVICE.ts),
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
						99: new Date(TEMP.ts),
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
						99: new Date(HUMID.ts),
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
						99: new Date(BUTTON.ts),
					},
				},
			],
			[
				GNSS,
				<Geolocation_14201>{
					ObjectID: LwM2MObjectID.Geolocation_14201,
					// ObjectInstanceID: 0, // 0: device, 1: ground-fix, 2: single-cell
					ObjectVersion: '1.0',
					Resources: {
						0: 10.437692463102255,
						1: 63.43308707524497,
						3: 4.703136444091797,
						2: 138.33331298828125,
						4: 0.02938256226480007,
						5: 185.11207580566406,
						6: 'GNSS',
						99: new Date(GNSS.ts),
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
