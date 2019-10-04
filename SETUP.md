Create droplet

```
ssh root@run.bothrs.com
```

```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
add-apt-repository ppa:certbot/certbot -y
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

sudo apt update
sudo apt install mysql-server nodejs yarn nginx python-certbot-nginx -y
sudo apt upgrade -y
sudo apt autoremove -y

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw status
sudo ufw --force enable

sudo mysql_secure_installation
sudo mysql
```

Create and save password in Lastpass
```
CREATE USER 'spelfun'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON spelfun.* TO 'spelfun'@'localhost' WITH GRANT OPTION;
CREATE DATABASE IF NOT EXISTS `spelfun` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `spelfun`;
exit
```

```
sudo nano /etc/nginx/sites-available/run.bothrs.com
```

```
server {
    listen 80;
    listen [::]:80;
    server_name run.bothrs.com;

    location / {
        proxy_pass http://localhost:19098;
        proxy_http_version 1.1;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Nginx-Proxy true;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/run.bothrs.com /etc/nginx/sites-enabled/

sudo mkdir /var/www/run.bothrs.com/

sudo adduser node
sudo adduser ward
sudo adduser thomas
sudo chown -R node: /var/www/run.bothrs.com
sudo chmod -R 770 /var/www/run.bothrs.com
sudo usermod -aG sudo ward
sudo usermod -aG sudo thomas
sudo usermod -aG node ward
usermod -aG node thomas
rsync --archive --chown=ward:ward ~/.ssh /home/ward
rsync --archive --chown=thomas:thomas ~/.ssh /home/thomas
rsync --archive --chown=node:node ~/.ssh /home/node
```

```
sudo nginx -t && sudo service nginx restart && sudo certbot --nginx
sudo sed -i 's/443 ssl/443 ssl http2/g' /etc/nginx/sites-available/run.bothrs.com
sudo service nginx restart
```

```
su node
cd /home/node
mkdir run.git
cd run.git
git init --bare --shared=group
git config core.sharedRepository group
git config receive.denyNonFastforwards false
#git --work-tree=/var/www/run.bothrs.com --git-dir=/home/node/run.git remote add origin git@gitlab.com:bothrs.com/run.git
#git --work-tree=/var/www/run.bothrs.com --git-dir=/home/node/run.git status
#git --work-tree=/var/www/run.bothrs.com --git-dir=/home/node/run.git branch
#git --work-tree=/var/www/run.bothrs.com --git-dir=/home/node/run.git fetch
#git --work-tree=/var/www/run.bothrs.com --git-dir=/home/node/run.git checkout -f master
echo -e "NODE_ENV=production\nPORT=19098" > /var/www/run.bothrs.com/.env
nano /home/node/run.git/hooks/post-receive
```

```
#!/bin/bash
function deploy {
  if [[ $ref = refs/heads/$1 ]];
  then
    echo "Deploy: $1 to $2" >> /home/node/log-run.log
    git --work-tree=$2 --git-dir=/home/node/run.git checkout -f $1
    cd $2
    yarn deploy
  fi
}

while read oldrev newrev ref
do
  echo "" >> /var/www/log-run.log
  date >> /var/www/log-run.log
  echo "New ref $ref" >> /var/www/log-run.log
  deploy master /var/www/run.bothrs.com
done
```

```
chmod +x /home/node/run.git/hooks/post-receive
```

workflow

```
make changes to code
commit changes
push changes
(autodeploy)
```

```
sudo npm install pm2@latest -g
pm2 startup systemd
```

```
# Local machine
git clone git@gitlab.com:bothrs.com/run.git
git remote add droplet node@run.bothrs.com:run.git
git push droplet master

# 
git remote add droplet git@gitlab.com:bothrs.com/run.git
```

