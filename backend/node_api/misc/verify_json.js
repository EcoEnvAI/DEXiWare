const fs = require('fs');
xml2js = require('xml2js');

console.log("reading DXI file...")

let parser = new xml2js.Parser();
fs.readFile(__dirname + '/../business_logic/models/production/AgriFoodChainFull.dxi', function(err, data) {
    parser.parseString(data, function (err, dexi) {
        console.log("reading JSON file...")
        let rawdata = fs.readFileSync('indicators.json');
        let data = JSON.parse(rawdata);
        
        for (pillarName in data) {
            let pillarIndicators = data[pillarName]["INDICATORS"];
            for (iter in pillarIndicators){
                let indicator = pillarIndicators[iter];
                let nodeName = indicator['NODE'];
                let themeName = indicator['THEME'];
                let subthemeName = indicator['SUB-THEME'];
                let subsubthemeName = indicator['SUB-SUB-THEME'];
                let subsubsubthemeName = indicator['SUB-SUB-SUB-THEME'];
                let indicatorName = indicator["INDICATOR_NAME"];

                let dexiRatings = getDexiThresholdsSerialized(dexi, pillarName, nodeName, themeName, subthemeName, subsubthemeName, subsubsubthemeName, indicatorName);
                let jsonRatings = indicator["RATINGS"].map(r => r["NAME"].toUpperCase()).join(";");

                if (dexiRatings) {
                    if (dexiRatings != jsonRatings) {
                        if (dexiRatings.includes("HIGH")) {
                            console.log("Ratings mismatch: " + pillarName + "/" + nodeName + "/" + indicatorName + ": " + dexiRatings + " vs " + jsonRatings);
                        } else {
                            let badToGoodJson = indicator["RATINGS"][0]["VALUE"] == "red";
                            let badToGoodDexi = getDexiThresholdsBadToGood(dexi, pillarName, nodeName, themeName, subthemeName, subsubthemeName, subsubsubthemeName, indicatorName);
                            if (badToGoodJson != badToGoodDexi) {
                                console.log("Ratings mismatch (bad/good): " + pillarName + "/" + nodeName + "/" + indicatorName + ": " + dexiRatings + " vs " + jsonRatings);
                            }
                        }
                    }
                }
            }
        }
    });
});

getDexiIndicator = function (dexi, pillarName, nodeName, themeName, subthemeName, subsubthemeName, subsubsubthemeName, indicatorName) {
    let root = dexi.DEXi.ATTRIBUTE.find(a => a["NAME"]=='AgriFoodChain');
    let pillar = root.ATTRIBUTE.find(a => a["NAME"][0].toUpperCase().startsWith(pillarName.toUpperCase()));
    let node = pillar.ATTRIBUTE.find(a => a["NAME"][0].toUpperCase().startsWith(nodeName.toUpperCase() + "_" + pillarName.toUpperCase()));

    var attribute;

    if (themeName) {
        //let theme = node.ATTRIBUTE.find(a => a["NAME"][0].toUpperCase() == themeName.toUpperCase());
        let theme = node.ATTRIBUTE.find(a => a["NAME"][0] == themeName);
        if (theme) {
            attribute = theme;
        } else {
            console.log("Theme not found: " + pillarName + "/" + nodeName + "/" + themeName + "/" + subthemeName + "/" + indicatorName);
            return false;
        }
    } else {
        attribute = node;
    }

    if (subthemeName) {
        //let subTheme = attribute.ATTRIBUTE.find(a => a["NAME"][0].toUpperCase() == subthemeName.toUpperCase())
        let subTheme = attribute.ATTRIBUTE.find(a => a["NAME"][0] == subthemeName)
        attribute = subTheme;
    }

    if (subsubthemeName) {
        //let subsubTheme = attribute.ATTRIBUTE.find(a => a["NAME"][0].toUpperCase() == subsubthemeName.toUpperCase())
        let subsubTheme = attribute.ATTRIBUTE.find(a => a["NAME"][0] == subsubthemeName)
        attribute = subsubTheme;
    }

    if (subsubsubthemeName) {
        //let subsubsubTheme = attribute.ATTRIBUTE.find(a => a["NAME"][0].toUpperCase() == subsubsubthemeName.toUpperCase())
        let subsubsubTheme = attribute.ATTRIBUTE.find(a => a["NAME"][0] == subsubsubthemeName)
        attribute = subsubsubTheme;
    }

    if (attribute) {
        let indicators = attribute.ATTRIBUTE.filter(a => a["NAME"][0] == indicatorName || a["NAME"][0].startsWith(indicatorName + "###"));

        var indicator;
        if (indicators.length == 1) {
            indicator = indicators[0];
        } else {
            console.log(indicators);
        }

        if (indicatorName == 'Safety of Workplace, Operations and Facilities') {
            console.log("Found: " + pillarName + "/" + nodeName + "/" + themeName + "/" + subthemeName + "/" + indicatorName);
        }
        if (indicator)
            return indicator;
        else {
            console.log("Indicator not found: " + pillarName + "/" + nodeName + "/" + themeName + "/" + subthemeName + "/" + indicatorName);
            return false;
        }
    } else {
        console.log("Subtheme not found: " + pillarName + "/" + nodeName + "/" + themeName + "/" + subthemeName + "/" + indicatorName);
        return false;
    }
}

getDexiThresholdsBadToGood = function (dexi, pillarName, nodeName, themeName, subthemeName, subsubthemeName, subsubsubthemeName, indicatorName) {
    let indicator = getDexiIndicator(dexi, pillarName, nodeName, themeName, subthemeName, subsubthemeName, subsubsubthemeName, indicatorName);
    return indicator["SCALE"][0]["SCALEVALUE"][0]["GROUP"] == "BAD";
}

getDexiThresholdsSerialized = function (dexi, pillarName, nodeName, themeName, subthemeName, subsubthemeName, subsubsubthemeName, indicatorName) {
    let indicator = getDexiIndicator(dexi, pillarName, nodeName, themeName, subthemeName, subsubthemeName, subsubsubthemeName, indicatorName);
    return indicator["SCALE"][0]["SCALEVALUE"].map(v => v["NAME"][0].toUpperCase()).join(";");
}