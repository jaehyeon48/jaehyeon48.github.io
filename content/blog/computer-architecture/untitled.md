---
categories: computer-architecture_concepts
tags: computer-architecture
title: 컴퓨터 구조 Intro
---

<p align="center">
  <a href="/category/computer-architecture/concepts/">목차로 돌아가기</a>
</p>

## Architecture and Organization

컴퓨터를 설명할 때, _컴퓨터 구조(computer architecture)_ 와 _컴퓨터 조직(computer organization)_ 을 구분하여 설명한다:

- **Computer architecture** 는 프로그래머에게 보여지는 특성들, 즉 프로그래머가 바라보는 특성들에 관한 것이다. e.g.) 데이터가 어떻게 표현되는지, Instruction set이 어떻게 되는지, 입/출력 메커니즘이 어떤지, 주소 지정(addressing) 방식이 어떠한지, 등등..

- **Computer organization** 은 구조에서 정의한 특성들을 실제로 어떻게 "구현"할 것인가에 관한 것이다. e.g.) 컨트롤 시그널, 컴퓨터와 주변 장치들 (peripherals)에 관한 인터페이스, 메모리 technology 등 프로그래머에게는 보이지 않는 하드웨어 세부 사항들.

두 개를 비교하여 예를 들자면, "곱셈"에 관해 architecture 관점에서는 instruction set 중에서 곱셈 명령이 존재하는지? 에 대해 관심을 가지고, organization 관점에서는 덧셈을 반복해서 곱셈을 구현하는지, 혹은 전용 곱셈 장치가 있는지에 대해 관심을 가진다. 즉, architecture는 좀 더 추상적인 레벨이고, organization은 좀 더 디테일한 관점이다.

<p align="center">
<img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io/assets/images/computer_architecture/fig1.0.png" style="background-color:#fff"  />
</p>

표로 정리하면 다음과 같다:

| Computer Architecture                                        | Computer Organization                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| 컴퓨터가 **무엇 (what)**을 하는지에 대해 설명.               | 컴퓨터가 **어떻게 (how)** 하는지에 대해 설명.                      |
| 컴퓨터 시스템의 기능 동작 (functional behavior)에 대해 다룸. | 컴퓨터 시스템의 구조적 관계 (structural relationship)에 대해 다룸. |
| high-level 설계 이슈를 다룸.                                 | low-level 설계 이슈를 다룸.                                        |

## 구조(Structure)와 기능(Function)

컴퓨터는 매우 복잡한 시스템이다. 따라서 명확하게 컴퓨터를 설명하기 위해서는, 컴퓨터의 _계층적_ 특성을 이해할 필요가 있다.

어떤 복잡한 시스템을 설계하고 기술(description)하기 위해서는 계층적 특성(hierarchical nature)이 필수적이다. 설계자는 이를 활용하여 시스템 중에서 어느 특정 레벨만 다루면 된다. 각각의 레벨에서 시스템은 일련의 컴포넌트들과 그들의 상호관계(interrelationship)으로 구성된다. 각 레벨에서의 동작은 바로 아래 레벨의 단순화되고 추상화된 특성 의존한다. 각 레벨에서, 설계자는 구조와 기능을 고려한다:

- **구조(Structure)**란, 각 컴포넌트들이 서로 연관된 관계를 의미한다.

- **기능(Function)**이란, 구조의 일부로서 각각의 개별적인 컴포넌트들의 동작(operation)을 의미한다.

### 기능(Function)

컴퓨터의 구조와 기능은 본질적으로는 단순하다. 컴퓨터가 수행하는 기능을 크게 4가지로 분류할 수 있다:

- **데이터 처리**
- **데이터 저장**
- **데이터 이동**
- **제어 (control)**

### Structure

