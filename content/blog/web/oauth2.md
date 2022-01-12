---
title: 'OAuth 2.0'
date: 2022-01-12
category: 'Web'
draft: false
---

## OAuth 2.0 이란?

[OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749)(Open Authorization)은 서드 파티 앱이 자원 소유자 혹은 앱 자기 자신을 대신하여 HTTP 서비스에 대한 제한된 접근 권한을 얻을 수 있게 해주는 인가 프레임워크(authorization framework) 입니다.

기존의 전통적인 클라이언트-서버 인증 모델을 살펴보자면, 접근이 제한된 자원(protected resource)에 접근하기 위해 클라이언트는 자원 소유자의 인증 정보(credentials)를 이용하여 서버와 인증 절차를 거칩니다. 제한된 자원에 대한 접근 권한을 서드 파티 앱에 주기 위해선 자원 소유자의 인증 정보를 서드 파티와 공유해야 하는데, 여기엔 몇 가지 한계점과 문제가 있습니다:

- 미래에도 자원에 계속해서 접근하기 위해 서드 파티 앱이 자원 소유자의 인증 정보를 저장하고 있어야 합니다.
- 패스워드 인증 방식의 취약성에도 불구하고 서버는 패스워드 인증 방식을 지원해야만 합니다.
- 제한된 자원에 대한 권한을 너무 광범위하게 주게 되면 자원 소유자는 하위 리소스에 대한 접근이나 기한을 제한할 수 없게 됩니다.
- 자원 소유자는 모든 서드 파티들의 권한을 취소하지 않고서는 개별 서드 파티의 권한을 취소할 수 없고, 취소하기 위해선 서드 파티의 비밀번호를 변경하는 방식으로 해야만 합니다.
- 서드 파티 앱이 뚫리게 되면(compromised) 최종 사용자(end user)의 비밀번호가 유출될 수 있고, 이에 따라 해당 비밀번호로 보호되는 모든 데이터가 위험에 노출될 수 있습니다.

이러한 문제들을 해결하기 위해 OAuth는 인증 레이어(authorization layer)를 도입하고, 클라이언트와 자원 소유자의 역할을 분리하였습니다. OAuth에선 클라이언트가 다른 소유자에 의해 관리되고 있는 자원에 접근하고자 할 때 자원 소유자가 가진 것과는 다른 인증 정보를 부여받게 됩니다. 즉 제한된 자원에 접근하고자 할 때, (기존 방식처럼) 클라이언트는 자원 소유자의 인증 정보를 사용하는 것이 아니라 특정 범위·유효 기간·기타 접근 속성 등을 담고 있는 **엑세스 토큰**을 부여받습니다.

엑세스 토큰은 자원 소유자의 동의를 거쳐 인가 서버가 서드 파티 클라이언트에게 부여합니다. 그리고 이 엑세스 토큰을 사용하여 클라이언트는 제한된 자원에 접근하게 되는 것이구요.

## 역할

역할에 대한 개념은 OAuth 2.0 시스템의 필수 구성 요소를 정의합니다:

- **자원 소유자(resource owner)**: 제한된 자원에 대한 접근을 허가할 권한을 갖는 개체입니다. 사람일 수도 있고, 시스템일 수도 있습니다.
- **자원 서버(resource server)**: 제한된 자원을 호스팅하는 서버이며, 엑세스 토큰을 사용한 제한된 자원 접근 요청을 받아 응답하는 역할을 합니다.
- **클라이언트(client)**: 자원 소유자(와 그 권한)을 대신하여 제한된 자원을 요청하는 애플리케이션입니다.
- **인가 서버(authorization server)**: 인증 절차를 거치고 자원 소유자의 허가를 얻은 클라이언트에 엑세스 토큰을 발급하는 서버입니다.

애플리케이션 개발자의 관점에서 보자면 서비스의 API는 자원 서버와 인가 서버의 역할을 동시해 수행하고 있다고 볼 수도 있습니다.

## 흐름

일반적으로 OAuth 2.0이 어떤 방식으로 동작하는지 큰 그림을 살펴봅시다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/oauth2/flow.png" alt="OAuth 2.0 abstract protocol flow" />
</figure>

1. 클라이언트가 자원 소유자에게 인가를 요청합니다. 인가 요청은 위 그림에서처럼 소유자에게 직접 요청할 수도 있고, 인가 서버를 매개로 간접적으로 요청할 수도 있습니다.
2. 소유자가 클라이언트의 인가 요청을 수락하면, 클라이언트는 여러 개의 승인(grant) 타입 중 하나로 표현된 소유자의 인가를 나타내는 인증 정보를 발급받게 됩니다. 승인 타입에 대해선 잠시 후에 살펴보겠습니다.
3. 방금 발급받은 승인 정보를 가지고 클라이언트는 인가 서버에 엑세스 토큰을 요청합니다.
4. 인가 서버는 클라이언트에 대한 인증 절차를 진행하고 승인 정보의 유효성을 검사한 뒤, 만약 유효한 승인 정보라면 엑세스 토큰을 발급합니다.
5. 발급받은 엑세스 토큰을 가지고 클라이언트는 자원 서버에 가서 제한된 자원을 요청합니다.
6. 자원 서버는 엑세스 토큰의 유효성을 검사한 뒤, 유효한 엑세스 토큰인 경우 클라이언트의 요청에 응답합니다.

