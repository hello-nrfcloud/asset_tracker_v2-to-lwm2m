import {
	IoTActionRole,
	PackedLambdaFn,
} from '@bifravst/aws-cdk-lambda-helpers/cdk'
import type { aws_lambda as Lambda } from 'aws-cdk-lib'
import { aws_iam as IAM, aws_iot as IoT, Stack } from 'aws-cdk-lib'
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
		}: {
			lambdaSources: Pick<BackendLambdas, 'onDeviceMessage'>
			layers: Lambda.ILayerVersion[]
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
					AND isUndefined(appId) = False
					AND isUndefined(data) = False
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
						roleArn: new IoTActionRole(this).roleArn,
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
