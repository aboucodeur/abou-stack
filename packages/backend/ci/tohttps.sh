#!/bin/bash

# POUR LE CLIENT REACT ET LA FACTURATION
getClientURL () {
    echo $CONSTANT_PROD > $CLIENT_PATH/src/constant.js
    echo 'export const APP_NAME = "YEYE"' >> $CLIENT_PATH/src/constant.js
    echo "FINISH : CHANGE API URL"
}

# POUR LE SERVEUR
setupServerENV () {
cat <<EOT > $SERVER_PATH/.env
NODE_ENV=production
TOKEN_SECRET=eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY1NDIxOTU4NSwiaWF0IjoxNjU0MjE5NTg1fQ.PHCj6KPPlJplOqiLZtST_SZXjqOB7RRLd784rjGNmEQ
RECOVERY_PASS=fatmaOsPlus
PASSWORD=abou@89
DATABASE=dbyeye
YEYE_HOST=https://www.ultra-glk.com
EOT
echo "FINISH : SERVER ENV COPY"
}

# POUR LE FICHIER SITEMAP
function setupSiteMAP () {
SITE_MAP_URL=https://www.ultra-glk.com
cat <<EOT > $CLIENT_PATH/public/sitemap.xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>$SITE_MAP_URL/</loc>
<lastmod>2023-08-29</lastmod>
<priority>1</priority>
<changefreq>yearly</changefreq>
</url>
<url>
<loc>https://www.ultra-glk.com/signup</loc>
<lastmod>2023-08-29</lastmod>
<priority>0.9</priority>
<changefreq>yearly</changefreq>
</url>
</urlset>
EOT
echo "FINISH : SERVER SITEMAP SETUP"
}

# DEFAULT VARIABLES
PREFIX=/home/abou/dev/projets/Yeye_lts
SERVER_PATH=$PREFIX/server
CLIENT_PATH=$PREFIX/frontend

SD="www.ultra-glk.com"
SDOMAIN="https://$SD"
CONSTANT_PROD="export const API_URL = \"https://$SD/api/v1\""
PRODUCTION_SRIPT="$PREFIX/scripts/production.sh"

getClientURL
setupServerENV
setupSiteMAP
echo "FINISH : COMMENCER LE DEPLOY"
$PRODUCTION_SRIPT
echo "FINISH : DEPLOY TERMINER"