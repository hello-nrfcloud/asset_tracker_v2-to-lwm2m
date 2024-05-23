import {
	packLayer,
	type PackedLayer,
} from '@bifravst/aws-cdk-lambda-helpers/layer'
import pJson from '../../package.json'

const dependencies: Array<keyof (typeof pJson)['dependencies']> = [
	'@aws-lambda-powertools/metrics',
	'@hello.nrfcloud.com/lambda-helpers',
	'@middy/core',
]

export const pack = async (): Promise<PackedLayer> =>
	packLayer({
		id: 'baseLayer',
		dependencies,
	})
