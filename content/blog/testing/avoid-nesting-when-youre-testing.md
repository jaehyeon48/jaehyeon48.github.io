---
title: '테스팅할 때 중첩은 피하세요'
date: 2021-12-28
category: 'Testing'
draft: false
---

이 글은 [Kent C. Dodds](https://kentcdodds.com/)의 [Avoid Nesting when you're Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing) 포스트를 번역한 글입니다.

<hr class="custom-hr">

제가 보여드리고 싶은 것은 React 컴포넌트 테스트에 적용된 일반적인 테스팅 원칙입니다. 비록 예제가 React이긴 하지만, 개념이 제대로 전달되었으면 좋겠네요.

> 💡 제가 하려는 말은 중첩 그 자체가 나쁘다는 말이 아닙니다만, 중첩을 사용하게 되면 자연스럽게 `beforeEach`와 같은 테스트 훅을 사용하게 되고 이에 따라 테스트를 유지 보수하기 어려워질 수 있습니다. 계속 읽어주세요..

여기, 제가 테스트하고 싶은 React 컴포넌트가 있습니다:

```jsx
// Login.js
import * as React from 'react';

function Login({ onSubmit }) {
  const [error, setError] = React.useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const {
      usernameInput: { value: username },
      passwordInput: { value: password },
    } = event.target.elements;

    if (!username) {
      setError('username is required');
    } else if (!password) {
      setError('password is required');
    } else {
      setError('');
      onSubmit({ username, password });
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="usernameInput">Username</label>
          <input id="usernameInput" />
        </div>
        <div>
          <label htmlFor="passwordInput">Password</label>
          <input id="passwordInput" type="password" />
        </div>
        <button type="submit">Submit</button>
      </form>
      {error ? <div role="alert">{error}</div> : null}
    </div>
  );
}

export default Login;
```

([예제](https://codesandbox.io/s/divine-mountain-pogxj?file=/src/App.js))

저는 수 년동안 아래와 같은 유형의 테스트 셋들을 많이 봤습니다:

```jsx
// __tests__/Login.js
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import Login from '../login';

describe('Login', () => {
  let utils,
    handleSubmit,
    user,
    changeUsernameInput,
    changePasswordInput,
    clickSubmit;

  beforeEach(() => {
    handleSubmit = jest.fn();
    user = { username: 'michelle', password: 'smith' };
    utils = render(<Login onSubmit={handleSubmit} />);
    changeUsernameInput = value =>
      userEvent.type(utils.getByLabelText(/username/i), value);
    changePasswordInput = value =>
      userEvent.type(utils.getByLabelText(/password/i), value);
    clickSubmit = () => userEvent.click(utils.getByText(/submit/i));
  });

  describe('when username and password is provided', () => {
    beforeEach(() => {
      changeUsernameInput(user.username);
      changePasswordInput(user.password);
    });

    describe('when the submit button is clicked', () => {
      beforeEach(() => {
        clickSubmit();
      });

      it('should call onSubmit with the username and password', () => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
        expect(handleSubmit).toHaveBeenCalledWith(user);
      });
    });
  });

  describe('when the password is not provided', () => {
    beforeEach(() => {
      changeUsernameInput(user.username);
    });

    describe('when the submit button is clicked', () => {
      let errorMessage;
      beforeEach(() => {
        clickSubmit();
        errorMessage = utils.getByRole('alert');
      });

      it('should show an error message', () => {
        expect(errorMessage).toHaveTextContent(/password is required/i);
      });
    });
  });

  describe('when the username is not provided', () => {
    beforeEach(() => {
      changePasswordInput(user.password);
    });

    describe('when the submit button is clicked', () => {
      let errorMessage;
      beforeEach(() => {
        clickSubmit();
        errorMessage = utils.getByRole('alert');
      });

      it('should show an error message', () => {
        expect(errorMessage).toHaveTextContent(/username is required/i);
      });
    });
  });
});
```

이와 같은 테스트는 우리에게 컴포넌트가 100% 잘 동작한다는 것과, 앞으로도 설계한대로 잘 동작할 것이라는 확신을 심어줍니다. 하지만 이러한 테스트 셋에 대해 개인적으로 맘에 들지 않는 부분들이 있습니다:

## 과(過)추상화 (Over-abstraction)

`changeUsernameInput`, `clickSubmit`과 같은 유틸리티들은 그럭저럭 괜찮다고 생각하지만, 테스트가 아주 간단하기 때문에 이러한 유틸리티들이 하는 동작을 단순히 복붙하는 것이 오히려 테스트 코드를 더욱 간소화하는 방법이라고 생각합니다. 지금과 같이 작은 테스트 셋에 대해선 이러한 함수 추상화들이 이득을 준다기보단 오히려 유지보수를 하는 사람으로 하여금 함수들이 정의된 파일을 계속 뒤적거려야 하는 불편함만 안겨줄 뿐입니다.

## 중첩 (Nesting)

위의 테스트 셋은 [Jest](https://jestjs.io/) API를 사용하였지만, 다른 주요 자바스크립트 프레임워크들도 이와 비슷합니다. 이 글에서 `describe`는 테스트를 묶는 것에 관해, `beforeEach`는 공통으로 사용되는 셋업/액션에 관해, 그리고 `it`은 실제 단정문(assertion)에 관해 말하고 있음을을 유념해주세요.

저는 이러한 방식으로 중첩하는 것을 매우 싫어합니다. 위와 흡사한 테스트를 수천 개 작성하고 유지 보수했던 경험에 비춰봤을 때, 위 예시에 있는 3개의 테스트만으로도 고통스러운데 그보다 많은 수천 라인의 테스트의 경우는 더욱 고통스러울 것이라고 여러분께 단언할 수 있습니다. 그리고 테스트가 거대해지면 그만큼 중첩도 더 많이 하게 될 거에요.

그럼 무엇이 그토록 복잡하게 만드는걸까요? 아래 예제를 봐주세요:

```js
it('should call onSubmit with the username and password', () => {
  expect(handleSubmit).toHaveBeenCalledTimes(1);
  expect(handleSubmit).toHaveBeenCalledWith(user);
});
```

`handleSubmit`은 어디서 오는 거고 값은 무엇일까요? 또, `user`는 어디서 오는 걸까요? 아 물론 이들이 정의된 부분을 살펴보면 되죠:

```js{3-4}
describe('Login', () => {
  let utils,
    handleSubmit,
    user,
    changeUsernameInput,
    changePasswordInput,
    clickSubmit;
  // ...
});
```

하지만, 정의된 부분 뿐만 아니라 할당된 부분도 살펴봐야 합니다:

```js
beforeEach(() => {
  handleSubmit = jest.fn();
  user = { username: 'michelle', password: 'smith' };
  // ...
});
```

그러고 나서, 이후에 더욱 중첩된 `beforeEach`에서 다른 값으로 할당되고 있지는 않은지 또한 살펴봐야 합니다. 이렇게 코드를 추적하면서 변수와 변수의 값을 기억해야 한다는 점이 제가 중첩된 테스트를 극히 반대하는 이유 중 하나입니다. 이렇게 여러분의 머릿속에 기억해야 할 것들이 많아질수록 정작 중요한 일을 제대로 처리하기가 힘들어지게 됩니다.

물론 여러분은 변수 재할당이 "안티 패턴"이라서 피해야 하는 것이지 않느냐고 하실 수 있는데, 물론 동의합니다만 이미 많은 린트 규칙을 적용하고 있는 테스트 셋에 계속해서 규칙을 추가하는 것은 멋진 해결책이 아닙니다. 변수 재할당을 걱정할 필요 없이 공통적인 셋업을 공유할 방법이 있다면 어떨까요?

## 인라인 하세요! (Inline it!)

여기서 살펴보고 있는 것과 같은 간단한 컴포넌트의 경우, 추상화를 최대한 제거하는 것이 최고의 해결책이라고 생각합니다. 확인해봅시다:

```jsx
// __tests__/Login.js
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import Login from '../Login';

test('calls onSubmit with the username and password when submit is clicked', () => {
  const handleSubmit = jest.fn();
  const { getByLabelText, getByText } = render(<Login onSubmit={handleSubmit} />);
  const user = { username: 'michelle', password: 'smith' };

  userEvent.type(getByLabelText(/username/i), user.username);
  userEvent.type(getByLabelText(/password/i), user.password);
  userEvent.click(getByText(/submit/i));

  expect(handleSubmit).toHaveBeenCalledTimes(1);
  expect(handleSubmit).toHaveBeenCalledWith(user);
});

test('shows an error message when submit is clicked and no username is provided', () => {
  const handleSubmit = jest.fn();
  const { getByLabelText, getByText, getByRole } = render(
    <Login onSubmit={handleSubmit} />,
  );

  userEvent.type(getByLabelText(/password/i), 'anything');
  userEvent.click(getByText(/submit/i));

  const errorMessage = getByRole('alert');
  expect(errorMessage).toHaveTextContent(/username is required/i);
  expect(handleSubmit).not.toHaveBeenCalled();
});

test('shows an error message when submit is clicked and no password is provided', () => {
  const handleSubmit = jest.fn();
  const { getByLabelText, getByText, getByRole } = render(
    <Login onSubmit={handleSubmit} />,
  );

  userEvent.type(getByLabelText(/username/i), 'anything');
  userEvent.click(getByText(/submit/i));

  const errorMessage = getByRole('alert');
  expect(errorMessage).toHaveTextContent(/password is required/i);
  expect(handleSubmit).not.toHaveBeenCalled();
});
```

> 💡 여기서 `test`는 `it`과 동일합니다. 개인적으로 `describe` 안에 중첩하는 것이 아니라면 `it` 대신 `test`를 선호하는 편입니다.

중복이 조금 발생하긴 했지만 (좀 있다 해결할 것입니다), 테스트 코드가 얼마나 간결해졌는지를 보세요. 몇몇 테스트 유틸리티와 로그인 컴포넌트를 제외하곤 모든 테스트가 독립적(self-contained)입니다. 이렇게 하면 스크롤 해서 왔다 갔다 할 필요 없이 테스트에서 어떤 일이 일어나고 있는지 이해하기 쉬워집니다. 만약 이 컴포넌트에 대한 테스트가 좀 더 있었다면 이러한 장점이 더욱 잘 드러났을 것입니다.

또한 굳이 모든 것을 `describe` 블록 안에 중첩하고 있지 않은 점을 봐주세요. 테스트 파일 내에 있는 모든 것은 분명 `Login` 컴포넌트를 테스트하는 것임을 명백히 알 수 있기 때문에 굳이 중첩을 추가할 필요가 없습니다.

## AHA (Avoid Hasty Abstractions) 적용하기

[AHA 원칙](https://kentcdodds.com/blog/aha-programming)에 따르면 여러분은:

> 잘못된 추상화보단 중복을 선호하시고, 변경에 대한 최적화를 먼저 하려고 하셔야 합니다.

우리가 살펴보고 있는 간단한 로그인 컴포넌트의 경우라면 테스트를 지금 상태 그대로 두어도 별문제 없지만, 상황이 좀 더 복잡해지고 코드 중복으로 인해 문제들이 발생하기 시작해서 중복을 줄이려고 한다고 해봅시다. `beforeEach`를 써야 할까요? 그래도 되는 걸까요?

글쎄요, 그럴 수는 있겠다만 그렇게 된다면 우리가 피해야 할 변수 재할당 문제가 생기게 될 겁니다. 그럼 어떻게 테스트 간에 코드를 공유할 수 있을까요? 아하! 함수를 쓰면 되겠군요!

```jsx
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import Login from '../Login';

// 여기에 테스트 케이스들을 위해 서로 조합하여 사용되는 셋업 함수들이 있습니다.
// 같은 일을 반복하는 테스트가 많이 있는 경우에만 이러한 방식을 사용하세요.
// 여기선 예시를 위해 작성해놨지만 실제로 예시 수준의 테스트에선 이 정도의 추상화는 필요 없습니다.
// https://kentcdodds.com/blog/aha-testing 에서 더 많이 알아보세요!
function setup() {
  const handleSubmit = jest.fn();
  const utils = render(<Login onSubmit={handleSubmit} />);
  const user = { username: 'michelle', password: 'smith' };
  const changeUsernameInput = value =>
    userEvent.type(utils.getByLabelText(/username/i), value);
  const changePasswordInput = value =>
    userEvent.type(utils.getByLabelText(/password/i), value);
  const clickSubmit = () => userEvent.click(utils.getByText(/submit/i));
  return {
    ...utils,
    handleSubmit,
    user,
    changeUsernameInput,
    changePasswordInput,
    clickSubmit,
  };
}

function setupSuccessCase() {
  const utils = setup();
  utils.changeUsernameInput(utils.user.username);
  utils.changePasswordInput(utils.user.password);
  utils.clickSubmit();
  return utils;
}

function setupWithNoPassword() {
  const utils = setup();
  utils.changeUsernameInput(utils.user.username);
  utils.clickSubmit();
  const errorMessage = utils.getByRole('alert');
  return { ...utils, errorMessage };
}

function setupWithNoUsername() {
  const utils = setup();
  utils.changePasswordInput(utils.user.password);
  utils.clickSubmit();
  const errorMessage = utils.getByRole('alert');
  return { ...utils, errorMessage };
}

test('calls onSubmit with the username and password', () => {
  const { handleSubmit, user } = setupSuccessCase();
  expect(handleSubmit).toHaveBeenCalledTimes(1);
  expect(handleSubmit).toHaveBeenCalledWith(user);
});

test('shows an error message when submit is clicked and no username is provided', () => {
  const { handleSubmit, errorMessage } = setupWithNoUsername();
  expect(errorMessage).toHaveTextContent(/username is required/i);
  expect(handleSubmit).not.toHaveBeenCalled();
});

test('shows an error message when password is not provided', () => {
  const { handleSubmit, errorMessage } = setupWithNoPassword();
  expect(errorMessage).toHaveTextContent(/password is required/i);
  expect(handleSubmit).not.toHaveBeenCalled();
});
```

이제 우리는 간단한 `setup` 함수를 사용하여 테스트 할 수 있게 되었습니다. 또, 셋업 함수들을 조합하여 사용함으로써 우리가 이전에 `beforeEach`를 사용하여 했던 동작을 비슷하게 재현할 수 있음을 눈여겨 봐주세요. 하지만 더 이상 변수를 계속해서 재할당하여 사용하지 않기 때문에 이전과 같이 머릿속에서 그 흐름을 추적해나갈 필요가 없게 되었습니다.

[AHA 테스팅 포스트](https://kentcdodds.com/blog/aha-testing)에서 테스팅에 AHA 원칙을 적용했을 때의 이점에 대해 더 알아보세요. 

## 테스트를 묶는것은 어쩌죠? (What about grouping tests?)

주로 `describe` 함수는 큰 테스트 파일 내에서 여러 개의 연관된 테스트들을 함께 묶어 시각적으로 서로 다른 테스트들을 분리하기 위해 사용됩니다. 하지만 개인적으로 테스트 파일이 커졌을 때 `describe`를 사용하는 것을 좋아하지는 않습니다. 대신 저는 연관된 테스트들을 파일로 분리합니다. 같은 "단위"의 코드에 대해 논리적으로 서로 다른 테스트들의 그룹이 있다면 저는 이들을 각기 다른 파일로 분리할 것입니다. 행여나 정말로 공유되어야 할 코드가 있다면 `__test__/helpers/login.js`와 같은 파일을 만들어서 관리할 것입니다.

이렇게 하면 테스트를 논리적으로 분리할 수 있고, 각 테스트 그룹에만 국한된 셋업을 분리할 수 있어서 현재 작업하고 있는 코드 부분에 대한 인지 부하가 줄어들게 됩니다. 또한 여러분의 테스팅 프레임워크에서 여러 개의 테스트를 병렬로 동시에 수행할 수 있다면 테스트를 더욱 빨리 돌릴 수도 있게 됩니다.

## 클린업은요? (What about cleanup?)

이 포스트는 `beforeEach`, `afterEach`와 같은 유틸리티를 비난하려고 쓴 것이 아닙니다. 그 보단 테스트 내에서 변경되는 변수에 대해, 그리고 여러분들이 더욱 신경 써서 추상화를 하시도록 주의를 주는 것에 더 가깝습니다.

클린업에 대해 말하자면, 때로는 여러분의 테스트가 글로벌 환경을 변화시킬 수도 있기 때문에 테스트 이후에 이를 원상복구 해야 하는 경우가 있을 수 있습니다. 만약 클린업 코드를 테스트 내에 인라인화 하여 작성해둔다면 테스트가 실패했을 때 클린업 코드가 실행되지 않을 수 있고, 그로 인해 다른 테스트들까지 실패하여 궁극적으로는 디버깅하기 힘든 많은 에러가 발생할 수 있습니다.

> 💡 아래 예시는 자동으로 클린업을 수행해주는 `testing-library/react@9`가 개발되기 이전에 작성되었습니다. 하지만 개념은 여전히 유효합니다. (예시를 다시 만들고 싶진 않습니다 😅)

예를 들어, React Testing Library는 여러분의 컴포넌트를 문서 내에 삽입하기 때문에, 만약 각 테스트가 끝난 뒤에 클린업을 하지 않으면 여러분의 테스트가 자체적으로 실행될 수 있습니다:

```jsx
import {render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import Login from '../Login';

test('example 1', () => {
  const handleSubmit = jest.fn();
  const { getByLabelText } = render(<Login onSubmit={handleSubmit} />);
  userEvent.type(getByLabelText(/username/i), 'kentcdodds');
  userEvent.type(getByLabelText(/password/i), 'ilovetwix');
  // more test here
});

test('example 2', () => {
  const handleSubmit = jest.fn();
  const { getByLabelText } = render(<Login onSubmit={handleSubmit} />);
  // 💣 여기서 `getByLabelText`가 실제로는 문서 전체를 훑어보고 있고, 이전 테스트 이후에 클린업을
  // 하지 않았기 때문에 RTL에서 label이 "username"인 입력 필드를 하나 이상 찾았다는 에러 메시지를
  // 띄울 것입니다.
  userEvent.type(getByLabelText(/username/i), 'kentcdodds');
  // more test here
});
```

이 문제는 `@testing-library/react`의 `cleanup` 함수를 각 테스트가 끝날 때마다 실행시켜 줌으로써 해결할 수 있습니다:

```jsx{1,13,21}
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import Login from '../Login';

test('example 1', () => {
  const handleSubmit = jest.fn();
  const { getByLabelText } = render(<Login onSubmit={handleSubmit} />);
  userEvent.type(getByLabelText(/username/i), 'kentcdodds');
  userEvent.type(getByLabelText(/password/i), 'ilovetwix');
  // more test here
  cleanup();
});

test('example 2', () => {
  const handleSubmit = jest.fn();
  const { getByLabelText } = render(<Login onSubmit={handleSubmit} />);
  userEvent.type(getByLabelText(/username/i), 'kentcdodds');
  // more test here
  cleanup();
});
```

하지만 이 경우에서, `afterEach`를 사용하여 클린업을 하지 않는다면 테스트가 실패했을 때 클린업 함수가 실행되지 않을 것입니다:

```jsx
test('example 1', () => {
  const handleSubmit = jest.fn();
  const { getByLabelText } = render(<Login onSubmit={handleSubmit} />);
  userEvent.type(getByLabelText(/username/i), 'kentcdodds');
  // 💣 아래의 오타로 인해 다음의 에러가 발생하게 됩니다:
  //   "no field with the label matching passssword"
  userEvent.type(getByLabelText(/passssword/i), 'ilovetwix');
  // more test here
  cleanup();
});
```

이로 인해 "example 1" 테스트의 `cleanup` 함수가 실행되지 않아 "example 2" 테스트가 정상적으로 동작하지 않게 됩니다. 따라서 테스트 결과로 첫 번째 테스트만 실패했다고 뜨는 것이 아니라 전체 테스트가 실패했다고 뜨게 되고, 이렇게 되면 디버깅이 훨씬 힘들어질 수 있습니다.

따라서 이 경우엔 테스트가 실패해도 클린업을 할 수 있도록 `afterEach`를 사용하는 것이 좋습니다:

```jsx
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import Login from '../Login'

afterEach(() => cleanup());

test('example 1', () => {
  const handleSubmit = jest.fn();
  const { getByLabelText } = render(<Login onSubmit={handleSubmit} />);
  userEvent.type(getByLabelText(/username/i), 'kentcdodds');
  userEvent.type(getByLabelText(/password/i), 'ilovetwix');
  // more test here
});

test('example 2', () => {
  const handleSubmit = jest.fn();
  const { getByLabelText } = render(<Login onSubmit={handleSubmit} />);
  userEvent.type(getByLabelText(/username/i), 'kentcdodds');
  // more test here
});
```

어떤 경우엔 서버를 켜고 끄는 것과 같이 `before*`를 사용하는 것이 좋은 경우가 존재합니다. 일반적으로 이들은 `after*`에 존재하는 클린업과 같이 사용됩니다:

```js
let server;
beforeAll(async () => {
  server = await startServer();
});
afterAll(() => server.close());
```

위와 같은 동작을 수행하는 데엔 이보다 더 신뢰할만한 방법은 없습니다. 제가 생각해낼 수 있는 또 다른 유스 케이스는 `console.error` 호출을 테스팅하는 경우입니다:

```js
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockClear();
});

afterAll(() => {
  console.error.mockRestore();
});
```

**이를 통해, `before*`, `after*` 유틸리티를 사용해야 할 유스 케이스가 따로 존재함을 알 수 있습니다. 따라서 단순히 코드 재사용을 위해 이러한 유틸리티를 사용하지는 마세요. 우리에겐 함수가 있으니까요!**

## 결론

제가 [트윗](https://twitter.com/kentcdodds/status/1154468901121482753?lang=en)에서 의도한 바를 명확히 하는 데에 이 포스트가 도움이 되었으면 좋겠네요.

여태껏 서로 다른 프레임워크와 코드 스타일을 사용하여 수만 개의 테스트를 작성해본 결과, 변수가 변이(mutation)되는 빈도를 줄일수록 테스트를 유지 보수하기 훨씬 쉬워진다는 것을 경험했습니다. 행운을 빕니다!

추신: 예제의 데모는 [여기](https://codesandbox.io/s/react-codesandbox-ni9fk)서 보실 수 있습니다.