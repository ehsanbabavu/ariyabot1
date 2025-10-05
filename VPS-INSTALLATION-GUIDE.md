# راهنمای نصب پروژه روی VPS

این راهنما مراحل نصب و راه‌اندازی اپلیکیشن فروشگاهی فارسی روی VPS را به تفصیل توضیح می‌دهد.

## ✅ پیش‌نیازها

### مشخصات سرور مورد نیاز:
- **سیستم عامل**: Ubuntu 20.04+ یا CentOS 8+
- **رم**: حداقل 2GB (توصیه می‌شود 4GB)
- **فضای دیسک**: حداقل 20GB
- **CPU**: حداقل 1 هسته (توصیه می‌شود 2 هسته)
- **اتصال اینترنت**: پایدار و پرسرعت

## 🚀 مرحله 1: آماده‌سازی سرور

### 1.1 اتصال به سرور
```bash
ssh root@YOUR_SERVER_IP
```

### 1.2 به‌روزرسانی سیستم
```bash
# Ubuntu/Debian
apt update && apt upgrade -y

# CentOS/RHEL
yum update -y
```

### 1.3 ایجاد کاربر غیر‌root
```bash
# ایجاد کاربر جدید
adduser deploy
usermod -aG sudo deploy

# تنظیم SSH برای کاربر جدید
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 1.4 ورود به کاربر جدید
```bash
su - deploy
# یا اتصال مجدد با SSH
ssh deploy@YOUR_SERVER_IP
```

## 🔧 مرحله 2: نصب Node.js

### 2.1 نصب Node.js 20.x
```bash
# اضافه کردن repository رسمی Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# نصب Node.js
sudo apt-get install -y nodejs

# بررسی نسخه
node --version
npm --version
```

### 2.2 نصب PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## 🗃️ مرحله 3: نصب و تنظیم PostgreSQL

### 3.1 نصب PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib -y

# راه‌اندازی سرویس
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.2 تنظیم پایگاه داده
```bash
# ورود به PostgreSQL
sudo -u postgres psql

