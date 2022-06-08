---
title: '프로세스'
date: 2021-03-15
category: 'OS'
draft: false
---

## 프로세스의 개념

초창기 컴퓨터들은 어느 한순간에 하나의 프로그램만 실행할 수 있었습니다. 하지만 현대의 컴퓨터들은 여러 개의 프로그램이 동시에 메모리에 적재(load)되어 실행될 수 있는 형태로 발전하였습니다. 이러한 발전으로 인해 여러 프로그램들을 서로 구분해야 할 필요가 생겼고, 이에 따라 **프로세스(process)**라는 개념이 탄생하게 됩니다.

프로세스는 쉽게 말해 **프로그램의 인스턴스**, 즉 OS로 부터 가상 메모리를 할당 받아 현재 실행되고 있는 프로그램을 의미합니다. 프로그램이라는 것은 단순히 보조기억장치에 저장되어 있는, 기계어로 된 실행가능한 파일(executable)이고 이것이 메모리에 로드되어 실행되면 이를 프로세스라고 하는 것입니다. 프로세스의 활동 상태는 프로그램 카운터(PC)의 값과 CPU의 레지스터들에 의해 표현됩니다.

프로세스가 가지는 메모리 공간을 나타내면 아래의 그림과 같습니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/process/fig1.png" alt="프로세스 메모리 레이아웃" />
  <figcaption>프로세스 메모리 레이아웃.</figcaption>
</figure>

위 그림을 살펴보자면 다음과 같습니다:

- 유저 레벨 이외의 메모리 영역은 커널이 사용합니다.
- 유저 레벨 메모리 영역은 크게 5가지로 나뉩니다:

  - **스택 영역(Stack segment)**: 함수 호출과 연관된 지역·매개 변수가 저장되는 공간입니다. 함수 호출 시 생성되며 함수가 종료되면 반환(제거)됩니다. 시스템마다 차이가 존재하나, x86 아키텍처의 경우 주소가 감소하는 방향(lower address)으로 스택이 커집니다.
  - **힙 영역(Heap segment, or Dynamic Data)**: 동적 할당된 변수들이 저장되는 공간입니다. 시스템마다 차이가 존재하나, x86 아키텍처의 경우 주소가 증가하는 방향(higher address)으로 영역이 커집니다.
  - **BSS(or Uninitialized data)**: 초기화되지 않은 전역, static 변수들이 저장된 공간입니다. 프로그램이 실행되기 전에 커널에 의해 0으로 초기화됩니다 (포인터의 경우 `null` 포인터로 초기화됩니다). 여담으로 BSS는 Block Started (by) Symbol의 약자로서, *block started by symbol*이라는 어셈블러에서 유래했다고 합니다.
  - **Initialized Data**: 초기화된 전역·static 변수들이 저장되는 공간입니다.
  - **Text 영역(Text segment, or Code segment)**: 프로그램의 실행 가능한 명령들, 즉 명령어들이 저장되는 공간입니다. 임의로 Text 영역의 내용이 지워지는 것을 방지하기 위해 일반적으로 읽기 전용으로 설정됩니다. 또한 대부분의 경우 Text 영역은 프로세스 간에 공유할 수 있는데, 그 이유는 똑같은 프로그램에 대해 여러 개의 프로세스가 메모리에서 돌아가는 경우 해당 프로그램의 소스 코드는 같기 때문입니다. 예를 들어, 워드 프로그램을 동시에 3개 실행하는 경우 실제로 워드 프로그램의 소스 코드 데이터는 메모리에 하나만 올라가고 3개의 프로세스가 해당 소스 코드 데이터를 공유하는 방식을 사용합니다.

## CPU-bound, I/O-bound 프로세스

프로세스는 CPU burst(CPU를 사용하는 시간)에 따라 크게 다음과 같은 두 종류로 나눌 수 있습니다:

- **CPU bound 프로세스**: I/O 작업보다 연산(computation)에 더 많은 시간을 소모하는 프로세스입니다. CPU burst가 큰 프로세스로, 주로 많은 양의 수학 계산을 하는 프로세스가 이에 해당합니다.
- **I/O bound 프로세스**: 연산보다 I/O를 처리하는 데에 시간을 더 소모하는 프로세스입니다. CPU burst가 작습니다 (반대로 I/O burst가 크다고도 합니다).

## 프로세스 상태 (Process State)

프로세스를 실행하는 과정에서 프로세스의 상태는 계속해서 변합니다. 프로세스의 상태는 크게 다섯 가지로 나눌 수 있습니다:

- **생성(New)**: 프로세스가 생성되는 시점입니다.
- **실행(Running)**: 프로세스가 실행되고 있는 상태, 즉 프로세스를 구성하는 명령을 수행하고 있는 상태입니다.
- **대기(Waiting, or Blocked)**: 특정 이벤트(예를 들어, 인터럽트)에 의해 큐에 저장되어 기다리는 상태입니다.
- **준비(Ready)**: CPU를 할당받기를 기다리는 상태입니다.
- **소멸(Terminated)**: 프로세스가 실행을 마치고 종료된 상태입니다.

- 위 상태들을 그림으로 나타내면 다음과 같습니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/process/fig2.png" alt="프로세스 상태" />
  <figcaption>프로세스 상태. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

## Process Control Block, PCB

방금 살펴본 것처럼 프로세스의 상태가 변한다는 말은 운영 체제가 프로세스의 정보를 관리할 필요가 있다는 뜻이기도 합니다. 따라서 운영 체제는 **Process Control Block, PCB (or Task Control Block)**라는 것을 이용하여 프로세스의 정보를 관리합니다.

PCB의 구조는 다음과 같습니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/process/fig3.png" alt="PCB 구조" />
  <figcaption>PCB 구조. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

- **프로세스 상태(Process state)**: 현재 프로세스의 상태(5가지 중 하나)를 저장합니다.
- **Program counter**: 다음에 수행할 명령의 위치 정보를 저장합니다.
- **CPU 레지스터(CPU register)**: 프로세스 중심(process-centric) 레지스터들(accumulators, index registers, stack pointers, general-purpose registers, and condition-code information, ...)의 정보를 저장합니다.
- **CPU 스케줄링 정보(CPU scheduling information)**: 프로세스 우선순위와 같이, 프로세스 스케줄링에 관한 정보를 저장합니다.
- **메모리 관리 정보(Memory-management information)**: 프로세스에 할당된 메모리 정보를 저장합니다.
- **Accounting information**: CPU 사용 시간, 프로세스 숫자(ID) 등 프로세스 수행과 관련된 정보를 저장합니다.
- **I/O 상태 정보(I/O status information)**: 프로세스에 할당된 I/O 장치에 관한 정보, open file등에 대한 정보를 저장합니다.

## 레퍼런스

- [Modern Operating Systems (4th Edition) - Andrew Tanenbaum, Herbert Bos](https://www.amazon.com/Modern-Operating-Systems-Andrew-Tanenbaum/dp/013359162X)
- [Operating System Concepts (10th Edition) - Abraham Silberschatz, Greg Gagne, Peter B. Galvin](https://www.amazon.com/Operating-System-Concepts-Abraham-Silberschatz/dp/1119800366/ref=sr_1_1?keywords=operating+system+concepts&qid=1649684419&s=books&sprefix=operating+system%2Cstripbooks-intl-ship%2C348&sr=1-1)
