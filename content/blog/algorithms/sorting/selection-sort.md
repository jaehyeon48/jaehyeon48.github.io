---
title: '선택 정렬'
date: 2022-01-07
category: 'Algorithms'
draft: false
---

📢  
- 여기서 소개하는 정렬은 **오름차순**정렬을 기준으로 합니다.  
- `n`개의 원소를 저장하는 배열`A`를 `A[0 ⋯ n - 1]`라고 표현하겠습니다.

## 개념

일반적으로 선택 정렬은 `A[0 ⋯ n - 1]`에서 가장 큰 요소를 찾아 이 요소와 배열의 끝자리에 있는 요소랑 자리를 바꾸는 방식으로 동작하는 알고리즘입니다. 매 번 배열을 돌 때마다 맨 끝으로 옮겨진 요소는 자기 자리(정렬된 위치)를 찾게 되고, 이를 반복하면 배열이 정렬됩니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/selection-sort/selection_sort_process_1.png" alt="selection sort process 1" />
    <figcaption>선택 정렬 프로세스 1</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/selection-sort/selection_sort_process_2.png" alt="selection sort process 2" />
    <figcaption>선택 정렬 프로세스 2</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/selection-sort/selection_sort_process_3.png" alt="selection sort process 3" />
    <figcaption>선택 정렬 프로세스 3</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/selection-sort/selection_sort_process_4.png" alt="selection sort process 4" />
    <figcaption>선택 정렬 프로세스 4</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/selection-sort/selection_sort_process_5.png" alt="selection sort process 5" />
    <figcaption>선택 정렬 프로세스 5</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/selection-sort/selection_sort_process_6.png" alt="selection sort process final" />
    <figcaption>선택 정렬 프로세스 6</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/algorithms/sorting/selection-sort/selection_sort_process_final.png" alt="selection sort process final" />
    <figcaption>선택 정렬 프로세스 완료</figcaption>
</figure>

선택 정렬의 첫 번째 패스는 요소를 `n-1`번, 두 번째 패스는 `n-2`번, 세 번째는 `n-3`번, ... 순회하여 마지막 패스는 `1`번 순회하게 됩니다. 따라서 선택 정렬의 총 순환 횟수는 (n-1)+(n-2)+...+1번 이므로 시간 복잡도는 $O(n^2)$이 됩니다.

## 구현 코드

[구현 코드 보러가기](https://github.com/jaehyeon48/ds-and-algo/tree/main/src/algorithms/sorting/selectionSort)
