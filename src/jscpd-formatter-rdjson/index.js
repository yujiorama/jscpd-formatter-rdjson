// jscpd-formatter-rdjson
//
if (process.argv.length < 2) {
    process.exit(1);
}

const path = require('node:path');
const fs = require('node:fs');

const jscpdReportPath = path.normalize(process.argv[2]);
if (!jscpdReportPath.startsWith(process.cwd())) {
    process.exit(1);
}

const jscpdReport = JSON.parse(
    fs.readFileSync(
        jscpdReportPath,
        {
            "encoding": "utf-8",
            "flag": "r"
        }
    )
);

const toMessage = (item, duplicationPercentage) => {
    const firstFileName = path.relative(process.cwd(), item.firstFile.name);
    const secondFileName = path.relative(process.cwd(), item.secondFile.name);
    return [
        `found ${duplicationPercentage} % duplication in`,
        `${secondFileName}#L${item.secondFile.start}-L${item.secondFile.end}`,
        "from",
        `${firstFileName}#L${item.firstFile.start}-L${item.firstFile.end}`,
    ].join(" ") + ".";
};

const SeverityKind = {
    ERROR: {
        value: 1,
        name: "ERROR"
    },
    WARNING: {
        value: 2,
        name: "WARNING"
    },
    INFO: {
        value: 3,
        name: "INFO"
    },
    DEBUG: {
        value: 4,
        name: "DEBUG"
    },
    TRACE: {
        value: 5,
        name: "TRACE"
    },
};

const toSeverityKind = (percentage) => {
    if (percentage > 95.0) {
        return SeverityKind.ERROR;
    }

    if (percentage > 80.0) {
        return SeverityKind.WARNING;
    }

    return SeverityKind.INFO;
};

const sortByFirstFileName = (a, b) => {
    path.normalize(a.firstFile.name).localeCompare(path.normalize(b.firstFile.name))
};

const duplicates = Array.from(jscpdReport.duplicates);
duplicates.sort(sortByFirstFileName);

const diagnostics = duplicates
    .map(item => {
        const secondFilePath = path.resolve(process.cwd(), item.secondFile.name);
        const keyOfSource = Object.keys(jscpdReport.statistics.formats[item.format].sources)
            .find(s => path.resolve(process.cwd(), s).localeCompare(secondFilePath) === 0);
        if (keyOfSource === undefined) {
            return;
        }
        const source = jscpdReport.statistics.formats[item.format].sources[keyOfSource];
        const duplicationPercentage = Number.parseFloat(source.percentage / source.clones).toFixed(2);
        const severity = toSeverityKind(duplicationPercentage);

        return {
            "severity": severity.name,
            "message": toMessage(item, duplicationPercentage),
            "location": {
                "path": item.secondFile.name,
                "range": {
                    "start": {
                        "line": item.secondFile.startLoc.line,
                        "column": item.secondFile.startLoc.column
                    },
                    "end": {
                        "line": item.secondFile.endLoc.line,
                        "column": item.secondFile.endLoc.column
                    }
                }
            },
            "original_output": item.fragment,
            "suggestions": [
                {
                    "range": {
                        "start": {
                            "line": item.secondFile.startLoc.line,
                            "column": item.secondFile.startLoc.column
                        },
                        "end": {
                            "line": item.secondFile.endLoc.line,
                            "column": item.secondFile.endLoc.column
                        }
                    },
                    "text": ""
                }
            ]
        };
    }).filter(Boolean);

const severities = duplicates
    .map(item => {
        const secondFilePath = path.resolve(process.cwd(), item.secondFile.name);
        const keyOfSource = Object.keys(jscpdReport.statistics.formats[item.format].sources)
            .find(s => path.resolve(process.cwd(), s).localeCompare(secondFilePath) === 0);
        if (keyOfSource === undefined) {
            return;
        }
        const source = jscpdReport.statistics.formats[item.format].sources[keyOfSource];
        return toSeverityKind(source.percentage / source.clones);
    }).filter(Boolean);

severities.sort((a, b) => a.value - b.value);

const severity = Object.values(SeverityKind).find(v => v.value === severities[0].value);

rdjson = {
    "source": {
        "name": "super lint",
        "url": "https://github.com/reviewdog/reviewdog/blob/master/proto/rdf/jsonschema/DiagnosticResult.jsonschema"
    },
    "severity": severity.name,
    "diagnostics": diagnostics
};

process.stdout.write(JSON.stringify(rdjson));
