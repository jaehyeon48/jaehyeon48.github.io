---
title: '버블 정렬'
date: 2022-01-05
category: 'Algorithms'
draft: false
---

📢  
- 여기서 소개하는 정렬은 **오름차순**정렬을 기준으로 합니다.  
- `n`개의 원소를 저장하는 배열`A`를 `A[0 ⋯ n - 1]`라고 표현하겠습니다.

## 개념

일반적으로 버블 정렬은 두 개의 포인터를 이용하여 이웃한 요소쌍(pair)을 비교해가면서 순서대로 되어 있지 않은 요소들의 자리를 바꿔나가는 방식으로 진행됩니다. 각 패스(pass)마다 이 과정을 거치며, 최대 n번의 패스를 수행합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/bubble-sort/bubble_sort_process_1.png" alt="bubble sort process 1" />
    <figcaption>버블 정렬 프로세스 1</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/bubble-sort/bubble_sort_process_2.png" alt="bubble sort process 2" />
    <figcaption>버블 정렬 프로세스 2</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/bubble-sort/bubble_sort_process_3.png" alt="bubble sort process 3" />
    <figcaption>버블 정렬 프로세스 3</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/bubble-sort/bubble_sort_process_4.png" alt="bubble sort process 4" />
    <figcaption>버블 정렬 프로세스 4</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/bubble-sort/bubble_sort_process_5.png" alt="bubble sort process 5" />
    <figcaption>버블 정렬 프로세스 5</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/bubble-sort/bubble_sort_process_final.png" alt="bubble sort process final" />
    <figcaption>버블 정렬 프로세스 완료</figcaption>
</figure>

버블 정렬의 첫 번째 패스는 요소를 `n-1`번, 두 번째 패스는 `n-2`번, 세 번째는 `n-3`번, ... 순회하여 마지막 패스는 `1`번 순회하게 됩니다. 따라서 버블 정렬의 총 순환 횟수는 (최대) (n-1)+(n-2)+...+1번 이므로 시간 복잡도는 $O(n^2)$이 됩니다.

## 구현 코드

[구현 코드 보러가기](https://github.com/jaehyeon48/ds-and-algo/tree/main/src/algorithms/sorting/bubbleSort)