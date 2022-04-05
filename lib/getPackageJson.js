const cp = require('child_process');
const util = require('util');
const execAsPromise = util.promisify(cp.exec);

module.exports = async function (package, installedVersion) {
    let packageParam = package;
    if (installedVersion) {
        packageParam = `${package}@${installedVersion}`;
    }
    return await execAsPromise(`npm view --json=true ${packageParam} name version versions author license homepage dist.tarball repository.type repository.url deprecated`)
        .then(response => {
            try {
                return JSON.parse(response.stdout);
            } catch (ex) {
                console.log(response.stderr);
                throw ex;
            }
        })
        .then((value) => value);
}