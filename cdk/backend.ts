import { IAMClient } from '@aws-sdk/client-iam'
import { STS } from '@aws-sdk/client-sts'
import { ensureGitHubOIDCProvider } from '@bifravst/ci'
import { env } from '../aws/env.js'
import pJSON from '../package.json'
import { BackendApp } from './BackendApp.js'
import { pack as packBaseLayer } from './layers/baseLayer.js'
import { packBackendLambdas } from './packBackendLambdas.js'

const repoUrl = new URL(pJSON.repository.url)
const repository = {
	owner: repoUrl.pathname.split('/')[1] ?? 'hello-nrfcloud',
	repo: repoUrl.pathname.split('/')[2]?.replace(/\.git$/, '') ?? 'backend',
}

const sts = new STS({})
const iam = new IAMClient({})

const accountEnv = await env({ sts })

new BackendApp({
	lambdaSources: await packBackendLambdas(),
	layer: await packBaseLayer(),
	repository,
	gitHubOICDProviderArn: await ensureGitHubOIDCProvider({
		iam,
	}),
	env: accountEnv,
	isTest: process.env.IS_TEST === '1',
	version: (() => {
		const v = process.env.VERSION
		const defaultVersion = '0.0.0-development'
		if (v === undefined)
			console.warn(`VERSION is not defined, using ${defaultVersion}!`)
		return v ?? defaultVersion
	})(),
})
