---
title: '동일 출처 정책(SOP)과 CORS'
date: 2022-05-10
category: 'Web'
draft: false
---

이 포스트에선 브라우저의 보안 정책인 동일 출처 정책(Same-Origin Policy)과, CORS(Cross-Origin Resource Sharing)에 대해 알아보겠습니다.

## Origin 이란?

그 전에 먼저 **출처(origin)**란 무엇인가에 대해 살펴보겠습니다. 우선, URL의 구성 요소를 살펴보면 아래 그림과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/sop-and-cors/components_of_url.png" alt="URL의 구성 요소." />
    <figcaption>URL의 구성 요소.</figcaption>
</figure>

위 그림에 있는 URL의 구성 요소중에서, `scheme`, `domain name`, `port` 세 가지가 합쳐진 것을 origin 이라고 합니다. 이때 포트 번호의 경우, `http://domain.com`과 같이 생략되어 있다면 기본 포트를 기준으로 하고(HTTP의 경우 80, HTTPS의 경우 443), 만약 위 그림과 같이 포트가 명시되었다면 명시된 포트 번호를 기준으로 합니다. 각 origin을 비교한 예시를 들면 다음과 같습니다:

- ✔️ `scheme`, `domain`, `port`가 동일한 경우:
  - **ht<span>tp://</span>example.com**/app1/index.html *vs.* **ht<span>tp://</span>example.com**/app2/index.html
  - **ht<span>tp://</span>example.com:80**/app1/index.html *vs.* **ht<span>tp://</span>example.com**/app2/index.html
  - **ht<span>tps://</span>example.com:8080**/app1/index.html *vs.* **ht<span>tps://</span>example.com:8080**/app2/index.html
- ❌ `scheme`이 다른 경우:
  - **ht<span>tp**://</span>example.com *vs.* **ht<span>tps**://</span>example.com
- ❌ `domain`이 다른 경우:
  - ht<span>tps://</span>**www.example.com** *vs.* ht<span>tps://</span>**hello.example.com**
- ❌ `port`가 다른 경우:
  - ht<span>tps://</span>example.com**:8080** *vs.* ht<span>tps://</span>example.com

## Same-Origin Policy, SOP

대부분의 브라우저는 다른 누군가(remote party)를 대신하여 많은 동작들을 수행하는데, 대표적인 예로 서버에 의한 리디렉션이라던지, 혹은 외부 서버로부터 다운받은 스크립트 파일에게 DOM을 제공하여 조작할 수 있게끔 합니다. 이때 만약 어떠한 보안 메커니즘도 없다면 브라우저에서 돌아가는 웹 애플리케이션들은 악의적인 공격에 무방비한 상태로 노출되게 될 것입니다. 누구나 손쉽게 개발자 도구를 열어 DOM을 살펴볼 수 있고, 네트워크 탭을 통해 어떤 서버와 통신하는지 알 수 있고, 또 소스 코드를 살펴볼 수도 있으니 브라우저 환경은 꽤 위험하다고 할 수 있습니다.

이런 상황에서 출처가 서로 다른 애플리케이션끼리 통신하는 데에 아무런 제약이 없다면 악의적인 사용자가 [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery) 혹은 [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting) 등의 공격을 통해 다른 사용자의 민감한 정보를 손쉽게 탈취할 수 있을 것입니다.

이러한 이유로, 브라우저는 출처가 동일한 경우에만 리소스를 공유할 수 있게 제한하고 있습니다. 이 정책이 바로 **동일 출처 정책(Same-Origin Policy, SOP)**인데, 말 그대로 "동일한 출처(origin)"에서만 리소스를 공유할 수 있게끔 제한하는 브라우저의 보안 정책입니다.

SOP 정책이 어떤 것을 허용하고, 어떤 것을 못하게 제한하는지 살펴보자면 아래와 같습니다:

- **script**: 다른 출처(cross-origin)의 스크립트를 문서에 삽입(embed)하는 것은 가능하지만, `fetch API` 등을 이용하여 다른 출처로 요청을 날리는 것은 불가능합니다.
- **css**: `<link>` 혹은 `@import`로 다른 출처의 css를 삽입할 수 있습니다. 이때 올바른 `Content-Type` 헤더가 설정되어야 할 수도 있습니다.
- **iframe**: [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) 응답 헤더가 `DENY` 혹은 `SAMEORIGIN`이 아닌 이상, 일반적으로 다른 출처의 iframe을 삽입하는 것은 가능합니다. 하지만 자바스크립트 등을 이용하여 다른 출처의 iframe에 접근하는 것은 불가능합니다.
- **form**: `<form>` 태그의 `action` 속성값으로 출처가 다른 URL을 사용할 수 있습니다. 즉, 다른 출처로 폼 데이터를 전송하는 것이 가능합니다.
- **image**: 다른 출처의 이미지를 삽입하는 것은 가능합니다. 하지만 자바스크립트 등을 이용하여 다른 출처의 이미지를 읽는 것은 불가능합니다 (e.g. 자바스크립트를 이용하여 다른 출처의 이미지를 `<canvas>`에 삽입하는 경우)
- **multimedia**: 다른 출처의 오디오·비디오를 삽입할 수 있습니다.

