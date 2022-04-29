---
title: '고해상도 환경에서 캔버스가 흐릿하게 보이는 현상 해결하기'
date: 2022-04-29
category: 'HTML/CSS'
draft: false
---

캔버스를 이용한 프로젝트를 진행하다 해상도가 높은 환경에서 그래프, 텍스트 등이 흐릿하게 표시되는 현상을 발견하고 이를 해결하는 과정에서 학습한 내용을 정리한 글입니다.

## 캔버스 요소 크기 vs. 그리기 영역 크기

캔버스에는 크게 두 가지 영역이 존재합니다. 하나는 `<canvas>` HTML 요소 자체의 영역이고, 다른 하나는 실제 그림·텍스트 등이 그려지는 그리기 영역(drawing surface)입니다.

영역이 두 개가 존재하기 때문에 캔버스의 크기를 지정하는 방법에도 두 가지가 있습니다. 하나는 캔버스 요소의 `width`, `height` 속성을 이용하는 것이고, 나머지 하나는 CSS를 이용하는 것입니다:

- 캔버스 요소의 `width`, `height` 속성을 이용하여 크기를 지정하는 것은 **캔버스 요소의 크기 및 그리기 영역의 크기**를 지정하는 것과 같습니다.
- CSS(혹은 인라인 스타일)을 이용하여 크기를 지정하는 것은 **오로지 캔버스 요소의 크기**만을 지정하는 것과 같습니다.

|📌|
|-|
|그리기 영역 크기의 기본값은 너비 300, 높이 150입니다. 이때, 그리기 영역의 크기를 지정할 때는 "px"과 같은 단위를 붙여서는 안 되고 오직 **양의 정수**값만 입력할 수 있습니다. 만약 유효하지 않은 값으로 크기를 지정한다면 기본값이 적용됩니다. |


만약 캔버스 요소의 크기와 그리기 영역의 크기가 서로 다르다면 어떻게 될까요? 이 경우엔 **우선 그리기 영역의 크기에 맞춰 그림을 그린 다음, 브라우저가 그리기 영역의 크기를 캔버스 요소의 크기에 맞춰 표시합니다**. 이 때문에 아래와 같이 원치 않는 결과가 발생할 수도 있습니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/htmlcss/diff-between-canvas-size/canvas_twice_only_in_elem_size.png" alt="캔버스 요소의 크기만 두 배로 늘린경우" />
  <figcaption>캔버스 요소의 크기만 두 배로 늘린경우.</figcaption>
</figure>

위 사진에서 분홍색 캔버스는 기본값, 파란색 캔버스는 css를 이용하여 `width`와 `height`를 각각 `600px`, `300px` (두 배)로 적용한 경우입니다. 즉, 파란색 캔버스의 경우 그리기 영역의 크기는 기본값인 `300×150`이고, 캔버스 요소의 크기는 `600px × 300px`인 것이죠.

그림에서 볼 수 있듯이, 파란색 캔버스는 우선 대각선을 원래 그리기 영역의 크기(이 경우 디폴트 값인 300×150)에 맞춰 캔버스에 그린 다음, 캔버스 요소의 크기인 600px × 300px에 맞게 그리기 영역을 확대했습니다. 이에 따라 파란색 캔버스의 대각선이 흐릿하게 보이는 것입니다. 600×300 크기에 맞춰 텍스트를 그린 것이 아니라, 300×150에 맞게 그린 다음 이를 두 배 확대한 것이니 말이죠. 비트맵 이미지를 확대한 것과 같은 효과가 나타난 것입니다!

이러한 문제를 방지하기 위해선 CSS, 혹은 인라인 스타일을 이용하여 캔버스 크기를 지정하지 말고, 캔버스의 `width`, `height` 속성을 이용하여 지정하는 것이 좋습니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/htmlcss/diff-between-canvas-size/canvas_twice_in_both_size.png" alt="캔버스 요소의 크기와 그리기 영역의 크기 모두 두 배로 늘린 경우" />
  <figcaption>캔버스 요소의 크기와 그리기 영역의 크기 모두 두 배로 늘린 경우.</figcaption>
