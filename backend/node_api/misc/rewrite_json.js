const fs = require('fs');

let rawdata = fs.readFileSync('indicators2.json');
let data = JSON.parse(rawdata);

for (let pillarName of Object.keys(data)) {
    let pillar = data[pillarName];
    for (let indicator of pillar["INDICATORS"]) {
        let ratings = indicator["RATINGS"];
        let descriptions = indicator["RATINGS_DESCRIPTIONS"];
        if (ratings.length == 2) {
            newRatings = [{ "NAME": ratings[0], "VALUE": "red", "DESCRIPTION": descriptions[0]}, { "NAME": ratings[1], "VALUE": "green", "DESCRIPTION": descriptions[1]}];
            indicator["RATINGS"] = newRatings;
        } else if (ratings.length == 3) {
            newRatings = [{ "NAME": ratings[0], "VALUE": "red", "DESCRIPTION": descriptions[0]}, { "NAME": ratings[1], "VALUE": "orange", "DESCRIPTION": descriptions[1]}, { "NAME": ratings[2], "VALUE": "green", "DESCRIPTION": descriptions[2]}];
            indicator["RATINGS"] = newRatings;
        } else if (ratings.length == 4) {
            newRatings = [{ "NAME": ratings[0], "VALUE": "red", "DESCRIPTION": descriptions[0]}, { "NAME": ratings[1], "VALUE": "orange", "DESCRIPTION": descriptions[1]}, { "NAME": ratings[2], "VALUE": "orange", "DESCRIPTION": descriptions[2]}, { "NAME": ratings[3], "VALUE": "green", "DESCRIPTION": descriptions[3]}];
            indicator["RATINGS"] = newRatings;
        } else {
            console.log("ERROR: length is " + ratings.length);
        }
        delete indicator["RATINGS_DESCRIPTIONS"];
    }

}

fs.writeFileSync('indicators.json', JSON.stringify(data, null, 4));