## Cross-Origin Resource Sharing, CORS

방금 살펴본 SOP 정책으로 인해 다른 출처의 자원을 사용할 수 없습니다. 이는 악의적인 사이트가 다른 사이트의 정보를 읽을 수 없게 된다는 장점이 있지만, 유효한 요청 또한 막아버린다는 단점도 있습니다.

웹 환경은 개방되어 있다는 특성이 있습니다. 즉, 출처가 서로 다른 곳에서 리소스를 가져와서 사용하는 행위는 상당히 빈번한데, 보안상의 이유로 이러한 것들을 모두 막아버리면 웹 애플리케이션이 원활히 동작하기 힘들게 될 것입니다.

따라서, 출처가 다른 리소스를 사용할 수 있도록 하는 몇 가지 예외 조항이 있는데, 그중 하나가 바로 **CORS 정책을 지킨 리소스 요청**입니다. 다시 말해, CORS 정책을 지킨다면 SOP에서 기본적으로 제한하고 있는 행위들의 적용을 받지 않게 된다는 뜻입니다.

그럼 CORS가 어떻게 동작하는지를 한번 살펴봅시다.

우선, 기본적으로 웹 애플리케이션이 출처가 다른 곳에 요청할 때 요청 헤더에 `Origin` 이라는 필드를 함께 보냅니다:

```
Origin: https://www.google.com
```

이후, 서버가 응답할 때 `Access-Control-Allow-Origin` 이라는 응답 헤더 필드에 허용하고자 하는 출처를 명시합니다. 예를 들어, 출처가 `https://my-server.com`인 서버에서 `https://www.google.com` 로 부터 오는 리소스 요청을 허용하고자 한다면, 응답 헤더에 `Access-Control-Allow-Origin: https://www.google.com` 을 설정하여 응답하게 됩니다. 그리고 응답을 받은 브라우저는 자신이 보냈던 요청의 `Origin`과 서버 응답의 `Access-Control-Allow-Origin` 값이 일치하는지를 살펴보고, 일치하면 출처가 다른 요청일지라도 유효한 요청으로 보고 받아온 리소스를 사용할 수 있게 합니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/sop-and-cors/cors_headers_example.png" alt="Origin, Access-Control-Allow-Origin 헤더 예시" />
    <figcaption>Origin, Access-Control-Allow-Origin 헤더 예시.</figcaption>
</figure>

