---
title: 'SameSite 속성'
date: 2021-12-07
category: 'web'
draft: false
---

## SameSite 속성

쿠키의 "SameSite" 속성은 쿠키의 범위(scope)를 제한하여 same-site 요청에 대해서만 해당 쿠키를 첨부할 수 있도록 한다. 이 속성을 통해 CSRF 공격을 어느정도 예방할 수 있다.

SameSite 속성값에는 `None`, `Lax`, `Strict` 세 가지가 있는데, 우선 same-site와 cross-site가 무엇인지 부터 간략히 살펴보고자 한다.

## "same-site" 요청과 "cross-site" 요청

다음의 경우, origin A와 B는 same-site로 취급된다:

- origin A와 B 둘 다 UUID인 경우 **same-site**
- origin A와 B 둘 다 `scheme/domain(혹은 host)/port` 구조로 되어있을 때,
  - `(A의 domain) == (B의 domain)` 이고, `(A의 registrable domain) == null`인 경우 A와 B는 **same-site**
  - `(A의 registrable domain) == (B의 registrable domain)` 이고, `(A의 registrable domain) != null`인 경우 A와 B는 **same-site**
- 이외의 경우 A와 B는 **cross-site** 이다.

### Registrable domain

그렇다면 `registrable domain`는 무엇인가? **Registrable domain**는 `public suffix + public suffix 바로 왼쪽의 label`로 정의된다. public suffix는 _effective top-level domain, eTLD_ 라고도 하는데, [public suffix list](https://publicsuffix.org/)에 항목들이 등재되어 있다.

예를 들어, `example.com`의 경우 public suffix인 `.com`과 바로 왼쪽의 label `example`이 합쳐져서 `example.com`이 `registrable domain`가 된다. `api.example.com`도 public suffix인 `.com`과 바로 왼쪽의 `example`이 합쳐져서 `example.com`이 `api.example.com`의 `registrable domain`가 된다.

또 다른 예로, `github.io`의 경우, `github.io` 자체가 public suffix 이기 때문에 `user.github.io`와 `other.github.io`는 cross-site로 취급된다.

### Schemeful same-site

기존에는 registrable domain가 같고 scheme만 다른 경우 same-site로 취급하였는데, 크롬 89버전 부터는 scheme이 다른 경우 cross-site로 취급한다고 한다.

즉, 기존에는 `http://example.com`과 `https://example.com`은 same-site로 취급되었으나, 이제는 cross-site로 취급되게 된다.

이미 기존의 웹사이트가 `HTTPS`를 사용하고 있다면 이와 같은 변경에 대해선 전혀 신경쓸 필요가 없다고 한다.

## SameSite 속성값

### None

SameSite의 값이 `None`으로 설정된 쿠키는 same-site 요청뿐만 아니라 cross-site 요청시에도 쿠키가 전송된다. `None`값이 되기 위해선 반드시 쿠키의 `Secure` 속성값이 `true` 이어야만 한다.

### Lax

SameSite값이 명시되지 않은 경우 default로 적용되는 값이다. same-site 요청, 그리고 [안전한](https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP) HTTP 메소드를 통한 cross-site top-level 네비게이션시에 쿠키가 전송된다.

Top-level 네비게이션에는 `<a>`를 클릭하거나 `window.location.replace` 등으로 인해 자동으로 발생하는 이동, `302` 리다이렉트로 인한 이동이 포함된다. `<img>`나 `<iframe>`등을 통한 HTTP 요청은 "네비게이션"이라 보기 어려우므로 쿠키가 전송되지 않는다.

Top-level 네비게이션에 관한 예시는 [RFC6265bis section 8.8.2](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis#section-8.8.2)를 참고하길 바란다.

### Strict

same-site 요청시에만 쿠키가 전송된다.

## References

- [draft-ietf-httpbis-rfc6265bis-07](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-07#section-5.2)
- [Schemeful Same-Site](https://web.dev/schemeful-samesite/)
- [SameSite cookies explained](https://web.dev/samesite-cookies-explained/)
