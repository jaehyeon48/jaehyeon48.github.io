---
title: 'React 컨텍스트 효율적으로 사용하기'
date: 2021-12-28
category: 'react'
draft: false
---

이 포스트는 [How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)를 번역한 글입니다.

<hr class="custom-hr">

[React로 애플리케이션 상태관리 하기](https://jaehyeon48.github.io/react/application-state-management-with-react/)에서 지역 상태와 React 컨텍스트를 같이 사용하여 React 애플리케이션의 상태를 잘 관리할 수 있는 방법을 소개해 드렸습니다. 여기서는 해당 포스트에서 보여드렸던 몇 가지 예제를 바탕으로, 어떻게 하면 컨텍스트 comsumer를 효과적으로 작성하여 개발자 경험과 컨텍스트 객체의 유지 보수성을 높일 수 있는지에 대해 말씀드리려고 합니다.

> ⚠️ 우선 [React로 애플리케이션 상태관리 하기](https://jaehyeon48.github.io/react/application-state-management-with-react/)를 읽으시고, 모든 문제에 대해 컨텍스트를 사용하면 안된다는 조언을 따르세요. 하지만 정말로 컨텍스트가 필요한 상황이라면, 이 포스트를 통해 컨텍스트를 더 효과적으로 사용하는 방법을 아시게 될 겁니다. 또한, 컨텍스트가 무조건 글로벌하게 존재할 필요는 전혀 없으며 논리적으로 분할하여 여러 개의 컨텍스트를 가지는 것이 더 바람직할 수 있습니다.

우선, `src/count-context.js` 파일을 생성하여 컨텍스트를 만들어 봅시다:

```jsx
import * as React from 'react';

const CountContext = React.createContext();
```

현재 `CountContext`에는 초기값이 없습니다. 만약 초기값을 추가하고 싶다면 `React.createContext({ count: 0 });`와 같이하면 됩니다. 하지만 이 예제에선 의도적으로 초기값을 넣지 않았습니다. 기본값은 다음과 같은 상황에서나 유용합니다:

```jsx{2}
function CountDisplay() {
  const { count } = React.useContext(CountContext);
  return <div>{count}</div>;
}

ReactDOM.render(<CountDisplay />, document.getElementById('⚛️'));
```

`CountContext`에 초기값이 없기 때문에, 위 코드에서 하이라이트 된 부분에서 에러가 발생할 것입니다. 이 컨텍스트의 기본값은 `undefined`인데 `undefined`를 [구조 분해](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#object_destructuring)할 수는 없기 때문이죠!

런타임 에러를 좋아하는 사람은 없기 때문에, 아마 여러분은 런타임 에러를 해결하기 위해 무의식적으로 기본값을 추가하실 겁니다. 하지만 한번  생각해봅시다. 컨텍스트에 실제 값이 없는데 컨텍스트를 왜 쓰는걸까요? 만약 단순히 기본값만을 쓰는 거라면 컨텍스트를 굳이 사용하는 이유가 없을 겁니다. 애플리케이션에서 컨텍스트를 생성하고 사용하는 대부분의 경우, 유용한 값을 제공해주는 provider 내에서 (`useContext`를 사용하는) consumer가 렌더링 되기를 원할 겁니다.

> 물론 기본값이 유용한 경우도 있지만, 기본값이 필요 없을 뿐 더러 그다지 유용하지 않은 경우가 대부분입니다.

[React 공식 문서](https://reactjs.org/docs/context.html#reactcreatecontext)에선 컨텍스트의 기본값을 제공하면 "컴포넌트를 wrapping하지 않고 테스트하기에 유용하다"라고 하고 있습니다. 물론 맞는 말이긴 합니다만 컴포넌트를 컨텍스트로 wrapping 하지 않는 것이 좋은 것인지는 잘 모르겠습니다. 애플리케이션에서 실제로는 하지 않는 동작을 테스트하는 것은 테스트를 통해 얻을 수 있는 (코드에 대한) 자신감을 저하하는 행위임을 기억하세요. [이렇게 하는 경우](https://kentcdodds.com/blog/the-merits-of-mocking)가 있기는 하지만 지금의 상황은 맞지 않습니다.

> ⚠️ 만일 타입스크립트를 사용하고 계신다면, 기본값을 제공하지 않을 경우 `useContext`를 사용하는 것이 매우 귀찮아질 수 있습니다. 이에 대한 해결책은 뒤에서 알려드릴게요!