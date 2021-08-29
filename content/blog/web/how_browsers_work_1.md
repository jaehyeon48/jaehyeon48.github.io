---
title: '브라우저는 어떻게 동작하는가? Part1'
date: 2020-08-29
category: 'web'
draft: false
---

## 브라우저의 주요 구성 요소

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/browser_components.png" alt="Browser components" />
    <figcaption>https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/</figcaption>
</figure>

1. **유저 인터페이스**: 주소창, 북마크바, 앞/뒤로 가기 버튼 등 사이트 화면이 나오는 곳을 제외한 부분.
2. **브라우저 엔진**: UI와 렌더링 엔진을 제어.
3. **렌더링 엔진**: 요청한 내용(content)을 보여주는 역할을 함. 예를 들어, 요청한 내용이 HTML이라면 HTML(과 CSS)를 파싱하여 화면에 렌더링함.
4. **네트워크**: HTTP 통신과 같은 네트워크 요청을 처리.
5. **UI 백엔드**: 드랍다운 메뉴와 같이 기본적인 위젯을 그림.
6. **자바스크립트 엔진**: 자바스크립트를 분석하고 실행하는데 사용.
7. **데이터 저장소**: 쿠키, localStorage, IndexedDB와 같은 데이터를 저장.

## 브라우저의 여정

