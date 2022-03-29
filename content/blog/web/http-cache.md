---
title: 'HTTP 캐시'
date: 2022-03-29
category: 'Web'
draft: false
---

## Overview

필요한 데이터를 매번 서버에서 가공해 제공하는 것은 이 자체로 오랜 시간이 소요됩니다. 하지만 만약 사용자의 같은 요청에 응답하는 리소스가 동일한 경우 서버가 매번 같은 작업으로 데이터를 가공하지 않고도 이전에 (클라이언트가) 가져온 리소스를 재사용함으로써 성능을 크게 향상시킬 수 있습니다. 즉, 원본 서버로의 요청 수를 최소화하여 네트워크 왕복 수를 줄이고 이에 따라 사용자 요청에 대한 응답 속도를 단축할 수 있습니다. 또, 완전한 컨텐츠 전체를 주고받지 않아도 되므로 네트워크 대역폭 및 리소스 등을 보다 효율적으로 사용할 수 있습니다.

각 캐시 엔트리는 캐시 키와 하나 이상의 HTTP 응답으로 구성됩니다. 캐시 엔트리의 가장 흔한 형태는 GET 요청에 대한 성공 응답(200 OK)을 저장하는 형태이지만, 리디렉션이나 `404 Not Found`와 같은 에러 혹은 `206 Partial Content`와 같은 불완전한 응답도 캐싱할 수 있습니다. 또한 적절히 캐싱할 수 있는 경우 GET 이외의 요청도 캐싱할 수 있습니다.

캐시 엔트리의 primary 캐시 키는 `요청 메서드 + 타겟 URI` 로 구성됩니다. 하지만 현재는 일반적으로 GET 요청에 대해서만 캐싱하므로 대부분의 캐시는 GET 요청의 URI만을 primary 캐시 키로 사용하고 이외의 메서드에 대해선 캐싱하지 않습니다.

만약 요청이 [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation)의 대상이라면 해당 요청의 캐시 엔트리에는 여러 개의 응답이 저장될 수 있습니다. 이 경우 secondary 캐시 키로 흔히 [Vary](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary) 헤더 필드가 사용됩니다.

## 캐시 종류

HTTP 캐시는 크게 공유 캐시, 브라우저(로컬) 캐시로 구분할 수 있습니다. 공유 캐시는 응답을 여러 사용자가 공유하는 캐시이고, 로컬 캐시는 오직 한 사용자에게만 할당되는 캐시입니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/http-cache/not_use_cache.png" alt="Not using cache" />
    <figcaption>캐시를 사용하지 않는 경우</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/http-cache/shared_cache.png" alt="Shared cache mechanism" />
    <figcaption>공유 캐시 동작</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/http-cache/browser_cache.png" alt="Local cache mechanism" />
    <figcaption>브라우저 (로컬) 캐시 동작</figcaption>
</figure>

### 공유 캐시

공유 캐시는 ISP, CDN 등에서 사용되는 캐시로, 자주 사용되는 자원을 여러 사용자가 공유하는 형태입니다.

### 브라우저 (로컬) 캐시

브라우저 (로컬) 캐시는 오직 한 사용자에게만 할당되는 프라이빗한 캐시입니다.

## 캐시의 유효 기간

대부분의 캐시는 생명 주기를 가집니다. 캐시는 생명 주기와 관련하여 크게 `fresh`, `stale` 두 개의 상태로 구분할 수 있습니다. 만약 아직 유효 기간이 지나지 않은 캐시의 경우 해당 캐시는 **fresh**한 캐시라고 하고, 유효 기간이 지난 캐시의 경우 **stale**한 캐시라고 부릅니다.

캐시의 유효 기간을 설정하는 방법은 잠시 후에 살펴볼 `Cache-Control` 헤더 등을 이용하여 명시적으로 설정하거나, 명시적으로 설정되지 않은 경우 휴리스틱을 사용하여 결정할 수 있습니다. 일반적으로 캐시의 유효 기간은 "**응답이 원본 서버에서 생성된 시점**으로부터 얼마" 라고 설정됩니다.

캐시가 fresh 하다면 원본 서버에 요청을 보내지 않고 캐시에 저장된 데이터를 읽어와 사용하게 됩니다. stale한 캐시의 경우엔 원본 서버로 재검증(revalidation) 요청을 보내 해당 캐시가 여전히 유효한지를 검증받아야 사용할 수 있습니다.

## 캐시 제어 방식

### Expires

HTTP/1.0에선 [Expires](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires) 헤더를 사용하여 캐시의 유효 기간을 지정하도록 합니다. 이때 원본 서버는 Expires 헤더와 함께 [Date](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Date) 헤더도 같이 보내야 하며, Date 헤더는 응답이 서버에서 생성된 시점을 의미합니다.

