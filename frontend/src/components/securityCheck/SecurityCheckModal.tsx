// SecurityCheckModal.tsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import jsPDF from 'jspdf'; // Import jsPDF
import 'bootstrap/dist/css/bootstrap.min.css';

interface CookieFlags {
    httpOnly: boolean;
    secure: boolean;
    sameSite: boolean;
}

interface Cookie {
    cookie: string;
    flags: CookieFlags;
}

interface PortScanResult {
    port: number;
    status: string;
}

interface DnsRecord {
    value: string;
    type: string;
}

interface SecurityCheckResult {
    sslResult: { sslStatus: string };
    xssResult: { error: string };
    headersResult: { contentSecurityPolicy: string; xFrameOptions: string; strictTransportSecurity: string };
    cspResult: { cspStatus: string; cspDetails: string };
    portScanResult: PortScanResult[];
    sqlInjectionResult: { error: string };
    dnsResult: { dnsRecords: DnsRecord[] };
    subdomainsResult: { subdomain: string; status: string }[];
    directoryResult: { path: string; status: string }[];
    cookieResult: { cookies: Cookie[] };
}

interface SecurityCheckModalProps {
    show: boolean;
    onHide: () => void;
    score: string | null;
    results: SecurityCheckResult | null;
}

// Function to get score color and message
const getScoreColor = (score: string) => {
    if (!score) return { color: '#f88', message: 'No score available' };

    const match = score.match(/(\d+)/);
    if (match && match[0]) {
        const numericScore = parseFloat(match[0]);

        if (numericScore >= 70) return { color: 'green', message: 'Great job! 🎉 ' + numericScore };
        if (numericScore >= 50) return { color: 'orange', message: 'Good effort, but there’s room for improvement! ' + numericScore };
        return { color: 'red', message: 'Needs significant improvement! ' + numericScore };
    }

    return { color: '#f88', message: 'Invalid score format' };
};

const parseCookieString = (cookieString: string) => {
    const cookieArray = cookieString.split('; ').map(cookie => {
        const [key, value] = cookie.split('=');
        return { key, value };
    });
    return cookieArray;
};

