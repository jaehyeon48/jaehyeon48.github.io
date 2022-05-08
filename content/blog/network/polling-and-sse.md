---
title: '폴링, 롱폴링, HTTP 스트리밍, SSE'
date: 2022-05-08
category: 'network'
draft: false
---

현재 실시간 양방향 통신을 구현할 때 흔히 사용하는 기술은 [웹소켓](./websocket-protocol) 기술입니다. 이 포스트에선 웹소켓이 등장하기 전에 (실시간) 양방향 통신을 구현하던 방법인 폴링과 롱폴링, 스트리밍, 그리고 양방향 통신은 아니지만 실시간 단방향 통신 기술인 SSE에 대해 간략히 알아보겠습니다.

## 폴링

**폴링(Polling)** 기술은 전통적인 AJAX 애플리케이션에서 사용되던 방식으로, 주기적으로 HTTP 요청을 서버에 날려서 데이터를 받아오는 방식입니다. 즉, 일정 간격마다 요청이 이뤄지며, 클라이언트는 새로운 데이터가 있든 없든 응답을 받고 일정 시간 기다렸다가 다음 요청을 날리고 응답받고, 또 기다렸다가 다음 요청을 날리고 응답받고 …와 같은 방식으로 동작합니다. 

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/polling-and-sse/http_polling.png" alt="HTTP 폴링" />
  <figcaption>HTTP 폴링.</figcaption>
</figure>

스포츠의 문자 중계 기능과 같이, 새로운 데이터가 일정한 간격으로 생성되는 경우엔 폴링이 효과적일 수 있습니다. 하지만 코인 가격 데이터와 같이 데이터가 짧은 간격마다 계속해서 업데이트되는 경우엔 비효율적일 수 있는데 그 이유는:

- 실시간성을 최대화하고자 요청을 보내는 간격을 줄이자니 요청 수가 많아져서 서버에 부담이 가게 됩니다. 특히 요청을 보낼 때 HTTP 헤더 또한 같이 전송되므로 클라이언트가 요청 간격을 줄이게 되면 그만큼 서버가 받는 부하가 커지게 됩니다.
- 반대로 서버 부담을 덜고자 간격을 늘리게 되면 실시간성이 떨어지는 문제가 있습니다.

이를 어느 정도 해소하고자 나온 기술이 롱 폴링 기법입니다.

## 롱 폴링

**롱 폴링(Long-polling)** 기술 또한 기본적으로 폴링 방식과 유사하게 HTTP 요청을 주기적으로 날려서 데이터를 받아오는 방식입니다. 하지만 폴링과 달리 롱 폴링의 경우 서버에 요청을 날렸을 때 응답해줄 데이터가 없다면 일정 시간 기다리다가 데이터가 생기면 그때서야 응답해주는 방식입니다 (혹은 타임아웃이 발생하면 빈 응답을 보낼 수도 있습니다). 그리고 응답을 받은 클라이언트는 일반적으로 곧장 다음 요청을 서버에 보냅니다 (물론 일정 시간 기다린 이후에 보낼 수도 있습니다).

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/polling-and-sse/http_long_polling.png" alt="HTTP 롱 폴링" />
  <figcaption>HTTP 롱 폴링.</figcaption>
</figure>

또한, HTTP 연결 재사용 기능을 활용하여 매 롱 폴링 요청마다 TCP/IP 연결을 새로 맺어야 하는 오버헤드를 줄일 수 있습니다 (이는 폴링의 경우에도 적용되지만 일반적으로 요청 사이의 간격이 더 짧은 롱 폴링의 경우에 특히 효과를 볼 수 있습니다).

하지만 롱 폴링의 경우, 폴링과 마찬가지로 어쨌든 HTTP 요청을 계속해서 날리는 것이므로 HTTP 헤더에 의한 오버헤드가 존재합니다.데이터가 빈번하게 업데이트되는 상황에선 폴링방식과 별다른 차이가 없게 됩니다. 데이터 업데이트가 빈번한 경우 클라이언트는 요청 즉시 응답을 받게 되고, 바로 이어서 다시 요청을 보내 응답을 받게 되고, 또 바로 이어서 다시 요청을 보내 응답을 받고 … 와 같은 상황이 발생하기 때문입니다.

## HTTP 스트리밍

**HTTP 스트리밍(HTTP Streaming)** 방식은 요청에 대한 응답을 완료하지 않은채(즉, 서버에서 요청을 계속해서 열어둔채로) 데이터를 계속해서 클라이언트로 푸시하는 방식입니다. 매번 응답을 할 때마다 곧 이어 다시 요청해야 하는 (롱)폴링 방식에 비해 효율적이며, 서버의 상태 변경이 잦은 경우에 유리한 방식입니다. 일반적으로 `Content-Length`, `Transfer-Encoding`, `End of File` 응답 헤더 등을 이용하여 응답 데이터의 크기를 명시할 수 있습니다.

## SSE

단방향 통신 기술인 **SSE(Server Sent Events)**는 처음부터 효율적으로 설계되었습니다. SSE 또한 HTTP를 기반으로 동작하는 기술이지만, 폴링·롱 폴링과는 달리, SSE는 서버가 원할 때 언제든 클라이언트로 데이터를 보낼 수 있습니다. 여기서 "서버가 원할 때"는 일반적으로 새로운 데이터가 생겼을 때를 의미하겠죠?

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/polling-and-sse/server_sent_events.png" alt="SSE" />
  <figcaption>SSE.</figcaption>
</figure>

SSE는 웹소켓 프로토콜이 제공하는 양방향 통신 기능 대신, SNS 친구들의 상태 정보, 주식 시세, 뉴스 피드와 같이 굳이 클라이언트가 서버로 데이터를 보낼 필요가 없는 경우 적합한 기술입니다.

## 레퍼런스

- [RFC 6202 - Known Issues and Best Practices for the Use of Long Polling and Streaming in Bidirectional HTTP](https://datatracker.ietf.org/doc/html/rfc6202)
- [Stream Updates with Server-Sent Events - HTML5 Rocks](https://www.html5rocks.com/en/tutorials/eventsource/basics/)
- [Polling vs SSE vs WebSocket— How to choose the right one | by Bharathvaj Ganesan | codeburst](https://codeburst.io/polling-vs-sse-vs-websocket-how-to-choose-the-right-one-1859e4e13bd9)
