---
title: '컴퓨터의 구성 요소들'
date: 2021-03-25
category: 'Computer Architecture'
draft: false
---

이 포스트에선 컴퓨터를 구성하는 주요 요소들을 간략히 살펴보겠습니다.

## 컴퓨터 구성 요소(Computer Components)

현대의 컴퓨터들은 대부분 **폰 노이만 구조**를 따르는데, 이 구조의 핵심은 다음과 같습니다:

  - 데이터와 명령어들은 메인 메모리에 저장됩니다.
  - 메모리 주소를 이용하여 저장된 데이터 및 명령어들을 식별합니다.
  - 명시적으로 변경되지 않는 한, 명령어들은 순차적으로 실행됩니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-components/von-neumann-architecture.png" alt="폰 노이만 구조" />
    <figcaption>폰 노이만 구조.</figcaption>
</figure>

폰 노이만 구조 이전에는 **hardwired program** 방식을 사용했었는데, 이 방식의 특징은 다음과 같습니다:

  - 전선들이 하드웨어적으로 연결되어 동작합니다. 이때, 컴퓨터가 수행하는 동작을 다르게 하려면 하드웨어를 조작해서 재설정해야 합니다.
  - 하드웨어 구성(configuration)을 어떻게 하느냐에 따라 실행 결과가 달라집니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-components/hard-wired-eniac.png" alt="hardwired 방식을 사용했던 ENIAC" />
    <figcaption>hardwired 방식을 사용했던 ENIAC. 출처: https://www.simslifecycle.com/2022/01/04/the-journey-of-eniac-the-worlds-first-computer/</figcaption>
</figure> 

이 둘의 차이를 비교하자면 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-components/hardware-software-approaches.png" alt="hardwired 방식 vs. 소프트웨어 방식" />
    <figcaption>hardwired 방식 vs. 소프트웨어 방식. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure> 

위 그림 `(a)`에서, 네모 블럭이 곱셈을 수행하는 하드웨어라고 생각해봅시다. 이 네모 블럭에 데이터를 집어넣으면 그에 맞는 곱셈 결과가 나오게 될 것입니다. 하지만 만약 곱셈이 아니라 나눗셈을 수행하고 싶다면, 하드웨어 구성 자체를 나눗셈을 실행할 수 있는 형태로 뜯어고쳐야 합니다. 이것이 hardwired 구조입니다.

`(b)`의  general-purpose 블럭에는 각각 덧셈·뺄셈·곱셈·나눗셈 연산을 수행하는 하드웨어가 있다고 해봅시다. 만약 곱셈 연산을 수행하고 싶다면, 곱셈 명령을 명령 해석기에 전달하기만 하면 됩니다. 그러면 해석기에서 명령을 해석하여 general-purpose 블럭이 명령에 알맞은 동작을 수행하도록 합니다. 또한 곱셈이 아니라 나눗셈을 수행하고 싶다면, `(a)`와 같이 나눗셈을 수행하는 전용 하드웨어로 교체할 필요 없이, 명령 해석기에 나눗셈 명령을 전달하기만 하면 됩니다. 이것이 바로 소프트웨어 방식을 사용하는 컴퓨터의 동작입니다.

### 주요 구성 요소들

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-components/computer-components-top-down.png" alt="컴퓨터의 주소 구성 요소들" />
    <figcaption>컴퓨터의 주소 구성 요소들. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure> 

#### CPU

CPU는 주로 명령을 해석하고, 산술 및 논리 연산을 수행합니다. 

또한, CPU에는 범용 레지스터 이외에 특정 동작을 위한 레지스터가 여럿 존재합니다:

  - `MAR(Memory Address Register)`: 다음에 읽고 쓸 메모리 주소를 저장합니다.
  - `MBR(Memory Buffer Register)`: 메모리에 쓸 데이터, 혹은 메모리로부터 받은 데이터를 저장합니다.
  - `PC(Program Counter)`: 다음에 실행할 명령어의 주소를 저장합니다.
  - `IR(Instruction Register)`: PC가 가리키는 곳에서 가져온 명령어를 저장합니다.
  - `I/OAR`: MAR과 비슷하게, 특정 I/O 장치를 가리킵니다.
  - `I/OBR`: MBR과 비슷하게, I/O 모듈과 CPU 간에 교환되는 데이터를 저장합니다.

#### 메인 메모리

명령어와 데이터를 저장하는 메인 메모리는 순차적으로 증가하는 주소를 이용해서 각각의 메모리 셀(cell)을 식별합니다.

#### I/O 장치

CPU·메인 메모리와 외부 데이터를 주고 받는 장치로써, 데이터를 임시로 저장하는 버퍼를 자체적으로 가지고 있습니다.

## 명령 사이클(Instruction Cycle)

컴퓨터의 기본적인 기능은 메모리에 저장된 명령어들의 집합인 프로그램을 실행하는 것입니다. 이는 CPU가 메모리로부터 명령어를 하나씩 가져와 실행하는 방식으로 진행되는데, 이때 하나의 명령어를 실행하는 과정을 **명령 사이클(instruction cycle)**이라고 합니다. 명령 사이클에는 크게 **fetch 사이클**과 **execute 사이클**이 존재합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-components/basic-instruction-cycle.png" alt="기본적인 명령 사이클" />
    <figcaption>기본적인 명령 사이클. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure> 

