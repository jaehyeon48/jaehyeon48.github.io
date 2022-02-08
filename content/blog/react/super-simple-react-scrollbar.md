---
title: '초간단 React 커스텀 스크롤바 만들기'
date: 2022-02-08
category: 'React'
draft: false
---

## 개요

이전 프로젝트를 진행할 때 사이트 디자인을 참고하다가 [업비트](https://upbit.com/home)의 스크롤바가 신기했었습니다. 처음엔 [::-webkit-scrollbar](https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar)로 커스터마이징한 줄 알았는데 알고보니 자체적으로 만든거였습니다..!

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/upbit_scrollbar.gif" alt="업비트 스크롤바" />
</figure>

이전 프로젝트에선 `::-webkit-scrollbar` 기능을 이용하여 스크롤바를 커스터마이징 했지만, 스크롤바가 차지하는 공간으로 인해 레이아웃을 잡을 때 왼쪽/오른쪽 대칭을 맞추는게 꽤 번거롭다고 느꼈습니다. 이 때문에 다음 프로젝트에선 스크롤바를 따로 구현하여 업비트에서와 같은 스크롤바를 구현하고자 했습니다.

## 기초 작업

우선, 커스텀 스크롤바를 구현하기 위해 필요한 기초 계산들을 수행했습니다. 스크롤바는 주로 리스트, 테이블 등에서 사용되지 싶은데 리스트를 예로 들자면 바깥 컨테이너는 `<ul>`, 안쪽에는 여러 개의 `<li>`를 담고 있는 내부 컨테이너 `<div>` 등이 존재한다고 했을때 이를 그림으로 나타내면 아래와 같을겁니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/basic_layout" alt="기본 레이아웃" />
</figure>

일반적으로 내부 컨테이너(`<div>` 등)에는 여러 개의 `<li>`, `<td>` 등이 존재할 것이고, 외부 컨테이너는 보통 `<ul>`, `<tbody>` 등의 요소가 사용될 것입니다. 그리고 외부 컨테이너엔 `overflow: hidden scroll;`과 같은 css 속성을 먹여주겠죠?

기본적인 레이아웃을 살펴봤으면 그 다음으로 스크롤바 막대 `thumb`의 높이를 구해줄 차례입니다. 비(ratio)를 이용하여 계산할 수 있을 듯 합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/calculate_height_of_thumb.png" alt="thumb 높이 구하기" />
</figure>

~~~이때 두 번째 $innerH * thumbH = outerH^2$ 식에서, $innerH ≥ outerH$ 이므로 $thumbH ≤ outerH$임을 유추할 수 있을 것 같습니다.~~~

제가 잘못생각했습니다! innerH가 outerH보다 작은 경우가 있을 수 있고 이때 thumbH의 height는 0이 되겠네요 😂

<br />

`thumb`의 높이도 구했으면 마지막으로 `thumb`의 y좌표를 구해줄 차례입니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/calculate_y_of_thumb.png" alt="thumb y좌표 구하기" />
</figure>

위 그림에서와 같이 `thumb`를 위아래로 움직이기 위해 `transform: translateY()` css 속성을 적용할 예정입니다. 이를 위해 `translateY()` 함수에 들어갈 값을 알아내야겠죠!

제가 생각한 로직은 다음과 같습니다. 일단 살펴보면 내부 컨테이너가 움직이는 y축 범위는 `0`(스크롤 제일 위) 부터 `innerH - outerH`(스크롤 제일 아래) 입니다. 하지만 이 범위를 그대로 `thumb`에 적용하면 아래 그림과 같이 됩니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/calculate_y_of_thumb_worng.png" alt="잘못된 thumb y좌표 구하기" />
</figure>

즉, 스크롤을 제일 아래로 내렸을 때 스크롤은 외부 컨테이너의 최상단에 위치하게 됩니다. 하지만 우리가 원하는 것은 거기서 `outer - thumbH` 만큼 더 내려오는 것이죠!

다시 말해 스크롤이 움직이는 y축 범위는 `0`(스크롤 제일 위) 부터 `innerH - outerH + outerH - thumbH = innerH - thumbH` (스크롤 제일 아래)가 된다고 할 수 있습니다.

이에 착안하여 스크롤의 y축 범위를 구하는 방법은 아래 그림과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/calculate_y_of_thumb_worng.png" alt="잘못된 thumb y좌표 구하기" />
</figure>

이제 모든 계산은 끝났으므로 이를 구현하기만 하면 됩니다!

## 구현1

여기까지 결정한 사항들을 바탕으로, 커스텀 훅 기반으로 구현한 데모 링크입니다: [데모 링크](https://codesandbox.io/s/react-custom-scrollbar-demo-1-obn9b)

## 구현2

위 구현을 바탕으로, 특정 컨테이너가 아니라 앱의 스크롤을 바꾸는 `GlobalCustomScroll`을 구현해보았습니다. 글로벌 스크롤은 `root` 요소의 자식이 아니라 `body` 요소의 자식으로 렌더링하기 위해 `createPortal`을 사용했습니다: [데모 링크](https://codesandbox.io/s/react-custom-scrollbar-demo-with-global-scroll-s1v0c)
