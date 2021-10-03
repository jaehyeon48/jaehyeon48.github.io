---
title: '브라우저는 어떻게 동작하는가? Part2'
date: 2020-08-29
category: 'web'
draft: false
---

[1편](../how_browsers_work_1)

<hr class="custom-hr">

## Critical Rendering Path

브라우저가 HTML, CSS, JS 파일들을 분석하여 화면의 픽셀로 변환하는 과정을 **Critical Rendering Path, CRP**라고 한다. 이 포스트에서는 브라우저가 서버로 부터 응답을 받은 이후 CRP를 진행하는 과정을 살펴보자.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/crp.png" alt="Critical Rendering Path" />
    <figcaption>Critical Rendering Path</figcaption>
</figure>

## 파싱

### DOM

버로 부터 응답으로 HTML 데이터를 받으면 브라우저는 해당 HTML을 분석하여 [DOM](https://en.wikipedia.org/wiki/Document_Object_Model)으로 변환한다.

여기서 DOM이란, HTML (혹은 XML) 문서를 트리 구조로 나타낸 것임과 동시에 프로그래밍 언어로 문서를 조작할 수 있도록 하는 API 이다. 이 때 트리의 각 노드는 문서의 각 요소들을 나타내는 객체이다.

[DOM 스펙](https://dom.spec.whatwg.org/#ref-for-dom-node-nodetype%E2%91%A0)에 따르면, 노드의 종류는 다음과 같다:

- `Node.ELEMENT_NODE`
- `Node.TEXT_NODE`
- `Node.CDATA_SECTION_NODE`
- `Node.PROCESSING_INSTRUCTION_NODE`
- `Node.COMMENT_NODE`
- `Node.DOCUMENT_NODE`
- `Node.DOCUMENT_TYPE_NODE`
- `Node.DOCUMENT_FRAGMENT_NODE`

<br />

서버로 부터 받은 HTML 데이터를 DOM으로 변환하는 과정을 간략히 살펴보면 다음과 같다:

1. **Conversion**: 서버로 부터 전송받은 HTML 2진 데이터를 파일에 명시된 인코딩 방법(UTF-8 등)을 통해 문자열로 변환한다.
2. **Tokenizing**: 문자열로 변환된 HTML을 [HTML 스펙](https://html.spec.whatwg.org/#tokenization)에 따라 (`<html>`, `<body>`와 같은) 토큰들로 분리한다.
3. **Lexing**: 토큰들을 각각의 속성들과 규칙들을 갖는 객체로 변환한다.
4. **DOM Construction**: Lexing을 통해 만들어낸 객체들을 이용하여 HTML 문서를 나타내는 트리 구조를 만들어 낸다. 트리 구조로 만드는 이유는, HTML이 기본적으로 서로 다른 태그간의 관계를 정의하고 있기 때문이다 (예를 들면 어떤 태그가 다른 태그 내부에 nested 되어 있는 것처럼).

이렇게 만들어진 DOM을 기반으로 브라우저는 렌더링을 해나간다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/dom_construction.png" alt="A process of DOM construction" />
    <figcaption>https://developers.google.com/web/fundamentals/performance/critical-rendering-path/constructing-the-object-model</figcaption>
</figure>

### CSSOM

CSS 파일에 대해서도 HTML과 마찬가지로 파싱해서 트리 구조를 만든다. 이렇게 만들어진 CSS를 나타내는 트리 구조를 CSS Object Model, [CSSOM](https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path#css_object_model) 이라고 한다.

CSSOM의 각 노드는 해당 노드가 타겟으로 삼고있는 DOM 요소의 스타일 정보를 갖는다. CSSOM도 트리 구조인 이유는, CSS의 "Cascading"한 특성 때문이다.

페이지의 어떤 요소에 적용할 최종 스타일을 계산할 때, 브라우저는 우선 해당 노드에 적용가능한 가장 일반적인 규칙에서 시작하여 점점 specific한 규칙을 적용해 나간다. 예를 들면, `<body>` 요소 내부의 `<p>` 요소에 대해 `<body>` 요소의 규칙부터 적용하고 이후 `<p>` 요소의 규칙으로 덮어씌우는 방식이다.

또한, 브라우저 마다 기본적으로 제공되는 **user agent stylesheet**라는 것도 존재한다. 제일 처음에는 브라우저에서 제공하는 이 규칙을 적용하고, 개발자가 작성한 스타일을 적용해나가는 방식으로 진행된다. 만약 user agent stylesheet에도 없는 CSS 속성의 경우, [W3C CSS](https://www.w3.org/Style/CSS/) 스탠다드에 정의된 기본 속성값이 적용된다.

여담으로, 더 간결한(less specific) CSS selector는 더 자세한(more specific) selector보다 빠르다. 예를 들어 `.foo {}` 는 `.bar .foo {}`보다 빠른데, 그 이유는 브라우저가 두 번째 경우의 `.foo`를 만나게 되면 DOM을 통해 부모 요소로 올라가서 `.foo`가 `.bar`를 조상으로 갖는지 살펴봐야 하기 때문이다. 이렇듯 selector가 자세할 수록, 즉 CSS specificity가 높을 수록 브라우저가 할 일이 많아지지만, 사실 차이가 그리 크지는 않기 때문에 딱히 최적화할 가치는 없다고 할 수 있다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/cssom.png" alt="A CSSOM" width="600px"/>
    <figcaption>https://developers.google.com/web/fundamentals/performance/critical-rendering-path/constructing-the-object-model</figcaption>
</figure>

### Render Tree

이제 DOM과 CSSOM을 만들었으니, 이 둘을 합쳐서 **Render Tree**를 만든다. 브라우저는 이렇게 DOM과 CSSOM을 합쳐 render tree를 만든 다음, 이후에 이 render tree를 바탕으로 visible한 요소들을 배치하고 화면에 이 요소들의 픽셀을 그리게 된다.

일반적으로 다음과 같은 과정을 거쳐 render tree를 구축한다:

1. DOM의 루트부터 시작하여 **visible**한 각 요소를 탐색해 나간다
   - `<head>`, `<script>`, `<link>`와 같이 화면에 보이지 않는 요소들은 무시된다. 왜냐면 말그대로 화면에 보이지 않기 때문에 렌더링할 필요가 없기 때문이다.
   - 또한, `display: none` 속성이 적용된 요소와 그 자식들도 화면상에서 아무런 공간을 차지하지 않기 때문이 무시된다.
   - `visibility: hidden`과 `opacity: 0` 속성이 적용된 요소의 경우는, 화면에 보이지는 않지만 공간을 차지하기 때문에 render tree에 포함된다.
   - `::before`, `::after`와 같은 CSS pseudo 클래스의 경우, DOM에는 존재하지 않지만 화면에 나타나기 때문에 render tree에 추가된다.
2. 각 visible한 요소에 대해 적절한 CSSOM 규칙을 찾아 적용한다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/render_tree.png" alt="A Render Tree" width="600px"/>
    <figcaption>https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction</figcaption>
</figure>

### Layout (Reflow)

레이아웃 단계는 render tree를 기반으로 [viewport](https://web.dev/responsive-web-design-basics/#set-the-viewport) 내에서의 각 요소의 위치, 크기등을 계산하는 단계이다. 각 요소의 정확한 크기와 위치를 계산하기 위해, 브라우저는 render tree의 루트부터 시작해나간다. 다음 HTML을 예시로 살펴보자:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Critial Path: Hello world!</title>
  </head>
  <body>
    <div style="width: 50%">
      <div style="width: 50%">Hello world!</div>
    </div>
  </body>
</html>
```

위 HTML의 `<body>`에는 두 개의 중첩 `<div>`가 있다. 첫 번째(부모) `<div>`는 viewport width의 50%가 적용되고, 두 번째(자식) `<div>`의 width는 부모 (첫 번째 `<div>`) width의 50%가 적용된다. 즉, viewport width의 25%가 적용된다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/layout_example.png" alt="Layout process example" width="600px"/>
    <figcaption>https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction</figcaption>
</figure>

레이아웃 과정의 결과는 viewport 내에서의 각 요소들의 정확한 위치와 크기를 적용한 **박스 모델**이다. `%`, `em` 등과 같은 모든 상대 치수(measurement)는 절대 단위인 픽셀로 변환된다.

웹 페이지의 레이아웃을 결정하는 것은 어려운 작업이다. 가장 단순하게 위에서 아래로 펼쳐지는 블록 영역 하나만 있는 웹 페이지의 레이아웃을 결정할 때에도 폰트의 크기가 얼마이고 줄 바꿈을 어디서 해야 하는지 고려해야 한다. 단락의 크기와 모양이 바뀔 수 있고, 다음 단락의 위치에 영향이 있기 때문이다.

레이아웃 단계를 거치고 나면 **레이아웃 트리**가 만들어진다. 이 트리에는 요소들의 x, y좌표, 박스 영역(bounding box)의 크기와 같은 정보를 가지고 있다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/layout_tree.png" alt="A layout tree" width="600px"/>
    <figcaption>Layout tree: https://developers.google.com/web/updates/2018/09/inside-browser-part3</figcaption>
</figure>

#### DIRTY BIT SYSTEM

작은 변화에도 전체 요소의 레이아웃을 다시 계산하는 것은 너무 비효율적이므로, 브라우저들은 [dirty bit](https://en.wikipedia.org/wiki/Dirty_bit)를 사용하여 변경사항이 있는 요소와 그 자식 요소들만 dirty bit로 체킹하여 dirty bit로 체킹된 요소들만 다시 계산한다.

레이아웃 과정을 **reflow**, 혹은 **browser reflow**라고도 한다. 화면을 스크롤 하거나, 화면을 줄이거나 늘리는 등 크기를 바꾸거나, DOM을 조작하는 등의 행동을 할때 reflow 과정이 일어난다. [이 리스트](https://stackoverflow.com/questions/27637184/what-is-dom-reflow/27637245#27637245)에 레이아웃 과정을 발생시키는(trigger) 이벤트들이 나와있다.

### Paint

이제 DOM, 스타일, 레이아웃을 알고있지만 이것만으로는 여전히 페이지를 렌더링할 수 없다. 예를 들어, 어떤 그림을 따라 그리려 한다고 해보자. 그림의 크기, 모양, 각 요소의 위치를 알고있지만 **어떤 순서**로 그림을 그려야할 지 판단해야 한다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/paint_example.png" alt="Drawing Game" width="600px"/>
    <figcaption>https://developers.google.com/web/updates/2018/09/inside-browser-part3</figcaption>
</figure>

예를 들어, `z-index` 속성이 적용된 요소의 경우, HTML에 나타난 요소의 순서대로 렌더링하게되면 부정확한 결과가 나오게 될 것이다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/z_index_fail.png" alt="z-index fail" />
    <figcaption>https://developers.google.com/web/updates/2018/09/inside-browser-part3</figcaption>
</figure>

위 그림에서는 `<h1>` 요소가 `<div>` 요소보다 위에 와야 정확하게 렌더링한 것이다. 이러한 경우와 같이, DOM에 선언된 노드 순서와 페인트 순서는 다를 수 있다.

페인트 단계에서 브라우저의 메인 스레드는 render tree를 순회하여 paint record를 생성한다. Paint record는 "배경을 먼저 그리고, 그 다음 텍스트, 그리고 나서 직사각형"과 같이 페인팅 과정을 기록한 일종의 노트이다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/paint_record.png" alt="A paint record" />
    <figcaption>https://developers.google.com/web/updates/2018/09/inside-browser-part3</figcaption>
</figure>

### 합성(Compositioning)

|💡|
|-|
|페인트(paint)는 페인트 단계에서 페인트 작업을 수행하는 것을 의미하고, 그리기(draw)는 페인트 작업을 기반으로 비트맵 혹은 텍스처를 만들어 내는 것을 의미한다. 좀 더 정확히 말하자면, **합성 프레임(compositing frame)**을 만들어 내는 것을 의미한다.|

이제 브라우저는 문서의 구조, 각 요소의 스타일과 위치/크기 및 paint 순서를 알고있는 상태이다. 이제 이러한 정보들을 가지고 어떻게 페이지를 그릴까? 이러한 정보들을 화면의 픽셀로 변환하는 작업을 **래스터화(rasterization)** 라고 한다.

가장 단순한 rasterization은 (아마도) viewport 내의 부분들을 rasterize 하는 것이다. 사용자가 페이지를 스크롤하면 이미 rasterize한 프레임을 움직이고 나머지 빈 부분을 추가로 rasterize한다. 이 방법은 크롬 브라우저가 초창기에 수행했던 방법이다. 하지만 대부분의 요즘 브라우저들은 **합성(compositioning)**이라는 좀 더 정교한 과정을 수행한다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/naive_raster.gif" alt="A naive raster process" />
    <figcaption>Animation of naive rastering process: https://developers.google.com/web/updates/2018/09/inside-browser-part3</figcaption>
</figure>

<br />

**합성(compositioning)**이란 웹 페이지의 각 부분들을 레이어(layer)로 분리하여, 각 레이어들을 따로 raster한 다음 compositor 쓰레드에서 이 레이어들을 하나의 페이지로 합성하는 기술이다. 페이지를 스크롤해도 이미 레이어가 rasterize 되어 있기 때문에 새로운 프레임을 합성하기만 하면 된다. (CSS의) 에니메이션 또한 레이어를 움직이고 새로운 프레임으로 합성하는 방식으로 만들 수 있다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/composit.gif" alt="A compositioning process" />
    <figcaption>Animation of compositing process: https://developers.google.com/web/updates/2018/09/inside-browser-part3</figcaption>
</figure>

크롬 개발자 도구의 [레이어 패널](https://blog.logrocket.com/eliminate-content-repaints-with-the-new-layers-panel-in-chrome-e2c306d4d752?gi=cd6271834cea)을 이용하여 웹사이트가 어떤 레이어들로 나뉘어 졌는지를 확인할 수 있다.

#### 레이어로 나누기

어떤 요소가 어떤 레이어에 위치하는지를 결정하기 위해, 메인 쓰레드는 레이아웃 트리를 순회하며 **레이어 트리(layer tree)**를 만든다. 모든 요소별로 레이어를 할당하면 좋겠지만, 수 많은 레이어를 합성하는 작업은 웹 페이지의 작은 부분들을 매 프레임마다 새로 raster하는 것보다 더 오래 걸릴 수 있다. 따라서 애플리케이션의 성능을 측정하는 것이 중요하다. 이와 관련해서는 [이 글](https://developers.google.com/web/fundamentals/performance/rendering/stick-to-compositor-only-properties-and-manage-layer-count)을 참조하라.

<br />

레이어 트리가 완성되고 페인트 순서가 결정되면 메인 쓰레드는 이러한 정보들을 compositor 쓰레드로 넘긴다(commit). 그러면 compositor 쓰레드는 각 레이어를 rasterize 한다. 어떤 레이어의 크기는 페이지의 전체 길이만큼 길 수 있기 때문에, compositor 쓰레드는 레이어를 타일(tile)로 쪼개어 각 타일들을 raster 쓰레드로 보낸다. Raster 쓰레드에서는 각 타일을 rasterize 하여 GPU 메모리에 저장한다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/raster_thread.png" alt="raster" />
    <figcaption>Raster threads creating the bitmap of tiles and sending to GPU: https://developers.google.com/web/updates/2018/09/inside-browser-part3</figcaption>
</figure>

|💡|
|-|
|rasterize 역시 GPU의 도움을 받기 좋은 단계이다. 이와 관련한 더 자세한 내용은 [Software vs. GPU Rasterization in Chromium](https://software.intel.com/content/www/us/en/develop/articles/software-vs-gpu-rasterization-in-chromium.html)을 참고하라.|

|💡|
|-|
|compositor 쓰레드 내부에도 레이어 트리가 여러개 있다. 메인 쓰레드가 넘긴(commit) 레이어 트리는 compositor 쓰레드의 **pending tree**로 복사된다. Pending tree는 최신 프레임이지만 아직 화면에는 그려지지 않은 상태이다. 현재 화면에 그려지고 있는 이전 프레임은 **active tree**로 그린 프레임이다. 최신 정보로 화면을 갱신할 때는 pending tree와 active tree를 스왑한다. 이와 관련한 더 자세한 내용은 [Native One-copy Texture Uploads for Chrome OS...](https://software.intel.com/content/www/us/en/develop/articles/native-one-copy-texture-uploads-for-chrome-os-on-intel-architecture-enabled-by-default.html)을 참고하라.|

compositor 쓰레드는 서로 다른 raster 쓰레드들간의 우선순위를 결정할 수 있다. 따라서 viewport 근처의 것들이 먼저 rasterize 될 수 있다. 또한, 레이어는 줌인, 줌아웃과 같은 동작을 처리하기 위해 해상도가 다른 여러 타일들을 가지고 있다.

타일이 rasterize 되면 compositor 쓰레드는 **합성 프레임(compositor frame)**을 만들기 위해 **draw quads**이라고 하는, 타일의 정보들을 모은다.

- **Draw quads**: 메모리 상에서의 타일의 위치, 페이지 합성을 고려하여 타일을 웹 페이지의 어디에 그릴 것인지와 같은 정보들을 담고있다.  해상도별 타일 세트에서 타일을 선택적으로 조합하기 때문에, draw quads가 조합에 필요한 정보를 기억해야 한다.
- **Compositor frame**: 한 페이지의 프레임을 나타내는 draw quads의 모음이다.

이후 compositor frame은 IPC을 통해 브라우저 프로세스로 넘겨진다. 이 때 브라우저 UI의 변경 사항을 반영하려는 UI 쓰레드나 확장 앱을 위한 다른 renderer 프로세스에 의해 compositor frame이 추가될 수 있다.

이렇게 브라우저 프로세스로 넘어온 프레임들은 화면에 출력하기 위해 GPU로 보내진다. 스크롤이 발생하면 compositor 쓰레드는 GPU로 보낼 또 다른 프레임을 만든다.

|💡|
|-|
|(2019년 4월 기준) 앞으로는 compositor frame이 브라우저 프로세스를 거치지 않고 바로 GPU 프로세스로 보내지는 방식으로 변경될 예정이라고 한다.|

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/how_browsers_work/composit.png" alt="composit" />
    <figcaption>Compositor thread creating compositing frame. Frame is sent to the browser process then to GPU: https://developers.google.com/web/updates/2018/09/inside-browser-part3</figcaption>
</figure>

합성(compositioning)의 장점은 메인 쓰레드와 별개로 동작한다는 점이다. Compositor 쓰레드는 메인 쓰레드가 스타일(CSS) 계산, 혹은 자바스크립트 실행을 끝마칠 때까지 기다릴 필요가 없다. 이 때문에 [합성만 하는 애니메이션](https://www.html5rocks.com/en/tutorials/speed/high-performance-animations/)이 성능상 가장 부드럽다고 한다. 레이아웃이나 페인트를 다시 계산해야하는 경우, 메인 쓰레드가 관여해야만 한다.

## Reference

[https://dev.to/gitpaulo/journey-of-a-web-page-how-browsers-work-10co](https://dev.to/gitpaulo/journey-of-a-web-page-how-browsers-work-10co)

[https://developers.google.com/web/fundamentals/performance/critical-rendering-path](https://developers.google.com/web/fundamentals/performance/critical-rendering-path)

[https://developers.google.com/web/updates/2018/09/inside-browser-part1](https://developers.google.com/web/updates/2018/09/inside-browser-part1)

[https://developers.google.com/web/updates/2018/09/inside-browser-part2](https://developers.google.com/web/updates/2018/09/inside-browser-part2)

[https://developers.google.com/web/updates/2018/09/inside-browser-part3](https://developers.google.com/web/updates/2018/09/inside-browser-part3)

[https://medium.com/jspoint/how-the-browser-renders-a-web-page-dom-cssom-and-rendering-df10531c9969](https://medium.com/jspoint/how-the-browser-renders-a-web-page-dom-cssom-and-rendering-df10531c9969)

[https://d2.naver.com/helloworld/5237120](https://d2.naver.com/helloworld/5237120)

[https://medium.com/@maneesha.wijesinghe1/what-happens-when-you-type-an-url-in-the-browser-and-press-enter-bb0aa2449c1a](https://medium.com/@maneesha.wijesinghe1/what-happens-when-you-type-an-url-in-the-browser-and-press-enter-bb0aa2449c1a)

[https://www.cloudflare.com/learning/dns/what-is-dns/](https://www.cloudflare.com/learning/dns/what-is-dns/)

[https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/](https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/)

[https://www.html5rocks.com/en/tutorials/speed/layers/](https://www.html5rocks.com/en/tutorials/speed/layers/)