---
title: '초간단 React 커스텀 스크롤바 만들기'
date: 2022-02-08
category: 'React'
draft: false
---

## 개요

이전 프로젝트를 진행할 때 사이트 디자인을 참고하다가 [업비트](https://upbit.com/home)의 스크롤바가 신기했었습니다. 처음엔 [::-webkit-scrollbar](https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar)로 커스터마이징한 줄 알았는데 알고보니 자체적으로 만든거였습니다..!

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-scrollbar/upbit_scrollbar.gif" alt="업비트 스크롤바" />
</figure>

이전 프로젝트에선 `::-webkit-scrollbar` 기능을 이용하여 스크롤바를 커스터마이징 했지만, 스크롤바가 차지하는 공간으로 인해 레이아웃을 잡을 때 왼쪽/오른쪽 대칭을 맞추는게 꽤 번거롭다고 느꼈습니다. 이 때문에 다음 프로젝트에선 스크롤바를 따로 구현하여 업비트에서와 같은 스크롤바를 구현하고자 했습니다.

## 기초 작업

우선, 커스텀 스크롤바를 구현하기 위해 필요한 기초 계산들을 수행했습니다. 스크롤바는 주로 리스트, 테이블 등에서 사용되지 싶은데 리스트를 예로 들자면 바깥 컨테이너는 `<ul>`, 안쪽에는 여러 개의 `<li>`를 담고 있는 내부 컨테이너 `<div>` 등이 존재한다고 했을때 이를 그림으로 나타내면 아래와 같을겁니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-scrollbar/basic_layout.png" alt="기본 레이아웃" />
</figure>

일반적으로 내부 컨테이너(`<div>` 등)에는 여러 개의 `<li>`, `<td>` 등이 존재할 것이고, 외부 컨테이너는 보통 `<ul>`, `<tbody>` 등의 요소가 사용될 것입니다. 그리고 외부 컨테이너엔 `overflow: hidden scroll;`과 같은 css 속성을 먹여주겠죠?

기본적인 레이아웃을 살펴봤으면 그 다음으로 스크롤바 막대 `thumb`의 높이를 구해줄 차례입니다. 비(ratio)를 이용하여 계산할 수 있을 듯 합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-scrollbar/calculate_height_of_thumb.png" alt="thumb 높이 구하기" />
</figure>

~~~이때 두 번째 $innerH * thumbH = outerH^2$ 식에서, $innerH ≥ outerH$ 이므로 $thumbH ≤ outerH$임을 유추할 수 있을 것 같습니다.~~~

제가 잘못생각했습니다! innerH가 outerH보다 작은 경우가 있을 수 있고 이때 thumbH의 height는 0이 되겠네요 😂

<br />

`thumb`의 높이도 구했으면 마지막으로 `thumb`의 y좌표를 구해줄 차례입니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-scrollbar/calculate_y_of_thumb.png" alt="thumb y좌표 구하기" />
</figure>

위 그림에서와 같이 `thumb`를 위아래로 움직이기 위해 `transform: translateY()` css 속성을 적용할 예정입니다. 이를 위해 `translateY()` 함수에 들어갈 값을 알아내야겠죠!

제가 생각한 로직은 다음과 같습니다. 일단 살펴보면 내부 컨테이너가 움직이는 y축 범위는 `0`(스크롤 제일 위) 부터 `innerH - outerH`(스크롤 제일 아래) 입니다. 하지만 이 범위를 그대로 `thumb`에 적용하면 아래 그림과 같이 됩니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-scrollbar/calculate_y_of_thumb_wrong.png" alt="잘못된 thumb y좌표 구하기" />
</figure>

즉, 스크롤을 제일 아래로 내렸을 때 스크롤은 외부 컨테이너의 최상단에 위치하게 됩니다. 하지만 우리가 원하는 것은 거기서 `outer - thumbH` 만큼 더 내려오는 것이죠!

다시 말해 스크롤이 움직이는 y축 범위는 `0`(스크롤 제일 위) 부터 `innerH - outerH + outerH - thumbH = innerH - thumbH` (스크롤 제일 아래)가 된다고 할 수 있습니다.

이에 착안하여 스크롤의 y축 범위를 구하는 방법은 아래 그림과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-scrollbar/calculate_height_of_thumb_final.png" alt="thumb y좌표 구하기 최종" />
</figure>

이제 모든 계산은 끝났으므로 이를 구현하기만 하면 됩니다!

## 구현1

여기까지 결정한 사항들을 바탕으로, 커스텀 훅 기반으로 구현한 데모 링크입니다: [데모 링크](https://codesandbox.io/s/react-custom-scrollbar-demo-1-obn9b)

## 구현2

위 구현을 바탕으로, 특정 컨테이너가 아니라 앱의 스크롤을 바꾸는 `GlobalCustomScroll`을 구현해보았습니다. 글로벌 스크롤은 `root` 요소의 자식이 아니라 `body` 요소의 자식으로 렌더링하기 위해 `createPortal`을 사용했습니다: [데모 링크](https://codesandbox.io/s/react-custom-scrollbar-demo-with-global-scroll-s1v0c)

## 남은 과제

- 화면 resize시 그에 맞춰 스크롤바 thumb의 높이 다시 계산하기
- ~~~스크롤바 `thumb`의 크기가 매우매우 작아지는 경우(즉, `outerH` 대비 `innerH`가 너무 커지는 경우)엔 어떻게 할것인가?~~~
- 실제 스크롤바처럼 마우스로 `thumb`를 잡고 움직일 수 있도록 구현하기

## 스크롤바 thumb의 크기가 매우 작아지는 케이스 처리

이번엔 스크롤바 thumb의 크기가 매우 작아지는 경우에 대해서 처리해보겠습니다. 기본적인 아이디어는, 계산된 thumb의 높이가 일정 수준 이하로 내려가면 미리 설정해둔 최소 thumb 높이를 설정하고 thumb의 y좌표값을 보정해주는 것입니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-scrollbar/revised_thumb_h_concept.png" alt="최소 thumb 높이 조정" />
</figure>

위 그림처럼 원래의 thumb을 original thumb, 조정된 thumb을 revised thumb이라고 하고, original thumb의 y좌표를 y, revised thumb의 y좌표를 y'라고 해보겠습니다. 이때, 원래의 thumb을 최소 크기로 조정한다면 원래의 thumb과 조정된 thumb 간에는 `ΔH` 만큼의 차이가 발생하게 됩니다. 저는 thumb 높이를 보정하는 것의 핵심은 바로 이 `ΔH` 만큼의 차이를 y'에 반영해주는 것이라 생각했습니다. 이를 통해 도출한 식은 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-scrollbar/revised_thumb_h_calculation.png" alt="최소 thumb 높이 조정 계산" />
</figure>

이때 ymax값은 앞 섹션에서 구한 `innerH - thumbH`를 사용하면 되고, Δymax값은 (최소 thumb 높이 - 실제 thumb 높이)로 구할 수 있습니다.

이것들을 반영하여 구현한 데모 링크입니다: [데모](https://codesandbox.io/s/react-scrollbar-revise-min-height-demo-q527h)

이때, 글로벌 스크롤의 경우 스크롤을 올리고 내릴때 중간 중간에 이상하게 움직이는 버그가 있습니다. useCustomScrollBar 로직에는 이 같은 버그가 없는 것 같은데 버그의 원인은 아직 모르겠습니다. 기능적으로는 정상적으로 동작하는것으로 보아 페인팅 과정에서 무슨 문제가 일어나는 것 같습니다..? (예시를 위해 thumb의 너비를 크게 했습니다):

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-scrollbar/scrollbar_bug.gif" alt="최소 thumb 높이 조정 계산" />
</figure>

## 2022.02.28 업데이트

커스텀 스크롤바를 사용하다 보니, 리스트 아이템이 추가되거나 제거되는 경우에도 `thumb`의 높이와 `y` 좌표를 다시 계산해줘야 한다는 사실을 알게되어, 이를 반영해주었습니다.

우선 `y` 좌표를 구하는 로직의 경우, `useEffect`를 이용하여 아래와 같이 스크롤바 훅을 사용하는 컴포넌트가 업데이트 될 때마다 `useEffect`를 실행해주어 `y` 좌표를 다시 계산하게 하였습니다:

```ts
const calculateThumbY = useCallback(() => {
  if (!thumbRef.current) return;
  if (!outerContainerRef.current) return;
  if (!innerContainerRef.current) return;

  const { clientHeight: outerH } = outerContainerRef.current;
  const { clientHeight: innerH } = innerContainerRef.current;
  const { top: outerTop } = outerContainerRef.current.getBoundingClientRect();
  const { top: innerTop } = innerContainerRef.current.getBoundingClientRect();

  const revisedThumbScrollY =
  	originalThumbH.current === -1
  	  ? calculateRevisedThumbH({
  	  	  outerTop,
  	  	  innerTop,
  	  	  outerH,
  	  	  innerH,
  	  	  outerContainerBorderWidth,
  	  	  thumbH
  	    })
  	  : calculateRevisedThumbH({
  	  	  outerTop,
  	  	  innerTop,
  	  	  outerH,
  	  	  innerH,
  	  	  thumbH: originalThumbH.current,
  	  	  outerContainerBorderWidth,
  	  	  isRevisedToMinH: true
  	    });
  thumbRef.current.style.transform = `translateY(${revisedThumbScrollY}px)`;
}, [thumbH, innerContainerRef, outerContainerRef, outerContainerBorderWidth]);

useEffect(() => {
  calculateThumbY();
}, [calculateThumbY]);
```

그 다음, `thumb`의 높이를 구하는 이펙트의 의존성 배열을 제거하여 컴포넌트가 리렌더링될 때마다 높이를 다시 구하도록 하였습니다:

```ts{21}
useEffect(() => {
  let intervalId: NodeJS.Timer;
	function initThumbHeight() {
	  if (!outerContainerRef.current || !innerContainerRef.current || !thumbRef.current) return;
	  clearInterval(intervalId);
	  const { clientHeight: outerH } = outerContainerRef.current;
	  const { clientHeight: innerH } = innerContainerRef.current;
	  if (innerH <= outerH) {
	  	setThumbHeight(0);
	  	return;
	  }

	  const thumbHCandidate = outerH ** 2 / innerH;
	  if (thumbHCandidate < MIN_THUMB_H) originalThumbH.current = thumbHCandidate;
	  setThumbHeight(thumbHCandidate < MIN_THUMB_H ? MIN_THUMB_H : thumbHCandidate);
	}

  if (!outerContainerRef.current || !innerContainerRef.current || !thumbRef.current) {
    intervalId = setInterval(initThumbHeight, 1);
  } else initThumbHeight();
});
```

이때 예상되는 문제는, 아무래도 리스트 자체가 아니라 리스트의 부모가 리렌더링 되는 경우에도 (불필요하게?) 스크롤바 관련 계산이 다시 발생한다는 점인데, 이는 계산관련 로직을 외부로 위임하여 리스트가 업데이트 되는 경우에 해당 로직들을 외부에서 호출하도록 하면 최적화할 수 있을 듯 합니다.

하지만 현재로선 일단 위 로직대로 사용하고 이후 성능상 저하가 많이 발생한다고 하면 그때가서 최적화할 수 있는 방안들을 살펴보려고 합니다.