# ایجاد پایگاه داده و کاربر
CREATE DATABASE persian_ecommerce;
CREATE USER deploy WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE persian_ecommerce TO deploy;
\q
```

### 3.3 تنظیم احراز هویت PostgreSQL
```bash
# ویرایش فایل تنظیمات
sudo nano /etc/postgresql/*/main/pg_hba.conf

# اضافه کردن این خط:
# local   all             deploy                                  md5

# راه‌اندازی مجدد PostgreSQL
sudo systemctl restart postgresql
```

## 📁 مرحله 4: آپلود و تنظیم پروژه

### 4.1 کلون کردن پروژه
```bash
cd /home/deploy
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY

# یا آپلود فایل‌ها با SCP/SFTP
```

### 4.2 نصب وابستگی‌ها
```bash
npm install
```

### 4.3 تنظیم متغیرهای محیطی
```bash
# ایجاد فایل .env
nano .env
```

محتویات فایل `.env`:
```env
# Database Configuration
DATABASE_URL="postgresql://deploy:your_secure_password_here@localhost:5432/persian_ecommerce"

# JWT Configuration
JWT_SECRET="your_super_secret_jwt_key_here_with_minimum_32_characters"

# Server Configuration
NODE_ENV=production
PORT=3000

# Upload Configuration
UPLOAD_DIR=/home/deploy/uploads
MAX_FILE_SIZE=5242880

# Optional: Email Configuration (برای reset password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Optional: Redis (برای session store)
REDIS_URL=redis://localhost:6379
```

### 4.4 ایجاد پوشه آپلود
```bash
mkdir -p /home/deploy/uploads
chmod 755 /home/deploy/uploads
```

### 4.5 اعمال schema پایگاه داده
```bash
npm run db:push
```

## 🏗️ مرحله 5: Build کردن پروژه

### 5.1 Build production
```bash
npm run build
```

### 5.2 تست اجرا
```bash
# تست کوتاه
npm start
# باید پیام "serving on port 3000" را ببینید
# با Ctrl+C متوقف کنید
```

## ⚙️ مرحله 6: تنظیم PM2

### 6.1 ایجاد فایل تنظیمات PM2
```bash
nano ecosystem.config.js
```

محتویات فایل:
```javascript
module.exports = {
  apps: [{
    name: 'persian-ecommerce',
    script: 'npm',
    args: 'start',
    cwd: '/home/deploy/YOUR_REPOSITORY',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/deploy/logs/err.log',
    out_file: '/home/deploy/logs/out.log',
    log_file: '/home/deploy/logs/combined.log',
    time: true
  }]
};
```

### 6.2 ایجاد پوشه لاگ
```bash
mkdir -p /home/deploy/logs
```

### 6.3 راه‌اندازی با PM2
```bash
# شروع اپلیکیشن
pm2 start ecosystem.config.js

# ذخیره تنظیمات PM2
pm2 save

# تنظیم startup script
pm2 startup
# دستور نمایش داده شده را اجرا کنید
```

## 🌐 مرحله 7: نصب و تنظیم Nginx

### 7.1 نصب Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7.2 تنظیم Virtual Host
```bash
sudo nano /etc/nginx/sites-available/persian-ecommerce
```

محتویات فایل:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # گزارش‌گیری
    access_log /var/log/nginx/persian-ecommerce.access.log;
    error_log /var/log/nginx/persian-ecommerce.error.log;
    
    # پروکسی به Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # تنظیمات timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # فایل‌های استatic
    location /uploads {
        alias /home/deploy/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # امنیت
    location ~ /\.ht {
        deny all;
    }
    
    # حداکثر سایز فایل آپلود
    client_max_body_size 10M;
}
```

### 7.3 فعال‌سازی site
```bash
# ایجاد symlink
sudo ln -s /etc/nginx/sites-available/persian-ecommerce /etc/nginx/sites-enabled/

# حذف default site
sudo rm /etc/nginx/sites-enabled/default

# تست تنظیمات Nginx
sudo nginx -t

# راه‌اندازی مجدد Nginx
sudo systemctl reload nginx
```

## 🔒 مرحله 8: نصب SSL (Let's Encrypt)

### 8.1 نصب Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 دریافت گواهی SSL
```bash
# جایگزین کردن yourdomain.com با دامنه واقعی شما
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 8.3 تنظیم تجدید خودکار
```bash
# تست تجدید
sudo certbot renew --dry-run

# ایجاد cron job
sudo crontab -e
# اضافه کردن این خط:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔥 مرحله 9: تنظیم Firewall

### 9.1 تنظیم UFW
```bash
# فعال‌سازی UFW
sudo ufw --force enable

# اجازه SSH
sudo ufw allow ssh

# اجازه HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# بررسی وضعیت
sudo ufw status
```

## 📊 مرحله 10: نظارت و نگهداری

### 10.1 بررسی وضعیت سرویس‌ها
```bash
# وضعیت PM2
pm2 status
pm2 logs

# وضعیت Nginx
sudo systemctl status nginx

# وضعیت PostgreSQL
sudo systemctl status postgresql

# استفاده از منابع سیستم
htop
df -h
free -h
```

### 10.2 دستورات مفید PM2
```bash
# مشاهده logs
pm2 logs persian-ecommerce

# راه‌اندازی مجدد
pm2 restart persian-ecommerce

# توقف
pm2 stop persian-ecommerce

# حذف
pm2 delete persian-ecommerce

# نظارت realtime
pm2 monit
```

### 10.3 پشتیبان‌گیری
```bash
# اسکریپت backup پایگاه داده
cat > /home/deploy/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U deploy persian_ecommerce > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /home/deploy/uploads

# حذف backup های قدیمی (بیش از 7 روز)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

# اجازه اجرا
chmod +x /home/deploy/backup.sh

# تست backup
./backup.sh

# اضافه کردن به crontab (هر روز ساعت 2 شب)
crontab -e
# اضافه کردن:
0 2 * * * /home/deploy/backup.sh
```

## 🔄 مرحله 11: Deploy کردن آپدیت‌ها

### 11.1 اسکریپت deploy
```bash
cat > /home/deploy/deploy.sh << 'EOF'
#!/bin/bash
echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build project
npm run build

# Apply database changes
npm run db:push

# Restart application
pm2 restart persian-ecommerce

echo "Deployment completed!"
EOF

chmod +x /home/deploy/deploy.sh
```

### 11.2 استفاده از deploy script
```bash
./deploy.sh
```

## 🚨 عیب‌یابی مسائل رایج

### مشکل 1: اپلیکیشن start نمی‌شود
```bash
# بررسی logs
pm2 logs persian-ecommerce

# بررسی متغیرهای محیطی
cat .env

# بررسی اتصال پایگاه داده
psql -U deploy -d persian_ecommerce -c "SELECT 1;"
```

### مشکل 2: خطای 502 Bad Gateway
```bash
# بررسی وضعیت Node.js
pm2 status

# بررسی Nginx logs
sudo tail -f /var/log/nginx/error.log

# بررسی تنظیمات Nginx
sudo nginx -t
```

### مشکل 3: مشکل آپلود فایل
```bash
# بررسی permissions
ls -la /home/deploy/uploads

# تنظیم permissions
chmod 755 /home/deploy/uploads
```

### مشکل 4: حافظه کم
```bash
# افزایش swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 📋 چک‌لیست نهایی

- [ ] سرور آماده شده
- [ ] Node.js نصب شده
- [ ] PostgreSQL تنظیم شده
- [ ] پروژه کلون/آپلود شده
- [ ] وابستگی‌ها نصب شدند
- [ ] متغیرهای محیطی تنظیم شدند
- [ ] پایگاه داده schema اعمال شد
- [ ] پروژه build شده
- [ ] PM2 تنظیم شده
- [ ] Nginx نصب و تنظیم شده
- [ ] SSL نصب شده
- [ ] Firewall تنظیم شده
- [ ] Backup تنظیم شده
- [ ] دسترسی از اینترنت تست شده

## 🎯 نتیجه

پس از تکمیل همه مراحل، اپلیکیشن شما در آدرس دامنه‌تان در دسترس خواهد بود. برای پشتیبانی و عیب‌یابی، همیشه logs PM2 و Nginx را بررسی کنید.

**تبریک! اپلیکیشن فروشگاهی فارسی شما با موفقیت روی VPS راه‌اندازی شد! 🎉**

---

## 📞 نکات مهم امنیتی

1. **رمزهای قوی**: همیشه از رمزهای پیچیده استفاده کنید
2. **به‌روزرسانی منظم**: سیستم و وابستگی‌ها را به‌روز نگه دارید
3. **نظارت**: logs را مرتب بررسی کنید
4. **Backup**: از پشتیبان‌گیری منظم غافل نشوید
5. **SSH Key**: از SSH key authentication استفاده کنید بجای password

برای سوالات بیشتر، به مستندات رسمی هر سرویس مراجعه کنید.