각 명령 사이클을 시작할 때, CPU는 PC에 저장된 메모리 주소로부터 명령을 가져옵니다(fetch). 그러고 나서 다른 주소로 점프해야 하는 경우가 아니라면, 명령어를 fetch 한 뒤 항상 PC값을 증가함으로써 순차적으로 다음 명령을 가져올 수 있도록 합니다. 이때 명령어의 크기에 따라 값을 얼만큼 증가하느냐가 결정되는데, 예를 들어 32비트 컴퓨터의 경우 주소가 4씩 증가하고, 64비트 컴퓨터의 경우 8씩 증가하게 됩니다.

이렇게 메모리로부터 가져온 명령어는 IR에 저장되는데, CPU는 이렇게 저장된 명령어를 해석하여 명령어가 요구하는 동작을 수행합니다. 일반적으로 명령어가 요구하는 동작을 다음과 같이 크게 네 가지로 분류할 수 있습니다:
  - `Processor-memory`: CPU에서 메모리로 데이터를 전송하거나, 혹은 반대로 메모리에서 CPU로 데이터를 전송합니다.
  - `Processor-I/O`: CPU와 I/O 모듈 간의 통신을 이용해 데이터를 주변 장치로 전송하거나, 혹은 반대로 주변 장치에서 CPU로 데이터를 전송합니다.
  - `Data processing`: 데이터에 대한 산술 혹은 논리 연산을 수행합니다.
  - `Control`: 명령 실행 순서를 변경합니다. 예를 들어, 100번지에 있는 명령이 다음 명령을 200번지에서 가져오라고 하는 경우 (원래라면 101), CPU는 PC에 101이 아니라 200을 저장함으로써 명령의 실행 순서를 변경합니다.

<hr />

다음 그림과 같이 하나의 AC(accumulator) 레지스터를 가지는 CPU가 있고, 명령어와 데이터 모두 16비트인 가상의 컴퓨터를 예로 살펴봅시다. 각 명령어는 4비트의 opcode와 12비트의 주소로 구성되어 있습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-components/hypothetical-machine.png" alt="가상의 컴퓨터" />
    <figcaption>가상의 컴퓨터. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure> 

아래 그림은 프로그램 실행의 일부분으로, 실행과 관련된 메모리와 CPU 레지스터들을 보여주고 있습니다. 여기에 나온 프로그램은 메모리 주소 940번지에 있는 데이터와 941번지에 있는 데이터를 더해 941번지에 저장하는 프로그램입니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-components/example-of-program-execution.png" alt="프로그램 실행 예시" />
    <figcaption>프로그램 실행 예시. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure> 

여기서는 총 세 번의 명령 사이클이 소요됩니다:

  1. 현재 PC에는 첫 번째 명령의 주소인 300을 저장하고 있습니다. 이후 이 명령(16진수로 1940)이 IR에 로드되고, PC는 301로 증가됩니다 (실제로는 MAR과 MBR도 사용되지만 여기서는 생략하였습니다).
  2. IR에 저장된 첫 4비트(16진수에서 맨 앞 숫자 1)는 데이터를 AC에 로드하라는 것이고, 나머지 12비트(940)는 가져올 데이터의 주소를 나타내고 있으므로, 이를 실행하여 940번지로부터 데이터를 가져와서 AC에 로드합니다.
  3. PC에 저장된 주소에서 명령(5941)을 가져와서 IC에 저장한 뒤, PC를 증가시킵니다.
  4. AC에 저장되어있던 데이터(3)와 301번지에서 가져온 데이터(2)를 더해서 그 결과를 AC에 저장합니다.
  5. PC에 저장된 주소에서 명령(5941)을 가져와서 IC에 저장한 뒤, PC를 증가시킵니다.
  6. AC에 있는 데이터(5)를 941번지에 저장합니다.

여기서 940번지의 데이터와 941번지의 데이터를 더하기 위해서는 총 세 번의 명령 사이클이 소요되었습니다 (각각의 명령 사이클 당 fetch 사이클 한 번, execute 사이클 한 번이 포함되어 있으므로, fetch 및 execute 사이클도 각각 총 3번 수행되었습니다).

<hr />

앞서 살펴본 instruction cycle을 좀 더 세분화 해서 나타내면 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/computer-components/instruction-cycle-diagram.png" alt="명령 사이클 상태 diagram" />
    <figcaption>명령 사이클 상태 diagram. 출처: Computer Organization and Architecture 10th Edition</figcaption>
</figure> 

## 레퍼런스

- [Computer Organization and Architecture 10th Edition](https://www.amazon.com/Computer-Organization-Architecture-William-Stallings/dp/0134101618/ref=sr_1_3?crid=254TMAUZ6SF0Z&keywords=Computer+Organization+and+Architecture&qid=1655859599&s=books&sprefix=computer+organization+and+architecture%2Cstripbooks-intl-ship%2C242&sr=1-3)
