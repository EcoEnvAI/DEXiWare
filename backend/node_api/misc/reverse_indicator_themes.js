var db = require('../config/database');

console.log("Starting");

getLeaf = function (flat, id) {
    let next = flat[id];
    if (next == null) {
        return id;
    } else {
        return getLeaf(flat, next);
    }
}

getParent = function (flat, id) {
    return Object.keys(flat).find(f => flat[f] == id);
}

db.themes.findAll().then(themes => {
    let themesFlat = {};
    for (let theme of themes) {
        if (theme.themeId) {
            themesFlat[theme.id] = theme.themeId;
        } else {
            themesFlat[theme.id] = null;
        }
    }

    console.log("Loaded theme table.");

    let promises = [];

    for (let theme of Object.keys(themesFlat)) {
        let parentId = getParent(themesFlat, theme);

        if (parentId == undefined) {
            parentId = 'null';
        }
        promises.push(db.sequelize.query('UPDATE "Themes" set "themeId"=' + parentId + ' where id=' + theme));
    }

    return Promise.all(promises).then(() => {
        return db.indicators.findAll().then((indicators) => {
            let promises = [];
            for (let indicator of indicators) {
                let newThemeId = getLeaf(themesFlat, indicator.themeId)
                indicator.themeId = newThemeId;
                promises.push(indicator.save());
            }
        
            return Promise.all(promises);
        }).then(() => {
            console.log("Done...");
        });
    });
});

