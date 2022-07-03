---
title: '클럭이란 무엇일까?'
date: 2021-03-26
category: 'Computer Architecture'
draft: false
---

우선 비유를 통해 클럭을 사용하는 이유를 알아보자면, 클럭은 오케스트라의 지휘자의 역할을 수행합니다. 만약 오케스트라 연주를 하는데 지휘자가 없다면, 각 연주자들이 자신만의 템포로 연주하게되어 전체적으로 엉망이 될 것입니다.

회로에서도 이와 비슷한 현상이 발생할 수 있는데, 이를 해결하기 위해 오케스트라에서 지휘자가 "일정한 속도"로 지휘를 해서 전체적인 템포를 일정하게 맞추듯이, 회로에 전기적 진동을 "일정하게" 가하여 회로 전체의 템포(타이밍)을 맞추기 위해 클럭을 사용합니다.

이때 이러한 전기적 진동의 속도를 나타내는 단위가 **클럭**이며, 전파·음파등이 초당 진동하는 횟수인 Hz(헤르츠)로 표시합니다. 클럭은 값이 1인 구간과 0인 구간이 반복되는데, 이 클럭 신호에서 반복되는 기본 단위를 클럭 주기(clock cycle, or clock period)라고 합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/what-is-a-clock/clock-cycle.png" alt="클럭 사이클" />
    <figcaption>클럭 사이클.</figcaption>
</figure>

일반적으로 클럭 신호는 수정 발진자(quartz crystal, 흔히 quartz 시계에 들어가는 그 quartz 입니다)에 의해 생성됩니다. 수정 발진자에 전력이 공급되면 일정한 사인파(sine wave)를 만들어내는데, 이 파동을 디지털 신호로 변환시켜서 사용합니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/computer-architecture/what-is-a-clock/clock-generator.png" alt="클럭 생성기" />
    <figcaption>클럭 생성기. 출처: https://en.wikipedia.org/wiki/Clock_generator</figcaption>
</figure>