import { MetricUnit } from '@aws-lambda-powertools/metrics'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import middy from '@middy/core'
import { metricsForComponent } from '@hello.nrfcloud.com/lambda-helpers/metrics'
import { logger } from '@hello.nrfcloud.com/lambda-helpers/logger'
import { converter } from '../convert/converter.js'
import {
	IoTDataPlaneClient,
	PublishCommand,
} from '@aws-sdk/client-iot-data-plane'
import { lwm2mToSenML } from '@hello.nrfcloud.com/proto-map/senml'

const iotData = new IoTDataPlaneClient()

const log = logger('deviceMessage')

const { track, metrics } = metricsForComponent('onDeviceMessage')

const h = async (event: {
	message: Record<string, any>
	deviceId: string
	timestamp: number
}): Promise<void> => {
	log.debug('event', { event })

	const { message, deviceId } = event

	const converted = converter(message)
	if (converted === null) {
		log.error(`Failed to convert message`, JSON.stringify(message))
		track('deviceMessage:error', MetricUnit.Count, 1)
		return
	}
	log.debug('converted', { converted })
	track('deviceMessage:success', MetricUnit.Count, 1)

	const maybeSenML = lwm2mToSenML(converted)
	if ('errors' in maybeSenML) {
		log.error('Failed to convert to SenML', { errors: maybeSenML.errors })
		track('deviceMessage:error', MetricUnit.Count, 1)
		return
	}

	// Republish as SenML
	const topic = `data/m/d/${deviceId}/d2c/senml`
	log.debug('topic', topic)
	await iotData.send(
		new PublishCommand({
			topic,
			payload: JSON.stringify(maybeSenML.senML),
		}),
	)
}

export const handler = middy(h).use(logMetrics(metrics))
