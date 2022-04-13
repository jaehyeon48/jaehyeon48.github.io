---
title: '운영 체제의 구조'
date: 2021-03-13
category: 'OS'
draft: false
---

## 단일형 구조 (Monolithic Structure)

**단일형 구조**는 가장 단순한 형태로서, 커널의 모든 기능이 하나의 형태로 구현되어 있습니다. 즉, 커널이 마치 하나의 프로그램처럼 동작합니다. 초창기 UNIX 운영 체제에서 사용되었으며, 커널 프로그램과 시스템 프로그램 두 부분으로 나뉘어 구성됩니다. 이후 UNIX가 발전함에 따라 이 두 부분 이외에 인터페이스, 장치 드라이버 등과 같은 부분이 추가되었습니다.

다음 그림과 같이 하드웨어 윗단, 시스템 콜 인터페이스 밑단에 존재하는 영역이 커널이라고 할 수 있습니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/os-architecture/fig1.png" alt="전통적인 UNIX 시스템 구조" />
  <figcaption>전통적인 UNIX 시스템 구조. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

여기서 커널은 시스템 콜을 통해 파일 시스템, CPU 스케쥴링, 메모리 관리 등과 같은 시스템 기능을 제공하는데, 이처럼 방대한 양의 기능들이 한 공간에 통합되어 존재하는 구조가 단일형 구조입니다. UNIX에 기반한 Linux 운영체제 또한 다음 그림에서 볼 수 있듯, UNIX와 비슷한 구조로 되어 있습니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/os-architecture/fig2.png" alt="Linux 운영체제 구조 예시" />
  <figcaption>Linux 운영체제 구조 예시. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

단일형 구조의 장점은,

- 시스템 콜 오버헤드가 적으므로 커널 내에서의 통신이 빠릅니다. 따라서 비교적 속도가 빠르고 효율적으로 동작합니다.

단점은,

- 단일 형태로 존재하다 보니, 한 부분에서의 (예를 들면 파일 시스템) 장애로 인해 전체 시스템이 다운될 수 있습니다.
- 수정이 어렵기 때문에 다양한 환경 시스템에 적용하기 힘듭니다.

## 계층화 구조 (Layered Systems)

단일형 구조가 밀착 결합(tightly coupled) 형태라고 한다면, 느슨한 결합 (loosely coupled) 형태로 모듈화한 구조가 **계층화 구조**입니다. 즉, 각각의 특정 기능을 수행하는 모듈로 쪼개고, 이렇게 나뉜 모듈을 하나로 합쳐서 커널을 구성하는 형태입니다.

운영 체제 시스템이 몇 개의 계층(혹은 레벨)으로 나누어 지며, 가장 밑부분(the bottom layer, layer 0)은 하드웨어, 가장 윗부분(the highest layer, layer N)은 유저 인터페이스라고 볼 수 있습니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/os-architecture/fig3.png" alt="계층화 구조 예시" />
  <figcaption>계층화 구조 예시. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

어떤 임의의 계층 `layer M`에 존재하는 데이터들과 기능들은 상위 레벨 계층에 의해 사용될 수 있습니다. 반대로 말하자면, 각 계층은 자신보다 하위 레벨의 계층에 존재하는 기능들을 호출하여 사용하는 형태입니다. 상위 계층에서 하위 계층의 정보를 볼 수 없어야 하며, 상위 계층은 하위 계층이 잘 동작한다는 가정하에 동작합니다.

계층화 구조의 장점은,

- 유지보수와 확장이 쉽습니다. 예를 들어, 어떤 문제가 발생했을 때 이 문제와 관련된 계층들만 살피면 되므로 디버깅이 비교적 쉽습니다.

단점은,

- 상대적으로 성능이 떨어질 수 있습니다. 예를 들어, 위 그림에서 유저 인터페이스 계층에서 하드웨어 계층의 기능을 사용하고자 한다면, 나머지 계층들을 모두 지나야 하므로 때문에 그로 인한 성능상의 불이익이 존재할 수 있습니다.

이러한 계층화 모델은 네트워크(TCP/IP 등)분야와 웹 애플리케이션 분야에서 많이 사용되지만, 요즘의 운영 체제 분야에선 거의 사용되지 않습니다. 좀 더 엄밀히 말하자면 순수한 계층화 모델"만" 사용하지는 않습니다. 그 이유 중 하나는 각 계층의 역할을 정확히 정의하기가 어렵기 때문이고, 또 앞서 단점에서도 말했듯이 여러 계층을 통한 통신 오버헤드가 존재하기 때문입니다.

