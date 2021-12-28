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