여기서는 컴퓨터의 일반적인 내부 구조를 살펴볼 것이다. 우선 싱글 프로세서부터 살펴보고, 그 다음 멀티코어 구조로 넘어가보자.

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io/assets/images/computer_architecture/computer_top_level_structure.png" />
</p>

그림 1.1은 전통적인 싱글 프로세서 컴퓨터의 내부 구조를 보여준다. 여기에는 네 개의 주요 요소(component)가 존재한다:

- **CPU**는 컴퓨터의 동작을 제어(현재 상태값을 저장하고, 외부의 정보를 해석)하고, 데이터를 처리한다. 간단하게 **프로세서**라고 부르기도 한다. CPU의 주요 구조적 요소들은 다음과 같다:

  - **제어 유닛(Control unit**)은 CPU의 동작 (더 나아가, 컴퓨터의 동작)을 제어한다.

  - **산술 논리 장치(Arithmetic Logic Unit, ALU)**는 데이터 처리 기능을 수행한다.

  - **레지스터(Registers)**는 CPU 내부의 기억 공간(즉, 메모리)을 제공한다.

  - **CPU interconnection**: control unit과 ALU, 레지스터 간의 소통 메커니즘이다.

- **주기억장치(Main memory)**: 데이터를 저장한다.

- **입출력장치(I/O)**: 컴퓨터 간에 데이터를 이동시키거나, 외부 장치로 데이터를 이동시킨다.

- **System interconnection**: CPU, 메모리, I/O 간의 소통 메커니즘이다. 대표적인 예로는 (전선으로 구성된) **시스템 버스(system bus)**가 있다.

현대 컴퓨터들의 특징 중 하나가 멀티 프로세서 (혹은 멀티코어)이고, 또 다른 특징 중 하나는 **캐시 메모리(cache memory)**라고 하는, CPU와 메인 메모리 사이에 존재하는 메모리를 사용하여 메모리 계층을 이룬다는 것이다. 이 캐시 메모리에 가까운 미래에 사용될 가능성이 높은 데이터들을 저장함으로써 컴퓨터 성능 향상을 꾀하는데, CPU에 (논리적으로) 가까울 수록 빠르고 용량이 작고, 멀수록 느리고 용량이 크다.

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io/assets/images/computer_architecture/fig1.2.png" />
</p>

그림 1.2는 멀티코어 컴퓨터의 주요 장치들을 보여준다. 임베디드 컴퓨터, 스마트폰, 태블릿 등을 포함한 컴퓨터들의 장치들은 **마더보드**에 들어있다 (housed). 이러한 구성들을 살펴보기 전에 몇가지 용어를 정의해보자:

- **인쇄 회로 기판(Printed circuit board, PCB)**: 집적 회로, 스위치 등의 전기적 부품들이 납땜되는 얇은 판. 흔히 생각하는 초록색깔 판이다.

- **마더보드(Motherboard)**: 컴퓨터의 PCB들 중에서 메인 PCB이다.

- **확장 보드(expansion board)**: 컴퓨터 시스템에 기능을 추가할 목적으로 확장 슬롯에 꽂는 PCB.

- **Chip**: 주로 실리콘으로 만들어져 전자 회로와 논리 게이트들이 집적되는 반도체. 이 결과물을 집적 회로 (integrated circuit) 이라고 한다.

마더보드는 프로세서를 위한 슬롯 (혹은 소켓), 메모리를 위한 슬롯, I/O 컨트롤러 칩, 그리고 다른 주요 컴퓨터 하드웨어 요소들로 이루어져 있다.

다음으로, 하나의 코어에 대해 살펴보자. 한 코어의 기능적인 요소들은 다음과 같다:

- **명령 로직(Instruction logic)**에는 명령을 가져오기 위한(fetching instructions) 작업들, 그리고 가져온 명령들을 해석하기 위한 작업들이 포함된다.

- **ALU**는 명령에 의한 동작들을 수행한다.

- **Load/store logic** 캐시를 통한 데이터 전송을 관리한다.
