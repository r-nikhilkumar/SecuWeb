const utils = require('./utils');

async function runSecurityCheck(url, progressMap, ws) {
    try {
        // SSL Check
        const sslResult = await utils.checkSSL(url);
        progressMap.sslCheck = true;
        ws.send(JSON.stringify({ final: false, progressMap, step: 'SSL Check', completed: progressMap.sslCheck, result: sslResult }));

        // XSS Check
        const xssResult = await utils.testXSS(url);
        progressMap.xssCheck = true;
        ws.send(JSON.stringify({ final: false, progressMap, step: 'XSS Check', completed: progressMap.xssCheck, result: xssResult }));

        // Security Headers Check
        const headersResult = await utils.checkSecurityHeaders(url);
        progressMap.securityHeadersCheck = true;
        ws.send(JSON.stringify({ final: false, progressMap, step: 'Security Headers Check', completed: progressMap.securityHeadersCheck, result: headersResult }));

        // CSP Check
        const cspResult = await utils.checkCSP(url);
        progressMap.cspCheck = true;
        ws.send(JSON.stringify({ final: false, progressMap, step: 'CSP Check', completed: progressMap.cspCheck, result: cspResult }));

        // Port Scan
        const portScanResult = await utils.scanPorts(url);
        progressMap.portScanCheck = true;
        ws.send(JSON.stringify({ final: false, progressMap, step: 'Port Scan', completed: progressMap.portScanCheck, result: portScanResult }));

        // SQL Injection Check
        const sqlInjectionResult = await utils.testSQLInjection(url);
        progressMap.sqlInjectionCheck = true;
        ws.send(JSON.stringify({ final: false, progressMap, step: 'SQL Injection Check', completed: progressMap.sqlInjectionCheck, result: sqlInjectionResult }));

        // DNS Records Check
        const dnsResult = await utils.checkDNSRecords(url);
        progressMap.dnsCheck = true;
        ws.send(JSON.stringify({ final: false, progressMap, step: 'DNS Records Check', completed: progressMap.dnsCheck, result: dnsResult }));

        // Subdomain Enumeration
        const subdomainsResult = await utils.subdomainEnumeration(url);
        progressMap.subdomainCheck = true;
        ws.send(JSON.stringify({ final: false, progressMap, step: 'Subdomain Enumeration', completed: progressMap.subdomainCheck, result: subdomainsResult }));

        // Directory Scanning
        const directoryResult = await utils.directoryScanning(url);
        progressMap.directoryScanCheck = true;
        ws.send(JSON.stringify({ final: false, progressMap, step: 'Directory Scanning', completed: progressMap.directoryScanCheck, result: directoryResult }));

        // Cookie Security Check
        const cookieResult = await utils.checkCookieSecurity(url);
        progressMap.cookieCheck = true;
        ws.send(JSON.stringify({ final: false, progressMap, step: 'Cookie Security Check', completed: progressMap.cookieCheck, result: cookieResult }));

        // Gather results and generate security score
        const results = {
            sslResult,
            xssResult,
            headersResult,
            cspResult,
            portScanResult,
            sqlInjectionResult,
            dnsResult,
            subdomainsResult,
            directoryResult,
            cookieResult
        };
        console.log("Scan Results:", results);
        const securityScore = utils.generateSecurityScore(results);
        ws.send(JSON.stringify({ final: true, results, score: securityScore }));
        console.log("Final Score:", securityScore);

    } catch (error) {
        console.error("Error during security check:", error);
        ws.send(JSON.stringify({ error: error.message }));
    }
}

module.exports = { runSecurityCheck };
