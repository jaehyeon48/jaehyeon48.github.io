---
title: 'NGINX의 아키텍처'
date: 2022-04-21
category: 'nginx'
draft: false
---

## 왜 아키텍처가 중요한가?

NGINX의 아키텍처를 살펴보기 전에, 우선 아키텍처의 중요성에 대해 간단히 살펴보고 가봅시다.

일반적으로, 프로그램의 기본 베이스는 프로세스와 스레드입니다. (넓은 시각에서 보자면, 프로세스와 스레드는 메모리를 공유하는 정도의 차이 이외엔 거의 같다고 볼 수도 있습니다). 프로세스와 스레드는 CPU 코어에서 실행될 수 있는 명령어들의 모음이라고 볼 수 있는데, 대부분의 복잡한 프로그램들은 여러 개의 프로세스 혹은 스레드를 병렬로 실행합니다. 그 이유는:

- 동시에 더 많은 코어를 사용할 수 있기 때문이고,
- 동시에 여러 개의 연결을 처리하는 것과 같이 어떤 작업을 병렬로 수행하기 쉬워지기 때문입니다.

프로세스와 스레드는 메모리, OS 자원 등을 소모하고, 수시로 CPU 코어에 할당됐다가 해제되기를 반복합니다 (a.k.a 컨텍스트 스위칭). 현대의 서버들은 동시에 수백개의 프로세스/스레드를 다룰 수 있지만, 사용할 수 있는 메모리를 거의 다 사용했거나 I/O 부하가 집중되어 컨텍스트 스위칭이 매우 빈번히 일어나게 되면 성능이 크게 저하될 수도 있습니다.

네트워크 프로그램을 설계하는 흔한 방법은 각 연결 하나당 프로세스/스레드를 하나씩 할당하는 것입니다. 이 방식은 간단하고 구현하기 쉽다는 장점이 있지만, 동시에 수천 개의 연결을 관리해야 하는 경우 규모를 확장하기 힘들다는 단점이 있습니다.

## NGINX는 어떻게 동작하는가?

NGINX는 사용할 수 있는 하드웨어 자원에 맞춰 튜닝된 예측 가능한 프로세스 모델을 사용하는데, 아래 그림과 같이 하나의 마스터 프로세스와 여러 개의 워커, 그리고 헬퍼 프로세스로 구성됩니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/nginx_process_model.png" alt="NGINX의 프로세스 모델" />
    <figcaption>NGINX의 프로세스 모델. 출처: https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/</figcaption>
</figure>

