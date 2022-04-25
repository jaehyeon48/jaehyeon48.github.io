---
title: 'HTML prefetch, preload 기능 정리'
date: 2022-04-24
category: 'Web'
draft: true
---

HTML의 `prefetch`, `preload` 모두 브라우저에게 무언가를 다운로드 하라고 알려주는 지시자인데, 이 기능들에 대해 정리해보았습니다.

## prefetch

`preload`는 브라우저에게 **다음번 네비게이션에서 필요할 지도 모르는** 자원을 다운로드 하도록 하는 지시자입니다. 현재 보고 있는 페이지에 대한 정보가 다음번에 _필요할 지도 모르는_ 정보보다 더 중요하기 때문에, `prefetch`는 주로 다음번 페이지 네비게이션 속도를 향상하고자 할 때 유용합니다. 즉, 우선 순위가 매우 낮은 방식으로 다운로드

`preload`는 다음과 같은 방식으로 사용할 수 있습니다:

```html
<link rel="prefetch" href="https://www.some-domain/some-resource" />
```

## preload

## 레퍼런스

- [Preload: What Is It Good For? — Smashing Magazine](https://www.smashingmagazine.com/2016/02/preload-what-is-it-good-for/)
- [Preload, Prefetch And Priorities in Chrome | by Addy Osmani | reloading | Medium](https://medium.com/reloading/preload-prefetch-and-priorities-in-chrome-776165961bbf)