브라우저 주소창에 [www.google.com](https://www.google.com)을 치면 어떤 일이 일어나는지를 살펴보자.

### 네비게이션

우선 첫 번째로 일어나는 일은, 올바른 장소를 찾아가는(navigate) 것이다. 특정 웹 페이지를 찾아간다는 말은 해당 페이지에 대한 데이터(asset)가 어디에 있는지를 찾아낸다는 의미이다.

#### DNS LOOKUP

사람한테 웹 페이지란 google.com과 같은 **도메인 이름**이지만, 컴퓨터는 오직 0과 1밖에 모르기 때문에 도메인 이름 "문자열"을 IP 주소로 변환한다. 이렇게 도메인 이름을 IP주소로 변환하는 과정을 **DNS lookup** 이라고 한다.

`www.google.com` 도메인에 대한 DNS 과정을 간략하게 나타내면 다음과 같다:

1. 우선 해당 도메인의 IP주소에 대한 캐시가 있는지 살펴본다.
   1. 제일 먼저 브라우저 캐시부터 살펴본다.
   2. 브라우저 캐시가 없으면 (시스템 콜을 통해) OS캐시를 살펴본다.
   3. OS캐시도 없으면 라우터와 통신하여 라우터 캐시를 살펴본다.
   4. 만약 라우터 캐시도 없으면 ISP의 DNS 서버에 있는 ISP 캐시를 살펴본다.
2. 만약 캐시를 발견하지 못했다면 DNS resolver에게 요청하여 도메인(URL)에 대한 IP 주소를 얻는다.
   1. 우선 resolver가 DNS root 네임서버 (.) 에게 요청한다.
   2. root nameserver는 .com, .net과 같은 TLD DNS 네임서버의 주소를 반환한다. www.google.com을 검색하는 경우, .com TLD DNS 네임서버 주소를 반환하게 될 것이다.
   3. resolver는 이제 TLD 네임서버에게 요청을 보낸다.
   4. TLD 네임서버는 authoritative 네임서버(도메인 네임서버)의 주소를 반환한다. www.google.com의 경우, google.com 네임서버의 주소를 반환하게 될 것이다.
   5. resolver는 마지막으로 authoritative 네임서버에게 요청을 보낸다.
   6. authoritative 네임서버는 요청받은 URL의 IP주소를 반환한다.

실제로 각 레이어마다 캐시를 사용하기 때문에 이 과정은 매우 빠르게 일어난다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/dns_lookup.png" alt="dns_lookup" width="600px" />
    <figcaption>https://www.cloudflare.com/learning/dns/what-is-dns/</figcaption>
</figure>

#### TCP HANDSHAKE

이제 IP 주소를 알아냈으니, 브라우저는 IP 주소에 해당하는 서버와 통신할 준비를 한다. 이 때 서버와 연결을 하기위해 사용되는 프로토콜에는 여러 종류가 있지만, HTTP 요청에는 주로 TCP가 사용된다.

브라우저는 TCP 3-way handshake를 통해 IP 주소에 해당하는 서버와 연결을 한다. 대략적인 과정은 다음과 같다:

1. 클라이언트(브라우저)가 서버에게 새로운 연결을 요청하기 위해 SYN 패킷을 보낸다.
2. 서버가 새로운 연결을 할 수 있는 상태라면, SYN/ACK 패킷을 클라이언트로 보내 SYN 패킷에 대한 응답을 한다.
3. 마지막으로, 클라이언트는 SYN/ACK에 대한 응답으로 ACK 패킷을 서버로 보낸다.

이제 브라우저와 서버끼리 데이터를 주고받을 준비를 마쳤다 (아마도?).

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/three_way_handshake.png" alt="three_way_handshake" width="600px" />
</figure>

#### TLS NEGOTIATION

HTTPS 프로토콜을 사용하는 경우, 서버와 통신을 하기위해 한 가지 과정을 더 거쳐야 한다. HTTPS는 TLS(SSL)을 사용하여 일반적인 HTTP 요청/응답을 암화하 하는 프로토콜이다.

HTTPS를 사용하여 안전한 통신을 하기 위해선 또 다른 handshake 과정을 수행해야만 한다. TLS handshake (TLS negotiation) 과정에선 다음의 일들이 발생한다:

- 어떤 TLS 버전(TLS 1.0, 1.2, 1.3, etc.)를 사용할 것인가를 결정
- 어떤 [cipher suite](https://en.wikipedia.org/wiki/Cipher_suite#:~:text=A%20cipher%20suite%20is%20a,help%20secure%20a%20network%20connection.&text=The%20key%20exchange%20algorithm%20is,encrypt%20the%20data%20being%20sent.)를 사용할 것인가를 결정
- 서버의 공개키(public key)와 SSL certificate의 전자 서명을 통해 서버의 신원을 인증
- handshake 이후 [symmetric encryption](https://www.cryptomathic.com/news-events/blog/symmetric-key-encryption-why-where-and-how-its-used-in-banking#:~:text=Symmetric%20encryption%20is%20a%20type,encrypt%20and%20decrypt%20electronic%20information.&text=This%20encryption%20method%20differs%20from,to%20encrypt%20and%20decrypt%20messages.)를 사용하기 위해 세션키를 생성

TLS handshake가 일어나는 과정은 추후에 따로 살펴보자.

### Fetching

이제 TCP 연결도 마쳤고 (HTTPS의 경우) TLS 설정도 마쳤으니 브라우저는 HTTP 프로토콜을 이용하여 서버로부터 HTML 파일을 받는다.

#### HTTP REQUEST

페이지를 가져오기 위해 [idempotent](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation) (간단히 말하자면, 같은 입력에 대해선 항상 같은 출력이 나온다는 뜻)한 요청을 보낸다. 이 때 HTTP의 `GET` 메소드를 사용한다.

HTTP `GET` 메소드를 간단히 말하자면, 주어진 [URI](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier)가 가리키는 서버의 데이터를 요청하는 것이라고 할 수 있다.

HTTP `GET`을 사용하면 다음과 같이 서버에게 `HTTP REQUEST`를 보낸다:

```
GET / HTTP/2
Host: www.google.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: en-GB,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Upgrade-Insecure-Requests: 1
Cache-Control: max-age=0
TE: Trailers
```

이러한 요청을 받은 서버는 요청과 관련된 헤더와 데이터를 다음과 같이 `HTTP RESPONSE` 형식으로 응답한다:

```
HTTP/2 200 OK
date: Sun, 18 Jul 2021 00:26:11 GMT
expires: -1
cache-control: private, max-age=0
content-type: text/html; charset=UTF-8
strict-transport-security: max-age=31536000
content-encoding: br
server: gws
content-length: 37418
x-xss-protection: 0
x-frame-options: SAMEORIGIN
domain=www.google.com
priority=high
X-Firefox-Spdy: h2
```

이 때 HTML 문서의 소스코드는 response의 body에 포함되어 전달된다.

더 많은 HTTP 메소드에 대해선 [RFC7231 Section 8.1.3](https://datatracker.ietf.org/doc/html/rfc7231#section-8.1.3)을 참고하길 바란다.

\> 2부에 계속...