이 경우 캐시의 유효 기간은 Expires의 날짜에서 Date 날짜를 뺌으로써 계산할 수 있습니다:

```
TTL(Time To Live) = Expires_value - Date_value
```

### Cache-Control: max-age

HTTP/1.1에선 `Cache-Control: max-age=<seconds>` 헤더로 캐시의 유효 기간을 설정합니다. 예를 들어, 어떤 리소스의 헤더로 `Cache-Control: max-age=3600`과 같이 설정하면 이 리소스에 대한 캐시의 유효 기간은 1시간(=3600초) 입니다.

`Cache-Control: max-age` 헤더는 `Expires` 및 `Date` 헤더와 실질적으로 동일한 동작을 수행합니다. 물론 따지고 보면 `Expires` 헤더는 캐시의 만료 일자를 지정하는 반면 `Cache-Control: max-age` 헤더는 유효 기간을 지정하지만요.

그러나 `Cache-Control` 헤더를 지원하지 않는 HTTP/1.0 기반의 서버 혹은 브라우저를 위해 두 헤더 값을 모두 표시하는 것이 좋습니다. 만약 HTTP/1.1을 지원하는 서버의 경우 `Cache-Control`을 우선적으로 사용합니다.

### Cache-Control: s-maxage

`Cache-Control: s-maxage` 헤더는 CDN과 같이 공유 캐시의 유효 기간을 설정합니다. 예를 들어, `Cache-Control: s-maxage=31536000, max-age=0`과 같이 설정하면 CDN에서는 1년 동안 캐시 되지만 브라우저에서는 매번 재검증 요청을 보내도록 설정할 수 있습니다.

### no-cache vs. no-store

no-cache와 no-store 지시자는 서로 이름은 비슷하지만, 전혀 다른 동작을 합니다.

`Cache-Control: no-cache`는 대부분의 브라우저에서 max-age=0과 같은 뜻을 가집니다. 즉 캐시는 저장하지만, 해당 캐시를 사용하려 할 때마다 서버에 재검증 요청을 보내야 합니다.

반면, `Cache-Control: no-store`는 절대로 캐싱해서는 안 되는 리소스 (예를 들면 사용자 정보와 관련된 리소스)에 대해 사용하는 강력한 값입니다. no-store를 사용하면 브라우저는 어떤 경우에도 캐시 저장소에 해당 리소스를 저장하지 않습니다.

### public vs. private

`Cache-Control: public` 헤더를 사용하면 관련된 응답을 CDN 등에 존재하는 공유 캐시를 포함하여 모든 종류의 캐시에 캐싱 될 수 있게 하고, 사용자 제한 없이 모든 사용자에게 응답이 전달될 수 있도록 합니다.

반면, `Cache-Control: private` 헤더를 사용하면 해당 응답과 관련된 요청을 한 사용자에게만 캐싱할 수 있고, 이외에 CDN과 같은 공유 캐시에는 캐싱 되지 않습니다. 엄밀히 따지자면 범용 캐시 서버에도 캐싱할 수는 있지만 해당 응답을 모든 사용자에게 공유할 수는 없습니다. 즉, 궁극적으로 최종 사용자의 브라우저에서만 이 응답을 캐싱할 수 있습니다.

하지만 private 지시자를 이용한다고 해서 응답에 담긴 개인 정보가 자동으로 보호되는 것은 아니므로 주의해야 합니다. public과 private은 응답을 어디에 캐싱할 것인지를 지정하기 위해 사용되는 것이지 개인 정보를 보호하는 장치는 아닙니다.

### must-revalidate

must-revalidate 지시자는 응답을 캐싱할 수 있고, 캐시가 fresh한 상태라면 캐시를 사용하도록, stale한 상태라면 무조건 재검증받도록 합니다.

클라이언트가 원본 서버와 통신할 수 없는 경우 HTTP는 stale 캐시를 재사용할 수 있도록 합니다. 하지만 must-revalidate 지시자를 사용하면 원본 서버와 통신할 수 없는 경우에도 재검증받게 하는데, 이 경우 서버와 재연결되어 재검증을 받거나 504 Gateway Timeout 응답이 발생하게 됩니다.

### stale-while-revalidate

만일 사용자가 아주 중요한 컨텐츠를 급히 다운받으려 할 때 마침 캐시가 만료되었고, 컨텐츠에 변경이 발생했으며, 컨텐츠의 크기도 크다면 사용자는 컨텐츠를 다운받는데 오랜 시간 지연을 겪을 수 있습니다. 이러한 경우를 피하기 위해 `stale-while-revalidate` 지시자를 이용하여 사용자가 기한이 만료된 컨텐츠를 요청하기 전 미리 최신 컨텐츠를 받아둘 수 있습니다.

```
Cache-Control: max-age=3600, stale-while-revalidate=30
```

