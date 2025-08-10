#!/usr/bin/env node

const dns = require('dns');
const https = require('https');

console.log('🔍 Checking domain status for photoncoaching.in...\n');

// Check DNS resolution
function checkDNS() {
    return new Promise((resolve) => {
        dns.resolve4('photoncoaching.in', (err, addresses) => {
            if (err) {
                console.log('❌ DNS Resolution: Failed');
                console.log(`   Error: ${err.message}`);
                resolve(false);
            } else {
                console.log('✅ DNS Resolution: Success');
                console.log(`   IP Address: ${addresses[0]}`);
                
                // Check if it's pointing to Vercel
                if (addresses[0] === '76.76.19.61') {
                    console.log('✅ Pointing to Vercel: Yes');
                } else {
                    console.log('❌ Pointing to Vercel: No');
                    console.log('   Expected: 76.76.19.61');
                }
                resolve(true);
            }
        });
    });
}

// Check HTTPS
function checkHTTPS() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'photoncoaching.in',
            port: 443,
            path: '/',
            method: 'GET',
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            console.log('✅ HTTPS: Working');
            console.log(`   Status Code: ${res.statusCode}`);
            resolve(true);
        });

        req.on('error', (err) => {
            console.log('❌ HTTPS: Failed');
            console.log(`   Error: ${err.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log('❌ HTTPS: Timeout');
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

// Check nameservers
function checkNameservers() {
    return new Promise((resolve) => {
        dns.resolveNs('photoncoaching.in', (err, nameservers) => {
            if (err) {
                console.log('❌ Nameservers: Could not resolve');
                console.log(`   Error: ${err.message}`);
                resolve(false);
            } else {
                console.log('📋 Current Nameservers:');
                nameservers.forEach(ns => {
                    console.log(`   - ${ns}`);
                    if (ns.includes('vercel-dns.com')) {
                        console.log('✅ Vercel nameserver detected');
                    } else if (ns.includes('dns-parking.com')) {
                        console.log('❌ Still using parking nameservers');
                    }
                });
                resolve(true);
            }
        });
    });
}

async function main() {
    console.log('Starting domain verification...\n');
    
    await checkNameservers();
    console.log('');
    
    await checkDNS();
    console.log('');
    
    await checkHTTPS();
    console.log('');
    
    console.log('🏁 Verification complete!');
    console.log('\nIf you see errors above, please:');
    console.log('1. Check that you\'ve updated your nameservers');
    console.log('2. Wait for DNS propagation (up to 48 hours)');
    console.log('3. Try clearing your browser cache');
}

main().catch(console.error);