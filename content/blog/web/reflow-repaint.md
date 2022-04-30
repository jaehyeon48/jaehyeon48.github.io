---
title: 'Reflow와 Repaint'
date: 2022-04-30
category: 'Web'
draft: false
---

## Reflow? Repaint?

**리페인트(repaint)**는 화면에 변화가 생겼을 때 요소의 크기 및 위치 정보, 그리고 스타일 정보를 바탕으로 화면에 그림을 그리는 작업입니다.

**리플로우(reflow)**는 HTML 요소들의 위치 및 크기를 계산하는 작업을 의미합니다. 특정 요소에 대한 reflow 발생 시 해당 요소뿐만 아니라 해당 요소의 모든 자식 요소 및 형제(sibling)요소(그리고 브라우저에 따라서 조상 요소까지)에 대해서도 reflow를 수행하도록 합니다. 사실상 페이지 전체의 레이아웃이 다시 계산되는 셈이지요. 아래 예시를 살펴봅시다:

```html
<body>
  <div class="error">
    <p><strong>Error:</strong>Something went wrong.</p>
    <ul>
      <li>item 1</li>
      <li>item 2</li>
    </ul>
  </div>
</body>
```

위 코드에서 `<p>` 요소에 reflow가 발생하면 해당 요소의 자식 요소인 `<strong>` 뿐만 아니라 형제 요소인 `<ul>` (그리고 브라우저에 따라서 조상 요소인 `<div class="error">`와 `<body>` 까지) reflow를 유발하게 됩니다. 이 경우 `<ul>` 요소에 reflow가 발생했으므로 자식 요소인 두 개의 `<li>` 요소에 대해서도 reflow가 발생하게 되지요.

원래는 `<p>` 요소에만 reflow가 발생했는데 그 자식 요소와 주변 요소들까지 전부 reflow가 발생하는 이유는 `<p>` 요소의 자식과 주변의 요소들이 reflow로 인해 변화된 `<p>` 요소의 위치 및 크기에 영향을 받기 때문입니다. 예를 들어 `<p>` 요소의 텍스트가 길어져서 원래는 한 줄짜리였던 `<p>` 요소가 두 줄로 바뀌게 되면 그에 따라 `<ul>` 요소의 위치 또한 바뀌어야 하기 때문이죠.

<hr />

repaint 작업도 비용이 비싼 연산이지만, reflow는 그보다 더 비싼 작업입니다. 상대적으로 성능이 낮은 모바일 환경에선 더욱 치명적일 수 있습니다. 특히 reflow가 발생하면 곧이어 repaint 작업도 발생하기 때문에(새로 계산된 결과물을 그려야 하니까요!), reflow가 아예 발생하지 않도록 할 수는 없겠지만 불필요한 reflow 작업이 발생하지 않도록 최적화를 할 필요가 있습니다. 이러한 방법들을 살펴봅시다.

**※ 참고**

