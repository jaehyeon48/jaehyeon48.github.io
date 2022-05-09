---
title: '웹 소켓 프로토콜'
date: 2022-05-09
category: 'network'
draft: false
---

## 등장 배경

[웹 소켓이 등장하기 전에 실시간 통신을 구현하기 위해 사용되던 방식](../polling-and-sse)에는 폴링, 롱폴링, HTTP 스트리밍 기법 등이 있습니다.

하지만 이러한 기법들은 근본적으로 HTTP 프로토콜을 사용하는데, HTTP 프로토콜은 애초에 요청/응답 형태로 동작하는 프로토콜이라서 클라이언트가 요청하지 않으면 서버는 클라이언트에게 응답해줄 수 없습니다. 따라서 서버에서 새로운 데이터가 생성되는 즉시 해당 데이터를 전달받기 위해선 클라이언트는 주기적으로 서버에게 요청을 날려 데이터를 받아와야만 했습니다. 하지만 이렇게 주기적으로 요청을 날리는 방식에선, 서버에서 새로운 데이터가 생성되지 않은 경우 이러한 요청은 무용지물이 되고 오히려 자원만 낭비한 꼴이 됩니다 (빈 응답을 받거나, 기존과 동일한 응답을 받을 테니까요). 또한 매번 연결을 맺었다 끊어야 하고, HTTP 헤더로 인한 오버헤드 또한 무시할 수 없었습니다.

