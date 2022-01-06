---
title: '유니코드와 Character Set에 관하여'
date: 2022-01-06
category: 'Computer Architecture'
draft: false
---

## 역사

옛날에 Unix가 개발이 한창이고 브라이언 커니핸과 데니스 리치가 [The C Programming Language](https://www.amazon.com/Programming-Language-2nd-Brian-Kernighan/dp/0131103628/ref=sr_1_1?keywords=the+c+programming+language&qid=1641382143&sprefix=the+c+pro%2Caps%2C267&sr=8-1)를 집필할 당시, 악센트가 없는 영문자만 잘 표현하면 되었습니다.

이는 숫자 32부터 127 사이를 이용하는 [ASCII](https://en.wikipedia.org/wiki/ASCII)를 통해 모든 글자를 표현할 수 있었습니다. 공백 문자는 32, 대문자 `A`는 65와 같은 식으로요. 단 7비트만 가지고 이러한 글자들을 표현할 수 있었죠.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/computer-architecture/unicode-and-character-sets/ascii_table.gif" alt="ASCII table" />
    <figcaption>ASCII 테이블. 출처: http://www.lonniebest.com/ASCII/Table/</figcaption>
</figure>

이 당시 대부분의 컴퓨터는 8비트였기 때문에 ASCII 문자를 모두 저장하고도 1비트가 남았습니다. 그래서 사람들은 "128부터 255 사이의 코드를 우리 맘대로 이용할 수 있지 않을까?"라고 생각했습니다. 대표적으로 IBM-PC의 OEM character set에는 여분의 코드에 악센트가 추가된 영문자와 도형 등을 그리기 위한 문자들을 대응하였습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/computer-architecture/unicode-and-character-sets/ibm_oem_character_set.png" alt="IBM's OEM character set" />
    <figcaption>IBM's OEM character set. 출처: https://en.wikipedia.org/wiki/Code_page_437#/media/File:Codepage-437.png</figcaption>
</figure>

그러다 이러한 컴퓨터들이 전 세계적으로 팔리기 시작하자, 여분의 코드는 각 나라의 사정에 맞게 변경되었습니다. 예를 들어 미국에서 사용되던 컴퓨터에서 문자 코드 130은 é를 나타내었지만, 이스라엘에서 사용된 컴퓨터는 히브리어 ג를 나타내었습니다. 이 때문에 미국인이 이스라엘에 이력서 "résumés"를 보내면 이스라엘에서는 "rגsumגs"라고 받았었습니다. 특히 러시아어 같은 경우 여분의 문자 코드를 어떻게 사용할지에 대한 여러 가지 아이디어가 있었기 때문에 러시아 내에서 러시아 사람끼리 문서를 주고받는 것조차 쉽지 않았죠.

결국 이러한 무질서함을 바로잡기 위해 [ANSI](https://www.ansi.org/) 표준이 제정되었습니다. 이 표준에서 문자 코드 128 밑으로는 ASCII와 동일하지만, 128 이상의 코드에 대해선 각 나라마다 다르게 사용되었습니다. 이를 [코드 페이지](http://www.i18nguy.com/unicode/codepages.html#msftdos)라고 합니다. 예를 들어 이스라엘 컴퓨터는 코드 페이지 862번을, 그리스 컴퓨터는 737번을 사용했습니다.

한편 아시아에서 사용된 언어의 경우 수천 개의 문자가 존재하기 때문에 (당장 한국어만 봐도 가, 갸, 거, 겨, 고, ... 등 총 11,172자가 존재합니다!) 8비트로는 어림도 없었습니다. 당시 이 문제는 흔히 [DBCS (Double Byte Character Set)](https://en.wikipedia.org/wiki/DBCS)시스템, 즉 어떤 글자는 1바이트로 저장하고 어떤 글자는 2바이트로 저장하는 방식으로 해결하곤 했습니다.

하지만 사람들은 여전히 한 문자는 1바이트라고 인식하고 있었고, 다른 컴퓨터로 문자를 전송하거나 다국어를 하지 않는 이상 별문제가 없다고 생각했습니다. 하지만 잘 아시다시피, 인터넷이 발명된 이후 다른 컴퓨터로 문자를 전송하는 게 흔한 일이 되어버렸고 모든 것이 엉망진창이 되어버렸죠. 하지만 다행스럽게도 유니코드가 발명되었습니다.

## 유니코드 (Unicode)

유니코드는 지구상에서 흔히 사용되는 언어 체계를 단 하나의 character set으로 표현하기 위해 개발된 시스템입니다. 몇몇 사람들은 유니코드는 단순히 16비트 문자 코드, 즉 하나의 문자를 16비트로 표현하는 시스템이므로 총 65,536개의 문자를 표현할 수 있다고 생각합니다. **하지만 이는 사실이 아닙니다.** 이는 유니코드에 대한 가장 대표적인 미신이므로, 여러분이 여태껏 이렇게 생각하셨다고 해도 속상해하실 필요는 없습니다.

사실 유니코드에서 문자를 다루는 방식이 기존의 방식과 다르기때문에, 유니코드를 이해하기 위해 유니코드적 방식(Unicode way)으로 생각하는 방법을 익히셔야 합니다.

이때까지 우리는 한 문자를 디스크나 메모리에 저장할 때 특정 비트에 매핑한다고 가정하였습니다:

A -> 0100 0001

하지만 유니코드에서 한 문자는 **코드 포인트**라는 이론적인 개념에 매핑됩니다. 이 코드 포인트를 어떻게 메모리나 디스크에 저장하는 가는 또 다른 이야기입니다.

유니코드에서 알파벳 `A`는 [이데아](https://en.wikipedia.org/wiki/Platonic_realism)입니다. 즉 하늘에 떠다니는, "본질"이라는 것이죠:

<p class="text-center font-2em">A</p>

이 이데아 <span class="font-1-5em">A</span>는 <span class="font-1-5em">B</span> 혹은 <span class="font-1-5em">a</span>와는 다르지만 <strong class="font-1-5em">A</strong>, <em class="font-1-5em">A</em>, A와는 동일합니다. Times New Roman 폰트의 A는 Helvetica 폰트의 A와 똑같지만 소문자 a와는 다릅니다.

얼핏 보기엔 논란의 여지가 없는 사실인 것 같지만 몇몇 언어에서는 그렇지 않을 수 있습니다. 독일어 ß는 실제 문자일까요 아니면 단순히 "ss"를 멋지게 쓰는 방식일까요? 어떤 단어 끝에서 문자의 모양이 변한다면 이 문자는 다른 문자일까요? 히브리어에서는 다른 문자이고, 아랍어에서는 그렇지 않습니다. 어쨌건 유니코드 컨소시엄의 똑똑한 분들이 수년간 많은 정치적인 토론 등을 통해 이러한 것들을 전부 규정해놓으셨기 때문에 우리는 이와 같은 문제에 대해 전혀 걱정할 필요가 없습니다.

유니코드 컨소시엄에 의해 모든 문자들은 **U+0639**와 같은 마법의 숫자들에 할당되었습니다. 이러한 마법의 문자를 **코드 포인트**라고 합니다. 코드 포인트에서 "U+"는 유니코드를 나타내고, 그 뒤의 숫자는 16진수 입니다. **U+0639**는 아랍어 아인(ع)을 나타내고, **U+0041**은 대문자 A를 나타냅니다. 각 코드 포인트가 어떤 문자를 나타내는 것인가는 [여기](https://home.unicode.org/)에서 보실 수 있습니다.

유니코드가 정의할 수 있는 최대 문자 개수라는 것은 사실 존재하지 않습니다. 이미 유니코드로 정의된 문자의 개수는 65,536개를 진작에 넘어섰기 때문에 모든 문자를 2바이트로 나타낼 수도 없습니다.

좋습니다. 이제 다음과 같은 문자열을 생각해봅시다:

<p class="text-center"><strong class="font-2em">Hello</strong></p>

유니코드에서 이를 코드 포인트로 나타내면 `U+0048 U+0065 U+006C U+006C U+006F`가 됩니다. 그저 숫자일 뿐이죠. 그럼 이와 같은 것들을 어떻게 메모리에 저장하고, 이메일에서 표현할 수 있을까요?

## Reference

[https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/)

[JavaScript for impatient programmers](https://exploringjs.com/impatient-js/)
