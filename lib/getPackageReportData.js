const isValidUrl = require('./isValidUrl.js');
const getPackageJson = require('./getPackageJson.js')
const getGithubUserJson = require('./getGithubUserJson.js');

module.exports = getPackageReportData

/*
	collect the data for a single package
*/
async function getPackageReportData(packageEntry, installedVersions) {
	const definedVersion = packageEntry.version
	const fullPackageName = packageEntry.fullName

	let installedVersion = ''
	let installedVersionsEntry = installedVersions[fullPackageName]
	if (installedVersionsEntry !== undefined) {
		installedVersion = installedVersionsEntry
	} else {
		installedVersion = definedVersion
		if (installedVersion.match(/^[\^~].*/)) {
			installedVersion = installedVersion.substring(1);
		}
	}

	let packageVersion = null;
	if (isValidUrl(installedVersion)) {
		const versionRegex = new RegExp(`-(?<version>[0-9]+\.[0-9]+\.[0-9]+(.[0-9]+)*).tgz`)
		var versionRegexResult = versionRegex.exec(installedVersion);
		if (versionRegexResult
			&& versionRegexResult.groups
			&& versionRegexResult.groups["version"]) {
			packageVersion = versionRegexResult.groups["version"];
		}
	} else {
		packageVersion = installedVersion;
	}

	const packageDetails = await getPackageJson(fullPackageName, packageVersion)

	let author = null;
	const regex = new RegExp(/(github\.com\/)(?<owner>[\w\-]+)(\/)(?<repo>[\w\-]+)(\.git)/)
	const repoLink = packageDetails["repository.url"];
	var result = regex.exec(repoLink);
	var owner = (result && result.groups) ? result.groups["owner"] : null;
	if (owner) {
		author = owner;
		var userDetails = await getGithubUserJson(owner);
		if (userDetails) {
			author = userDetails.name;
		}
	}
	if (!author) {
		author = packageDetails.author ?? "";
	}

	return {
		name: packageDetails.name,
		author,
		installedVersion: packageVersion,
		link: packageDetails.homepage,
		licenseType: packageDetails.license,
	}
}