위 헤더는 3600초 동안은 캐시에 저장된 리소스를 사용하도록 하고, 이후 30초는 만료되었지만 여전히 캐시에 저장된 리소스를 사용하도록 합니다. 그리고 캐시는 그동안 서버와 통신하여 새로운 컨텐츠를 비동기적으로 받아도게 합니다.

### ETag

ETag(Entity Tag) 헤더는 원본 서버가 각 리소스를 식별하기 위해 사용하는 고윳값(식별자) 입니다. ETag는 임의의 문자들이 따옴표(") 안에 포함되도록 하며, 이 값은 전적으로 원본 서버가 결정하지만 고유한 값이어야 합니다.

```
ETag: "a16c78370b6a265bde1d35sgbfda"
```

ETag 값은 크게 *Strong ETag*와 *Weak ETag*로 나눌 수 있습니다. 위 예시에 사용된 것이 Strong ETag이고, Weak ETag는 다음과 같이 사용합니다:

```
ETag: W/"34gfsfdb99381kabmdenbcacz"
```

Strong ETag는 모든 리소스에 대해 유일한 값을 가져야 하므로 Weak ETag에 비해 값을 생성하는 과정이 까다롭습니다. 반면 Weak ETag는 비교적 간단하게 값을 생성할 수 있지만 ETag 값에 대한 신뢰도가 떨어집니다.

만약 원본 서버에서 ETag의 역할이 그다지 중요하지 않으면 유일성이 약한 ETag 값을 할당할 수 있습니다. 이때 ETag 값에 `W/`를 붙여 이 값이 유일하지 않을 수도 있지만 괜찮다는 뜻을 전달해야 합니다.

## 캐시 유효성 체크

유효 기간이 지나 stale 상태가 된 캐시는 더 이상 신뢰할 수 없는 캐시로 간주됩니다. 따라서 해당 캐시를 사용하려고 하는 경우 원본 서버에 요청을 보내 새 응답을 받아야 합니다. 이때 원본 서버에 있는 리소스에 변경 사항이 존재하는 경우 원본 서버는 (당연히) 새 응답을 만들어 반환하고 max-age 값을 다시 설정하여 캐싱 되도록 합니다.

하지만 리소스가 변경되지 않은 경우는 어떨까요? 이 경우엔 굳이 완전한 응답을 만들어 반환할 필요가 없습니다. 오히려 완전한 응답을 반환하는 경우 이미 캐시에 존재하는 내용과 똑같은 응답을 받을 것이고, 결과적으로 캐싱된 내용엔 아무런 변화가 없고 네트워크 대역폭만 낭비하게 됩니다.

이러한 비효율적인 동작을 방지하고자 HTTP에는 **조건부 요청**이라는 메커니즘이 존재합니다. 이는 만료된 캐시를 사용하려고 하는 경우 우선 원본 서버에 조건부 요청을 보내 캐시가 여전히 유효한지에 대한 재검증을 수행합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/http-cache/304.png" alt="304 not modified" />
    <figcaption>77.2kB 크기의 리소스의 캐시 검증을 위해 1.7kB만의 네트워크 송수신만을 주고받았음을 나타냄</figcaption>
</figure>

재검증 결과, 브라우저가 가지고 있는 캐시가 유효하다고 판별되면 서버는 **304 Not Modified** 응답을 반환합니다. 이 응답은 본문(HTTP body)를 포함하지 않기 때문에, 완전한 응답을 반환하는 경우에 비해 매우 빠릅니다. 물론 캐시가 유효하지 않다고 판별되면(즉, 리소스가 변경된 경우) 200 OK와 같은 응답과 함께 변경된 리소스를 반환합니다.

조건부 요청을 보낼 때는 시간을 기반으로 한 방법과 컨텐츠를 기반으로 한 방법 두 가지가 존재합니다.

**시간 기반의 조건부 요청**은 어떤 요청에 대한 원본 서버의 컨텐츠가 캐싱된 이후 변경되었는지를 컨텐츠의 *최종 변경 시간*을 중심으로 확인하는 방법입니다. 서버에 저장된 컨텐츠가 변경되어 새로 저장되면 그 날짜와 시간을 메타 데이터로 남기는데, 서버가 컨텐츠에 대한 응답을 보낼 때 `Last-Modified`라는 헤더에다 컨텐츠의 최종 변경 날짜와 시간을 적어 보냅니다:

```
Cache-Control: public, max-age=31536000
Last-Modified: Tue, 01 Mar 2022 13:14:29 GMT
```

그러면 캐시는 최초 요청에 대한 이 응답을 저장하고, TTL 시간이 지난 이후에 같은 요청이 발생하면 원본 서버에 "만약 최종 변경 시간 이후에 변경 사항이 있다면 전체 응답을 다시 주세요"와 같은 의미의 요청을 보냅니다. 이는 `If-Modified-Since` 라는 요청 헤더에 `Last-Modified` 헤더값을 복사함으로써 수행합니다:

```
If-Modified-Since: Tue, 01 Mar 2022 13:14:29 GMT
```

만약 이 날짜 이후 변경 사항이 있다면 서버는 200 코드와 함께 변경된 컨텐츠를 내려주고, 만약 변경 사항이 없다면 304 코드와 함께 응답 헤더만을 리턴합니다.

**컨텐츠 기반의 조건부 요청**은 어떤 요청에 대한 원본 서버의 컨텐츠가 캐싱된 이후 변경되었는지를 컨텐츠의 *고윳값*을 중심으로 확인하는 방법입니다. 여기서 고윳값은 서버가 정하기 나름이지만 일반적으로 해시값이 사용됩니다. 만약 컨텐츠의 내용이 조금이라도 변경된다면 해시값 또한 달라지므로 이 값들을 비교하여 컨텐츠의 변경 여부를 파악할 수 있습니다.

원본 서버는 미리 정의한 알고리즘을 이용하여 고윳값을 만들어 ETag 헤더에 이 값을 넣어 보냅니다. 시간 기반의 조건부 요청에서 살펴본 것처럼 원본 서버와의 요청/응답 프로세스는 비슷합니다. 캐시는 최초 요청에 대한 이 응답을 저장하고, TTL 시간이 지난 이후에 같은 요청이 발생하면 원본 서버에 "만약 캐시된 리소스의 ETag 값과 같은 값이 서버에 없다면 전체 응답을 다시 내려주세요"와 같은 의미의 요청을 보냅니다. 이는 `If-None-Match` 라는 헤더에 `ETag`의 값을 복사함으로써 수행합니다:

```
If-None-Match: "a16c78370b6a265bde1d35sgbfda"
```

## 캐시 컨텐츠 갱신

웹 사이트가 개편되었거나 컨텐츠를 급하게 변경한 경우엔 캐시에 저장된 사본을 강제로 갱신해야만 사용자에게 정상적인 서비스를 제공할 수 있습니다. 이를 위해 다음의 두 가지 방법을 사용할 수 있습니다:

### 퍼지

**퍼지(purge)**는 저장소를 완전히 지우는 방식으로, 대부분의 캐시 서버가 캐시를 모두 지우는 명령 또는 API를 제공합니다. 또한 브라우저의 옵션 메뉴에서 로컬 캐시를 삭제할 수도 있습니다. CDN을 비롯한 캐시 서버에서 한꺼번에 많은 컨텐츠를 퍼지하는 경우 서버에 충분한 리소스가 남아있는지 살펴봐야 합니다. 퍼지를 하고 난 이후에 캐시되지 않은 많은 요청이 한꺼번에 몰려 서버에 부하가 높아질 수 있기 때문입니다.

특히 프로모션 혹은 새 페이지를 오픈하는 경우 갑작스러운 퍼지는 되도록 피하고 테스트 툴을 이용하여 웹 페이지 리소스들을 캐시에 미리 저장하는 것이 좋습니다. CDN에 많은 트래픽을 의존하여 원본 서버의 리소스를 최소로 유지하는 경우 단계적으로 나눠 퍼지하거나 무효화 방법을 사용하는 것이 좋습니다.

### 무효화

**무효화(invalidate)**는 캐시 저장소를 완전히 지우기보단 조건부 요청을 통해, 캐시된 리소스 중 변경이 있던 리소스만 새로 갱신하는 방법입니다. 아래 예시와 같이 `Cache-Control` 헤더를 통해 캐시 서버의 내용을 강제로 무효화할 수 있습니다:

```
Cache-Control: max-age=0, must-revalidate
```

이 경우에도 퍼지와 마찬가지로 트래픽이 잠깐 증가할 수는 있지만 퍼지와는 다르게 대부분 `If-Modified-Since` 혹은 `If-None-Match` 요청일 것이고, 실제 변경된 리소스에 한해서만 전체 컨텐츠가 반환되므로 네트워크 대역폭 낭비를 크게 줄일 수 있습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/http-cache/revalidation.png" alt="Revalidation header" />
    <figcaption>If-None-Match와 If-Modified-Since가 포함된 요청</figcaption>
</figure>

## 레퍼런스

- [HTTP caching - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [RFC 7234 - Hypertext Transfer Protocol (HTTP/1.1): Caching](https://httpwg.org/specs/rfc7234.html#expiration.model)
- [토스 테크 - 웹 서비스 캐시 똑똑하게 다루기](https://toss.tech/article/smart-web-service-cache)
- [웹 성능 최적화 기법](https://book.naver.com/bookdb/book_detail.nhn?bid=17664118)
