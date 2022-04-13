---
title: '로컬 환경에서의 CORS 문제 해결'
date: 2021-04-02
category: 'Web'
draft: false
---

로컬 환경에서 자바스크립트 관련 테스팅을 할 게 있어서 다음과 같은 html파일을 로컬환경에서 실행시켰더니 CORS 에러가 발생했습니다.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script type="module" src="index.js" defer></script>
  </body>
</html>
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/cors-on-local-environment/js_local_cors.png" alt="로컬 환경에서의 CORS 에러" />
    <figcaption>로컬 환경에서의 CORS 에러</figcaption>
</figure>

## 에러의 원인

이 문제의 근본적인 원인은 **동일 출처 정책 (same-origin policy)** 입니다. 동일 출처 정책이란, 어떤 [출처(origin)](https://developer.mozilla.org/en-US/docs/Glossary/Origin)에서 불러온 문서 혹은 스크립트가 다른 출처에서 가져온 리소스와 상호작용 하는것을 제한하는 보안 방식을 일컫습니다.

이때, **두 URL의 프로토콜, 포트(명시한 경우), 호스트가 모두 같아야** 동일한 출처라고 합니다

> CORS에 관한 전반적인 내용은 [여기](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)를 참고하세요.

즉, 이를 토대로 위 에러 내용을 살펴보면 `null`오리진에서 `file:///C:/Users/kjhye/myPython/index.js`오리진에 있는 리소스를 참고했기 때문에 CORS 에러가 발생한 것으로 보입니다.

## 근데 왜 오리진이 `null` 이지?

처음엔 "html 파일과 같은 경로상에 존재하는 자바스크립트 파일을 불러왔으니, 자바스크립트 파일의 오리진은 html 파일과 동일해야 하는 것 아닌가??" 라고 생각했었습니다.

이에 대한 해답은 [MDN JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#other_differences_between_modules_and_standard_scripts)에서 찾을 수 있었습니다.

> 로컬 테스트에서의 주의 사항 — HTML파일을 로컬(예를들어 file:// URL)에서 로드하려고 하면, 자바스크립트 모듈 보안 요구 사항으로 인해 CORS오류가 발생합니다. 서버를 통해 테스트 해야 합니다.

[이 블로그](https://blog.seulgi.kim/2014/12/file-uri-same-origin-policy.html)를 살펴보니, file URI에 대해서는 어떤 URI를 same-origin이라고 할 것인지에 대해 정해진 것이 없고, 브라우저 마다 알아서 자신이 옳다고 생각하는 방식으로 구현했다고 합니다.

## 해결방안

vscode 기준으로, vscode의 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)와 같은 로컬 서버를 통해 파일을 실행시키면 해결됩니다. (물론 [http-server](https://www.npmjs.com/package/http-server)와 같은 웹서버를 이용해도 되구요!) 즉, 이 문제의 근본적인 해결방법은 위에서 살펴봤듯이 "서버를 통해 테스트" 하는 것입니다.