- **마스터 프로세스(master process)**는 설정 불러오기, 포트 바인딩, 자식 프로세스 생성과 같은 특권 명령(privileged operation)을 수행합니다.
- **캐시 로더 프로세스(cache loader process)**는 NGINX의 시작 시점에 디스크 기반의 캐시를 메모리로 불러오는 작업을 수행하고 종료됩니다. 캐시 로더 프로세스는 보수적으로 스케줄링 되므로 소모하는 자원이 적습니다.
- **캐시 매니저 프로세스(cache manager process)**는 주기적으로 실행되어 설정된 캐시 크기를 넘기지 않도록 캐시를 관리하는 작업을 수행합니다.
- **워커 프로세스(worker process)**는 네트워크 연결, 디스크에 읽기/쓰기 작업, [업스트림 서버](https://en.wikipedia.org/wiki/Upstream_server#:~:text=In%20computer%20networking%2C%20upstream%20server,in%20a%20hierarchy%20of%20servers.)와의 통신과 같이 모든 일을 수행합니다.

아래 그림과 같이, 기본적으로 NGINX는 CPU 코어 하나 당 워커 프로세스 하나를 생성합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/nginx_processes_on_1_core_pc.png" alt="코어가 1개인 PC에서의 워커 프로세스" />
    <figcaption>코어가 1개인 PC에서의 워커 프로세스.</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/nginx_processes_on_2_cores_pc.png" alt="코어가 2개인 PC에서의 워커 프로세스" />
    <figcaption>코어가 2개인 PC에서의 워커 프로세스.</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/nginx_processes_on_6_cores_pc.png" alt="코어가 6개인 PC에서의 워커 프로세스" />
    <figcaption>코어가 6개인 PC에서의 워커 프로세스.</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/nginx_processes_on_8_cores_pc.png" alt="코어가 8개인 PC에서의 워커 프로세스" />
    <figcaption>코어가 8개인 PC에서의 워커 프로세스.</figcaption>
</figure>

이는 `/etc/nginx/` 디렉토리에 존재하는 `nginx.conf` 파일의 `worker_processes` 설정을 통해 변경할 수 있습니다. 디폴트 값은 `auto` 입니다.

예를 들어, 이 값을 `20`으로 바꾸게 되면 아래 그림과 같이 (코어 개수에 상관없이) 스무 개의 워커 프로세스가 생성된 것을 볼 수 있습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/worker_process_20_config.png" alt="코어가 2개인 PC에서 워커 프로세스를 20개 생성한 경우" />
    <figcaption>코어가 2개인 PC에서 워커 프로세스를 20개 생성한 경우.</figcaption>
</figure>

하지만 성능 향상을 위해 단순히 워커 프로세스를 무작정 늘리는 것은 좋지 않습니다. 잠시 후에 자세히 살펴보겠지만 NGINX의 워커 프로세스는 모든 요청을 비동기적으로 처리합니다. 따라서 하나의 워커 프로세스만으로도 NGINX가 설치된 PC의 하드웨어 성능을 최대로 사용할 수 있기 때문에 단순히 워커 프로세스의 수를 늘린다고 해서 NGINX의 성능이 더 좋아지지는 않습니다. NGINX 공식 문서에서도 하드웨어 자원을 가장 효율적으로 사용할 수 있는 방법이 코어 하나당 워커 프로세스를 하나 생성하는 것이라고 하고 있으므로, 일반적인 경우 `worker_processes` 설정값을 `auto`로 두고 사용하는 것이 좋아 보입니다.

## NGINX 워커 프로세스의 구조

NGINX 서버가 구동되는 와중엔 워커 프로세스만 바쁘게 움직입니다. 각각의 워커 프로세스는 싱글 스레드를 기반으로 독립적으로 동작하면서 네트워크 연결을 처리합니다. 프로세스들은 공유 캐시 데이터, 세션 데이터 등을 통해 서로 소통할 수 있습니다. 또, 워커 프로세스는 여러 개의 네트워크 연결을 비동기 방식으로 처리함으로써 컨텍스트 스위칭 횟수를 줄입니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/nginx_worker_process.png" alt="NGINX 워커 프로세스 구조" />
    <figcaption>NGINX 워커 프로세스 구조. 출처: https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/</figcaption>
</figure>

워커 프로세스는 NGINX 설정을 기반으로 마스터 프로세스에 의해 제공된 listen 소켓과 함께 초기화되며, listen 소켓에서 발생하는 이벤트를 대기하는 상태가 됩니다. 이벤트는 새로운 네트워크 연결에 의해 발생하는데, 각 연결은 상태 머신(state machine)에 할당됩니다. 일반적으로 HTTP 상태 머신이 흔히 사용되지만 스트림 트래픽(raw TCP)을 위한 상태 머신과 메일 프로토콜(e.g. SMTP, IMAP, POP3)를 위한 상태 머신 또한 존재합니다. 여기서 상태 머신이란 기본적으로 NGINX에게 요청을 어떻게 처리할 것인가를 알려주는 명령어의 집합이라고 생각할 수 있습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/nginx_state_machine.png" alt="NGINX 상태 머신" />
    <figcaption>NGINX 상태 머신. 출처: https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/</figcaption>
</figure>

## 상태 머신 스케줄링

상태 머신은 체스 게임의 규칙이라고 생각할 수 있습니다. 각각의 HTTP 통신은 "체스 게임"이고, 결정을 매우 빠르게 내릴 수 있는 체스 고인물 "웹 서버"와, 네트워크를 통해 사이트에 접속하는 (상대적으로 느린) "브라우저(클라이언트)"가 체스 게임을 한다고 생각할 수 있죠:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/browser_nginx_chess.png" alt="브라우저와 NGINX의 체스 게임 비유" />
</figure>

하지만 실제 체스와 달리 이 게임의 규칙은 매우 복잡할 수 있는데, 예를 들어 웹 서버가 프록시 기능을 통해 제 3자와 통신하고자 하는 경우, 웹 서버의 서드 파티 모듈이 게임의 규칙을 추가할 수도 있습니다.

### 블로킹(Blocking) 상태 머신

대부분의 웹 서버와 웹 앱들은 앞서 비유를 들었던 체스 게임(HTTP 통신)을 하기 위해 네트워크 연결 하나당 프로세스/스레드를 사용하는 방식을 사용합니다. 각 프로세스/스레드는 체스 게임을 끝까지 진행할 명령들을 가지고 있죠. 프로세스가 서버에 의해 실행되는 동안, 프로세스는 클라이언트가 다음 동작을 수행하기를 _기다리면서_ 대부분의 시간을 보냅니다. 즉, 프로세스가 _블로킹(blocking)_ 되는 것이죠:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/infographic_inside_nginx_blocking.png" alt="대부분의 웹 앱이 사용하는 blocking I/O 방식" />
    <figcaption>대부분의 웹 앱이 사용하는 blocking I/O 방식. 출처: https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/</figcaption>
</figure>

위 그림에서,

1. 웹 서버의 프로세스는 listen 소켓을 통해 새로운 연결(즉, 클라이언트에 의해 시작되는 새 게임)을 기다립니다.
2. 새로운 연결(새 게임)이 생성되면, 웹 서버 프로세스는 자신의 차례마다 말을 옮기고 클라이언트의 응답을 기다립니다.
3. 게임이 끝나면 웹 서버 프로세스는 클라이언트가 새로운 게임을 하고자 하는지 살펴봅니다 (keep-alive 연결). 만약 연결이 종료되면 (클라이언트가 떠났거나 타임아웃이 발생한 경우), 웹 서버 프로세스는 1번으로 돌아가 새로운 연결을 다시 기다립니다.

여기서 중요한 점은 매 HTTP 연결마다 서버의 프로세스/스레드가 할당되어야 한다는 점입니다 (클라이언트 혼자 체스 게임을 할 수는 없으니까요!). 이러한 방식은 단순하면서 새로운 규칙(서드 파티 모듈)의 추가도 쉽습니다. 하지만 파일 기술자(descriptor)와 일부 메모리만으로 표현할 수 있는 (상대적으로 가벼운) HTTP 연결을 (상대적으로 무거운) 프로세스/스레드에 매핑해야 한다는 단점이 있습니다. 이 방식은 구현하기 쉬울진 몰라도 매우 비효율적이죠.

### NGINX는 체스게임 고인물입니다

[Kiril Georgiev라는 분이 360명과 동시에 체스 게임을 둬서](https://www.greaterkashmir.com/sports/bulgarian-grandmaster-plays-360-games-simultaneously) 총 284승 70무 6패를 거둔적이 있습니다.

NGINX 워커 프로세스도 이같이 동작합니다. 각 워커는 수백·수천개의 클라이언트와 동시에 "체스 게임"을 할 수 있습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/infographic_inside_nginx_nonblocking.png" alt="NGINX의 non-blocking I/O 방식" />
    <figcaption>NGINX의 non-blocking I/O 방식. 출처: https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/</figcaption>
</figure>

1. 워커 프로세스는 listen 소켓과 연결 소켓으로부터 새로운 이벤트가 발생하기를 기다립니다.
2. 소켓에서 이벤트가 발생하면 워커 프로세스는 이벤트를 처리합니다:
    - listen 소켓에서 발생한 이벤트는 새로운 연결(새 게임)을 의미하므로, 워커는 새로운 연결 소켓을 생성합니다.
    - 연결 소켓에서 발생한 이벤트는 클라이언트의 요청(말 옮기기)을 의미하므로, 워커는 이에 대해 즉시 응답합니다.

이러한 방식을 통해 워커는 클라이언트가 응답할 때까지 기다리지 않습니다. 즉, 네트워크 트래픽에 대해 _절대로_ 블로킹 되지 않습니다. 워커가 클라이언트에게 응답하고 나면 즉시 다른 게임(다른 클라이언트와의 HTTP 통신)으로 가서 응답을 처리하거나 새로운 클라이언트를 맞이합니다.

### 왜 이러한 방식이 블로킹, 멀티 프로세스 아키텍처보다 빠를까요?

NGINX는 워커 프로세스 하나당 수십만의 연결을 처리할 수 있는 능력을 갖추고 있습니다. 각각의 새로운 연결은 또 다른 파일 기술자를 생성하고 적은 메모리를 추가로 사용하기 때문에 연결 하나당 프로세스에 가해지는 오버헤드는 미미합니다. 또한 컨텍스트 스위칭이 상대적으로 적게 일어납니다.

연결 하나당 하나의 프로세스 방식 (블로킹)에선 각 연결이 사용하는 자원과 프로세스에 가하는 오버헤드가 크고, 컨텍스트 스위칭도 자주 일어납니다. 더욱 자세한 설명은 [여기]()를 참고해 주세요.

## 설정 업데이트 하기

적은 수의 워커 프로세스를 사용하는 NGINX의 프로세스 아키텍처는 NGINX 설정(configuration) 업데이트 및 NGINX 프로그램 업그레이드를 매우 효율적으로 할 수 있도록 합니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/infographic_inside_nginx_load_config_1.png" alt="NGINX에선 딜레이 없이 즉시 설정을 변경하고 적용할 수 있습니다" />
    <figcaption>NGINX에선 딜레이 없이 즉시 설정을 변경하고 적용할 수 있습니다. 출처: https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/</figcaption>
</figure>

NGINX 설정을 업데이트하는 것은 매우 쉽고 간단한 작업입니다. 일반적으로 설정을 업데이트한다는 것은 단순히 `nginx -s reload` 명령을 실행하여 디스크로부터 설정을 읽어 마스터 프로세스에게 `SIGHUP` 시그널을 보낸다는 것을 뜻하죠.

마스터 프로세스가 `SIGHUP` 시그널을 받으면:

1. 설정을 리로드하고 새로운 워커 프로세스들을 생성합니다. 이 워커 들은 (업데이트 된 설정을 기반으로) 생성되는 즉시 새로운 연결을 받아 처리하기 시작합니다.
2. 기존의 워커 프로세스들에게 graceful exit을 하도록 시그널을 보냅니다. 그럼 기존의 워커들은 새로운 연결은 더 이상 받지 않고, 자신들이 처리하고 있던 HTTP 통신 작업을 완료하면 연결을 해제합니다. 이후 모든 연결이 해제되면 기존의 워커 프로세스는 사라집니다.

이러한 설정 업데이트 과정이 일어날 때 CPU와 메모리 사용이 일시적으로 증가할 순 있지만 일반적으로 무시할만한 수준이라 괜찮습니다. 초당 여러 번 설정을 변경할 수도 있구요 (실제로 많은 NGINX 사용자들이 그렇게 합니다). 극히 드물게 연결이 종료되기를 기다리는 워커 프로세스들이 많은 경우 이슈가 발생할 수도 있지만 이 경우에도 대부분 빨리 해결됩니다.

NGINX 프로그램 업그레이드 과정 또한 서비스에 장애를 일으키지 않고 수행할 수 있습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/nginx/nginx-architecture/infographic_inside_nginx_load_binary.png" alt="NGINX 업그레이드 또한 즉시 적용할 수 있습니다" />
    <figcaption>NGINX 업그레이드 또한 즉시 적용할 수 있습니다. 출처: https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/</figcaption>
</figure>

NGINX 업그레이드 과정 또한 NGINX 설정 업데이트 과정과 흡사합니다. NGINX를 업그레이드하게 되면 새로운 버전의 NGINX의 마스터 프로세스가 기존의 마스터 프로세스와 병렬로 실행되는데, 이때 두 프로세스는 서로 listening 소켓을 공유합니다. 두 프로세스 모두 실행 중인 상태이므로 이들에 대한 각각의 워커 프로세스 또한 트래픽을 처리합니다. 이후 기존의 마스터 프로세스와 워커 프로세스에게 graceful exit 시그널을 보내 하던 작업을 전부 마무리하고 종료되도록 합니다.

## 레퍼런스

- [Inside NGINX: Designed for Performance & Scalability](https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/)