⚠️ 이때 SOP도 그렇고 CORS도 마찬가지로, 이들은 **브라우저의 정책**이라는 점입니다. 즉, 다른 출처의 리소스를 사용하는 것을 제한하는 것은 서버가 아니라 브라우저라는 점, 다시 말해 만약 서버에 CORS 정책을 위반한 요청을 날렸을 때 이를 차단하는 것은 서버가 아니라 브라우저라는 점입니다. 서버는 정상적으로 요청을 받아 응답하지만, 이후 응답을 받은 브라우저에서 이를 분석하여 CORS 정책을 위반한 경우라면 이를 차단하는 것입니다. 이와 같은 이유로, 브라우저에선 CORS 정책으로 인해 차단되는 요청도 [Postman](https://www.postman.com/)과 같이 브라우저가 아닌 환경(혹은 서버 끼리 통신)에선 통신이 원활하게 이뤄질 수 있습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/sop-and-cors/violated_cors_request.png" alt="CORS 정책을 위반한 요청의 흐름" />
    <figcaption>CORS 정책을 위반한 요청의 흐름.</figcaption>
</figure>

## CORS 설정과 관련된 헤더들

CORS 정책은 `Origin` 및 `Access-Control-` 헤더들을 통해 제어할 수 있습니다. CORS와 관련된 헤더들에는 어떤 것들이 있는지 살펴보겠습니다.

### 요청 헤더

#### Origin

`Origin` 헤더는 출처가 다른 요청 혹은 preflight 요청의 출처를 나타냅니다. 값이 `null` 일 수도 있으며, 출처가 다른 요청의 경우 항상 `Origin` 헤더가 전송됩니다.

#### Access-Control-Request-Method

preflight 요청을 보낼 때, 서버에게 실제 요청의 HTTP 메서드 정보를 알려주는 역할을 합니다.

#### Access-Control-Request-Headers

preflight 요청을 보낼 때, 서버에게 실제 요청의 HTTP 헤더 정보를 알려주는 역할을 합니다.

### 응답 헤더

#### Access-Control-Allow-Origin

리소스에 접근할 수 있는 출처를 명시합니다. 오직 하나의 출처를 명시하거나, 와일드카드(`*`)를 사용할 수 있습니다. 단, 인증 정보(credential)를 사용하는 경우 와일드카드를 사용할 수 없고, *반드시* 하나의 출처를 명시해야만 합니다. 인증 정보를 사용하는 요청에 와일드카드를 사용하게 되면 에러가 발생합니다.

이때, 헤더 값으로 와일드카드가 아니라 하나의 출처를 명시하는 경우, 출처를 `Vary` 헤더에도 명시하여 클라이언트에게 출처에 따라 응답이 달라질 수 있음을 명시해야 합니다.

#### Access-Control-Expose-Headers

기본적으론 브라우저의 스크립트에 노출되지는 않지만, 브라우저 스크립트에서 접근할 수 있도록 허용하는 헤더를 지정합니다. 기본으로 노출되는 헤더들은 아래와 같습니다:

- `Cache-Control`
- `Content-Language`
- `Content-Length`
- `Content-Type`
- `Expires`
- `Last-Modified`
- `Pragma`

위 헤더 이외에, 커스텀 헤더를 포함하여 추가로 헤더를 스크립트에서 접근할 수 있도록 하고자 할 땐 `Access-Control-Expose-Headers` 응답 헤더를 사용하면 됩니다.

#### Access-Control-Max-Age

preflight 요청이 얼마 동안 캐시 될지를 나타낼 때 사용됩니다. 이 헤더 값의 단위는 `초` 입니다.

파이어폭스의 경우 최대값은 `86,400초`(24시간), 크롬(Chromium)의 경우 버전 76 이전에는 최대 `600초`(10분), 버전 76 부터는 최대 `7,200초`(2시간)로 제한하고 있습니다.

#### Access-Control-Allow-Credentials

요청의 인증 모드(e.g. fetch API의 `credentials`)가 `include`인 경우, 응답을 브라우저의 스크립트에서 접근할 수 있도록 허용할지를 나타낼 때 사용됩니다. 즉, `credentials`가 `include`인 요청의 경우 `Access-Control-Allow-Credentials` 헤더 값이 `true` 이어야만 스크립트에서 응답에 접근할 수 있습니다. 이때 인증 정보(credential)에는 HTTP 쿠키, 인증 헤더, TLS 클라이언트 인증서 등이 포함됩니다.

#### Access-Control-Allow-Methods

preflight 요청에 대한 응답에 사용되는 헤더로, 이후 본 요청에서 어떤 HTTP 메서드를 사용할 수 있는지를 나타낼 때 사용됩니다. 하나 이상의 HTTP 메서드를 `,` 로 구분하여 명시할 수 있으며, 와일드카드 또한 사용 가능하지만 인증 정보를 사용하는 요청의 경우, "모든 HTTP 메서드 허용"으로 해석되는 것이 아니라 문자 그대로 "'*' 메서드 허용"으로 해석됩니다. 따라서 인증 정보를 사용하는 경우에는 와일드카드 대신 HTTP 메서드를 구체적으로 명시하는 것이 바람직합니다.

#### Access-Control-Allow-Headers

`Access-Control-Request-Headers` 헤더를 포함하는 preflight 요청에 대한 응답에 사용되는 헤더로, 이후 본 요청에서 어떤 HTTP 헤더를 사용할 수 있는지를 나타낼 때 사용됩니다. `Access-Control-Request-Headers` 요청 헤더가 존재하는 경우 반드시 응답 헤더에 `Access-Control-Allow-Headers` 를 포함해야 합니다.

`Access-Control-Allow-Methods`와 유사하게, 하나 이상의 HTTP 헤더를 `,` 로 구분하여 명시할 수 있고, 와일드카드 또한 사용 가능하지만 인증 정보를 사용하는 경우에는 "모든 HTTP 헤더 허용"이 아니라 "'*' 헤더 허용"으로 해석됩니다.

## CORS의 상세한 동작 흐름

사실 CORS가 동작하는 시나리오는 앞서 살펴본 한 가지가 아니라 크게 세 가지로 나뉩니다. 이들을 각각 살펴보겠습니다.

### 1. 간단한 요청인경우 (Simple Request)

아래의 조건을 *모두* 만족하는 HTTP 요청은 **간단한 요청(simple request)**로 간주됩니다:

- HTTP 메서드가 아래 세 가지 중 하나인 경우:
  - `GET`
  - `HEAD`
  - `POST`
- 브라우저에 의해 자동으로 설정되는 헤더(e.g. `Connection`, `User-Agent`)등을 제외하고, 요청 헤더가 아래 목록에 나와있는 것만 설정된 경우:
  - `Accept`
  - `Accept-Language`
  - `Content-Language`
  - `Content-Type`의 경우, 헤더값이 아래 셋 중 하나이어야 함:
      - `application/x-www-form-urlencoded`
      - `multipart/form-data`
      - `text/plain`

위 조건을 만족하는 요청은 별다른 절차 없이 다른 출처에 HTTP 요청을 보낼 수 있습니다. 이 경우, 일단 요청을 보내고 응답을 받은 뒤 해당 요청이 CORS를 만족하는지를 체크합니다.

### 2. 복잡한 요청인경우 (Complex Request)

간단한 요청 이외의 요청을 **복잡한 요청(complex request)**라고 하는데, 이 경우 본 요청을 보내기 전에 [preflight 요청](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflighted_requests)을 보내서 다른 출처에 해당 요청을 보낼 수 있는지 점검한 뒤, 보낼 수 있다고 확인을 받으면 그제야 본 요청을 서버에 보냅니다.

preflight 요청은 `OPTION` HTTP 메서드를 사용하며, 일반적으로 아래와 같이 생겼습니다:

```
OPTIONS /data HTTP/1.1
Origin: https://example.com
Access-Control-Request-Method: DELETE
```

이를 받은 서버에선 아래와 같이 허용하는 출처와 허용하는 메서드, preflight 요청을 얼마 동안 캐시 할 것인지 등에 관한 정보를 응답합니다:

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, DELETE, HEAD, OPTIONS
Access-Control-Max-Age: 86400
```

이에 대한 흐름을 그림으로 나타내면 아래와 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/sop-and-cors/preflight_request.png" alt="preflight 요청 흐름" />
    <figcaption>preflight 요청 흐름.</figcaption>
</figure>

이때, preflight 요청의 성공/실패 여부, 즉 preflight 요청에 대한 응답이 성공(200 OK)인지, 혹은 실패(400번대 코드)인지의 여부와 CORS 위반 에러는 별 상관이 없다는 점에 주의하세요. 브라우저가 CORS 정책 위반 여부를 판단하는 시점이 preflight 응답을 받은 이후일 뿐만 아니라, `Origin` 값과 `Access-Control-Allow-Origin`의 값이 같냐 다르냐를 토대로 CORS 정책 위반 여부를 판별하는 것이지 preflight 요청 자체의 성공/실패 여부를 토대로 판별하는 것이 아닙니다.

이렇게 preflight 요청에 담은 `Origin` 헤더 값과 preflight 응답으로 부터 받아온 `Access-Control-Allow-Origin` 헤더 값을 비교하여, CORS 정책을 위반했다면 이후 실제 요청은 전송되지 않습니다.

### 3. Credential을 포함한 요청일경우

마지막은 credential, 즉 HTTP 쿠키와 같이 인증 정보를 포함하는 요청을 보내는 경우입니다. 기본적으로 `fetch` 등의 요청 API는 다른 출처에 요청하는 경우엔 쿠키 정보나 인증과 관련된 헤더를 요청에 포함하지 않습니다. 만약 요청에 포함하고자 한다면 `credentials` 옵션을 사용하면 되는데, 이 옵션에는 3개의 값이 존재합니다:

- `same-origin`: 기본값으로, 같은 출처 간 요청에만 인증 정보를 포함합니다.
- `include`: 다른 출처에 요청하는 경우에도 항상 인증 정보를 포함하도록 합니다.
- `omit`: 인증 정보를 절대 포함하지 않도록 합니다.

이때, 다른 출처에 인증 정보를 포함하여 요청을 보내는 경우, 서버 측에선 반드시 `Access-Control-Allow-Credentials` 응답 헤더 값을 `true`로 설정해야 하고, `Access-Control-Allow-Origin` 헤더 값에 `*` (모든 출처를 허용) 대신 반드시 하나의 출처를 명시해야 합니다.

## 레퍼런스

- [RFC 6454 - The Web Origin Concept](https://datatracker.ietf.org/doc/html/rfc6454)
- [Same-origin policy - web.dev](https://web.dev/same-origin-policy/#what-is-permitted-and-what-is-blocked)
- [Cross-Origin Resource Sharing (CORS) - web.dev](https://web.dev/cross-origin-resource-sharing/)
- [Cross-Origin Resource Sharing (CORS) - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CORS는 왜 이렇게 우리를 힘들게 하는걸까? | Evans Library](https://evan-moon.github.io/2020/05/21/about-cors/)