</figure>

위 그림은 파란색 캔버스의 크기를 `width`, `height` 속성을 통해 각각 `600px`, `300px` 만큼 지정한 경우입니다. 여기선 파란색 캔버스를 그릴 때 처음부터 600x300에 맞게 그렸기 때문에 대각선이 그대로 선명하게 나오는 것을 볼 수 있습니다.

## 기기 픽셀 비율, DPR

**기기 픽셀 비율(Device Per Ratio, DRP)**이란 논리적인 픽셀(CSS 픽셀)이 화면상의 실제 물리적인 픽셀에 대응되는 비율을 의미합니다. 즉 `DRP = 물리적 픽셀 / 논리젝 픽셀`로 나타낼 수 있으며, DPR이 1이라는 의미는 논리적인 픽셀 하나를 그리는데 물리적인 픽셀 하나가 사용된다는 뜻이고, DPR이 2라는 의미는 논리적인 픽셀 하나를 그리는데 물리적인 픽셀 두 개가 사용된다는 뜻입니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/htmlcss/diff-between-canvas-size/google_logo_in_different_dpr.png" alt="DPR이 1인 환경과 DPR이 2인 환경에서의 구글 로고" />
  <figcaption>DPR이 1인 환경과 DPR이 2인 환경에서의 구글 로고.</figcaption>
</figure>

위 그림은 동일한 로고가 서로 다른 DPR 환경에서 어떻게 표시되는지를 나타내는 그림입니다. 왼쪽과 같이 DPR이 1인 환경에서 정상적으로 표시되는 로고가 DPR이 2인 환경에선 확대되어 흐릿하게 표시되는 모습을 볼 수 있습니다.

예를 들어, `100x100` 픽셀 크기의 원본 이미지에 대해 CSS로 `width`, `height` 속성 모두 100픽셀만큼 지정하면 DPR이 1인 환경에선 물리적으로 `100x100` 픽셀만큼 사용하여 이미지를 화면에 표시하게 됩니다. 원본 크기가 `100x100`인 이미지를 실제 픽셀 `100x100` 만큼을 사용하여 표시하니 정상적으로 표시가 되는 것이죠.

하지만 DPR이 2인 환경에선 논리적으로 적용된 `100x100` 픽셀이 실제 픽셀로는 `200x200`에 대응되기 때문에, `200x200` 만큼의 물리적 픽셀을 사용하여 `100x100` 짜리 이미지를 표시하려고 하므로 이미지가 확대되어 흐릿하게 보이게 되는 것입니다.

이 문제를 해결하는 방법은 간단(?)합니다. 원본 이미지의 크기를 DPR 비율만큼 크게 만든 다음, CSS를 이용해서 이를 축소하여 표시하는 것이죠. 아래 그림은 DPR이 2인 환경에서 DPR이 1인 환경을 기준으로 제작된 로고와 DPR이 2인 환경을 기준으로 제작된 로고가 표시되는 모습입니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/htmlcss/diff-between-canvas-size/google_logo_in_two_different_env.png" alt="DPR이 1인 환경과 DPR이 2인 환경에서의 구글 로고" />
  <figcaption>DPR이 1인 환경과 DPR이 2인 환경에서의 구글 로고.</figcaption>
</figure>

