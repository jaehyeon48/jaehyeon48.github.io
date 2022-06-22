---
title: '컴퓨터 구조 개론'
date: 2021-03-22
category: 'Computer Architecture'
draft: false
---

## Architecture and Organization

흔히 컴퓨터를 설명할 때, **컴퓨터 구조(Computer architecture)**와 **컴퓨터 구성(Computer organization)**을 구분하는 경우가 있습니다.

- `Computer architecture`: 개발자가 바라보는 특성에 관한 것으로, 프로그램의 논리적인 실행에 직접적인 영향을 주는 특성을 일컫는 말입니다. 흔히 **ISA(Instruction Set Architecture)**라고도 하는데, ISA는 명령어 형식, opcode, 레지스터, 명령 실행 결과가 레지스터와 메모리에 미치는 영향, 명령 실행을 제어하는 알고리즘 등을 정의합니다. 구조적 특성의 예시로는 instruction set, 다양한 데이터 타입을 표현하는 데 사용되는 비트 수, I/O 메커니즘, 메모리 addressing 방식 등이 있습니다.
- `Computer organization`: 컴퓨터 구조에서 정의한 특성들을 실제로 어떻게 "구현"할 것인가에 관한 것으로, 컨트롤 시그널, 컴퓨터와 주변 장치들(peripherals) 사이의 인터페이스, 메모리 기술 등 프로그래머에게는 보이지 않는 하드웨어 세부 사항들에 관한 내용입니다.

즉, `컴퓨터 구조`는 논리적인 내용과 관련되어 있고, `컴퓨터 구성`은 하드웨어적인 내용과 관련 있다고 할 수 있습니다. 예를 들어 곱셈 연산에 대해 생각해볼 때, 구조적인 관점에서는 "instruction set에 곱셈 명령을 포함할 것인지?"에 대해 관심을 가지고, 구성적인 관점에서는 곱셈 명령을 구현할 때 덧셈을 반복해서 곱셈을 구현할지, 혹은 전용 곱셈 장치로 구현할지에 관해 관심을 가집니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-architecture-intro/computer-architecture-vs-organization.png" alt="컴퓨터 구조 vs. 컴퓨터 구성" />
    <figcaption>컴퓨터 구조 vs. 컴퓨터 구성. 출처: https://www.geeksforgeeks.org/differences-between-computer-architecture-and-computer-organization/</figcaption>
</figure>

이를 표로 정리해보면 다음과 같습니다:

| **Computer Architecture**                                      | **Computer Organization**                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| 컴퓨터가 **무엇 (what)**을 하는지에 대해 설명.               | 컴퓨터가 **어떻게 (how)** 하는지에 대해 설명.                      |
| 컴퓨터 시스템의 기능 동작(functional behavior)에 대해 다룸. | 컴퓨터 시스템의 구조적 관계(structural relationship)에 대해 다룸. |
| high-level 설계 이슈를 다룸.                                 | low-level 설계 이슈를 다룸.                                        |

<br />

쉽게 말해, organization은 컴퓨터의 동작을 논리적으로 정의한 architecture를 구현한 것이라고 할 수 있는데, 이와 같이 논리적인 레벨을 다루는 architecture와, 하드웨어 레벨을 다루는 organization을 나눔으로써 architecture는 그대로 유지하되 시대에 따라 발전하는 하드웨어에 맞춰 이를 구현하는 organization을 변경하는 방식을 사용할 수 있습니다.

## 구조(Structure)와 기능(Function)

컴퓨터는 매우 복잡한 시스템이므로, 이를 제대로 이해하기 위해선 (다른 복잡한 시스템에도 존재하는) 계층적인 특성을 이해할 필요가 있습니다.

어떤 복잡한 시스템을 설계할 땐 계층적인 특성(hierarchical nature)이 반드시 포함됩니다. 이를 통해 시스템 설계자는 복잡한 시스템 전체가 아니라 특정 레벨의 계층만 다루면 되므로 시스템을 관리하기가 수월합니다.

각 계층은 여러 컴포넌트가 서로 의존하는 관계로 구성되는데, 각 계층의 동작은 바로 아래 계층의 단순화되고 추상화된 특성에 의존합니다.

시스템 설계자는 계층마다 아래의 두 가지를 고려해야 합니다:

- `기능(Function)`: 구조의 일부로서 개별 구성 요소의 동작을 의미합니다.
- `구조(Structure)`: 각 컴포넌트가 서로 연관된 방식을 의미합니다.

### 기능(Function)

컴퓨터의 기능과 구조는 사실 단순합니다. 일반적으로, 컴퓨터가 수행하는 기능을 크게 4가지로 분류할 수 있습니다:

