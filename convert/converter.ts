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
				99: new Date(ts),
			}),
	],
	// battery
	[
		isAppId('BATTERY'),
		(data, ts) =>
			toInstance(LwM2MObjectID.BatteryAndPower_14202, {
				0: parseInt(data as string, 10),
				99: new Date(ts),
			}),
	],
	[
		(appId, data) =>
			appId === 'DEVICE' && typeof data === 'object' && 'networkInfo' in data,
		(data, ts) => {
			const {
				currentBand,
				networkMode,
				rsrp,
				areaCode,
				mccmnc,
				cellID,
				ipAddress,
				eest,
			} = (data as Record<string, any>).networkInfo
			return toInstance(LwM2MObjectID.ConnectionInformation_14203, {
				1: currentBand,
				0: networkMode,
				2: rsrp,
				3: areaCode,
				5: mccmnc,
				4: cellID,
				6: ipAddress,
				11: eest,
				99: new Date(ts),
			})
		},
	],

	[
		(appId, data) =>
			appId === 'DEVICE' && typeof data === 'object' && 'deviceInfo' in data,
		(data, ts) => {
			const { imei, iccid, modemFirmware, board, appVersion } = (
				data as Record<string, any>
			).deviceInfo
			return toInstance(LwM2MObjectID.DeviceInformation_14204, {
				0: imei,
				1: iccid,
				2: modemFirmware,
				4: board,
				3: appVersion,
				99: new Date(ts),
			})
		},
	],
	[
		isAppId('RSRP'),
		(data, ts) =>
			toInstance(LwM2MObjectID.ConnectionInformation_14203, {
				2: parseFloat(data as string),
				99: new Date(ts),
			}),
	],
	[
		isAppId('HUMID'),
		(data, ts) =>
			toInstance(LwM2MObjectID.Environment_14205, {
				1: parseFloat(data as string),
				99: new Date(ts),
			}),
	],
	[
		isAppId('TEMP'),
		(data, ts) =>
			toInstance(LwM2MObjectID.Environment_14205, {
				0: parseFloat(data as string),
				99: new Date(ts),
			}),
	],
	[
		isAppId('AIR_QUAL'),
		(data, ts) =>
			toInstance(LwM2MObjectID.Environment_14205, {
				10: parseFloat(data as string),
				99: new Date(ts),
			}),
	],
	[
		isAppId('AIR_PRESS'),
		(data, ts) =>
			toInstance(LwM2MObjectID.Environment_14205, {
				2: parseFloat(data as string) * 10,
				99: new Date(ts),
			}),
	],
	[
		isAppId('BUTTON'),
		(data, ts) =>
			toInstance(LwM2MObjectID.ButtonPress_14220, {
				0: parseInt(data as string, 10),
				99: new Date(ts),
			}),
	],
	[
		(appId, data) =>
			appId === 'GNSS' &&
			typeof data === 'object' &&
			'lat' in data &&
			'lng' in data &&
			'acc' in data,
		(data, ts) => {
			const { lat, lng, acc, alt, spd, hdg } = data as Record<string, any>
			return toInstance(LwM2MObjectID.Geolocation_14201, {
				1: lat,
				0: lng,
				3: acc,
				2: alt,
				4: spd,
				5: hdg,
				6: 'GNSS',
				99: new Date(ts),
			})
		},
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