이때, 클라이언트가 자원 소유자로부터 승인을 받는 과정(1~2번)은 인가 서버를 매개로 하는 방식이 선호됩니다. 이에 대해선 아래의 인가 코드 타입 섹션을 참고해주세요.

## 인가 승인 (Authorization Grant)

앞서 살펴본 흐름에서 1~4번 과정은 승인을 받고 엑세스 토큰을 얻는 과정을 나타내고 있습니다. 인가 승인 타입은 애플리케이션이 인가를 요청할 때 사용된 방법과 API가 지원하는 타입에 따라 결정됩니다. OAuth 2.0은 서로 다른 상황에서 유용한 4개의 주요 승인 타입을 정의하고 있습니다:

- **인가 코드(Authorization Code)**: 서버 사이드 애플리케이션에서 주로 사용됩니다.
- **클라이언트 인증 정보(Client Credentials)**: 자동화 프로세스, 마이크로서비스와 같은 비 상호작용 애플리케이션에서 주로 사용됩니다.
- **기기 코드(Device Code)**: 스마트 TV와 같이 브라우저가 없거나 입력에 제한이 있는 기기에서 주로 사용됩니다.

이외에도 [암묵적인(Implicit) 방법 타입](https://oauth.net/2/grant-types/implicit/)과 [비밀번호 타입](https://oauth.net/2/grant-types/password/)이 존재하지만 이 둘은 보안에 취약하기 때문에 권장되지 않는 방법입니다.

### 인가 코드 타입

인가 코드 타입에선 인가 서버가 엑세스 토큰 교환에 사용되는 1회용 **인가 코드**를 클라이언트에게 발급합니다. 이러한 교환 과정이 서버 내에서 안전하게(즉, private 하게) 이뤄질 수 있기 때문에 전통적인 웹 앱에 최적화된 방법이라 할 수 있습니다. 리디렉션을 기반으로 동작하기 때문에 반드시 애플리케이션은 유저 에이전트(브라우저)와 상호작용할 수 있어야 하고, 유저 에이전트를 통해 들어오는 API 인가 코드를 받을 수 있어야 합니다.

물론 모바일/네이티브 앱이나 SPA에서도 사용될 수는 있지만 이 경우 클라이언트 시크릿이 안전하게 저장될 수 없기 때문에 [Authorization Code with PKCE grant](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce) 방법을 사용하는 것이 더 좋습니다.

인가 코드의 흐름을 그림으로 나타내면 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/oauth2/authorization_code_flow.png" alt="OAuth 2.0 authorization code flow" />
</figure>

#### 1

클라이언트가 자원 소유자의 유저 에이전트를 통해 인가 endpoint에 접근합니다. 이때 클라이언트는 클라이언트 id, 자원 요청 범위(scope), 지역 상태, 그리고 접근이 허가(혹은 거절)된 경우 유저 에이전트가 다시 되돌아올 리디렉션 URI를 포함합니다.

흔히 아래와 비슷한 링크를 이용하는 경우가 많습니다:

<p>https://github.com/login/oauth/authorize?client_id=<code class="language-text">CLIENT_ID</code>&redirect_uri=<code class="language-text">REDIRECT_URI</code>&scope=<code class="language-text">SCOPE</code>&state=<code class="language-text">STATE</code></p>

#### 2

인가 서버는 우선 자원 소유자를 인증한 다음, 자원 소유자로 하여금 인가 요청을 승인할지 거절할지 선택하도록 합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/oauth2/github_authentication.jpg" alt="GitHub authentication" />
    <figcaption>깃헙에서 자원 소유자를 인증하는 절차. 출처: https://help.victorops.com/knowledge-base/github-authentication-guide/</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/oauth2/github_authorization.jpg" alt="GitHub authorization" />
    <figcaption>깃헙에서 자원 소유자가 요청을 승인할 것인지를 묻는 절차. 출처: https://help.victorops.com/knowledge-base/github-authentication-guide/</figcaption>
</figure>

#### 3

자원 소유자가 요청을 승인하면 인가 서버는 유저 에이전트를 1번에서 제공한 redirect URI로 리디렉션 시킵니다. 이때 redirection URI에는 인가 코드와 클라이언트가 이전에 제공한 지역 상태가 포함됩니다.

#### 4

이제 클라이언트는 방금 받은 인가 코드를 가지고 인가 서버의 토큰 endpoint에 엑세스 토큰을 요청합니다. 이때 검증을 위해 인가 코드를 얻는 데 사용한 redirection URI도 요청에 함께 포함합니다.

#### 5

엑세스 토큰 요청을 받은 인가 서버는 우선 클라이언트를 인증한 다음 인가 코드의 유효성을 검사하고, 넘겨받은 redirection URI가 3번에서 사용된 URI와 동일한지 체크합니다. 유효성 검증이 통과되면 인가 서버는 엑세스 토큰을 반환합니다. 이때 리프레쉬 토큰또한 함께 반환될 수도 있습니다.

## References

[rfc6749](https://datatracker.ietf.org/doc/html/rfc6749)
[What is OAuth 2.0? - auth0](https://auth0.com/intro-to-iam/what-is-oauth-2/)
[An Introduction to OAuth 2 - DigitalOcean](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2)
