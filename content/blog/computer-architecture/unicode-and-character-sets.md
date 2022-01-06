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

## Reference

[https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/)

[JavaScript for impatient programmers](https://exploringjs.com/impatient-js/)