[이 사이트](https://www.codeproject.com/Articles/209041/HTML5-Web-Socket-in-Essence#Background)에 기존의 HTTP 폴링 방식과 웹 소켓을 비교한 자료가 있는데, 이에 따르면 하나의 HTTP 요청/응답의 경우 헤더 크기가 871바이트지만, 웹 소켓의 경우 하나의 메시지를 주고받는데 2바이트 만이 사용되었다고 합니다. 이들의 차이를 차트로 나타내면 아래와 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/websocket-protocol/compare_poll_ws.gif" alt="폴링과 웹 소켓 비교" />
  <figcaption>폴링과 웹 소켓 비교.</figcaption>
</figure>

위 그림의 유즈 케이스 A는 1,000명의 클라이언트가 1초마다 각각 폴링과 웹 소켓을 사용하여 요청을 보낸 경우의 bps, B는 10,000명의 클라이언트, C는 100,000명의 클라이언트인 경우를 나타냅니다. HTTP 헤더 크기에 따라 차이가 나겠지만, 불필요하게 주고받은 데이터 크기는 웹 소켓이 폴링에 비해 최대 1,000배가량 적었고, 레이턴시도 웹 소켓이 폴링의 1/3 수준이었다고 합니다.

이렇듯 기존 폴링 방식의 한계를 극복하고, 꼼수(?)를 사용해서 구현했던 HTTP 기반의 양방향 통신을 대체하기 위해 나온 것이 바로 웹 소켓 프로토콜입니다. 웹 소켓은 HTTP 인프라에서도 잘 동작하도록 설계되었기 때문에, 웹 소켓은 HTTP의 80번, 443번 포트에서도 잘 동작하고 HTTP 프록시와도 잘 연계됩니다. 그렇다고 해서 꼭 웹 소켓을 HTTP와 연계하여 사용할 필요는 없지만요!

## 웹 소켓 프로토콜의 철학

웹 소켓 프로토콜은 TCP 계층 위에서 동작하는 프로토콜로서 기존의 폴링 방식에 비해 양방향 통신을 할 때 오버헤드를 최소화하는 방식으로 설계되었는데, 아래의 규칙들을 따릅니다:

- 웹 소켓은 기존의 브라우저에서 사용되던 동일 근원 정책(origin)을 준수합니다.
- 한 개의 포트 및 IP에다가 여러 개의 연결을 유지하기 위해 주소 및 프로토콜 네이밍을 사용합니다.
- HTTP 등의 프로토콜과 마찬가지로 TCP 위에서 계층화되어 동작하므로 이후 TCP로 데이터를 보내는 것은 동일하지만, 길이에 제한이 없습니다.
- 프록시와 같은 중재자와도 원활하게 동작할 수 있도록 종료(closing) handshake 과정을 사용합니다.

이들이 웹 소켓의 전부입니다. 애초에 웹 소켓은 최대한 오리지널 TCP가깝게 설계되었기 때문에, 기존의 HTTP 서버에서 사용하던 포트를 같이 공유하여 사용할 수도 있고, 프록시 등의 중개자와도 잘 연계하여 동작합니다.

## 웹 소켓 URI

웹 소켓 프로토콜의 URI는 다음과 같이 구성되어 있습니다 (사실상 일반적인 URI와 같습니다):

> ws(s)://호스트[:포트]/경로[?쿼리]

- scheme: 보안 연결을 사용하지 않는 경우 `ws`, 보안 연결을 사용하는 경우 `wss` (`http://`, `https://`와 유사).
- host: 호스트 이름(도메인 이름).
- port(옵션): 명시적으로 지정하지 않는 경우, `ws`는 80번 포트, `wss`는 443번 포트가 사용됨.
- 경로: 자원의 경로.
- 쿼리(옵션): 쿼리 파라미터.

## 웹 소켓 프로토콜 opening handshake

TCP handshake와 흡사하게, 웹 소켓으로 통신하기 위해선 먼저 클라이언트와 서버끼리 opening handshake 과정을 거쳐 웹 소켓 연결을 맺어야 합니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/websocket-protocol/websocket_handshake.png" alt="웹 소켓 handshake" />
  <figcaption>웹 소켓 handshake.</figcaption>
</figure>

웹 소켓 통신을 하기 위해 먼저 클라이언트에서 handshake를 서버로 보내는데, 그 전에 우선 클라이언트는 서버와 연결을 맺고, 맺어진 연결을 기반으로 웹 소켓 handshake를 보냅니다. 이때 보안 연결, 즉 `wss`를 사용하는 경우, 클라이언트에서 handshake를 보내기 전에 TLS handshake를 수행해서 보안 채널을 만들고 이 보안 채널을 통해 이후의 모든 통신 과정이 이뤄져야 합니다. 만약 TLS 연결 맺기에 실패한 경우(e.g. 서버의 인증서가 유효하지 않은 경우 등), 웹 소켓 연결을 맺을 수 없습니다.

이렇게 클라이언트와 서버 간에 연결이 맺어지면 우선 클라이언트에서 아래 예시와 같은 handshake를 서버로 보냅니다:

```
클라이언트에서 보내는 웹 소켓 handshake 예시

GET /chat HTTP/1.1
Connection: Upgrade
Host: server.example.com
Origin: http://example.com
Upgrade: websocket
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
Sec-WebSocket-Extensions: deflate-frame
```

(위 헤더들의 순서가 바뀌어도 상관없으며, 이외의 HTTP 요청 헤더가 더 포함될 수도 있습니다.)

이때 이 handshake 요청은 아래 규칙을 준수해야 합니다:

1. HTTP 프로토콜을 준수하는 반드시 유효한 HTTP 요청이어야 합니다.
2. 요청 메서드는 반드시 `GET` 이어야 하고, HTTP 버전은 반드시 `1.1` 이상이어야 합니다.
3. 요청에 반드시 `HOST` 헤더가 존재해야 하고, 헤더 값이 `호스트이름` (그리고 기본 포트가 아닌 경우 포트도 포함)이어야 합니다.
4. 요청에 반드시 `Upgrade` 헤더가 존재해야 하고, 헤더 값에 `websocket`이 반드시 포함되어야 합니다.
5. 요청에 반드시 `Connection` 헤더가 존재해야 하고, 헤더 값에 `Upgrade` 가 반드시 포함되어야 합니다.
6. 요청에 반드시 `Sec-WebSocket-Version` 헤더가 존재해야 하고, 헤더 값이 반드시 `13` 이어야 합니다.
7. 요청에 반드시 `Sec-WebSocket-Key` 헤더가 존재해야 합니다. 잠시 뒤 보다 자세히 설명하겠습니다.
8. 클라이언트가 브라우저인 경우, `Origin` 헤더가 반드시 존재해야 합니다.

추가적으로, 아래의 내용이 포함될 수 있습니다:

1. `Sec-WebSocket-Protocol` 헤더를 통해 웹 소켓 프로토콜 위에서 동작하는 애플리케이션 레벨 프로토콜을 명시할 수 있습니다 (서브 프로토콜이라고도 합니다). 헤더 값은 위 예시(`chat, superchat`)와 같이 `,`로 구분하며, 선호도가 높은 순으로 명시합니다.
2. `Sec-WebSocket-Extensions`: 클라이언트가 사용하고자 하는 프로토콜 레벨의 확장자를 명시할 수 있습니다.

|📌|
|-|
|자바스크립트로는 위 handshake에서 사용되는 헤더들을 설정할 수 없기 때문에 `XMLHttpRequest` 혹은 `fetch` 로 handshake를 만들어서 보내는 것은 불가능합니다.|

<br />

클라이언트가 보낸 handshake를 서버에서 읽어보고 검증한 뒤(e.g. `Origin`은 올바른지, 웹 소켓 버전은 정확한지, 등등), 유효한 handshake라고 판단하면 클라이언트에게 아래의 예시와 같은 handshake를 보내 최종적으로 웹 소켓 연결을 수립합니다:

```
서버에서 보내는 웹 소켓 handshake 예시

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat
Sec-WebSocket-Extensions: deflate-frame
```

이때, 클라이언트에서와 마찬가지로 서버에서 보내는 handshake 요청 또한 아래 규칙을 준수해야 합니다:

1. 상태코드가 `101 Switching Protocols` 이어야 합니다.
2. `Upgrade` 헤더 필드에 `websocket` 값이 포함되어야 합니다.
3. `Connection` 헤더 필드에 `Upgrade` 값이 포함되어야 합니다.
4. `Sec-WebSocket-Accept` 헤더가 있어야 하고, 이 헤더의 값은 클라이언트 handshake로부터 전달받은 `Sec-WebSocket-Key` 값을 기반으로 만든 값이어야 합니다. 잠시 뒤 자세히 살펴보겠습니다.
5. 클라이언트 handshake에 `Sec-WebSocket-Protocol` 헤더가 있었다면, 클라이언트로부터 넘겨받은 헤더 값 중 서버에서 사용하기로 선택한 프로토콜을 `Sec-WebSocket-Protocol` 헤더 필드에 명시해야 합니다.
6. 클라이언트 handshake에 `Sec-WebSocket-Extensions` 헤더가 있었다면, 클라이언트로부터 넘겨받은 헤더 값 중 서버에서 사용하기로 선택한 하나 이상의 확장을 `Sec-WebSocket-Extensions`에 명시해야 합니다.

이러한 handshake 과정을 끝내면 클라이언트와 서버는 연결된 웹 소켓을 통해 서로 데이터를 주고받을 수 있게 됩니다.

### Sec-WebSocket-Key와 Sec-WebSocket-Accept

앞서 살펴본 `Sec-WebSocket-Key`는 웹 소켓 handshake가 유효한 요청인지, 즉 위조한 요청이 아니라 클라이언트가 정상적으로 보낸 웹 소켓 handshake인지를 확인하는데 사용되는 16바이트 크기의 base64로 인코딩된 임의의 값입니다.

그리고 서버는 `Sec-WebSocket-Key` 헤더를 통해 전달받은 값에 `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` 라는 [GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 값을 붙여서 SHA-1으로 해싱한 후 base64로 인코딩하여 `Sec-WebSocket-Accept` 헤더 필드를 통해 응답합니다.


## 레퍼런스

- [RFC 6202 - Known Issues and Best Practices for the Use of Long Polling and Streaming in Bidirectional HTTP](https://datatracker.ietf.org/doc/html/rfc6202)
- [RFC 6455 - The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [javascript.info - WebSocket](https://javascript.info/websocket)
- [HTML5 Web Socket in Essence - CodeProject](https://www.codeproject.com/Articles/209041/HTML5-Web-Socket-in-Essence)
