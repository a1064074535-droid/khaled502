# =========================================
# .htaccess - ATS Resume Builder
# للنشر على Hostinger Shared Hosting
# يدعم React Router (SPA)
# =========================================

Options -MultiViews
RewriteEngine On

# إعادة توجيه جميع الطلبات إلى index.html (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QR,L]

# ضغط GZIP لتحسين الأداء
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# التخزين المؤقت (Cache) للملفات الثابتة
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# منع تصفح المجلدات
Options -Indexes

# تفعيل HTTPS (احذف التعليق إذا كان عندك SSL)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]