- [reflow를 유발하는 자바스크립트 API 리스트](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)
- [reflow를 유발하는 동작들](https://sites.google.com/site/getsnippet/javascript/dom/repaints-and-reflows-manipulating-the-dom-responsibly)
- [reflow와 repaint를 유발하는 CSS 속성 리스트](https://csstriggers.com/)

## Reflow 최적화 방법들

### 1. 스타일을 변경하는 경우, 가장 하위 노드에 적용하기

스타일을 변경하는 경우엔 해당 스타일이 적용되는 요소 중 DOM 트리에서 가장 하위 요소에 적용하는 것이 좋습니다. 즉, reflow가 발생하는 범위(scope)를 줄이는 것이죠. 예를 들어 특정 요소의 스타일을 변경하는 경우, 해당 스타일을 감싸는 부모 wrapper에 스타일을 적용하는 것이 아니라, 변경의 대상인 자식 노드에 스타일을 적용하는 것이 바람직합니다.

크롬 브라우저 performance 탭의 프로파일러를 통해 동일한 스타일 변경을 부모 노드에 적용한 경우와 자식 노드에 적용한 경우를 비교해본 결과, 자식 노드에 적용하는 경우가 부모 노드에 적용하는 경우보다 평균적으로 약 2배가량 빨리 reflow 작업을 수행하는 것을 알 수 있었습니다.

[데모1: 스타일 변경을 부모 노드에 적용한 경우](https://codesandbox.io/s/trigger-reflow-on-parent-element-u0g2ku?file=/index.html:35-336)

[데모2: 스타일 변경을 자식 노드에 적용한 경우](https://codesandbox.io/s/trigger-reflow-on-child-element-qrbnp6?file=/index.html)

### 2. 인라인 스타일은 되도록 사용하지 않기

DOM을 조작하는 작업은 꽤 느립니다. 이에 따라 DOM fragment를 사용하여 모든 변화를 모아서 한 번에 배치(batch)하는 최적화 기법을 사용하기도 합니다.

이와 비슷하게, 인라인 스타일을 통해 요소에 스타일을 설정하는 것도 해당 요소에 reflow를 발생시키는데, 여러 개의 인라인 스타일을 사용하면 각각의 인라인 스타일이 각자 reflow를 발생시켜 여러 번의 reflow가 발생하게 됩니다. 이 대신, CSS를 사용하여 여러 스타일을 합쳐 한 번의 reflow만을 발생하도록 하는 것이 좋습니다.

### 3. position: `fixed`, position: `absolute`가 적용된 요소에 애니메이션 적용하기

일반적으로, 위치 이동을 구현한 애니메이션은 초 단위로 상당한 reflow를 발생시키기도 합니다. 이 경우, 애니메이션이 적용되는 요소의 `position` 속성을 `fixed` 혹은 `absolute`로 설정하면 해당 요소가 다른 요소에 영향을 미치지 않으므로 페이지 전체가 reflow 되는 대신 해당 요소의 repaint만 발생하게 됩니다.

[데모1: position: absolute 요소에 애니메이션을 적용한 경우](https://codesandbox.io/s/animation-on-position-absolute-element-und7h4)

[데모2: position: static (기본값) 요소에 애니메이션을 적용한 경우](https://codesandbox.io/s/animation-on-position-static-element-020xg6)

### 4. (애니메이션의) 부드러움과 속도 사이에 타협점을 찾기

3번에서 살펴봤듯이 애니메이션 효과를 사용하면 많은 reflow가 발생합니다. 예를 들어 한 번에 1px씩 움직이는 애니메이션과 5px씩 움직이는 애니메이션이 있다고 했을 때, 1px씩 움직이는 애니메이션이 더욱 부드럽게 움직이는 것처럼 보이겠지만 그로 인해 더 많은 reflow 작업량이 발생하게 됩니다. 물론 성능이 좋은 환경에선 별 차이가 없겠지만 모바일 환경과 같이 상대적으로 성능이 떨어지는 환경에선 부드러운 애니메이션을 구현하기 위해 수행하는 많은 양의 연산 때문에 애니메이션이 뚝뚝 끊겨서 보일 수 있습니다. 따라서 성능과 시각적인 효과 사이에서 적절한 타협점을 찾는 것이 좋습니다.

### 5. 테이블 레이아웃 피하기

테이블(`<table>`)의 경우, 기본적으로 테이블의 아래쪽 셀이 앞서 렌더링 된 테이블 전체의 크기를 변경할 수 있으므로 점진적으로 렌더링 되지 않고 모든 셀의 레이아웃이 계산된 이후에 한 번에 화면에 뿌려지게 됩니다. 만약 테이블이 위에서부터 차례대로 렌더링 된다면, 테이블의 마지막 셀의 너비가 매우 긴 경우 앞서 렌더링 된 셀들의 크기를 전부 다시 계산해서 그려야 할 겁니다.

또한, 사소한 변경이 일어나더라도 테이블의 모든 요소가 reflow 된다고 합니다. 또한 레이아웃 용도가 아닌, 데이터를 표시할 목적으로 올바르게 테이블을 사용한다고 하는 경우 해당 테이블에 [table-layout](https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout) 속성을 적용하여 사용하는 것이 디폴트 값인 `auto`를 사용하는 것보다 성능상 이점이 있다고 합니다.

`table-layout: fixed`와 `table-layout: auto` 알고리즘에 대해 요약하자면:

- `table-layout: fixed`의 경우, 테이블 컬럼의 너비는 `col` 요소의 너비 혹은 첫 번째 행에 있는 셀의 너비에 의해 결정되거나, 너비가 명시되지 않은 경우 각 컬럼이 균등한 너비를 나눠 가집니다. 즉, `fixed` 속성값의 경우 테이블의 첫 번째 행에 대한 정보만 있으면 테이블의 레이아웃을 결정할 수 있기 때문에 상대적으로 빠르게 렌더링할 수 있습니다.
- `table-layout: auto`의 경우, 앞서 살펴본 것과 같이 테이블의 모든 요소에 대한 정보가 있어야지만 최종 레이아웃을 결정할 수 있으므로 상대적으로 비효율적인 방법입니다.

더 자세한 `table-layout` 속성에 관해선 [CSS 스펙](https://drafts.csswg.org/css2/#width-layout)을 참고해 주세요.

### 6. 캐싱 활용하기

앞서 말했듯이 reflow와 repaint는 비용이 큰 작업이므로 브라우저는 이들을 최소한으로 실행하려고 노력하는데, 이에 대한 한 가지 방법은 *아무 것도 하지 않는 것*(!)이고, 다른 한 가지 방법은 **지금 하지 말고 미뤘다가 나중에 한꺼번에 하는 것**입니다. 즉 batch 작업을 한다는 뜻이지요.

브라우저는 레이아웃 변경을 큐에 저장했다가 일정 시간이 지나거나 일정 수의 변경이 큐에 쌓이면 이를 한꺼번에 처리하게 됩니다. 이렇게 하면 또 좋은 점이, 여러 개의 reflow 연산이 하나로 합쳐질 수 있다는 것인데, 즉 예를 들어 어떤 요소의 너비를 `100px`로 바꿨다가, `150px`로 바꿨다가, `300px`로 바꾸는 경우 그때그때 하나씩 실행하면 총 3번의 작업을 해야 하지만, 큐에 쌓아서 한꺼번에 처리하면 이 3개를 합쳐 그냥 `300px`로 바로 바꿔버리는 연산 하나로 묶을 수 있게 됩니다.

하지만 `clientWidth`, `offsetHeight`, `getComputedStyle()`과 같이 자바스크립트로 특정 요소의 레이아웃 값을 얻고자 하는 경우, 최신 정보를 반환해야 하므로 어쩔 수 없이 현재 큐에 쌓인 작업들을 강제로 처리해야 합니다. 따라서 자바스크립트로 레이아웃 값을 얻고자 하는 경우 아래와 같이 반복문 안에서 매번 실행하기보다 한 번만 요청하고 그 값을 캐싱하여 사용하는 것이 좋습니다:

```js
// Bad
for (let i = 0; i < 100; i++) {
  elems[i].style.left = `${elem.clientWidth + 20}px`;
  // ...
}


// Good
const widthOfElem = elem.clientWidth;
for (let i = 0; i < 100; i++) {
  elems[i].style.left = `${widthOfElem + 20}px`;
}
```

### 7. CSS를 이용하여 한 번에 스타일 변경하기

스타일을 변경하는 경우, 각각 스타일을 적용하게 되면 추가적인 reflow가 발생할 수 있으므로, 한 번에 모든 스타일을 반영하는 것이 좋습니다:

```js
// Bad
const TOP_PX = 10;
const LEFT_PX = 10;
el.style.left = `${LEFT_PX}px`;
el.style.top = `${TOP_PX}px`;
// ...


// Good
el.className += 'some-class-name';
```

### 8. `position: relative` 사용시 주의할 점

reflow가 발생하여 레이아웃 계산이 필요한 경우, 일반적으로 요소들은 박스 모델 계산(마진, 패딩, 보더 등) 작업을 수행한 뒤 normal flow 상태의 레이아웃에 배치됩니다 (선형적 배치). 이때 normal flow는 reflow 과정에 속하는 일부입니다. 그 과정을 살펴봅시다:

#### 1. 박스 모델 계산

아래 이미지와 같이 화면 내 배치가 아닌 각 요소 자체의 레이아웃 계산을 먼저 수행합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/reflow-repaint/css_box_model.png" alt="CSS 박스 모델" />
    <figcaption>CSS 박스 모델</figcaption>
</figure>

#### 2. Normal flow에 의해 선형적으로 배치된 상태 

박스 모델 계산 후, 마크업 순서에 따라 화면 내에 배치를 진행합니다. 단, position: absolute 혹은 fixed가 적용된 경우 normal flow를 거치지 않고 out of flow, 즉 곧바로 positioning을 수행합니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/reflow-repaint/linear_positioning.png" alt="Normal flow에 의해 선형적으로 배치된 상태" />
    <figcaption>Normal flow에 의해 선형적으로 배치된 상태</figcaption>
</figure>

#### 3. Normal flow 이후

normal flow 이후엔 float이냐 position이냐에 따라 positioning 과정이 한 번 더 일어나는데, 케이스별 시나리오는 아래와 같습니다

#### 3.1 `float` 속성을 가진 요소  

float 속성을 가진 경우, normal flow 이후 별도의 positioning 계산은 없으며, 왼쪽 혹은 오른쪽으로 자신이 갈 수 있는 한 끝까지 이동합니다. **(박스 모델 계산 → normal flow → floating)**.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/reflow-repaint/float.png" alt="float 속성을 가진 요소" />
    <figcaption>float 속성을 가진 요소</figcaption>
</figure>

#### 3.2 `position: relative`와 함께 `top`, `left` 등의 위치 값을 가진 요소

이 경우, normal flow 상태에서 한 번 더 positioning 과정을 거칩니다. **(박스 모델 계산 → normal flow → positioning)**.

```html
<div>
  <span>1</span>
  <span>2</span>
  <span style="position:relative;left:5px">3</span>
</div>
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/reflow-repaint/pos_relative.png" alt="position: relative 및 left 속성값을 가진 요소" />
    <figcaption>position: relative 및 left 속성값을 가진 요소</figcaption>
</figure>

#### 3.3 `position: absolute` 혹은 `position: fixed`를 가진 요소

이 경우, 박스 모델 계산 뒤 normal flow 과정을 거치지 않고 바로 자신의 위치에 찾아가게 됩니다(out of flow). **(박스 모델 계산 → positioning)**.

```html
<div>
  <span>1</span>
  <span>2</span>
  <span style="position:absolute;top:5px;right:5px">3</span>
</div>
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/reflow-repaint/pos_absolute.png" alt="position: absolute를 가진 요소" />
    <figcaption>position: absolute를 가진 요소</figcaption>
</figure>

위 과정에서 살펴볼 수 있듯이, `position: relative`가 "박스 모델 계산 → normal flow → positioning" 세 단계를 거치므로 오히려 `position: absolute` 혹은 `float` 보다 더 큰 비용을 가집니다. 따라서 `ul`에 존재하는 `li` 요소와 같이, 상당수 반복되는 요소에 `position: relative`와 함께 `top`, `left` 속성 등을 적용하는 경우 성능 하락이 발생할 가능성이 있으므로 주의해야 합니다.


## 레퍼런스

- [Repaints and Reflows: Manipulating the DOM responsibly - Get Snippet of Code](https://sites.google.com/site/getsnippet/javascript/dom/repaints-and-reflows-manipulating-the-dom-responsibly)
- [Reflows & Repaints: CSS Performance making your JavaScript slow? | Stubbornella](http://www.stubbornella.org/content/2009/03/27/reflows-repaints-css-performance-making-your-javascript-slow)
- [Reflow 원인과 마크업 최적화 Tip](https://lists.w3.org/Archives/Public/public-html-ig-ko/2011Sep/att-0031/Reflow_____________________________Tip.pdf)
- [[Browser] Reflow와 Repaint](https://beomy.github.io/tech/browser/reflow-repaint/#reflow-%EC%B5%9C%EC%A0%81%ED%99%94)
