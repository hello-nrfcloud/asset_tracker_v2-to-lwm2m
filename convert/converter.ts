import {
	LwM2MObjectID,
	type LwM2MObjectInstance,
} from '@hello.nrfcloud.com/proto-map/lwm2m'

const toInstance = (
	ObjectID: LwM2MObjectID,
	Resources: LwM2MObjectInstance['Resources'],
	ObjectInstanceID?: number,
): LwM2MObjectInstance => {
	const i: LwM2MObjectInstance = {
		ObjectID,
		ObjectVersion: '1.0',
		Resources,
	}
	if (ObjectInstanceID !== undefined) i.ObjectInstanceID = ObjectInstanceID
	return i
}

const isAppId = (expectedAppId: string) => (appId: string) =>
	appId === expectedAppId

const converters: Array<
	[
		testFn: (appId: string, data: string | Record<string, any>) => boolean,
		convertFn: (
			data: string | Record<string, any>,
			ts: number,
		) => LwM2MObjectInstance | null,
	]
> = [
	// gain
	[
		isAppId('SOLAR'),
		(data, ts) =>
			toInstance(LwM2MObjectID.SolarCharge_14210, {
				0: parseFloat(data as string),
				99: ts,
			}),
	],
	// battery
	[
		isAppId('BATTERY'),
		(data, ts) =>
			toInstance(LwM2MObjectID.BatteryAndPower_14202, {
				0: parseInt(data as string, 10),
				99: ts,
			}),
	],
	[
		isAppId('HUMID'),
		(data, ts) =>
			toInstance(LwM2MObjectID.Environment_14205, {
				1: parseFloat(data as string),
				99: ts,
			}),
	],
	[
		isAppId('TEMP'),
		(data, ts) =>
			toInstance(LwM2MObjectID.Environment_14205, {
				0: parseFloat(data as string),
				99: ts,
			}),
	],
	[
		isAppId('AIR_QUAL'),
		(data, ts) =>
			toInstance(LwM2MObjectID.Environment_14205, {
				10: parseFloat(data as string),
				99: ts,
			}),
	],
	[
		isAppId('AIR_PRESS'),
		(data, ts) =>
			toInstance(LwM2MObjectID.Environment_14205, {
				2: parseFloat(data as string) * 10,
				99: ts,
			}),
	],
	[
		isAppId('BUTTON'),
		(data, ts) =>
			toInstance(LwM2MObjectID.ButtonPress_14220, {
				0: parseInt(data as string, 10),
				99: ts,
			}),
	],
]

export const converter = (
	message: Record<string, any>,
): LwM2MObjectInstance | null => {
	const { appId, data, ts } = message
	if (appId === undefined) return null
	if (data === undefined) return null
	for (const [testFn, convertFn] of converters) {
		if (!testFn(appId, data)) continue
		const result = convertFn(data, ts)
		if (result !== null) return result
	}
	return null
}
