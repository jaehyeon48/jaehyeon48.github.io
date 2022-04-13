---
title: '프로세스 스케줄링'
date: 2021-03-16
category: 'OS'
draft: false
---

멀티프로그래밍(단일 CPU 상에서 여러 개의 프로그램이 동시에 실행되는 것)의 목적은 프로세스를 항상 사용함으로써 CPU를 놀도록 놔두지 않는 것, 즉 CPU를 최대한 효율적으로 사용하는 것입니다. 또한 시분할 시스템(Time sharing system)의 목적은 각 프로세스에 (매우)짧은 시간 간격으로 CPU를 할당하여 사용자가 여러 개의 프로세스와 동시에 상호작용 할 수 있도록, 즉 사용자가 보기에 여러 개의 프로세스가 동시에 돌아가는 것처럼 보이도록 하는 것입니다.

이러한 목적들을 달성하기 위해, **프로세스 스케줄러 (process scheduler)**는 사용 가능한(available) 프로세스 중에서 현재 실행할 프로세스 하나를 선택하여 CPU에 할당합니다. 이때, CPU의 각 코어는 한 번에 하나의 프로세스를 실행할 수 있습니다. 즉, 하나의 코어가 존재하는 시스템에서는 한순간에 최대 하나의 프로세스만 실행할 수 있고, 멀티코어 시스템에서는 한순간에 여러 개의 프로세스를 동시에 돌릴 수 있습니다. 만약 코어의 개수보다 더 많은 프로세스가 있다면 프로세스들은 코어가 빌 때까지 기다려야 할 것입니다.

## 큐 스케줄링 (Scheduling Queues)

프로세스가 시스템에 처음 진입(enter)하게 되면 **Job 큐(job queue)**라는 곳에 놓입니다. 즉, 디스크에 있는 프로그램이 실행되기 위해 (메인 메모리에 적재되기 위해) 기다리는 공간이라고 할 수 있습니다. 이후 메인 메모리에 적재된 프로세스들은 **레디 큐(ready queue)**라는 곳에 놓입니다. 레디 큐는 CPU 코어에 의해 실행되기를 기다리는 프로세스들이 모여있는 공간입니다.

또한, 프로세스가 (디스크와 같은) I/O 동작을 요청하는 경우가 있습니다. 일반적으로 이러한 장치들은 CPU에 비해 매우 느리게 동작하는데, 이에 따라 프로세스는 I/O 장치들이 동작을 마칠 때까지 기다려야 하는 경우가 발생하기도 합니다. 이렇게 I/O 동작이 완료되기를 기다리는 프로세스들은 **장치 큐(device queue)**라는 곳에 놓입니다. 장치 큐는 **대기 큐(waiting queue)**라고도 합니다.

일반적으로 큐들은 연결 리스트로 구현되는데, 큐의 헤더는 첫 번째 PCB를 가리키고, 각각의 PCB는 레디 큐에 있는 다음 PCB를 가리킵니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/process-scheduling/fig1.png" alt="프로세스 큐 구조" />
  <figcaption>프로세스 큐 구조.</figcaption>
</figure>

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/process-scheduling/fig2.png" alt="연결 리스트로 구현된 큐" />
  <figcaption>연결 리스트로 구현된 큐. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

## 프로세스 스케줄러

스케줄러는 크게 세 종류로 구분할 수 있습니다:

### 단키 스케줄러 Short-term scheduler (or, CPU scheduler)

**단기 스케줄러**는 레디 큐에 존재하는 프로세스 중에 다음에 실행할 프로세스를 선택하여 CPU 코어를 할당하는 작업, 즉 프로세스를 `Ready` 상태에서 `Running` 상태로 전이하는 역할을 수행합니다. 이러한 작업은 밀리초 단위로 (매우) 빈번하게 발생하기 때문에 "단기" 스케줄러라고 부릅니다 (CPU 스케줄러라고 하는 경우도 있습니다).

### 장기 스케줄러 Long-term scheduler (or, Job scheduler)

