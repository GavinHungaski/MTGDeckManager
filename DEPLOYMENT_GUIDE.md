# MTG Brewer AWS Deployment Guide

## Status: In Progress

### ✅ Completed
1. **AWS CLI configured** with `mtg-deployer` IAM user
2. **Frontend built** (`client/dist/`) with production API URL updated to HTTPS
3. **Frontend synced to S3** (`mtg-brewer-frontend` bucket)
4. **Backend packaged** (`deploy-v2.zip`) with `.ebextensions` and `Procfile`
5. **Backend uploaded to S3** and EB application version `v2-0-0-prod` created
6. **CloudFront OAC created** (`E18EUDYQ3Z7HGP`)
7. **EB environment rebuild** triggered (in progress)

### ⏳ Waiting On
1. **EB rebuild** — Environment `Mtg-brewer-backend-env` is rebuilding (est. 10-15 min)
2. **AWS CloudFront account verification** — Blocked by AWS (see fix below)

---

## Step 1: Fix CloudFront Account Verification (DO THIS NOW)

AWS is blocking CloudFront distribution creation. You must verify your account.

### Option A: Support Case (Recommended)
1. Go to https://console.aws.amazon.com/support/home#/
2. Click **Create case**
3. Select:
   - **Type**: Account and Billing
   - **Category**: Account
   - **Subject**: "CloudFront Account Verification Request"
   - **Body**:
     ```
     Hello,

     I am trying to create CloudFront distributions for my website
     (artificealley.cloud) but receiving this error:

     "Your account must be verified before you can add new CloudFront resources."

     Please verify my account for CloudFront access.
     Account ID: 212601669109

     Thank you.
     ```
4. Submit the case
5. **Usually approved within a few hours**

### Option B: Add/Update Payment Method
1. Go to https://console.aws.amazon.com/billing/home#/paymentmethods
2. Ensure a valid credit card is on file and set as default
3. Try creating the CloudFront distribution again after a few minutes

---

## Step 2: Deploy Backend to EB (Once Rebuild Completes)

After the EB environment shows **Status: Ready**, run these commands:

```powershell
# Check if Ready
py -m awscli elasticbeanstalk describe-environments --environment-names Mtg-brewer-backend-env --query "Environments[*].[Status,Health,VersionLabel]" --output table

# If Ready, deploy the new version with env vars
py -m awscli elasticbeanstalk update-environment --environment-name Mtg-brewer-backend-env --version-label v2-0-0-prod --option-settings Namespace=aws:elasticbeanstalk:application:environment,OptionName=CORS_ORIGIN,Value=https://artificealley.cloud Namespace=aws:elasticbeanstalk:application:environment,OptionName=ENCRYPTION_KEY,Value=3eb15e48aa3185e4d9e3e2ac9c33510f42452b57d48dc6ad904f6b4a8b55b6bf
```

Wait for deployment to complete:
```powershell
py -m awscli elasticbeanstalk describe-environments --environment-names Mtg-brewer-backend-env --query "Environments[*].[Status,Health]" --output table
```

Verify the API:
```powershell
# Health check
py -m awscli elasticbeanstalk describe-environments --environment-names Mtg-brewer-backend-env --query "Environments[*].CNAME" --output text
# Then browse to: https://<CNAME>/health
```

---

## Step 3: Create CloudFront Distribution (After Verification)

Once AWS approves your CloudFront access, run the prepared script:

```powershell
cd C:\Users\gavin\Desktop\MTG_Brewer
.\create-cloudfront.ps1
```

This creates a CloudFront distribution with:
- Custom domain: `artificealley.cloud` and `www.artificealley.cloud`
- ACM SSL certificate
- HTTPS redirect
- SPA error handling (403/404 → index.html)
- S3 origin with Origin Access Control

**Note the Distribution Domain Name** from the output (e.g., `d1234567890abcdef.cloudfront.net`).

---

## Step 4: Lock Down S3 Bucket (After CloudFront Created)

Replace `DISTRIBUTION_ID` with your actual CloudFront distribution ID from Step 3:

```powershell
$distId = "YOUR_DISTRIBUTION_ID"
$bucketPolicy = @"
{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
    {
      \"Sid\": \"AllowCloudFrontOAC\",
      \"Effect\": \"Allow\",
      \"Principal\": { \"Service\": \"cloudfront.amazonaws.com\" },
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::mtg-brewer-frontend/*\",
      \"Condition\": {
        \"StringEquals\": {
          \"AWS:SourceArn\": \"arn:aws:cloudfront::212601669109:distribution/$distId\"
        }
      }
    }
  ]
}
"@

py -m awscli s3api put-bucket-policy --bucket mtg-brewer-frontend --policy $bucketPolicy
```

Then block all public access:
```powershell
py -m awscli s3api put-public-access-block --bucket mtg-brewer-frontend --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

---

## Step 5: Update Porkbun DNS

### A Record (Root domain)
- **Type**: ALIAS or ANAME
- **Name**: `@` (root)
- **Value**: Your CloudFront domain name (e.g., `d1234567890abcdef.cloudfront.net`)

### CNAME Record (WWW subdomain)
- **Type**: CNAME
- **Name**: `www`
- **Value**: Your CloudFront domain name (e.g., `d1234567890abcdef.cloudfront.net`)

**Note**: If Porkbun doesn't support ALIAS/ANAME for root domains, use one of these workarounds:
1. **Redirect root to www** at Porkbun: Set `@` to forward to `https://www.artificealley.cloud`
2. **Switch DNS to Route 53** (free): Create a hosted zone in Route 53, copy the NS records to Porkbun, then use Route 53 ALIAS records

---

## Step 6: Verify Everything

Checklist:
- [ ] Backend health: `https://mtg-brewer-backend-env.eba-ajvwwj6w.us-east-2.elasticbeanstalk.com/health`
- [ ] Frontend loads: `https://artificealley.cloud`
- [ ] HTTPS works (no mixed content warnings)
- [ ] API calls succeed (login, deck loading)
- [ ] React Router works (direct URL to `/decks/123` loads correctly)
- [ ] S3 bucket is private (only CloudFront can access)

---

## Rollback

If you need to rollback the backend:
```powershell
py -m awscli elasticbeanstalk update-environment --environment-name Mtg-brewer-backend-env --version-label 0.1.
```

---

## Files Created During Deployment

| File | Purpose |
|------|---------|
| `client/.env.production` | Updated API URL to HTTPS |
| `server/deploy-new.zip` | First deployment attempt |
| `server/deploy-v2.zip` | Final deployment package with Procfile + .ebextensions |
| `server/Procfile` | Explicit process command for EB |
| `server/.ebextensions/01_nodecommand.config` | Explicit Node.js start command |
| `cloudfront-config.json` | CloudFront distribution JSON config |
| `create-cloudfront.ps1` | Script to create CloudFront after verification |
| `DEPLOYMENT_GUIDE.md` | This file |
