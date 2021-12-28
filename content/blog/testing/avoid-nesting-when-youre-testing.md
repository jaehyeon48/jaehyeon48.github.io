---
title: '테스팅할 때 중첩은 피하세요'
date: 2021-12-28
category: 'testing'
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

제가 수 년동안 봐왔던 테스팅과 비슷한 종류의 테스트 셋은 다음과 같습니다:

```jsx
// __tests__/Login.js
import {render} from '@testing-library/react';
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

`changeUsernameInput`, `clickSubmit`과 같은 유틸리티들은 그럭저럭 괜찮다고 생각하지만, 테스트가 아주 간단하기 때문에 이러한 유틸
리티들이 하는 동작을 단순히 복붙하는 것이 오히려 테스트 코드를 더욱 간소화하는 방법이라고 생각합니다. 지금과 같이 작은 테스트 셋에 대해선 이러한 함수 추상화들이 이득을 준다기보단 오히려 유지보수를 하는 사람으로 하여금 함수들이 정의된 파일을 계속 뒤적거려야 하는 불편함만 안겨줄 뿐입니다.

## 중첩 (Nesting)

위의 테스트 셋은 [Jest](https://jestjs.io/) API를 사용하였지만, 다른 주요 자바스크립트 프레임워크들도 이와 비슷합니다. 이 글에서 `describe`는 테스트를 묶는 것에 관해, `beforeEach`는 공통으로 사용되는 셋업/액션에 관해, 그리고 `it`은 실제 단정문(assertion)에 관해 말하고 있는 것임을 유념해주세요.

저는 이러한 방식으로 중첩하는 것을 매우 싫어합니다. 위와 같이 작성된 수천 개의 테스트를 작성하고 유지 보수했던 경험에 비춰봤을 때, 위 예시에 있는 3개의 테스트만으로도 고통스러운데 수천 라인의 테스트의 경우는 더욱 고통스럽다고 여러분께 단언할 수 있습니다. 그리고 테스트가 거대해지면 그만큼 중첩도 더 많이 하게 될 거에요.

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

그러고 나서 이후에 더욱 중첩된 `beforeEach`에서 다른 값으로 할당되고 있지는 않은지 또한 살펴봐야 합니다. 이렇게 코드를 추적하면서 변수와 변수의 값을 기억해야 한다는 점이 제가 중첩된 테스트를 극히 반대하는 이유 중 하나입니다. 이렇게 여러분의 머릿속에 기억해야 할 것들이 많아질수록 정작 중요한 일을 제대로 처리하기가 힘들어지게 됩니다.

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