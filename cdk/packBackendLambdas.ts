import {
	packLambdaFromPath,
	type PackedLambda,
} from '@bifravst/aws-cdk-lambda-helpers'

export type BackendLambdas = {
	onDeviceMessage: PackedLambda
}

const pack = async (id: string) => packLambdaFromPath(id, `lambda/${id}.ts`)

export const packBackendLambdas = async (): Promise<BackendLambdas> => ({
	onDeviceMessage: await pack('onDeviceMessage'),
})
