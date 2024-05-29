import { LambdaSource } from '@bifravst/aws-cdk-lambda-helpers/cdk'
import type { PackedLayer } from '@bifravst/aws-cdk-lambda-helpers/layer'
import type { App } from 'aws-cdk-lib'
import {
	Fn,
	aws_lambda as Lambda,
	Stack,
	aws_dynamodb,
	type Environment,
} from 'aws-cdk-lib'
import type { BackendLambdas } from './packBackendLambdas.js'
import { ConvertDeviceMessages } from './resources/ConvertDeviceMessages.js'
import { STACK_NAME } from './stackConfig.js'
import { ContinuousDeployment } from './resources/ContinuousDeployment.js'

export class BackendStack extends Stack {
	public constructor(
		parent: App,
		{
			lambdaSources,
			layer,
			repository,
			gitHubOICDProviderArn,
			env,
		}: {
			lambdaSources: BackendLambdas
			layer: PackedLayer
			gitHubOICDProviderArn: string
			repository: {
				owner: string
				repo: string
			}
			env: Required<Environment>
		},
	) {
		super(parent, STACK_NAME, {
			env,
		})

		const baseLayer = new Lambda.LayerVersion(this, 'baseLayer', {
			layerVersionName: `${Stack.of(this).stackName}-baseLayer`,
			code: new LambdaSource(this, {
				id: 'baseLayer',
				zipFile: layer.layerZipFile,
				hash: layer.hash,
			}).code,
			compatibleArchitectures: [Lambda.Architecture.ARM_64],
			compatibleRuntimes: [Lambda.Runtime.NODEJS_20_X],
		})

		const lambdaLayers: Lambda.ILayerVersion[] = [baseLayer]

		new ConvertDeviceMessages(this, {
			layers: lambdaLayers,
			lambdaSources,
			devicesTable: aws_dynamodb.Table.fromTableName(
				this,
				'devicesTable',
				Fn.importValue('hello-nrfcloud-backend:devicesTableName'),
			),
		})

		new ContinuousDeployment(this, {
			gitHubOICDProviderArn,
			repository,
		})
	}
}

export type StackOutputs = {
	webSocketURI: string
	devicesTableName: string
	lastSeenTableName: string
	devicesTableFingerprintIndexName: string
	historicalDataTableInfo: string
	bridgePolicyName: string
	bridgeCertificatePEM: string
	cdRoleArn: string
	APIURL: string
}