## 마이크로 커널 (Microkernels)

**마이크로 커널** 구조는 커널을 모듈화한 형태입니다. 즉, 불필요한 부분들을 커널 밖으로 빼 유저 레벨 프로그램 (즉, 유저 모드에서 동작하는)으로 구현하고, 꼭 필요한 부분만 커널로 남겨 커널을 간소화 시킨 형태입니다. 어떤 부분들을 커널에 남기고 어떤 부분들을 유저 레벨로 뺄 것인가에 대한 논쟁은 있지만, 일반적으로 프로세스 관리, 메모리 관리, CPU 스케쥴링 같은 부분들을 커널에 남깁니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/os-architecture/fig4.png" alt="마이크로 커널 구조 예시" />
  <figcaption>마이크로 커널 구조 예시. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

이 구조에서, 유저 모드로 동작하는 유저 모듈 간의 소통은 마이크로 커널이 제공하는 **메시지 패싱(message passing)**을 통해 이뤄집니다.

마이크로 커널의 장점은,

- 확장이 쉽고, 새로운 마이크로 아키텍처로의 이식(포팅)이 쉽습니다 (예를 들어, 인텔 아키텍처에서 ARM 아키텍처로).
- 또한, 커널이 간소화 됨에 따라 신뢰성이 높아지고 하고 보안 측면에서 안전합니다.

단점은,

- 유저 모듈 간의 소통에 따른 오버헤드가 존재합니다. 즉, 원래는 커널에 존재하던 모듈들이 유저 레벨로 올라옴에 따라 반드시 메시지 패싱을 통해서만 소통할 수 있기 때문입니다.

## 모듈 (Modules)

이름 그대로 각각의 역할을 하는 부분들을 **모듈화**하여 커널을 구성하는 방식입니다. 일반적으로 OOP의 개념을 사용합니다. 핵심 기능들 (하드웨어 및 다른 모듈과의 통신)을 기반으로, 다른 여러 가지 기능들 (프로세스 관리, 파일 관리, 메모리 관리, 등등..)을 핵심 기능에 연결(link)하여 하나의 커널을 구성합니다.

이러한 모듈들을 조합하여 필요에 맞게 커널을 구성함으로써, 계층화 구조의 장점을 가지면서 계층화 구조의 단점인 상위 레벨에서 하위 레벨로의 통신 시 발생하는 오버헤드를 줄일 수 있습니다. 또한, 마이크로 커널에서 사용했던 메시지 패싱 방식을 사용하지 않고도 모듈들끼리 통신할 수 있으므로, 마이크로 커널의 단점도 보완하고 있습니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/os-architecture/fig5.png" alt="모듈 구조 예시" />
  <figcaption>모듈 구조 예시. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

## 혼합 구조 (Hybrid Systems)

현대 운영 체제들이 가장 많이 채택하고 있는 형태로, 단일 구조 하나만을 사용하기보다 여러 구조를 혼합하여 사용하는 방법이 **혼합 구조** 방식입니다. 예를 들어 리눅스의 경우 단일형 구조를 기반으로 모듈 방식을 혼합하여 사용합니다. Windows도 이와 비슷하게 단일형 구조를 기반으로 마이크로 커널, 모듈 방식을 혼합하여 사용합니다 (이때 이러한 운영체제들이 단일형 구조를 기반으로 하는 이유는 운영 체제를 단일 주소 공간에 위치시키면 성능상으로 유리하기 때문입니다).

혼합 구조의 예시로, 애플 MacOS, iOS의 커널인 [Darwin](<https://en.wikipedia.org/wiki/Darwin_(operating_system)>)의 구조는 다음과 같습니다. Darwin 커널은 Mach 마이크로 커널을 기반으로 한 계층형 구조가 혼합된 형태입니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/os-architecture/fig6.png" alt="Darwin 커널 구조" />
  <figcaption>Darwin 커널 구조. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

## 레퍼런스

- [Modern Operating Systems (4th Edition) - Andrew Tanenbaum, Herbert Bos](https://www.amazon.com/Modern-Operating-Systems-Andrew-Tanenbaum/dp/013359162X)
- [Operating System Concepts (10th Edition) - Abraham Silberschatz, Greg Gagne, Peter B. Galvin](https://www.amazon.com/Operating-System-Concepts-Abraham-Silberschatz/dp/1119800366/ref=sr_1_1?keywords=operating+system+concepts&qid=1649684419&s=books&sprefix=operating+system%2Cstripbooks-intl-ship%2C348&sr=1-1)
