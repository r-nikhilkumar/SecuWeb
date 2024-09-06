const axios = require('axios');
const https = require('https');
const dns = require('dns');
const net = require('net');
const urlParser = require('url');
const fs = require('fs');

/**
 * Extract the hostname from a full URL.
 */
function extractHostname(url) {
    const parsedUrl = urlParser.parse(url);
    return parsedUrl.hostname;
}

/**
 * Scan for DNS records of a website.
 */
function checkDNSRecords(url) {
    const host = extractHostname(url);
    return new Promise((resolve) => {
        dns.resolveAny(host, (err, records) => {
            if (err) {
                resolve({ dnsRecords: [], error: `Error fetching DNS records: ${err.message}` });
            } else {
                resolve({ dnsRecords: records });
            }
        });
    });
}

/**
 * Subdomain enumeration using common subdomains list.
 */
function subdomainEnumeration(url) {
    const commonSubdomains = ['www', 'admin', 'mail', 'dev', 'test', 'shop'];
    const host = extractHostname(url);
    const promises = commonSubdomains.map(subdomain => {
        const subdomainUrl = `${subdomain}.${host}`;
        return new Promise((resolve) => {
            dns.lookup(subdomainUrl, (err) => {
                if (!err) {
                    // First, try HTTPS
                    axios.get(`https://${subdomainUrl}`)
                        .then(response => {
                            if (response.status === 200) {
                                resolve({ subdomain: subdomainUrl, status: 'exists and is up (HTTPS)' });
                            } else {
                                resolve({ subdomain: subdomainUrl, status: 'exists but unreachable (HTTPS)' });
                            }
                        })
                        .catch(() => {
                            // If HTTPS fails, fallback to HTTP
                            axios.get(`http://${subdomainUrl}`)
                                .then(response => {
                                    if (response.status === 200) {
                                        resolve({ subdomain: subdomainUrl, status: 'exists and is up (HTTP)' });
                                    } else {
                                        resolve({ subdomain: subdomainUrl, status: 'exists but unreachable (HTTP)' });
                                    }
                                })
                                .catch(() => {
                                    resolve({ subdomain: subdomainUrl, status: 'exists but unreachable' });
                                });
                        });
                } else {
                    resolve({ subdomain: subdomainUrl, status: 'not found' });
                }
            });
        });
    });
    return Promise.all(promises);
}


/**
 * Directory scanning for exposed common files or directories.
 */
function directoryScanning(url) {
    const directories = ['/admin', '/config', '/backup', '/.git', '/.env'];
    const scanPromises = directories.map(dir => {
        return axios.get(`${url}${dir}`).then(response => {
            if (response.status === 200) {
                return { path: dir, status: 'exposed' };
            }
            return { path: dir, status: 'not exposed' };
        }).catch(() => ({ path: dir, status: 'not exposed' }));
    });
    return Promise.all(scanPromises);
}

/**
 * Detect improper cookie settings.
 */
function checkCookieSecurity(url) {
    return axios.get(url).then(response => {
        const cookies = response.headers['set-cookie'] || [];
        const analysis = cookies.map(cookie => {
            const flags = {};
            flags.httpOnly = cookie.includes('HttpOnly');
            flags.secure = cookie.includes('Secure');
            flags.sameSite = cookie.includes('SameSite');
            return { cookie, flags };
        });
        return { cookies: analysis };
    }).catch(error => ({ error: error.message }));
}

/**
 * Advanced SQL Injection test (Union-based).
 */
function advancedSQLInjectionTest(url) {
    const payloads = [
        "' UNION SELECT NULL -- ",
        "' UNION SELECT NULL,NULL -- ",
        "' UNION SELECT NULL,NULL,NULL -- ",
    ];
    const tests = payloads.map(payload => {
        return axios.get(`${url}?q=${encodeURIComponent(payload)}`)
            .then(response => {
                if (response.data.includes('error') || response.data.includes('syntax')) {
                    return { payload, result: 'Potential SQL Injection Found' };
                }
                return { payload, result: 'No Vulnerability Detected' };
            }).catch(error => ({ error: error.message }));
    });
    return Promise.all(tests);
}

/**
 * Generate a security score based on scan results.
 */
