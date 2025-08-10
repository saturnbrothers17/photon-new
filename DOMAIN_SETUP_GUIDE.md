# Domain Setup Guide for photoncoaching.in

## Current Status
✅ Domain `photoncoaching.in` is connected to your Vercel project `photon-website`
✅ Your new website is deployed and working at: https://photon-website-seven.vercel.app
❌ Domain is currently pointing to parking nameservers instead of Vercel

## What You Need to Do

### Step 1: Access Your Domain Registrar
1. Go to the website where you purchased `photoncoaching.in`
2. Log into your account
3. Find the domain management section

### Step 2: Change Nameservers (Recommended Method)

**Current Nameservers (REMOVE these):**
- ns1.dns-parking.com
- ns2.dns-parking.com

**Change to Vercel Nameservers:**
- ns1.vercel-dns.com
- ns2.vercel-dns.com

**Steps:**
1. In your domain registrar, find "Nameservers" or "DNS Management"
2. Select "Custom Nameservers" or "Use Custom DNS"
3. Replace the current nameservers with Vercel's nameservers
4. Save the changes

### Step 3: Wait for DNS Propagation
- DNS changes can take 24-48 hours to fully propagate
- You can check the status using online DNS checker tools

### Alternative Method: If You Can't Change Nameservers

If your registrar doesn't allow nameserver changes, add these DNS records:

**A Record:**
- Name: `@` (or leave blank for root domain)
- Type: A
- Value: `76.76.21.21` (Updated from Vercel CLI)
- TTL: 300 (or default)

**CNAME Record:**
- Name: `www`
- Type: CNAME
- Value: `cname.vercel-dns.com`
- TTL: 300 (or default)

## Verification

After making the changes, you can verify the setup:

1. **Check DNS propagation:** Use tools like whatsmydns.net
2. **Test the domain:** Visit https://photoncoaching.in
3. **Check SSL:** Ensure HTTPS is working

## Expected Timeline
- Nameserver changes: 24-48 hours
- DNS record changes: 1-6 hours

## Troubleshooting

If the domain doesn't work after 48 hours:
1. Double-check the nameservers are correctly set
2. Clear your browser cache
3. Try accessing from a different device/network
4. Contact your domain registrar for support

## Current Vercel Configuration
- Project: photon-website
- Production URL: https://photon-website-seven.vercel.app
- Custom Domain: photoncoaching.in (configured)
- SSL: Will be automatically provisioned by Vercel

## Contact Information
If you need help with this process, you can:
1. Contact your domain registrar's support
2. Use Vercel's documentation: https://vercel.com/docs/concepts/projects/custom-domains