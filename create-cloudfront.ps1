# Run this after AWS CloudFront account verification is complete
# This creates the CloudFront distribution for the MTG Brewer frontend

Write-Host "Creating CloudFront distribution..."

$json = @"
{
  \"CallerReference\": \"mtg-brewer-cf-20260507\",
  \"Aliases\": {
    \"Quantity\": 2,
    \"Items\": [\"artificealley.cloud\", \"www.artificealley.cloud\"]
  },
  \"DefaultRootObject\": \"index.html\",
  \"Origins\": {
    \"Quantity\": 1,
    \"Items\": [
      {
        \"Id\": \"mtg-brewer-frontend-s3\",
        \"DomainName\": \"mtg-brewer-frontend.s3.us-east-2.amazonaws.com\",
        \"OriginAccessControlId\": \"E18EUDYQ3Z7HGP\",
        \"S3OriginConfig\": {
          \"OriginAccessIdentity\": \"\"
        }
      }
    ]
  },
  \"DefaultCacheBehavior\": {
    \"TargetOriginId\": \"mtg-brewer-frontend-s3\",
    \"ViewerProtocolPolicy\": \"redirect-to-https\",
    \"AllowedMethods\": {
      \"Quantity\": 2,
      \"Items\": [\"HEAD\", \"GET\"],
      \"CachedMethods\": {
        \"Quantity\": 2,
        \"Items\": [\"HEAD\", \"GET\"]
      }
    },
    \"Compress\": true,
    \"CachePolicyId\": \"658327ea-f89d-4fab-a63d-7e88639e58f6\"
  },
  \"CustomErrorResponses\": {
    \"Quantity\": 2,
    \"Items\": [
      {
        \"ErrorCode\": 403,
        \"ResponsePagePath\": \"/index.html\",
        \"ResponseCode\": \"200\",
        \"ErrorCachingMinTTL\": 10
      },
      {
        \"ErrorCode\": 404,
        \"ResponsePagePath\": \"/index.html\",
        \"ResponseCode\": \"200\",
        \"ErrorCachingMinTTL\": 10
      }
    ]
  },
  \"Comment\": \"MTG Brewer Frontend CDN\",
  \"PriceClass\": \"PriceClass_100\",
  \"Enabled\": true,
  \"ViewerCertificate\": {
    \"ACMCertificateArn\": \"arn:aws:acm:us-east-1:212601669109:certificate/d2d91885-6b58-47c1-acfa-fe9f4990c474\",
    \"SSLSupportMethod\": \"sni-only\",
    \"MinimumProtocolVersion\": \"TLSv1.2_2021\"
  },
  \"HttpVersion\": \"http2and3\",
  \"IsIPV6Enabled\": true
}
"@

$json | Out-File -FilePath "cf-temp.json" -Encoding utf8

py -m awscli cloudfront create-distribution --distribution-config file://cf-temp.json --region us-east-1

# After creation, update S3 bucket policy to allow CloudFront OAC only
Write-Host "`nAfter CloudFront is created, run these commands to lock down S3:"
Write-Host "1. Get the Distribution ID from the output above"
Write-Host "2. Update Porkbun DNS to point to the CloudFront domain name"
