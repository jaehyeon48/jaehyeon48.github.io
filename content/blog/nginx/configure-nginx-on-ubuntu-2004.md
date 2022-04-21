---
title: 'Ubuntu 20.04에서 Nginx 설치 및 설정하기'
date: 2022-04-21
category: 'nginx'
draft: false
---

이 포스트는 프로젝트를 배포하는 과정에서 참고한 여러 개의 포스트를 종합한 글입니다.

## Ubuntu 20.04에 Nginx 설치하기

1. **Nginx 설치**

```bash
sudo apt update
sudo apt install nginx
```

2. **방화벽 설정**

```bash
sudo ufw app list
```

위 명령을 실행하면 아래와 같은 리스트가 출력됩니다:

```bash
Available applications:
  Nginx Full
  Nginx HTTP
  Nginx HTTPS
  OpenSbash
```

각 설정이 의미하는 바는 다음과 같습니다:

- **Nginx HTTP**: 포트 80번만 허용
- **Nginx HTTPS**: 포트 443번만 허용
- **Nginx Full**: 포트 80, 443번 허용

방화벽 설정을 적용하는 방법은 다음과 같습니다:

```bash
sudo ufw allow 'Nginx HTTP'
```

이후 아래 명령어를 입력하여 상태를 체크합니다:

```bash
sudo ufw status
```

```bash
Status: active

To                         Action      From
--                         ------      ----
Nginx HTTP                 ALLOW       Anywhere
Nginx HTTP (v6)            ALLOW       Anywhere (v6)
```

만약 방화벽이 `inactive` 상태라면 아래 명령어를 입력하여 활성화 합니다:

```bash
sudo ufw enable
```

3. **Nginx 상태 체크**

위 과정을 거치면 우분투가 Nginx를 실행합니다. 이때 아래 명령어를 실행하여 정상적으로 실행 중인지 체크할 수 있습니다:

```bash
systemctl status nginx
```

```bash
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2022-04-20 09:03:47 UTC; 24h ago
       Docs: man:nginx(8)
   Main PID: 20596 (nginx)
      Tasks: 2 (limit: 1147)
     Memory: 5.4M
     CGroup: /system.slice/nginx.service
             ├─20596 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
             └─20597 nginx: worker process
```

또한, 브라우저 주소창에 서버의 ip 혹은 도메인 이름을 입력하여 아래와 같은 기본 Nginx 랜딩 페이지가 표시되는지 살펴봅니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/configure-nginx-on-ubuntu-2004/welcome_to_nginx.png" alt="Nginx 랜딩 페이지" />
  <figcaption>Nginx 랜딩 페이지.</figcaption>
</figure>

위 랜딩 페이지가 표시된다면 Nginx가 정상적으로 동작하고 있다는 뜻입니다.

4. **Nginx 프로세스 관리 명령어**


```bash
# 시작
sudo systemctl start nginx

# 종료
sudo systemctl stop nginx

# 재시작
sudo systemctl restart nginx

# 리로드 (변경된 설정을 적용하는 경우 사용. 기존 연결을 끊지 않음.)
sudo systemctl reload nginx

# 기본적으로 서버 시작 시 nginx가 자동으로 실행되는데, 이를 막고 싶은 경우
sudo systemctl disable nginx

# 서버 시작 시 자동으로 nginx를 실행하고 싶은 경우
sudo systemctl enable nginx
```

5. **서버 블록 설정**

```bash
# 1. 디렉토리 생성:
sudo mkdir -p /var/www/도메인 이름/html

# 2. 소유자 설정:
sudo chown -R $USER:$USER /var/www/도메인 이름/html

# 3. 권한 설정:
sudo chmod -R 755 /var/www/도메인 이름

# 4. index.html 생성:
sudo vi /var/www/도메인 이름/html/index.html

# 5. 서버 블록 생성:
sudo vi /etc/nginx/sites-available/도메인 이름

# 아래 내용 입력:
server {
    listen 80;
    listen [::]:80;

    root /var/www/도메인 이름/html;
    index index.html index.htm index.nginx-debian.html;

    server_name 도메인 이름 www.도메인 이름;

    location / {
        try_files $uri $uri/ =404;
    }
}

# 6. 심볼릭 링크 생성:
sudo ln -s /etc/nginx/sites-available/도메인 이름 /etc/nginx/sites-enabled/

# 7. nginx.conf 파일 설정:
sudo vi /etc/nginx/nginx.conf

# 아래 내용으로 수정:
...
http {
    ...
    server_names_hash_bucket_size 64;
    ...
}
...

# 8. 설정 파일에 문법 오류가 없는지 검사:
sudo nginx -t

# 9. Nginx 재시작:
sudo systemctl restart nginx
```

이제 브라우저 주소 창에 `http://도메인 이름`을 입력하면 아까 생성한 `index.html` 의 내용이 표시됩니다.

## HTTPS 적용

📌 HTTPS를 적용하고자 하는 경우, 반드시 등록된 도메인이 있어야 하고, 도메인에 대한 A 레코드가 존재해야 합니다. 또한, 위에서 설정했던 내용들이 적용되어 있어야 합니다.

