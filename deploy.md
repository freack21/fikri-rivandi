# Deployment Guide: Ubuntu 26.04 (VPS) with NVM & Nginx

This guide walks you through deploying your React (Vite) portfolio to an Ubuntu VPS (like 26.04) using Nginx as the web server and NVM to manage Node.js versions.

## Prerequisites
- Root or sudo access to your Ubuntu VPS.
- Your domain name pointed to your VPS IP address (optional but recommended).
- Git installed on your VPS.

## Step 1: Install NVM and Node.js
First, let's install NVM (Node Version Manager) so you can easily install and manage Node.js.

```bash
# 1. Download and install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 2. Load NVM into your current shell session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Install the latest LTS version of Node.js
nvm install --lts

# 4. Verify installation
node -v
npm -v
```

## Step 2: Clone and Build the Project
Now, we'll clone your repository and build the production-ready static files.

```bash
# 1. Navigate to the directory where you want to store your project
cd /var/www

# If you don't have permissions, you might need to create the folder and change ownership:
# sudo mkdir -p /var/www
# sudo chown -R $USER:$USER /var/www

# 2. Clone your repository (replace with your actual repo URL)
git clone https://github.com/freack21/fikri-rivandi.git portfolio

# 3. Enter the project directory
cd portfolio

# 4. Install dependencies
npm install

# 5. Build the Vite project
npm run build
```
This will create a `dist` folder containing your static website files.

## Step 3: Install and Configure Nginx
Nginx will be used to serve the static files generated in the `dist` folder.

```bash
# 1. Install Nginx
sudo apt update
sudo apt install nginx -y

# 2. Start and enable Nginx to run on boot
sudo systemctl enable nginx
sudo systemctl start nginx
```

Now, let's create a server block configuration for your portfolio.

```bash
# Open a new configuration file in nano
sudo nano /etc/nginx/sites-available/portfolio
```

Paste the following configuration into the file. (Replace `yourdomain.com` with your actual domain, or use your server's IP address if you don't have a domain).

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name yourdomain.com www.yourdomain.com; # Or your VPS IP address

    root /var/www/portfolio/dist;
    index index.html;

    # Gzip compression for faster loading
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        # This allows React Router (if used) to handle URLs properly
        try_files $uri $uri/ /index.html;
    }

    # Optional: Cache static assets like images, CSS, and JS
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webp)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }
}
```

Save and close the file (`Ctrl+O`, `Enter`, `Ctrl+X`).

## Step 4: Enable the Site and Restart Nginx
Enable your new configuration and test Nginx for syntax errors.

```bash
# 1. Create a symlink to sites-enabled
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# 2. Test the Nginx configuration
sudo nginx -t

# 3. If the test is successful, restart Nginx
sudo systemctl restart nginx
```

## Step 5: (Optional) Secure with SSL / HTTPS
If you are using a custom domain, you should secure your site with HTTPS using Certbot (Let's Encrypt).

```bash
# 1. Install Certbot and the Nginx plugin
sudo apt install certbot python3-certbot-nginx -y

# 2. Run Certbot to automatically configure SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the prompts, and Certbot will automatically update your Nginx configuration to support HTTPS.

---
**Done!** Your portfolio is now live and running beautifully on your Ubuntu VPS. 🚀