function generateSecurityScore(results) {
    let score = 100; // Start with a perfect score
    console.log("Initial Score: ", score); // Debugging

    // Deduct based on SSL status
    if (results.sslResult) {
        if (results.sslResult.sslStatus === 'Invalid' || results.sslResult.sslStatus === 'No SSL Certificate Found') {
            console.log("SSL Status deduction: -20");
            score -= 20;
        }
    }

    // Deduct if XSS vulnerability is found
    if (results.xssResult) {
        if (results.xssResult.xssVulnerable) {
            console.log("XSS vulnerability deduction: -15");
            score -= 10;
        }
    }

    // Deduct if SQL Injection vulnerability is found
    if (results.sqlInjectionResult) {
        if (results.sqlInjectionResult.sqlInjectionVulnerable) {
            console.log("SQL Injection vulnerability deduction: -20");
            score -= 15;
        }
    }

    // Deduct if cookies are not secure
    if (results.cookieResult && results.cookieResult.cookies) {
        results.cookieResult.cookies.forEach(cookie => {
            if (!cookie.flags.httpOnly) {
                console.log("Cookie HttpOnly deduction: -5");
                score -= 2;
            }
            if (!cookie.flags.secure) {
                console.log("Cookie Secure deduction: -5");
                score -= 2;
            }
            if (!cookie.flags.sameSite) {
                console.log("Cookie SameSite deduction: -5");
                score -= 2;
            }
        });
    }

    // Deduct for exposed directories
    if (results.directoryResult) {
        results.directoryResult.forEach(dir => {
            if (dir.status === 'exposed') {
                console.log(`Directory ${dir.path} exposed deduction: -10`);
                score -= 5;
            }
        });
    }

    // Deduct for missing important security headers
    if (results.headersResult) {
        if (results.headersResult.contentSecurityPolicy === 'Missing') {
            console.log("CSP header missing deduction: -10");
            score -= 7;
        }
        if (results.headersResult.xFrameOptions === 'Missing') {
            console.log("X-Frame-Options header missing deduction: -5");
            score -= 5;
        }
        if (results.headersResult.strictTransportSecurity === 'Missing') {
            console.log("Strict-Transport-Security header missing deduction: -5");
            score -= 5;
        }
    }

    console.log(`Final Security Score: ${score}/100`);
    return `Security Score: ${score}/100`;
}


/**
 * Scan a specific port on the given host.
 */
function scanPort(host, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        socket.on('connect', () => {
            socket.destroy();
            resolve({ port, status: 'open' });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({ port, status: 'closed' });
        });

        socket.on('error', () => {
            resolve({ port, status: 'closed' });
        });

        socket.connect(port, host);
    });
}

/**
 * Scan common ports on a given host.
 */
function scanPorts(url) {
    const host = extractHostname(url);  // Extract hostname from URL
    const commonPorts = [21, 22, 80, 443, 8080, 3306];  // Common ports: FTP, SSH, HTTP, HTTPS, etc.
    const scanPromises = commonPorts.map(port => scanPort(host, port));

    return Promise.all(scanPromises);
}

/**
 * Check the SSL certificate validity of a website.
 */
function checkSSL(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            const certificate = res.connection.getPeerCertificate();
            if (certificate) {
                const { valid_from, valid_to, subject, issuer } = certificate;
                resolve({
                    sslValidFrom: valid_from,
                    sslValidTo: valid_to,
                    sslSubject: subject,
                    sslIssuer: issuer,
                    sslStatus: "Valid"
                });
            } else {
                resolve({ sslStatus: "No SSL Certificate Found" });
            }
        });
        
        req.on('error', (e) => reject(e));
    });
}

/**
 * Test for XSS vulnerability.
 */
function testXSS(url) {
    const xssPayload = "<script>alert(1)</script>";
    return axios.get(`${url}?q=${encodeURIComponent(xssPayload)}`)
        .then(response => {
            if (response.data.includes(xssPayload)) {
                return { xssVulnerable: true, details: "XSS Found!" };
            } else {
                return { xssVulnerable: false, details: "No XSS Vulnerability Detected" };
            }
        }).catch(error => ({ error: error.message }));
}

/**
 * Check security headers of a website.
 */
function checkSecurityHeaders(url) {
    return axios.get(url).then(response => {
        const headers = response.headers;
        return {
            contentSecurityPolicy: headers['content-security-policy'] || "Missing",
            xFrameOptions: headers['x-frame-options'] || "Missing",
            strictTransportSecurity: headers['strict-transport-security'] || "Missing",
        };
    }).catch(error => ({ error: error.message }));
}

/**
 * Check if Content Security Policy (CSP) is present and properly configured.
 */
function checkCSP(url) {
    return axios.get(url).then(response => {
        const csp = response.headers['content-security-policy'];
        if (!csp) {
            return { cspStatus: "Missing", cspDetails: "Content Security Policy is not set." };
        } else {
            return { cspStatus: "Present", cspDetails: csp };
        }
    }).catch(error => ({ error: error.message }));
}

/**
 * Test for SQL Injection vulnerability.
 */
function testSQLInjection(url) {
    const sqlPayload = "' OR '1'='1' -- ";
    return axios.get(`${url}?q=${encodeURIComponent(sqlPayload)}`)
        .then(response => {
            if (response.data.includes('error') || response.data.includes('syntax')) {
                return { sqlInjectionVulnerable: true, details: "Potential SQL Injection Vulnerability Found!" };
            } else {
                return { sqlInjectionVulnerable: false, details: "No SQL Injection Vulnerability Detected" };
            }
        }).catch(error => ({ error: error.message }));
}

// Export all functions from this utils file
module.exports = {
    extractHostname,
    checkDNSRecords,
    subdomainEnumeration,
    directoryScanning,
    checkCookieSecurity,
    advancedSQLInjectionTest,
    generateSecurityScore,
    scanPort,
    scanPorts,
    checkSSL,
    testXSS,
    checkSecurityHeaders,
    checkCSP,
    testSQLInjection
};