위 그림에서 두 로고 모두 논리적인 크기(CSS 픽셀)는 모두 `272px × 92px`로 설정되어 있고, 왼쪽 로고의 경우 원본 이미지의 크기([Intrinsic size](https://developer.mozilla.org/en-US/docs/Glossary/Intrinsic_Size))는 `272px × 92px`이고, 오른쪽 로고의 원본 이미지 크기는 `544px × 184px` 입니다. 즉, 오른쪽 이미지는 DPR = 2에 맞춰 왼쪽 로고 대비 (원본의 크기가) 2배의 크기를 가지고 있는 이미지라는 것이죠.

따라서 위 환경은 DPR이 2이므로 두 로고를 표시할 때 사용하는 물리적 픽셀은 CSS픽셀 `272px × 92px`의 두 배인 `544px × 184px`가 됩니다. 이 때문에 왼쪽 로고의 경우 `272px × 92px` 크기의 원본 이미지를 `544px × 184px`의 물리적 픽셀 공간에 표시하려고 하다 보니 그림이 확대되어 흐릿하게 보이는 것이고, 오른쪽 로고의 경우 `544px × 184px` 크기의 원본 이미지를 `544px × 184px`의 물리적 픽셀 공간에 표시하다 보니 원본 그대로의 이미지가 출력되는 것입니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/htmlcss/diff-between-canvas-size/logo_dimension.png" alt="두 구글 로고의 논리적 크기는 동일" />
  <figcaption>두 구글 로고의 논리적 크기는 동일.</figcaption>
</figure>

즉, 위 그림처럼 두 로고의 논리적인 크기는 동일하므로 화면상에서 나타나는 크기 또한 같지만, 원본 이미지 크기와 이미지를 그리는 데 사용된 물리적 픽셀 간의 괴리로 인해 왼쪽 로고가 확대되어 흐리게 표시되는 것입니다.

## 드디어 본론으로

캔버스에 요소가 흐릿하게 그려지는 현상을 개선하는 방법은 앞서 살펴본 방법들을 종합하면 됩니다. 앞서 캔버스 요소의 크기와 캔버스 그리기 영역의 크기가 다르면 우선은 캔버스 그리기 영역에 맞춰 그림을 그린 다음, 그리기 영역을 캔버스 요소의 크기로 맞춘다는 사실을 기억하시나요? 바로 이를 이용하는 겁니다! 즉, **dpr에 맞춰 캔버스의 그리기 영역(drawing surface)을 키우고 이를 축소**하는 것이죠. 축소하는 작업은 브라우저가 알아서 해주니 우리는 dpr에 맞춰 그리기 영역을 키우기만 하면 됩니다. 이때 [scale()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale) 함수를 이용하여 캔버스 유닛의 크기 또한 dpr에 맞춰 키워줘야 합니다. 그렇지 않으면 그림이 선명하게 나올지언정 예상했던 크기보다 작게 표시될 수 있으니까요.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/htmlcss/diff-between-canvas-size/two_different_canvas.png" alt="DPR을 고려한 캔버스 그리기" />
  <figcaption>DPR을 고려한 캔버스 그리기.</figcaption>
</figure>

이 내용을 바탕으로 DPR을 보정하는 코드는 다음과 같습니다:

```js
const canvas = document.querySelector('.some-canvas-element');
const ctx = canvas.getContext('2d');
// DPR 정보 가져오기
const dpr = window.devicePixelRatio;
// 캔버스 요소의 크기 가져오기
const rect = canvas.getBoundingClientRect();

canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

// scale() 함수를 사용하여 캔버스 유닛 크기 보정
scale(dpr, dpr);
```

## 레퍼런스

- [HTML5 Canvas Essentials | 1.1. The canvas Element | InformIT](https://www.informit.com/articles/article.aspx?p=1903884)
- [Differences between canvas. width and canvas. style. width and their applications | Develop Paper](https://developpaper.com/differences-between-canvas-width-and-canvas-style-width-and-their-applications/)
- [High DPI Canvas - HTML5 Rocks](https://www.html5rocks.com/en/tutorials/canvas/hidpi/#disqus_thread)
- [삽질하기 싫으면 꼭 읽어봐야 할 Canvas 트러블 슈팅](https://ui.toast.com/weekly-pick/ko_20210526)
- [Optimizing canvas - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