1. **Certbot 설치**

```bash
sudo apt install certbot python3-certbot-nginx
```

2. **방화벽에서 HTTPS 허용**

```bash
sudo ufw allow 'Nginx Full' # HTTP와 HTTPS 모두 허용
sudo ufw delete allow 'Nginx HTTP' # 기존의 HTTP 허용 설정 제거
```

3. **SSL 인증서 발급**

```bash
sudo certbot --nginx -d 도메인 이름 -d www.도메인 이름
```

이때, 만약 처음으로 `certbot`을 실행하는 경우라면 이메일을 입력하라는 문구와 약관 동의 안내창이 뜰것입니다. 이 과정을 진행하면 `certbot`은 Let's Encrypt 서버와 통신하여 여러분이 입력한 도메인이 유효한지 체크하는 과정을 거칩니다.

체크에 성공하면 `certbot`은 아래와 같이 HTTPS 설정을 어떻게 할 것인가를 물어보게 됩니다:

```
Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: No redirect - Make no further changes to the webserver configuration.
2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
new sites, or if you're confident your site works on HTTPS. You can undo this
change by editing your web server's configuration.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-2] then [enter] (press 'c' to cancel):
```

위 두 가지 옵션 중 하나를 선택하시고 엔터를 누르면 아래와 같은 메시지가 뜨면서 설정이 업데이트되고 Nginx가 재시작됩니다:

```bash
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/example.com/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/example.com/privkey.pem
   Your cert will expire on 2020-08-18. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot again
   with the "certonly" option. To non-interactively renew *all* of
   your certificates, run "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

이제 `/etc/nginx/sites-available/도메인 이름` 파일에 접속해 보면 자동으로 적용된 설정을 보실 수 있으실 겁니다.

4. **Certbot 자동 갱신 확인하기**

Let's Encrypt의 인증서는 90일 동안 유효합니다. 다행히도 `certbot` 패키지는 타이머를 설정하여 하루에 두 번 체크한 뒤 인증서 만료 기간이 30일 이내라면 자동으로 갱신합니다.

이 타이머의 상태는 아래의 명령어를 통해 체크할 수 있습니다:

```bash
sudo systemctl status certbot.timer
```

```bash
● certbot.timer - Run certbot twice daily
     Loaded: loaded (/lib/systemd/system/certbot.timer; enabled; vendor preset: enabled)
     Active: active (waiting) since Mon 2020-05-04 20:04:36 UTC; 2 weeks 1 days ago
    Trigger: Thu 2020-05-21 05:22:32 UTC; 9h left
   Triggers: ● certbot.service
```

자동 갱신 과정을 테스트하려면 아래의 명령어를 이용할 수 있습니다:

```bash
sudo certbot renew --dry-run
```

## HTTP/2 적용

📌 HTTP/2를 적용하고자 하는 경우, 반드시 등록된 도메인과 서버에 TLS 설정이 적용되어 있어야 합니다.

1. **HTTP/2 옵션 켜기**

```bash
# 설정 파일 열기
sudo vi /etc/nginx/sites-enabled/도메인 이름

# 아래 내용 입력 ('http2' 단어 추가)

...
    listen [::]:443 ssl http2 ipv6only=on; 
    listen 443 ssl http2; 
...

# 설정 파일 문법 체크
sudo nginx -t
```

2. **안전하지 않은 Cipher Suite 제거**

```bash
# 설정 파일 열기
sudo vi /etc/nginx/sites-enabled/도메인 이름

# 아래 내용 주석 처리 (혹은 제거)
include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot<^>

# 이후 위 라인 바로 밑에 아래 내용 추가
ssl_ciphers EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
```

만약 self-signed 인증서를 사용하는 경우, 아래의 과정또한 수행합니다:

```bash
# 설정 파일 열기
sudo nano /etc/nginx/snippets/ssl-params.conf

# 아래 내용 찾기
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;

# 위 내용을 아래 내용으로 바꾸기
ssl_ciphers EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
```

설정 과정이 끝나면 Nginx 설정을 적용합니다:
```bash
sudo systemctl reload nginx
```

3. **HSTS(HTTP Strict Transport Security) 설정하기** 

기존에도 HTTP 연결을 HTTPS로 리다이렉트 한다고 하더라도, [HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) 설정을 통해 반드시 HTTPS로만 통신하도록 강제할 수 있습니다.

```bash
# 설정 파일 열기
sudo vi /etc/nginx/sites-enabled/도메인 이름

# 'ssl_ciphers' 설정을 포함하는 서버 블록에 아래 라인 추가
add_header Strict-Transport-Security "max-age=31536000" always;
```

기본적으로 위 헤더는 서브도메인에 대해선 적용되지 않습니다. 만약 서브도메인에도 HSTS를 적용하고 싶다면 `includeSubDomains` 값을 추가하면 됩니다:

```bash
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## 레퍼런스

- [How To Install Nginx on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04)
- [How To Secure Nginx with Let's Encrypt on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04)
- [How To Set Up Nginx with HTTP/2 Support on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-with-http-2-support-on-ubuntu-20-04)
