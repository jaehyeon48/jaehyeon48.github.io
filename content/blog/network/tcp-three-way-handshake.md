---
title: 'TCP 3-way & 4-way handshake'
date: 2022-05-19
category: 'network'
draft: false
---

TCP는 연결 지향(connection-oriented) 프로토콜이므로 TCP를 이용하여 데이터를 주고받기 위해선 먼저 클라이언트와 서버 간에 논리적인 연결이 수립되어야 합니다. 이 포스트에서는 어떠한 절차를 거쳐 TCP 연결을 맺는지, 그리고 어떠한 절차를 거쳐 TCP 연결을 끊는지 살펴보겠습니다.

## TCP 3-way handshake

우선, TCP 3-way handshake 과정을 그림으로 살펴보면 아래와 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/tcp-three-way-handshake/tcp_3_way_handshake.png" alt="TCP 3-way handshake" />
  <figcaption>TCP 3-way handshake.</figcaption>
</figure>

1. 클라이언트가 서버로 `SYN 세그먼트`를 보냅니다. `SYN 세그먼트`는 헤더의 `SYN` 필드의 비트가 1로 설정된 세그먼트로, 애플리케이션의 데이터는 포함되지 않습니다. 이때, 클라이언트의 seq 초기값(client\_isn)으로 사용할 난수(random number)가 `SYN 세그먼트` 헤더의 sequence number 필드에 포함됩니다. `SYN 세그먼트`를 보낸 클라이언트는 `SYN_SENT` 상태가 됩니다.
2. `SYN 세그먼트`를 받은 서버는 `SYN_RCVD` 상태가 되고, 해당 클라이언트와의 TCP 통신에서 사용할 버퍼 및 변수(e.g. 윈도우 크기)등을 초기화합니다. 그런 다음, 클라이언트의 `SYN 세그먼트` 에 대한 응답으로 헤더의 `SYN`과 `ACK` 필드의 비트가 1로 설정된 `SYNACK 세그먼트`를 클라이언트에 전송하는데, `SYNACK 세그먼트` 헤더의 acknowledgement number 필드에 클라이언트로부터 받은 seq 값에 대한 응답인 ack 값(client\_isn + 1)과, 서버의 seq 초기값(server\_isn)으로 사용할 난수를 sequence number 필드에 담아 전송합니다. `SYN 세그먼트`와 마찬가지로 `SYNACK 세그먼트`에도 애플리케이션의 데이터는 포함되지 않습니다.
3. `SYNACK 세그먼트` 를 받은 클라이언트는 해당 서버와의 TCP 통신에서 사용할 버퍼와 변수를 초기화하고, `SYNACK 세그먼트`를 통해 받은 값(server_isn)에 1을 더한 값을 ack 값으로 해서 `ACK 세그먼트`에 포함하여 서버에 전송합니다. 클라이언트의 상태가 `ESTABLISHED`로 바뀌고, 이제부터는 TCP 연결이 생성된 상태이므로 `ACK 세그먼트`를 서버에 전송할 때 애플리케이션의 데이터도 포함하여 전송할 수 있습니다. `ACK 세그먼트`의 `SYN` 필드는 0, `ACK` 필드는 1로 세팅됩니다.
4. 클라이언트로부터 `ACK 세그먼트`를 받은 서버는 `ESTABLISHED` 상태가 되고 클라이언트와 맺은 TCP 연결을 통해 데이터를 주고 받을 수 있게 됩니다.

### TCP 2-way handshake 대신 3-way handshake를 사용하는 이유?

기본적으로, TCP는 양방향 통신(bi-directional)이고, seq 및 ack number를 통해 데이터를 올바르게 주고받았는지 체크합니다. 이때 만약 3-way 대신 2-way로 진행하게 된다면, 클라이언트는 자신의 존재를 알리고(SYN) 그에 대한 서버의 응답(SYNACK)을 받을 수 있지만 서버는 자신의 존재를 알린 뒤(SYNACK) 이에 대한 클라이언트의 응답을 받지 못하게 되므로 TCP를 통해 데이터를 reliable 하게 보낼 수 있는지 판단하지 못하게 됩니다 (즉, 클라이언트가 자신의 존재를 제대로 알았는지 확인하지 못함). 따라서 3-way handshake를 통해 양측 모두 자신의 존재를 알리고 이에 대한 확답을 받은 뒤 통신을 수행하게 됩니다.

## TCP 4-way handshake

TCP 연결을 종료할 때도 3-way handshake와 비슷하게 4-way handshake 방식을 사용하여 연결을 종료합니다. TCP 연결을 맺은 클라이언트 혹은 서버 누구라도 연결을 종료할 수 있습니다.

TCP 4-way handshake 과정을 그림으로 살펴보면 아래와 같습니다. 여기선 클라이언트가 먼저 연결 종료 요청을 보냈다고 가정해보겠습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/tcp-three-way-handshake/tcp_4_way_handshake.png" alt="TCP 4-way handshake" />
  <figcaption>TCP 4-way handshake.</figcaption>
</figure>

1. 클라이언트가 TCP 연결 종료를 위해 `FIN` 헤더 필드가 1로 세팅된 `FIN 세그먼트`를 서버에 보내고, `FIN_WAIT_1` 상태가 됩니다.
2. 클라이언트로부터 `FIN 세그먼트`를 받은 서버는 `ACK 세그먼트`를 보내 응답하고 `CLOSE_WAIT` 상태가 됩니다. 서버로부터 `ACK 세그먼트`를 받은 클라이언트는 `FIN_WAIT_2` 상태가 됩니다.
3. 이후 서버에서 연결을 종료할 준비가 완료되면(이전에 수행되고 있던 통신이 완전히 끝나면) `FIN 세그먼트`를 보내고 서버는 `LAST_ACK` 상태가 됩니다.
4. 서버로부터 `FIN 세그먼트`를 받은 클라이언트는 서버에게 `ACK 세그먼트`를 보내 응답하고 `TIME_WAIT` 상태가 됩니다.
5. 클라이언트로부터 `ACK 세그먼트`를 받은 서버는 `CLOSED` 상태가 됩니다.
6. `ACK 세그먼트`를 보낸 클라이언트는 일정 시간(기본값은 240초) 기다린 후 연결을 종료합니다. 이때 일정 시간을 기다렸다가 종료하는 이유는, `ACK 세그먼트`가 유실될 경우를 대비해서 기다리는 것인데, 만약 `ACK 세그먼트`를 보낸 다음 바로 연결을 종료해버리면 클라이언트가 보낸 `ACK 세그먼트`가 유실될 경우 서버에선 `FIN 세그먼트`가 유실된 줄 알고 `FIN 세그먼트`를 재전송하게 됩니다. 하지만 이미 클라이언트는 연결을 종료해버렸기 때문에 재전송된 `FIN 세그먼트`는 버려지게 되는데, 이에 따라 서버에서는 클라이언트로부터 `ACK 세그먼트`가 오질 않으니 `FIN 세그먼트`가 유실된 줄 알고 계속해서 `FIN 세그먼트`를 재전송하는 현상이 발생할 수 있습니다. 따라서 이러한 현상을 방지하고자 `ACK 세그먼트`를 보낸 뒤 일정 시간 기다렸다가 최종적으로 TCP 연결을 종료하게 됩니다.
7. TCP 연결이 완전히 종료되면 TCP 통신을 위해 할당되었던 모든 자원의 할당 해제가 이뤄집니다.