**장기 스케줄러**는 Job 큐에 있는 프로세스 중에서 어떤 프로세스를 레디 큐로 옮길지 결정하는 역할을 합니다. 이러한 작업은 상대적으로 드물게 발생하기 때문에 "장기" 스케줄러라고 부릅니다 (Job 스케줄러라고 하는 경우도 있습니다). Job 큐에서 대기하고 있는 프로세스를 메모리로 적재한다는 측면에서 장기 스케줄러는 **degree of multiprogramming**, 즉 *현재 메모리에 존재하는 프로세스의 수*를 결정하는 역할을 합니다. 따라서 장기 스케줄러가 멀티프로그래밍 성능을 좌우한다고 할 수 있습니다.

### 중기 스케줄러 Mid-term scheduler

앞서 장기 스케줄러가 멀티프로그래밍 성능을 좌우한다고 하였는데, 이러한 장기 스케줄러의 속도를 빠르게 해서 결과적으로 멀티프로그래밍 성능을 향상하고자 고안된 것이 **중기 스케줄러**입니다. 중기 스케줄러는 프로세스를 (현재 상태 그대로) 메모리에서 제거하여 디스크에 저장하고, 필요하면 이후에 다시 메모리에 적재함으로써 degree of multiprogramming을 줄이는 역할을 합니다.

이러한 과정을 **스와핑(swapping)**이라고 하며, 프로세스가 메모리에서 디스크로 옮겨지는 것을 **스왑 아웃(swap out)**, 디스크에서 다시 메모리로 적재되는 것을 **스왑 인(swap in)**이라고 합니다. 이는 마치 레디 큐를 확장해서 사용하는 것과 같은 효과를 제공함으로써 멀티프로그래밍 성능을 향상합니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/process-scheduling/fig3.png" alt="mid-term 스케줄러가 추가된 구조" />
  <figcaption>mid-term 스케줄러가 추가된 구조. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

## 컨텍스트 스위치 (Context Switch)

**컨텍스트**란, 프로세스의 상태라고 할 수 있습니다. 이러한 컨텍스트는 프로세스의 PCB에 저장됩니다.

CPU를 다른 프로세스에게 할당하는 경우 현재 프로세스의 상태를 저장하고, 전환될 프로세스의 상태를 불러와야 하는데, 이 작업을 **컨텍스트 스위치(context switch)** 라고 합니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/os/process-scheduling/fig4.png" alt="컨텍스트 스위치" />
  <figcaption>컨텍스트 스위치. 출처: Operating System Concepts (10th Edition)</figcaption>
</figure>

위 그림에서와 같이, 컨텍스트 스위치가 발생하면 커널은 현재 프로세스의 상태를 PCB에 저장하고 새 프로세스의 상태를 불러옵니다. 하지만 컨텍스트 스위치에 걸리는 시간은 일종의 오버헤드 입니다. 컨텍스트 스위치를 하는 와중에는 CPU를 사용할 수 있음에도 불구하고 사용할 수 없기 때문입니다. 이런 컨텍스트 스위치 시간은 OS가 복잡해질수록, 그리고 PCB가 많아질 수록 증가합니다. 또한, 메모리 속도, 복사해야 할 레지스터의 양, 모든 레지스터를 한꺼번에 불러오거나 저장할 수 있는 특수 명령어의 존재 여부 등에 따라 이 시간이 달라집니다만 일반적으로 수 나노초(μs)가 소요됩니다.

메모리 대신 레지스터를 사용함으로써 스위치 타임을 줄일 수 있고, 또 스위치가 일어나는 횟수를 줄임으로써(이것은 스케줄러의 역할) 성능 향상을 불러올 수 있습니다.

## 레퍼런스

- [Modern Operating Systems (4th Edition) - Andrew Tanenbaum, Herbert Bos](https://www.amazon.com/Modern-Operating-Systems-Andrew-Tanenbaum/dp/013359162X)
- [Operating System Concepts (10th Edition) - Abraham Silberschatz, Greg Gagne, Peter B. Galvin](https://www.amazon.com/Operating-System-Concepts-Abraham-Silberschatz/dp/1119800366/ref=sr_1_1?keywords=operating+system+concepts&qid=1649684419&s=books&sprefix=operating+system%2Cstripbooks-intl-ship%2C348&sr=1-1)
