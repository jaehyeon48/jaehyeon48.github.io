---
title: 'DNS란 무엇일까'
date: 2022-05-19
category: 'network'
draft: false
---

**DNS(Domain Name System)**는 도메인 이름을 을 IP주소로 변환하는 분산 데이터베이스 시스템입니다. 인터넷에 연결된 모든 장치들은 각자 고유한 IP주소를 가지는데, `123.123.123.1`과 같이 숫자로 구성된 IP주소를 일일이 외우고 다닐 수는 없는 노릇이니(심지어 어떤 사이트의 IP주소가 바뀐다면 다시 외워야 함...) 일반적으로 우리는 `www.google.com`과 같은 도메인 이름을 사용합니다. 하지만 예를 들어, 어떤 사이트에 접속하고자 하는 경우 해당 사이트의 서버에 데이터를 요청해야 하는데 도메인 이름을 가지고 요청을 하게 되면 컴퓨터는 이를 알아먹을 수 없으니 DNS를 이용하여 도메인 이름을 IP주소로 변환한 뒤 이 IP주소를 가지고 서버에 요청하게 됩니다.

## DNS 개발에 관한 간략한 역사

DNS는 현재 우리가 사용하는 인터넷의 전신이라고도 할 수 있는 [ARPAnet](https://en.wikipedia.org/wiki/ARPANET)에서 발생했던 문제를 해결하기 위해 개발된 시스템입니다. 1970년대만 하더라도 ARPAnet의 규모가 작았기 때문에, 이 당시에는 `HOSTS.txt` 라는 파일 하나만을 이용하여 호스트 이름을 주소로 매핑하는 체계를 사용했었습니다. 이 파일을 관리하는 NIC(Network Information Center)라는 곳에 ARPAnet 관리자들이 변경 사항을 이메일로 알리면 NIC는 이러한 변경 사항을 모아 일주일에 한두 번정도 `HOSTS.txt` 파일을 갱신하였고, ARPAnet 관리자들은 FTP를 사용하여 주기적으로 NIC 서버에 있는 `HOSTS.txt`를 다운받아 사용하는 형태였습니다.

하지만 시간이 지나면서 TCP/IP 프로토콜이 도입되고 ARPAnet을 사용하는 호스트가 점차 늘어나면서 `HOSTS.txt` 파일의 크기 또한 커졌습니다. 또한 아래와 같은 문제들이 발생했습니다:

- NIC 서버가 받는 네트워크 트래픽과 프로세스 부하가 크게 증가했습니다.
- 이 당시엔 중복된 호스트 이름 등록을 방지하는 시스템이 딱히 없었기 때문에 호스트 이름이 충돌하는 문제가 발생하기 시작했습니다.
- 새로 갱신된 `HOSTS.txt` 파일을 (물리적으로) 거리가 먼 곳에 배포하는 동안에 `HOSTS.txt`의 내용이 바뀌어버려 앞서 배포한 파일이 구식 버전이 되어버리는 등의 일관성 문제가 발생했습니다.

(이외에도, 하나의 서버에서 도메인 이름을 IP주소로 변환하는 모든 작업을 처리한다면 [SPOF](https://en.wikipedia.org/wiki/Single_point_of_failure)문제등이 발생할 수 있습니다)

이처럼, 하나의 `HOSTS.txt` 파일을 사용하여 호스트 이름을 IP주소로 매핑하는 시스템은 확장성이 나빴습니다. 이러한 문제를 해결하고자 도입된 시스템이 바로 DNS라는 분산형 데이터베이스 시스템입니다.

## DNS의 구조

앞서 말했듯이, DNS는 여러 개의 DNS 서버(혹은 네임 서버)들로 구성된 분산 시스템입니다. OSI 7계층 중에 애플리케이션 레이어에서 동작하는 프로토콜이며, UDP를 기반으로 하고 포트는 53번을 사용합니다.

하나의 DNS 서버가 모든 매핑 정보를 가지고 있는 대신, 여러 개의 서버들이 전 세계 곳곳에 위치하여 계층적인 구조를 형성합니다. DNS 계층은 다음과 같이 크게 3가지로 나눌 수 있습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/dns/dns_hierarchy.png" alt="DNS 계층" />
  <figcaption>DNS 계층. 출처: Computer Networking: A Top-Down Approach (7th Edition)</figcaption>
</figure>

### Root DNS 서버

root DNS 서버는 TLD DNS 서버의 IP주소를 제공하는 역할을 합니다. 전 세계에 12개 기관에 의해 관리되는 13개의 루트 서버가 존재하며, 이 서버들의 인스턴스는 총 1,000개가 넘습니다. 루트 서버의 위치, 루트 서버 관리 기관등의 정보는 [root-servers.org](https://root-servers.org/)에서 보실 수 있습니다.

### TLD DNS 서버

`.com`, `.net`, `.kr`과 같은 top-level domain 별로 존재하는 DNS 서버이며, authoritative DNS 서버의 IP 주소를 제공하는 역할을 합니다. TLD 목록은 [tld-list.com](https://tld-list.com/)에서 보실 수 있습니다.

### Authoritative DNS 서버

실제로 우리가 원하는 도메인에 대한 IP주소를 매핑하는 DNS 서버입니다. 구글을 예로 들면 `google.com` authoritative DNS 서버에 `google.com` 뿐만 아니라 `www.google.com`, `apis.google.com`, `play.google.com`과 같이 `google.com`의 서브 도메인에 대한 IP주소도 모두 저장됩니다.

### Local DNS 서버

로컬 DNS 서버는 ISP의 DNS 서버이며, 일반적으론 DNS 계층에는 포함되지 않지만 DNS가 동작하는데 중요한 역할을 하는 서버로서 우리(클라이언트)가 도메인 이름에 대한 IP주소를 찾고자 할 때 가장 먼저 찾아가는 DNS 서버입니다.

## DNS 동작 예시

예를 들어 `google.com` 사이트에 접속하고자 할 때, 어떤 과정을 거쳐 DNS 작업을 수행하는지 살펴봅시다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/network/dns/dns_interaction.png" alt="DNS 동작 예시" />
  <figcaption>DNS 동작 예시.</figcaption>
</figure>

1. 제일 처음으로, `google.com` 도메인에 대한 DNS 쿼리 메시지를 로컬 DNS 서버에 보냅니다. 이때 만약 로컬 DNS 서버에 `google.com` 도메인에 대한 IP주소가 캐시 되어 있다면 다른 과정을 건너뛰고 8번 과정이 수행됩니다.
2. 로컬 DNS 서버에 `google.com`에 대한 IP주소가 캐시되어 있지 않다면 로컬 DNS 서버는 DNS 쿼리 메시지를 root DNS 서버에 보냅니다.
3. root DNS 서버는 쿼리 메시지에 있는 도메인을 분석하여 해당 도메인의 TLD(여기서는 `.com`)에 대한 TLD DNS 서버의 IP주소를 반환합니다. 일반적으로 하나의 TLD에 대응되는 TLD DNS 서버는 여러 개가 있기 때문에, 해당 TLD에 대응되는 TLD DNS 서버의 IP주소 목록을 보냅니다.
4. root DNS 서버로부터 받은 TLD DNS 서버의 IP주소 목록 중 하나를 골라 해당 TLD DNS 서버에 쿼리 메시지를 보냅니다.
5. TLD DNS 서버는 쿼리 메시지에 있는 도메인을 보고 적절한 authoritative DNS 서버의 IP주소를 반환합니다. 이 예제의 경우 `google.com`의 authoritative DNS 서버 IP주소가 반환됩니다.
6. TLD DNS 서버로부터 받은 authoritative DNS 서버에 쿼리 메시지를 보냅니다.
7. authoritative DNS 서버는 도메인에 알맞은 IP주소를 반환합니다.
8. 클라이언트가 요청한 도메인에 대한 IP주소를 반환합니다.

## DNS 캐싱

사실 DNS 서버들은 이전에 요청된 DNS 쿼리 결과를 각자의 로컬 메모리에 캐싱하기 때문에 위와 같이 많은 과정을 거치는 경우는 드뭅니다. 예를 들어, 위에서 살펴본 과정중에 로컬 DNS 서버에 `google.com` 도메인에 대한 IP주소가 캐시 되어 있다면 루트 서버·TLD 서버·authoritative 서버를 거치는 과정을 생략하고 바로 로컬 DNS 서버에 캐시 된 IP주소를 가져다 사용하게 됩니다. 물론 무한정 캐시 하지는 않고, 유효기간을 이틀로 설정하는 것이 일반적입니다.

DNS 서버 이외에도, 브라우저 및 OS에서도 DNS 캐시가 존재합니다. 브라우저를 통해 사이트에 접속하는 경우, 우선 브라우저에 저장된 DNS 캐시를 먼저 살펴보고 없으면 OS가 저장하고 있는 DNS 캐시를 살펴봅니다. 이 둘 중의 한곳에라도 원하는 도메인에 대한 DNS 캐시가 존재한다면 로컬 DNS 서버로 쿼리 메시지를 보내지 않고 바로 캐시에 저장된 정보를 가져다 사용합니다.

## DNS 레코드

도메인 이름에 대한 IP주소 매핑 정보가 담긴 DNS 레코드는 `(Name, Value, Type, TTL)` 형식으로 구성되어 있습니다. 여기서 TTL(Time To Live)는 해당 레코드가 DNS 캐시에 얼마 동안 저장되는지를 나타내는 정보입니다.

이제 각 타입별로 레코드의 `Name`과 `Value` 에는 어떠한 값이 오는지 살펴봅시다:

### Type A

A는 "Address"를 나타내며, `Name`은 도메인 이름, `Value`는 해당 도메인의 IPv4 주소를 나타냅니다. 예를 들면 아래의 형식으로 구성됩니다:

|Name|Value|Type|TTL|
|-|-|-|-|
|example.com|100.100.123.1|A|14400|

### Type AAAA

A의 경우 IPv4 주소를 매핑했다면 AAAA의 경우 IPv6의 주소를 매핑합니다.

|Name|Value|Type|TTL|
|-|-|-|-|
|example.com|0000:8a2e:0370:7334|AAAA|14400|

### Type CNAME

어떤 도메인이 다른 도메인의 별칭(alias)인 경우 CNAME 타입 레코드가 사용됩니다. 예를 들어, `hello.example.com` 도메인이 `example.com` 도메인의 alias인 경우 아래와 같이 구성됩니다:

|Name|Value|Type|TTL|
|-|-|-|-|
|hello.example.com|example.com|CNAME|14400|

만약 `hello.example.com`에 대한 IP주소를 쿼리하는 경우, 먼저 `hello.example.com` 도메인에 대한 CNAME 레코드를 발견하게 됩니다. 그러고 나서 `hello.example.com` 도메인이 `example.com`에 대한 alias임을 알았으니, `example.com` 도메인에 대한 DNS 쿼리를 요청하여 최종적으로 IP주소를 얻게 됩니다. 

### Type NS

NS는 "Name Server"를 나타내며, 어떤 도메인에 대한 네임서버를 매핑하는 데 사용됩니다. 예를 들어,

|Name|Value|Type|TTL|
|-|-|-|-|
|.com|dns.com|NS|14400|

라고 되어 있으면 "`.com` 도메인의 네임 서버 이름은 `dns.com`이다" 라는 뜻입니다. 이때, NS 레코드는 네임 서버의 "이름"을 나타내는 것이지 "IP주소"를 나타내는 것이 아니므로, 해당 네임 서버에 실제로 찾아가기 위한 A 혹은 AAAA 레코드가 존재해야 합니다. 만약 `dns.com`에 대한 A 레코드가 다음과 같이

|Name|Value|Type|TTL|
|-|-|-|-|
|dns.com|1.2.3.4|A|14400|

라고 되어 있다면, `어쩌구.com` 도메인에 관한 쿼리 메시지가 root 네임 서버에 도착한 경우 우선 `.com` 도메인의 NS 레코드를 보고 "아, `.com` 도메인의 네임 서버는 `dns.com` 이구나!"를 파악한 뒤, 다시 `dns.com` 도메인에 대한 A 레코드를 보고 `dns.com` 네임 서버의 IP주소인 `1.2.3.4`로 메시지를 다시 전송하게 됩니다.

## 레퍼런스

- [DNS and BIND, 5th Edition - Cricket Liu, Paul Albitz](https://www.oreilly.com/library/view/dns-and-bind/0596100574/)
- [Computer Networking: A Top-Down Approach (7th Edition) - James Kurose, Keith Ross](https://www.amazon.com/Computer-Networking-Top-Down-Approach-7th/dp/0133594149)
- [What is DNS? | How DNS works | Cloudflare](https://www.cloudflare.com/learning/dns/what-is-dns/)
