---
title: '컴퓨터 연결 구조'
date: 2021-03-29
category: 'Computer Architecture'
draft: false
---

컴퓨터는 기본적으로 CPU, 메모리, I/O장치와 같은 여러 개의 기본 모듈(컴포넌트)이 서로 연결된 네트워크라고 할 수 있는데, 이러한 모듈간에 서로 소통하기 위해선 모듈을 연결하는 장치가 필요한데, 이렇게 모듈을 연결하는 장치의 집합을 **연결 구조(interconnection structure)**라고 합니다. 이 포스트에선 컴퓨터의 기본 모듈들이 어떻게 서로 연결되어 있는지를 살펴보겠습니다.

## 메모리 모듈

일반적으로, 메모리 모듈은 동일한 크기의 `N`개의 워드(CPU가 한 번에 처리할 수 있는 데이터의 크기)로 구성되어 있고, 각 워드에는 고유한 숫자 주소가 부여됩니다. 또한, `read` 혹은 `write` 시그널을 통해 하나의 워드 만큼의 데이터를 메모리에 읽고 쓸 수 있습니다. 

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/interconnection-structures/memory-module.png" alt="메모리 모듈" />
    <figcaption>메모리 모듈. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure>

## I/O 모듈

컴퓨터의 내부적인 관점에서 보자면, I/O 모듈은 메모리와 흡사합니다. `read`와 `write` 동작이 존재하며, 일반적으로 한 개 이상의 외부 장치를 제어합니다.

*포트*를 통해 외부 장치에 대한 각 인터페이스를 참조할 수 있고, 각 인터페이스에 고유한 주소 (0, 1, ..., M - 1)을 부여합니다. 또한, I/O모듈은 CPU에게 인터럽트 시그널을 보낼 수 있습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/interconnection-structures/io-module.png" alt="I/O 모듈" />
    <figcaption>I/O 모듈. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure>

## CPU 모듈

CPU는 명령어와 데이터를 읽고 처리한 다음, 결과를 메모리에 기록합니다. 시스템 전체의 동작을 제어하기 위해 제어 시그널을 사용하며, 인터럽트 시그널을 받습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/interconnection-structures/cpu-module.png" alt="CPU 모듈" />
    <figcaption>CPU 모듈. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure>

<hr />

또한 연결 구조는 다음과 같은 전송 타입을 제공해야 합니다:

- `메모리 → 프로세서`: CPU가 메모리로 부터 데이터 혹은 명령어를 읽습니다.
- `프로세서 → 메모리`: CPU가 메모리에 데이터를 기록합니다.
- `I/O → 프로세서`: CPU가 I/O 모듈을 통해 I/O 장치로부터 데이터를 읽습니다.
- `프로세서 → I/O`: CPU가 I/O 장치에 데이터를 전송합니다.
- `I/O → 메모리, 혹은 메모리 → I/O`: CPU를 거치지 않고 메모리와 I/O장치가 직접 데이터를 주고 받습니다. 이를 **DMA(Direct Memory Access)**라고 하는데, 이와 관련해선 추후에 살펴보겠습니다.

## 버스 연결

**버스(Bus)**란, 두 개 혹은 그 이상의 장치들을 연결하는 통신 통로(communication pathway)입니다. 버스는 여러 장치들이 버스에 연결되어 하나의 장치가 버스를 통해 신호를 보내면 버스에 연결된 모든 장치들이 해당 신호를 받을 수 있다는 **공유 전달 매개체(shared transmission medium)**의 특징을 가지고 있습니다. 하지만 이로 인해 두 개(혹은 그 이상)의 장치가 동시에 신호를 전송하면 그 신호들간에 혼선이 발생할 수 있습니다.

일반적으로 버스는 0과 1을 나타내는 신호들을 전송할 수 있는 라인(전선) 여러 개로 구성됩니다. 예를 들어, 8비트 데이터는 8개의 버스 라인을 통해 전송할 수 있습니다.

