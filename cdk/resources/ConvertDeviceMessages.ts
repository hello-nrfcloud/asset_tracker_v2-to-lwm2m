import {
	IoTActionRole,
	PackedLambdaFn,
} from '@bifravst/aws-cdk-lambda-helpers/cdk'
import type { aws_lambda as Lambda } from 'aws-cdk-lib'
import { aws_iam as IAM, aws_iot as IoT, Stack } from 'aws-cdk-lib'
import type { ITable } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import type { BackendLambdas } from '../packBackendLambdas.js'

/**
 * Resources needed to convert messages sent by nRF Cloud to the format that hello.nrfcloud.com expects
 */
export class ConvertDeviceMessages extends Construct {
	public constructor(
		parent: Construct,
		{
			lambdaSources,
			layers,
			devicesTable,
		}: {
			lambdaSources: Pick<BackendLambdas, 'onDeviceMessage'>
			layers: Lambda.ILayerVersion[]
			devicesTable: ITable
		},
	) {
		super(parent, 'converter')

		const onDeviceMessage = new PackedLambdaFn(
			this,
			'onDeviceMessage',
			lambdaSources.onDeviceMessage,
			{
				description: `Convert device messages and republish as SenML`,
				layers,
				initialPolicy: [
					new IAM.PolicyStatement({
						actions: ['iot:Publish'],
						resources: [
							`arn:aws:iot:${Stack.of(parent).region}:${
								Stack.of(parent).account
							}:topic/data/m/d/*`,
						],
					}),
				],
			},
		)

		const topicRuleRole = new IoTActionRole(this).role
		devicesTable.grantReadData(topicRuleRole)

		const rule = new IoT.CfnTopicRule(this, 'topicRule', {
			topicRulePayload: {
				description: `Convert device messages and republish as SenML`,
				ruleDisabled: false,
				awsIotSqlVersion: '2016-03-23',
				sql: `
					SELECT
					    * as message,
						topic(4) as deviceId,
						timestamp() as timestamp,
						topic() as topic
					FROM 'data/+/+/+/+'
					WHERE messageType = 'DATA'
					AND isUndefined(data) = False
					AND (${['SOLAR', 'BATTERY', 'HUMID', 'TEMP', 'AIR_QUAL', 'AIR_PRESS', 'BUTTON']
						.map((appId) => `appId = '${appId}'`)
						.join(' OR ')})
					AND get_dynamodb("${devicesTable.tableName}", "deviceId", topic(4), "${topicRuleRole.roleArn}").model IN ["PCA20035+solar", "PCA20065+asset_tracker_v2"]
				`,
				actions: [
					{
						lambda: {
							functionArn: onDeviceMessage.fn.functionArn,
						},
					},
				],
				errorAction: {
					republish: {
						roleArn: topicRuleRole.roleArn,
						topic: 'errors',
					},
				},
			},
		})

		onDeviceMessage.fn.addPermission('topicRule', {
			principal: new IAM.ServicePrincipal('iot.amazonaws.com'),
			sourceArn: rule.attrArn,
		})
	}
}