- `데이터 처리(Data processing)`: 데이터의 형태가 무궁무진하고 이를 처리하는 방식도 다양하지만, 데이터를 처리하는 몇 가지 기본적인 방식만 살펴볼 예정입니다.
- `데이터 저장소(Data storage)`: 컴퓨터에는 어떤 연산을 실행하는 도중에 중간 결과물을 임시로 저장하는 저장소가 존재하고, 이러한 결과물을 장기적으로 저장하는 저장소 또한 존재합니다.
- `데이터 이동(Data movement)`: 컴퓨터의 동작 환경은 어떤 연산의 입력이 되는 장치와 이 연산의 결과물을 출력하는 장치들로 구성됩니다. 이처럼 컴퓨터와 직접 연결된 **주변 장치(peripheral)**로 부터 데이터를 가져오거나 주변 장치로 데이터를 내보내는 작업을 **I/O(Input/Output)** 작업이라고 합니다. 만약 주변 장치가 아니라 네트워크 등을 통해 멀리 떨어진 장치와 데이터를 주고 받는 경우, 이를 **데이터 통신(data communication)**이라고 합니다.
- `제어(Control)`: 컴퓨터 내의 제어 장치는 컴퓨터의 자원을 관리하고, 명령어에 따라 각 자원들의 동작을 조정합니다.

### Structure

이제 일반적인 컴퓨터의 내부 구조를 살펴봅시다. 우선 싱글 프로세서부터 살펴보고 멀티코어로 넘어가겠습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-architecture-intro/top-level-structure-of-computer.png" alt="일반적인 컴퓨터 구조" />
    <figcaption>일반적인 컴퓨터 구조. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure>

- `CPU(Central Processing Unit)`: 컴퓨터의 동작을 제어(현재 상태값을 저장, 정보 해석)하고, 데이터를 처리하는 역할을 합니다. 간단히 **프로세서(processor)**라고도 부릅니다. CPU의 주요 구성 요소는 다음과 같습니다:
  - `제어 장치(Control unit)`: CPU의 동작을 제어합니다.
  - `산술·논리 장치(Arithmetic Logic Unit, ALU)`: 말 그대로, 덧셈·뺄셈과 같은 산술 연산과 논리 연산(AND, OR, XOR, ...)을 수행하는 장치입니다.
  - `레지스터(Register)`: CPU 내에 존재하는 임시 저장장치로, 크기가 작지만 매우 빠릅니다.
  - `CPU interconnection`: 제어 장치, ALU, 레지스터 간의 통신 메커니즘입니다.
- `주기억장치(Main memory)`: CPU가 접근하여 처리할 수 있는 기억 장치로, 데이터와 명령어가 저장됩니다. 흔히 **RAM(Random Access Memory)**라고 부릅니다.
- `입출력장치(I/O)`: 키보드, 마우스, 모니터 등 컴퓨터가 처리하기 위한 데이터를 읽고 그 결과물을 출력하는 장치들을 말합니다.
- `System interconnection`: CPU, 메인 메모리, I/O장치 간의 통신 메커니즘으로, (전선으로 구성된) **시스템 버스(system bus)**가 대표적인 예시입니다.

<br />

현대 컴퓨터들의 특징 중 하나가 멀티 프로세서(즉, 멀티코어)이고, 또 다른 특징 중 하나는 **캐시 메모리(cache memory)**라고 하는 작고 빠른 메모리를 CPU와 메인 메모리 사이에 여러 개 두어 메모리 계층을 이룬다는 점입니다. 이 캐시 메모리에는 가까운 미래에 사용될 가능성이 높은 데이터들을 저장함으로써 컴퓨터 성능 향상을 꾀하는데, 이때 캐시 메모리가 CPU에 가까울수록 빠르고 용량이 작고, 멀수록 느리고 용량이 큽니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-architecture-intro/major-elements-of-multicore-computer.png" alt="멀티코어 컴퓨터의 주요 구성 요소" />
    <figcaption>멀티코어 컴퓨터의 주요 구성 요소. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure>

위 그림에서 볼 수 있듯이, 임베디드 컴퓨터, 스마트폰, 태블릿 등을 포함한 대부분의 컴퓨터 장치들은 **마더보드(Motherboard)**에 들어있습니다. 이러한 구성을 살펴보기 전에 몇 가지 용어를 살펴보겠습니다:

- `인쇄 회로 기판(Printed circuit board, PCB)`: 집적 회로, 스위치 등의 전기적 부품들이 납땜 되는 얇은 판으로, 흔히 생각하는 초록색 판입니다.
- `마더보드(Motherboard)`: 컴퓨터에 있는 PCB들 중에서 메인 PCB를 가리킵니다.
- `확장 보드(expansion board)`: 컴퓨터 시스템에 기능을 추가할 목적으로 확장 슬롯에 꽂는 PCB를 가리킵니다.
- `Chip`: 주로 실리콘으로 만들어져 전자 회로와 논리 게이트들이 집적되는 반도체로, 이 결과물을 **집적 회로(Integrated Circuit, IC)**라고 합니다.

마더보드는 프로세서를 위한 슬롯(혹은 소켓), 메모리를 위한 슬롯, I/O 컨트롤러 칩, 그리고 다른 주요 컴퓨터 하드웨어 요소들로 이루어져 있습니다.

## 레퍼런스

- [Computer Organization and Architecture 10th Edition](https://www.amazon.com/Computer-Organization-Architecture-William-Stallings/dp/0134101618/ref=sr_1_3?crid=254TMAUZ6SF0Z&keywords=Computer+Organization+and+Architecture&qid=1655859599&s=books&sprefix=computer+organization+and+architecture%2Cstripbooks-intl-ship%2C242&sr=1-3)
