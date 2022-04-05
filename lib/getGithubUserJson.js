const got = require('got')
const config = require('./config.js')
const debug = require('debug')('license-report:getGithubUserJson')

module.exports = getGithubUserJson

async function getGithubUserJson(user) {
	const uri = `${config.githubUsersApi}${user}`;

	debug('getGithubUserJson - REQUEST %s', uri)

	const options = {
		retry: config.httpRetryOptions.maxAttempts,
        headers:  {
            'Accept': 'application/vnd.github.v3+json',
			'Authorization' : `Bearer ${config.githubApiToken}`
        },  
		hooks: {
			beforeRetry: [
				(options, error, retryCount) => {
					debug(`http request to git user for ${user} failed, retrying again soon...`)
				}
			],
			beforeError: [
				error => {
					console.log(`git user for ${user}`)
					return error
				}
			]
		}
	}

	const apiToken = process.env[config.githubApiTokenEnvVar] || ''
	if (apiToken.trim().length > 0) {
		options['headers'] = { 'Authorization': `Bearer ${apiToken}` }
	}

	return await got(uri, options).json()
}