const SecurityCheckModal: React.FC<SecurityCheckModalProps> = ({ show, onHide, score, results }) => {
    const { color, message } = getScoreColor(score || "");

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 200);
        doc.text('Security Check Results', 20, 20);
        let y = 30; // Starting Y position

        if (score) {
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(`Score: ${score}`, 20, y);
            y += 10;
        }

        if (results) {
            // Function to handle adding text with page break
            const addTextWithPageBreak = (text: string, x: number, y: number) => {
                const textLines = doc.splitTextToSize(text, 180);
                for (const line of textLines) {
                    if (y >= 280) { // Check if position is near the bottom of the page
                        doc.addPage(); // Add a new page
                        y = 10; // Reset Y position for new page
                    }
                    doc.text(line, x, y);
                    y += 10;
                }
                return y; // Return the new Y position
            };

            // SSL Result
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            y = addTextWithPageBreak('SSL Result', 20, y);
            y += 5; // Add space after heading
            y = addTextWithPageBreak(`Status: ${results.sslResult.sslStatus}`, 20, y);

            // XSS Result
            y = addTextWithPageBreak('XSS Result', 20, y);
            y += 5;
            y = addTextWithPageBreak(`Error: ${results.xssResult.error || 'No errors found.'}`, 20, y);

            // Security Headers Result
            y = addTextWithPageBreak('Security Headers Result', 20, y);
            y += 5;
            y = addTextWithPageBreak(`Content Security Policy: ${results.headersResult.contentSecurityPolicy}`, 20, y);
            y = addTextWithPageBreak(`X-Frame-Options: ${results.headersResult.xFrameOptions}`, 20, y);
            y = addTextWithPageBreak(`Strict Transport Security: ${results.headersResult.strictTransportSecurity}`, 20, y);

            // CSP Result
            y = addTextWithPageBreak('CSP Result', 20, y);
            y += 5;
            y = addTextWithPageBreak(`Status: ${results.cspResult.cspStatus}`, 20, y);
            y = addTextWithPageBreak(`Details: ${results.cspResult.cspDetails}`, 20, y);

            // Port Scan Result
            y = addTextWithPageBreak('Port Scan Result', 20, y);
            y += 5;
            results.portScanResult.forEach(port => {
                y = addTextWithPageBreak(`Port: ${port.port}, Status: ${port.status}`, 20, y);
            });

            // SQL Injection Result
            y = addTextWithPageBreak('SQL Injection Result', 20, y);
            y += 5;
            y = addTextWithPageBreak(`Error: ${results.sqlInjectionResult.error || 'No vulnerabilities found.'}`, 20, y);

            // DNS Result
            y = addTextWithPageBreak('DNS Result', 20, y);
            y += 5;
            results.dnsResult.dnsRecords.forEach(record => {
                y = addTextWithPageBreak(`Value: ${record.value}, Type: ${record.type}`, 20, y);
            });

            // Subdomains Result
            y = addTextWithPageBreak('Subdomains Result', 20, y);
            y += 5;
            results.subdomainsResult.forEach(subdomain => {
                y = addTextWithPageBreak(`Subdomain: ${subdomain.subdomain}, Status: ${subdomain.status}`, 20, y);
            });

            // Directory Result
            y = addTextWithPageBreak('Directory Result', 20, y);
            y += 5;
            results.directoryResult.forEach(directory => {
                y = addTextWithPageBreak(`Path: ${directory.path}, Status: ${directory.status}`, 20, y);
            });

            // Cookie Result
            y = addTextWithPageBreak('Cookie Result', 20, y);
            y += 5;
            results.cookieResult.cookies.forEach((cookie, index) => {
                y = addTextWithPageBreak(`Cookie ${index}:`, 20, y);
                parseCookieString(cookie.cookie).forEach(cookiePart => {
                    y = addTextWithPageBreak(`${cookiePart.key}: ${cookiePart.value}`, 30, y);
                });
                y = addTextWithPageBreak(`HttpOnly: ${cookie.flags.httpOnly ? 'Yes' : 'No'}`, 30, y);
                y = addTextWithPageBreak(`Secure: ${cookie.flags.secure ? 'Yes' : 'No'}`, 30, y);
                y = addTextWithPageBreak(`SameSite: ${cookie.flags.sameSite ? 'Yes' : 'No'}`, 30, y);
            });
        }

        doc.save('security_check_results.pdf');
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Security Check Results</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {score && (
                    <h4 style={{ color }}>{message}</h4>
                )}
                {results && (
                    <div>
                        <h5 style={{ color: '#007BFF' }}>SSL Result</h5>
                        <p><strong>Status:</strong> {results.sslResult.sslStatus}</p>
                        
                        <h5 style={{ color: '#007BFF' }}>XSS Result</h5>
                        <p><strong>Error:</strong> {results.xssResult.error || 'No errors found.'}</p>
                        
                        <h5 style={{ color: '#007BFF' }}>Security Headers Result</h5>
                        <ul>
                            <li><strong>Content Security Policy:</strong> {results.headersResult.contentSecurityPolicy}</li>
                            <li><strong>X-Frame-Options:</strong> {results.headersResult.xFrameOptions}</li>
                            <li><strong>Strict Transport Security:</strong> {results.headersResult.strictTransportSecurity}</li>
                        </ul>
                        
                        <h5 style={{ color: '#007BFF' }}>CSP Result</h5>
                        <p><strong>Status:</strong> {results.cspResult.cspStatus}</p>
                        <p><strong>Details:</strong> {results.cspResult.cspDetails}</p>
                        
                        <h5 style={{ color: '#007BFF' }}>Port Scan Result</h5>
                        <ul>
                            {results.portScanResult.map((port, index) => (
                                <li key={index}>
                                    <strong>Port:</strong> {port.port}, <strong>Status:</strong> {port.status}
                                </li>
                            ))}
                        </ul>
                        
                        <h5 style={{ color: '#007BFF' }}>SQL Injection Result</h5>
                        <p><strong>Error:</strong> {results.sqlInjectionResult.error || 'No vulnerabilities found.'}</p>
                        
                        <h5 style={{ color: '#007BFF' }}>DNS Result</h5>
                        <ul>
                            {results.dnsResult.dnsRecords.map((record, index) => (
                                <li key={index}>
                                    <strong>Value:</strong> {record.value}, <strong>Type:</strong> {record.type}
                                </li>
                            ))}
                        </ul>
                        
                        <h5 style={{ color: '#007BFF' }}>Subdomains Result</h5>
                        <ul>
                            {results.subdomainsResult.map((subdomain, index) => (
                                <li key={index}>
                                    <strong>Subdomain:</strong> {subdomain.subdomain}, <strong>Status:</strong> {subdomain.status}
                                </li>
                            ))}
                        </ul>
                        
                        <h5 style={{ color: '#007BFF' }}>Directory Result</h5>
                        <ul>
                            {results.directoryResult.map((directory, index) => (
                                <li key={index}>
                                    <strong>Path:</strong> {directory.path}, <strong>Status:</strong> {directory.status}
                                </li>
                            ))}
                        </ul>
                        
                        <h5 style={{ color: '#007BFF' }}>Cookie Result</h5>
                        <ul>
                            {results.cookieResult.cookies.map((cookie, index) => (
                                <li key={index}>
                                    <strong>Cookie {index}:</strong>
                                    <ul>
                                        {parseCookieString(cookie.cookie).map((cookiePart, idx) => (
                                            <li key={idx}>
                                                <strong>{cookiePart.key}:</strong> {cookiePart.value}
                                            </li>
                                        ))}
                                        <li><strong>HttpOnly:</strong> {cookie.flags.httpOnly ? 'Yes' : 'No'}</li>
                                        <li><strong>Secure:</strong> {cookie.flags.secure ? 'Yes' : 'No'}</li>
                                        <li><strong>SameSite:</strong> {cookie.flags.sameSite ? 'Yes' : 'No'}</li>
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={downloadPDF}>
                    Download PDF
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SecurityCheckModal;
