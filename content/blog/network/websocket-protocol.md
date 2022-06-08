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
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/polling-and-sse/compare_poll_ws.gif" alt="폴링과 웹 소켓 비교" />
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

## 웹 소켓 프레임

웹 소켓 통신을 위한 handshake 과정을 무사히 거쳤다면, 이제부터 클라이언트와 서버는 언제든지 서로 데이터를 주고받을 수 있는 상태가 됩니다.

클라이언트와 서버가 웹 소켓을 통해 데이터를 주고받을 때, *메시지*라는 개념적인 단위로 주고받습니다. 그리고 이 메시지는 실제로 한 개 이상의 **프레임**으로 구성되어 있습니다. 이 섹션에선 프레임에 대해 자세히 살펴봅시다.

|📌|
|-|
|프록시와 같은 매개체에 혼선을 주는 것을 방지하고, 보안을 강화하기 위해 클라이언트는 TLS 적용 여부와 관계 없이 서버로 보내는 모든 프레임을 *반드시* 마스킹(masking)해야 합니다 (좀 더 정확히 말하자면 프레임에 포함된 payload를 마스킹하는 것입니다). 만약 서버에서 클라이언트로부터 마스킹 되지 않은 프레임을 받았다면 즉시 웹 소켓 연결을 종료해야 합니다. 반대로, 서버는 클라이언트로 보내는 모든 프레임에 대해 *반드시* 마스킹을 *적용하지 않아야* 합니다. 만약 클라이언트에서 서버로부터 마스킹 된 프레임을 받았다면 즉시 웹 소켓 연결을 종료해야 합니다.|

### 웹 소켓 프레임 구조

웹 소켓 프레임의 구조를 그림으로 나타내면 아래와 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/websocket-protocol/websocket_frame_structure.png" alt="웹 소켓 프레임 구조" />
  <figcaption>웹 소켓 프레임 구조.</figcaption>
</figure>

- **FIN**: 어떤 웹 소켓 메시지의 마지막 부분임을 나타냅니다. 물론, 메시지가 하나의 프레임으로 구성된 경우 첫 번째 프레임이자 동시에 마지막 프레임일 수 있습니다. 크기는 1비트입니다.
- **RSV1, RSV2, RSV3**: 웹 소켓 확장에서 0이 아닌 값에 대해 따로 정의를 하지 않은 경우 무조건 0이어야 합니다. 만약 웹 소켓 확장에서 정의하지 않은 0 이외의 값이 저장되어 있다면 이 프레임을 받는 주체(클라이언트 혹은 서버)는 반드시 웹 소켓 연결을 끊어야 합니다. 크기는 각각 1비트입니다.
- **Opcode**: payload를 어떻게 해석할지를 나타냅니다. 만약 알 수 없는 opcode가 지정된 경우, 이 프레임을 받는 주체는 반드시 웹 소켓 연결을 끊어야 합니다. 크기는 4비트이고 opcode의 값에는 아래의 종류가 존재합니다:
  - `0x0`: 프레임이 이전 프레임과 이어짐을 나타냅니다.
  - `0x1`: payload 데이터가 UTF-8 인코딩 텍스트 형식임을 나타냅니다.
  - `0x2`: payload 데이터가 바이너리 형식임을 나타냅니다.
  - `0x3 ~ 0x7`: 프로토콜에 차후 추가될 non-control 프레임을 위해 예약된 코드입니다.
  - `0x8`: 연결 종료를 나타냅니다 (Close 프레임).
  - `0x9`: "ping" 신호를 나타냅니다.
  - `0xA`: "pong" 신호를 나타냅니다.
  - `0xB ~ 0xF`: 프로토콜에 차후 추가될 non-control 프레임을 위해 예약된 코드입니다.
