var Sequelize = require('sequelize');
var Umzug = require('umzug');
var fs = require('fs');
var path = require('path');

var models = require("./node_api/config/database");

module.exports = {
    migrationSync: function () {
        return new Promise((resolve, reject) => {
            let migrationList = [];

            // populate list of migration files
            let migrationPath = path.resolve(__dirname, 'migrations');

            fs.readdir(migrationPath, function(err, items) {
                if (err) {
                    reject(err);
                    return;
                }

                for (let item of items.sort()) {
                    if (item.endsWith('.js')) {
                        migrationList.push(item.split('.js')[0]);
                    }
                }

                const umzug = new Umzug({
                    migrations: {
                        params: [ models.sequelize.getQueryInterface(), Sequelize ],
                        path: path.join(__dirname, './migrations'),
                    },
                    storage: "sequelize",
                        storageOptions: {
                        sequelize: models.sequelize
                    },
                    logging: console.log
                });

                umzug.execute({
                    migrations: migrationList,
                    method: "up"
                }).then(function() {
                    console.log('Migrations complete');
                    resolve();
                }).catch(reject);
            });
        });
    }
}