일반적인 컴퓨터 시스템에는 여러 개의 버스들이 존재하고, 이 버스들이 **버스 계층(bus hierarchy)**를 구성합니다. 이때 주요 컴포넌트(CPU, 메모리, I/O)를 연결하는 버스를 **시스템 버스(system bus)**라고 합니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/interconnection-structures/bus-hierarchy-comparison.png" alt="버스 계층 구조 비교" />
    <figcaption>버스 계층 구조 비교. 출처: http://csac31.blogspot.com/2015/</figcaption>
</figure>

또한 모듈들 간에 데이터를 전송하는 버스를 **데이터 버스(data bus)**라고 하는데, 데이터 버스는 32, 64, 128, 혹은 더 많은 개수의 라인들로 구성되어 있습니다. 이때 데이터 버스를 구성하는 라인의 개수를 *데이터 버스의 너비(width)* 라고 합니다.

데이터 버스의 width는 시스템 전체의 성능을 좌우하는 주요 요인인데, 예를 들어 너비가 32비트이고 각 명령어의 크기가 64비트라면 CPU는 한 명령 사이클당 두 번의 메모리 참조를 수행해야 합니다. 대부분 버스의 width는 CPU가 몇 비트이냐에 따라 결정되는데, 32비트 CPU이면 버스의 너비도 32비트, 64비트 CPU이면 너비도 64비트... 와 같은 방식으로 결정됩니다.

<br />

**주소 버스(address bus)**는 source 데이터 혹은 데이터가 저장될 위치를 지정하기 위해 사용됩니다. 예를 들어, CPU가 메모리로 부터 한 워드 사이드 만큼의 데이터를 읽고자 할 때, CPU는 주소 버스에 원하는 데이터의 주소를 입력함으로써 데이터를 불러옵니다.

주소 버스의 width는 시스템의 최대 메모리 용량(capacity)을 결정하는데, 만약 주소 버스의 width가 32비트이면 버스를 통해 지정할 수 있는 최대 주소도 2<sup>32</sup> - 1 바이트, width가 64비트이면 2<sup>64</sup> -1 바이트가 됩니다.

또한, I/O 포트의 주소를 지정할 때도 주소 버스가 사용되는데, 어떤 기준보다 값이 큰 비트는 버스에 연결된 모듈 중에 특정 모듈을 선택할 때 사용되고, 기준보다 값이 작은 비트는 메모리 주소 혹은 I/O 포트를 선택할 때 사용됩니다. 예를 들어, 8비트 주소 버스에서 `01111111` 이하의 주소는 메모리 모듈의 위치를 참조할 때, `10000000`이상의 주소는 I/O 모듈에 연결된 장치를 선택할 때 사용되는 방식입니다.

<br />

데이터와 주소 버스는 모든 컴포넌트가 같이 사용하기 때문에, **컨트롤 버스(control bus)**를 이용하여 데이터와 주소 버스를 제어합니다.

컨트롤 버스를 통해 전송되는 신호 중, 제어 신호는 명령(command)과 시기 정보(timing information)을 전송하고, 타이밍 신호는 데이터와 주소 정보의 유효성(validity)을 나타내며, 명령 신호는 수행하고자 하는 동작을 나타낼 때 사용됩니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/interconnection-structures/bus-interconnection-scheme.png" alt="버스 연결 구조" />
    <figcaption>버스 연결 구조. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure>

## 레퍼런스

- [Computer Organization and Architecture 10th Edition](https://www.amazon.com/Computer-Organization-Architecture-William-Stallings/dp/0134101618/ref=sr_1_3?crid=254TMAUZ6SF0Z&keywords=Computer+Organization+and+Architecture&qid=1655859599&s=books&sprefix=computer+organization+and+architecture%2Cstripbooks-intl-ship%2C242&sr=1-3)