- **MASK**: payload가 마스킹 되었는지를 나타냅니다. 값이 1인 경우, 추후 unmasking에 사용될 마스킹 key값이 `masking-key`에 저장됩니다. 클라이언트가 서버로 보내는 모든 프레임은 이 값이 1입니다. 크기는 1비트입니다.
- **Payload length**: payload의 바이트 크기를 나타냅니다. 크기는 유동적인데, 값에 따라 아래와 같이 해석됩니다:
  - **125 이하인 경우**: 값 자체가 payload의 크기를 나타냅니다. 예를 들어, `Payload length` 부분의 값이 82인 경우 payload의 크기는 82라는 뜻입니다.
  - **126인 경우**: payload의 크기는 이어지는 2바이트의 값을 16비트 unsigned integer 형식으로 해석한 값입니다. 즉, `Payload length` 부분의 값이 126이라면 이어지는 2바이트에 저장된 값을 16비트 unsigned integer 형으로 해석한 값이 payload의 크기가 된다는 뜻입니다.
  - **127인 경우**: payload의 크기는 이어지는 8바이트의 값을 64비트 unsigned integer 형식으로 해석한 값입니다. 즉, `Payload length` 부분의 값이 127이라면 이어지는 8바이트에 저장된 값을 64비트 unsigned integer 형식으로 해석한 값이 payload의 크기가 된다는 뜻입니다.
- **Masking-key**: 클라이언트에서 서버로 전송되는 모든 프레임은 32비트 값을 이용하여 마스킹 되는데, 마스킹 될 때 사용된 key를 나타냅니다. 크기는 `MASK`의 값이 0인 경우 0, `MASK`의 값이 1인 경우 4바이트입니다.
- **Payload data**: 클라이언트와 서버가 주고받는 실제 데이터를 의미합니다. Payload 데이터는 확장에서 사용되는 Extension 데이터와 앱에서 사용되는 Application 데이터로 다시 나뉩니다.

## 연결 종료하기

웹 소켓을 연결할 때 opening handshake 과정을 거쳤던 것처럼, 연결을 종료할 때도 closing handshake 과정을 거칩니다. 하지만 연결 종료를 위한 handshake 과정은 opening handshake 보다는 훨씬 간단합니다 😀

웹 소켓 연결 종료는 클라이언트, 서버 중 연결 종료를 원하는 곳에서 연결 종료를 위한 Close 프레임을 전송함으로써 이뤄집니다 (opcode가 "8"인 프레임). 이 컨트롤 프레임에는 추가로 연결을 종료하는 이유 등의 정보가 포함될 수 있습니다.

클라이언트 혹은 서버에서 Close 프레임을 보내 웹 소켓 연결을 종료하고자 한다면, 반대 측에선 그에 대한 응답으로 똑같이 Close 프레임을 전송합니다. 이때 현재 전송 중인 메시지가 있다면 Close 프레임 응답을 늦출 순 있지만, 이미 Close 프레임을 보낸 반대 측에서 해당 데이터를 처리할지는 알 수 없습니다. 최종적으로 웹 소켓 연결이 종료되면 곧이어 TCP 연결 또한 종료됩니다.

## 🏓 Ping, Pong

웹 소켓 프로토콜에는 웹 소켓 연결이 정상적으로 유지되고 있는지를 살펴보기 위해 ping-pong 메커니즘을 사용합니다. 한쪽에서 ping 프레임을 전송하면 다른 한쪽에서 ping 프레임을 받는 즉시 pong 프레임을 전송(응답)하는 형식으로 동작하는 것이죠.

이때, ping 프레임은 Opcode가 "9"인 컨트롤 프레임, pong 프레임은 Opcode가 "10"인 컨트롤 프레임입니다.

## 레퍼런스

- [RFC 6202 - Known Issues and Best Practices for the Use of Long Polling and Streaming in Bidirectional HTTP](https://datatracker.ietf.org/doc/html/rfc6202)
- [RFC 6455 - The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [javascript.info - WebSocket](https://javascript.info/websocket)
- [HTML5 Web Socket in Essence - CodeProject](https://www.codeproject.com/Articles/209041/HTML5-Web-Socket-in-Essence)