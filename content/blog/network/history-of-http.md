---
title: 'HTTP의 역사'
date: 2022-06-07
category: 'network'
draft: false
---

## HTTP란 무엇인가?

HTTP는 **Hypertext** Transfer Protocol의 약자로, 이름에서 알 수 있듯이 처음엔 하이퍼텍스트 문서(링크를 통해 서로 다른 문서들을 연결한 문서)를 주고받기 위해 설계된 프로토콜입니다. 그래서 최초의 HTTP 버전은 오직 HTML 문서만 주고 받을 수 있었습니다.

하지만 사람들이 HTTP를 사용하다 보니, "HTML 말고 다른 이미지 같은 데이터도 주고 받을 수 있을 것 같은데?" 라고 생각하여 이후의 HTTP 버전에선 실제로 여러 타입의 데이터를 주고 받을 수 있게 되었습니다. 그래서 사실 현시점에서 생각해보자면 HTTP의 "H"는 큰 상관관계가 없다고 할 수 있습니다.

또한 일반적으로 HTTP는 TCP/IP 프로토콜 위에서 동작하는데, 사실 굳이 TCP가 아니어도 됩니다. 엄밀히 말해 HTTP는 TCP 뿐만 아니라 "reliable"한 프로토콜이면 무엇이든지 상관없습니다. 실제로 HTTP/3는 UDP를 기반으로 동작하는 [QUIC](https://en.wikipedia.org/wiki/QUIC) 프로토콜을 기반으로 동작합니다.

## HTTP의 역사

HTTP는 1989년에 [Tim Berners-Lee](https://en.wikipedia.org/wiki/Tim_Berners-Lee) 선생님을 필두로 CERN 기관의 연구자들이 개발하였습니다. 연구원이다 보니 논문을 읽을 일이 잦았는데, 논문이 단순한 텍스트로 되어 있어 논문에 첨부된 참고 문헌을 일일이 찾아 읽는 것이 번거롭다는 문제가 있었습니다. 이러한 문제를 해결하기 위해 문서를 *링크*로 연결할 수 있는 HTML 이라는 문서 양식을 개발하였고 네트워크를 통해 이 HTML을 주고 받을 수 있도록 고안한 프로토콜이 바로 HTTP 입니다. 여담으로, *하이퍼 텍스트*라는 개념은 1960년대 부터 있었지만 당시에는 기술의 한계로 이를 구현할 수 없었고 80년대에 인터넷이 발전하면서 비로소 이를 구현할 수 있게 되었다고 합니다.

### HTTP/0.9

1991년에 나온 최초의 HTTP 명세로, 0.9라는 버전 명은 원래부터 있었던 것은 아니고 이후에 붙여진 것입니다. TCP/IP 위에서 동작하고 기본 포트는 80번을 사용하는, `GET` 요청만 사용할 수 있는 아주 단순한 프로토콜로서, 클라이언트가 서버에 요청하면 서버는 HTML 형식의 메시지를 응답한 뒤 연결을 종료하는 형태로 동작한다고 명시했습니다.

HTTP/0.9의 요청 형식은 아래와 같이 `GET 자원경로↵` 뿐이었으며, 이때 ↵는 캐리지 리턴(optional)과 라인 피드를 나타냅니다:

```
GET /page.html↵
```

또한 요청은 idempotent(즉, 동일한 요청에 대해 항상 동일한 응답을 리턴)한 특성을 가지며, 연결이 종료된 이후에 서버는 요청에 관한 어떠한 정보도 저장하지 말 것을 명시하고 있습니다. 이것이 바로 HTTP가 "stateless"한 프로토콜이라 불리는 이유이죠! 그리고 심지어 0.9버전에선 HTTP 헤더조차 존재하지 않았습니다.

### HTTP/1.0

HTTP/0.9가 나온 이후로 수많은 사용자들이 HTTP를 사용했지만, 기능이 매우 제한적이었기 때문에 대부분의 웹 서버들은 0.9버전 스펙에는 명시되지 않은 여러 기능들을 자체적으로 구현하여 사용하고 있었습니다. 이에 1996년 5월, [HTTP Working Group](https://httpwg.org/)에서 이러한 기능들을 문서화하여 발표하였는데 이것이 바로 HTTP/1.0 입니다. 사실 HTTP/1.0은 새로운 기능을 정의하기보다는, 이미 기존에 사람들이 구현해서 사용하던 기능들을 모아 문서화한 것에 가깝습니다.

HTTP/1.0에서 추가된 기능을 살펴보면,

- HTTP 헤더가 추가되었습니다.
  - 헤더 이름, 콜론(:), 헤더 값으로 구성되며 헤더 이름은 case-insensitive 입니다.
- `HEAD`, `POST`가 추가되었습니다.
  - `HEAD`는 리소스를 다운받지 않고도 HTTP 헤더와 같은 메타 데이터를 요청할 수 있도록 한 메서드입니다.
  - `POST`는 클라이언트가 서버에게 데이터를 보낼 수 있도록 한 메서드입니다. FTP와 같은 프로토콜을 통해 서버에 직접 파일을 추가할 필요 없이, POST 메서드를 이용하여 파일을 포함한 여러 데이터를 전송할 수 있게 되었습니다.
- HTTP 요청에 `HTTP/1.0`과 같이 HTTP 버전을 명시할 수 있도록 하였습니다. 하위 호환성을 위해 버전을 명시하지 않으면 0.9버전으로 간주합니다.
- HTTP 상태 코드가 추가되었습니다.
  - HTTP/0.9에선 에러를 HTML에 담아 전달했어야 했는데, HTTP/1.0에선 상태 코드를 통해 요청 성공·실패 등의 여부를 명시할 수 있게 되었습니다 (물론 이외에도 여러 정보를 명시할 수 있습니다).

HTTP/1.0 요청 및 응답을 예로 들면 아래와 같습니다:

```
GET /page.html HTTP/1.0↵
Header1: Value1↵
Header2: Value2↵↵


HTTP/1.0 200 OK
Content-Type: text/html

<html>
  <p>Hello, world!</p>
</html>
```

이때, 위에서 볼 수 있듯이 HTTP/1.0 버전의 응답은 `HTTP 버전, 상태 코드, 상태 코드 설명`으로 구성됩니다.

### HTTP/1.1

1997년 1월에 최초로 HTTP/1.1 스펙이 공개되었으며, 이후 여러 차례 개정되었습니다. HTTP/0.9 스펙 문서가 약 700자로 구성되었던 것에 비해 HTTP/1.1은 약 100,000자로 1.1버전에 관한 내용을 상세히 다루려면 책 한 권을 써야 할 정도가 되었습니다.

따라서 HTTP/1.1에 추가된 내용을 간략히 살펴보자면,

- `HOST` 요청 헤더를 반드시 포함하도록 합니다.
- 지속 연결 기능이 추가되었습니다.
- 파이프라이닝 기능이 추가되었습니다.
- `PUT`, `OPTIONS`, `DELETE` 등의 메서드가 추가되었습니다.
- 캐시를 제어할 수 있는 메커니즘이 추가되었습니다.
- HTTP 쿠키가 추가되었습니다.
- 기타 등등...

여기선 `HOST` 헤더, 지속 연결, 파이프라이닝에 대해서만 살펴보겠습니다.

#### HOST 요청 헤더

HTTP 요청을 보낼 땐 `https://www.google.com/index.html`과 같은 절대 경로가 아니라 `/index.html`처럼 상대 경로를 명시합니다. 이는 HTTP가 만들어졌을 땐 웹 서버 하나당 오직 하나의 웹 사이트만 호스팅하고 있었기 때문에 굳이 절대 경로를 명시할 필요가 없었기 때문인데요, 하지만 요즘엔 [가상 호스팅(virtual hosting)](https://en.wikipedia.org/wiki/Virtual_hosting)이라고 해서 하나의 서버에서 여러 개의 도메인을 호스팅할 수도 있습니다. 이 때문에 상대 경로뿐만 아니라 어떤 도메인에 접속하는지를 명시해줄 필요가 생겼고, 이전 버전과의 하위 호환성을 위해 절대 경로를 명시하는 방식 대신 `HOST` 헤더에 도메인을 명시하는 방식으로 구현되었습니다:

```
GET / HTTP/1.1
HOST: www.google.com
```

HTTP/1.1에서 `HOST` 요청 헤더를 포함하지 않는 경우, 서버는 해당 요청을 무시해야 합니다. 물론 대부분의 서버가 `HOST` 헤더 없이도 알아서 잘 동작하도록 구현되어 있긴 하지만 HTTP/1.1을 사용하는 경우 `HOST` 헤더를 명시하는 것이 바람직합니다.

#### 지속 연결

원래 HTTP는 요청할 때마다 새로운 TCP 연결을 생성하고, 응답을 마치면 연결을 종료하는 방식으로 동작합니다. HTTP로 전송하는 데이터가 많지 않았던 초창기엔 딱히 별문제가 없었지만, 웹이 발전하면서 웹 사이트 하나를 표시하는데 수십·수백 개의 자원을 요청하다 보니 이러한 방식이 문제가 되었습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/history-of-http/short_lived_connections.png" alt="HTTP short-lived 연결" />
  <figcaption>HTTP short-lived 연결.</figcaption>
</figure>

따라서 HTTP/1.1부터는 기존에 연결한 TCP 연결을 재사용하는 지속 연결 기능을 지원합니다. (사실 이 기능은 비록 스펙에는 포함되지 않았으나 HTTP/1.0 시절에도 지원하는 서버가 많았다고 합니다). 이 기능은 `Connection` 요청 헤더에 `Kee-Alive`라는 값을 명시함으로써 사용할 수 있는데, 사실 HTTP/1.1에선 이 기능이 디폴트이기 때문에 굳이 헤더로 명시하지 않아도 기본적으로 지속 연결을 사용합니다.

물론, 서버 자원이 무한대가 아니므로 연결을 무한정 유지하는 것은 아니고 timeout을 설정하여 연결된 소켓에 I/O 요청이 마지막에 종료된 시점으로부터 설정한 timeout 시간 동안 연결을 유지합니다. 물론 설정한 timeout 이내에 또 다른 요청이 들어오면 계속해서 연결을 유지합니다.

이를 그림으로 나타내면 아래와 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/history-of-http/persistent_connection.png" alt="HTTP 지속 연결" />
  <figcaption>HTTP 지속 연결.</figcaption>
</figure>

만약 서버에서 연결을 종료하고자 한다면 아래와 같이 `Connection: close` 응답 헤더를 명시해야 합니다:

```
HTTP/1.1 200 OK
Connection: close
```

#### 파이프라이닝

기본적으로 HTTP 요청은 순차적으로 전송됩니다. 즉, 이전 요청의 응답을 받은 이후에야 다음번 요청을 보낼 수 있는 것이죠. 이러한 방식은 네트워크 latency로 인해 지연이 크게 발생할 수도 있습니다.

이러한 단점을 극복하기 위해, HTTP/1.1에는 하나의 연결을 통해 앞선 요청의 응답을 기다리지 않고 여러 요청을 순차적으로 보낸 다음 요청 순서대로 응답받는(뒤에 보낸 요청에 대한 응답이 먼저 올 수도 있으니까요!) 파이프라이닝 기술을 도입했습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/history-of-http/http_pipelining.png" alt="HTTP 파이프라이닝" />
  <figcaption>HTTP 파이프라이닝.</figcaption>
</figure>

하지만 실제로 대부분의 모던 브라우저에선 이러한 파이프라이닝 기술을 사용하지 않는데요, 그 이유는

- 이를 제대로 지원하지 않는 프록시 서버가 존재하고,
- 제대로 구현하기 어렵고,
- 앞선 요청을 기다리지 않고 순차적으로 보낼 수 있긴 하지만 여전히 HOL(Head-of-line blocking)문제가 존재하기 때문입니다. 즉, 예를 들어 첫 번째 요청의 응답이 아직 도착하지 않았다면 두 번째 요청의 응답을 내려줄 수 있는 상황임에도 불구하고 첫 번째 요청의 응답이 도착할 때까지 기다려야 하는 문제가 있습니다.

이러한 문제로 인해 HTTP/1.1의 파이프라이닝 기술은 HTTP/2의 멀티플렉싱 기술로 대체되어 실제로는 거의 사용되지 않습니다.

### HTTP/2

작성 중...

## 레퍼런스

- [HTTP/2 in Action | Manning Publications](https://www.manning.com/books/http2-in-action)
- [RFC 2616 - Hypertext Transfer Protocol -- HTTP/1.1](https://datatracker.ietf.org/doc/html/rfc2616)
- [Evolution of HTTP - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Evolution_of_HTTP)
- [Connection management in HTTP/1.x - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Connection_management_in_HTTP_1.x)
