---
title: '자바스크립트 클로저 Part2'
date: 2020-08-22
category: 'javascript'
draft: false
---

이 글은 아래의 원문을 번역/요약한 글입니다.

[You Don't Know JS Yet/Chapter 7: Using Closures](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch7.md)

[1편 보러가기](../closure_1)
[3편 보러가기](../closure_3)

## 클로저를 활용하는 사례: AJAX와 이벤트

클로저는 다음과 같이 주로 콜백을 사용하는 경우 맞닥뜨리게 된다:

```js
function lookupStudentRecord(studentID) {
    ajax(
        `https://some.api/student/${studentID}`,
        function onRecord(record) {
            console.log(`${record.name} (${studentID})`);
        }
    )
}

lookupStudentRecord(114); // 'Frank (114)'
```

`onRecord()` 콜백은 미래의 어느 시점에 Ajax로 부터 응답이 오면 호출될 것이다. 물론 콜백이 호출되는 시점에선 `lookupStudentRecord`는 이미 종료되고 난 뒤일 것이다.

그렇다면 콜백에서 어떻게 `studentID`를 참조할 수 있는 것일까? 바로 클로저 덕분이다.

이벤트 핸들러 또한 클로저를 활용하는 또 다른 사례 중 하나이다:

```js
function listenForClicks(btn, label) {
    btn.addEventListener('click', function onClick() {
        console.log(`The ${ label } button was clicked!`);
    });
}

const submitBtn = document.getElementById('submit-btn');

listenForClicks(submitBtn, 'Checkout');
```

`label` 변수는 이벤트 핸들러 `onClick()` 함수에 의해 에워싸여진다. 따라서 버튼이 눌려져서 `onClick()` 핸들러가 호출되는 시점에서도 여전히 `label` 변수를 참조할 수 있게 되는 것이다.

## 만약 클로저를 볼 수 없다면?

다음과 같은 (철학적인) 격언을 들어본적 있는가?

> 만약 숲속에서 나무가 쓰러졌는데 아무도 그 소리를 듣지 못했다면, 그 나무가 소리를 냈다고 할 수 있는가?

물론 과학적인 관점에서 나무는 음파를 발생시킨 것이 맞다. 하지만 중요한 포인트는 소리가 난 것이 정말 중요한 것인가? 라는 점이다.

클로저가 기술적인, 혹은 학술적인 관점에서 "존재"한다고 해도 **볼 수 없다면**, 클로저가 그렇게 중요한 것일까? 아니다.

다음 예시 코드를 살펴보자.

```js
function say(myName) {
    let greeting = 'Hello';
    output();

    function output() {
        console.log(`${greeting}, ${myName}!`);
    }
}

say('Kyle'); // 'Hello, Kyle!'
```

내부 함수 `output()`은 외부 스코프에 있는 `greeting`과 `myName` 변수를 참조하고 있다. 하지만 `output()` 함수 호출이 이 함수가 호출된 스코프에서 일어나고 있으므로 이는 클로저가 아니라 단순히 렉시컬 스코프를 통해 두 변수를 참조한 것이다.

사실, 글로벌 스코프는 어디에서든 접근이 가능하기 때문에 본질적으로 클로저에 의해 에워싸일 수 없다. 결국 모든 함수들도 글로벌 스코프, 혹은 스코프 체인의 관점에서 보자면 글로벌 스코프의 "자손(descendant)" 스코프에서 호출되므로 사실 따지고 보면 글로벌 스코프에 있는 변수들은 클로저에 의해 에워싸여 지는 것이 아니라 단순히 렉시컬 스코프 체인에 의해 탐색되는 것이다.

다음 코드를 보자:

```js
const students = [
    { id: 14, name: 'Kyle' },
    { id: 73, name: 'Suzy' },
    { id: 112, name: 'Frank' },
    { id: 6, name: 'Sarah' }
];

function getFirstStudent() {
    return function firstStudent(){
        return students[0].name;
    };
}

const student = getFirstStudent();

student(); // Kyle
```

내부 함수 `firstStudent()`에서 외부 변수 `students`를 참조하고 있지만, `students`는 글로벌 스코프의 변수이므로 `firstStudent()` 함수가 어디서 호출되건 상관없이 (클로저가 아니라) 렉시컬 스코프를 통해 `students`에 접근할 수 있다. 따라서 모든 함수는 어디서 호출되건 상관없이 글로벌 변수에 접근할 수 있으므로, 글로벌 변수들은 클로저에 의해 에워싸여 진다고 할 수는 없다.

<br/>

또한, 존재는 하지만 한 번도 참조되지 않는 변수의 경우 클로저와는 별다른 관련이 없다:

```js
function lookupStudent(studentID) {
    return function nobody() {
        let msg = "Nobody's here yet.";
        console.log(msg);
    };
}

const student = lookupStudent(112);

student(); // Nobody's here yet.
```

위 코드에서, 내부 함수 `nobody()`가 에워싸는 외부 변수는 없다. 단지 자신의 스코프 내부에 있는 `msg` 변수만 참조할 뿐이다. `studentID` 변수가 `nobody()` 함수를 둘러싼 외부 스코프에 있다고 하더라도 내부 함수 `nobody()`에 의해 참조되지 않으므로 이 경우 자바스크립트 엔진은 `lookupStudent()` 함수가 종료되면 `studentID` 변수를 메모리에서 제거해버린다.

따라서 위 코드에선 어떠한 클로저도 관찰되지 않는다.

함수 호출이 발생하지 않는 경우에도 클로저는 관찰되지 않는다:

```js
function greetStudent(studentName) {
    return function greeting(){
        console.log(`Hello, ${ studentName }!`);
    };
}

greetStudent("Kyle"); // 아무런 일도 일어나지 않는다.
```

이 코드에선 분명 외부 함수 `greetStudent()`가 호출되고, 내부 함수 `greeting()`이 외부 변수 `studentName`을 참조하므로 클로저가 존재한다고 할 수 있지만 내부 함수가 "호출"되지는 않는다. 즉, 내부 함수가 어디에 저장되지 않고 그냥 "버려진다".

따라서 이 경우, 따지고보면 자바스크립트 엔진이 짧은 시간동안 클로저를 생성하지만 우리가 이 클로저를 관찰할 수는 없다.

분명 숲속에서 나무가 쓰러졌지만 우리가 듣지는 못했으므로 별로 신경쓰지는 않는다... 클로저도 마찬가지다. 우리가 클로저를 확인할 수 있어야 의미가 있는 것이지, 존재는 하지만 볼 수 없다면 별 의미 없는 것이다.

## 관측가능한 클로저의 정의

그렇다면 **관측가능한(observable)** 클로저의 정의를 한번 내려보자.

> 클로저는 어떤 함수가 이 함수의 스코프 밖에 있는 변수에 대해, 해당 변수를 사용할 수 없는 스코프에서 실행됨에도 불구하고 변수를 사용하는 경우 관측할 수 있다.

이 정의에서 핵심적인 부분은 다음과 같다:
- 반드시 함수가 호출되어야 한다.
- 반드시 함수 외부 스코프에 존재하는 변수를 하나 이상 참조해야 한다.
- 반드시 참조하는 변수가 속한 스코프 이외의 스코프에서 함수를 호출해야 한다.

이러한 관측 중심(observation-oriented) 정의가 시사하는 바는 클로저를 단순히 비직관적이고 학술적인 것으로 치부하지 말고, 클로저가 프로그램에 미치는 영향을 잘 살펴서 클로저를 잘 활용할 줄 알아야 한다는 점이다. 

## 클로저와 가비지 컬렉션

클로저는 본질적으로 함수 인스턴스와 연관되어 있기 때문에, 함수 인스턴스가 살아있을 동안(유지되는 동안) 함수 인스턴스의 클로저가 감싸는 변수들 또한 계속 살아있게 된다. 만약 열 개의 함수가 모두 같은 변수를 에워싸는 경우, 아홉개의 함수 인스턴스가 없어진다고 해도 여전히 살아있는 마지막 함수 인스턴스가 해당 변수를 계속해서 유지시키게 된다. 그러다 이 마지막 함수 인스턴스가 없어지는 순간 변수를 감싸던 클로저도 사라지게 되고, 마침내 변수도 가비지 컬렉트 된다.

이는 효율적이고 성능이 좋은 프로그램을 작성하는데 아주 큰 영향을 미친다. 즉, 클로저가 이미 사용이 끝난 변수가 가비지 컬렉트 되지 못하게 막을 수 있다는 것이다. 따라서 더 이상 사용하지 않는 함수 인스턴스를 없애는 것이 매우 중요하다. 다음 코드를 보자:

```js
function manageBtnClickEvents(btn) {
    let clickHandlers = [];

    return function listener(cb){
        if (cb) {
            const clickHandler =
                function onClick(evt){
                    console.log('clicked!');
                    cb(evt);
                };
            clickHandlers.push(clickHandler);
            btn.addEventListener(
                'click',
                clickHandler
            );
        }
        else {
            // passing no callback unsubscribes
            // all click handlers
            for (const handler of clickHandlers) {
                btn.removeEventListener(
                    'click',
                    handler
                );
            }

            clickHandlers = [];
        }
    };
}

const onSubmit = manageBtnClickEvents(mySubmitBtn);

onSubmit(function checkout(evt){
    // handle checkout
});

onSubmit(function trackAction(evt){
    // log action to analytics
});

// later, unsubscribe all handlers:
onSubmit();
```

이 코드에서, 내부 함수 `onClick()`의 클로저는 인자로 전달된 이벤트 콜백 `cb`을 가진다. 즉, 이벤트 핸들러 `checkout()`과 `trackAction()`에 대한 레퍼런스가 클로저를 통해 유지된다는 말이며 이 두 핸들러가 이벤트에 등록(subscribe)되어 있는 동안에는 가비지 컬렉트 되지 않는다.

마지막 줄을 보면 `onSubmit()` 함수에 아무런 인자도 전달해주지 않음으로써 모든 이벤트 핸들러를 등록 취소(unsubscribe)하고 있음을 할 수 있다. 이로 인해 `clickHandlers` 배열이 비워지게 되고, 등록된 모든 핸들러가 제거됨에 따라 `cb`를 통해 레퍼런스 하고 있는 `checkout()`, `trackAction()`에 대한 클로저도 제거된다.

따라서, 여기서 살펴본 것과 이벤트 핸들러들을 등록하는 것보다 핸들러를 더 이상 사용하지 않는 경우 등록을 취소하는 것이 더 중요하며 이렇게 해야 프로그램이 좀 더 효율적으로 동작할 수 있게 된다.

## 클로저는 변수 단위인가 스코프 단위인가?

클로저에 대해 생각해볼 또 하나는 과연 클로저가 오직 참조되는 외부 변수에만 적용이 되는 것인지, 아니면 외부 스코프 체인(및 외부 스코프에 존재하는 모든 변수들) 전체에 적용이 되는 것인지에 대한 것이다.

방금 살펴본 예제에 대해 살펴보자면 내부 함수 `onClick()`의 클로저는 `cb`만 감싸는 걸까?, 아니면 `clickHandler`, `clickHandlers`, `btn` 또한 감싸는 걸까?

사실 개념적으로, 클로저는 스코프 단위가 아니라 **변수 단위**이다. Ajax 콜백, 이벤트 핸들러 뿐만 아니라 모든 형태의 클로저들은 오직 명시적으로 참조하는 외부 변수만 감싼다.

하지만 현실은 이보다 좀 더 복잡할 수 있다. 다음을 보자:

```js
function manageStudentGrades(studentRecords) {
    let grades = studentRecords.map(getGrade);

    return addGrade;

    // ************************

    function getGrade(record) {
        return record.grade;
    }

    function sortAndTrimGradesList() {
        // sort by grades, descending
        grades.sort(function desc(g1, g2) {
            return g2 - g1;
        });

        // only keep the top 10 grades
        grades = grades.slice(0, 10);
    }

    function addGrade(newGrade) {
        grades.push(newGrade);
        sortAndTrimGradesList();
        return grades;
    }
}

const addNextGrade = manageStudentGrades([
    { id: 14, name: 'Kyle', grade: 86 },
    { id: 73, name: 'Suzy', grade: 87 },
    { id: 112, name: 'Frank', grade: 75 },
    // ... many more records
    { id: 6, name: 'Sarah', grade: 91 }
]);

// later

console.log(addNextGrade(81)); // [ 91, 87, 86, 81, 75 ]
console.log(addNextGrade(68)); // [ 91, 87, 86, 81, 75, 68 ]
```

외부 함수 `manageStudentGrades()`는 학생들의 목록을 받아 `addGrade()` 함수 레퍼런스를 리턴한다. 그리고 이렇게 리턴받은 `addGrade()` 함수 레퍼런스를 `addNextGrade`라는 변수에 저장하였다. 이후 `addNextGrade()` 함수에 새로운 점수를 인자로 주어 실행하면 내림차순으로 정렬된 상위 10개의 점수를 리턴받게 된다.

`manageStudentGrades()` 함수가 종료된 이후 `addNextGrade()` 함수를 호출하는 동안에도 `grades` 변수는 `addGrade()` 함수의 클로저 내부에 계속 유지된다. 여기서 다시한번 명심해야할 것이, 클로저가 저장하는 것은 `grades` 변수 그 자체이지 `grades` 변수가 가지고 있는 배열이 아니다.

이것 말고도 `addGrade()`의 클로저가 저장하는 것이 있다. 눈치챘는가? 바로 `sortAndTrimGradesList` 함수이다. `addGrade()`에서 이 함수를 호출하므로 `addGrade()`의 클로저 내부에는 `sortAndTrimGradesList()`의 identifier가 저장되어야 한다. 또한, 이 함수가 클로저를 통해 계속해서 유지되므로 `sortAndTrimGradesList()`의 클로저(에 저장된 변수들) 또한 유지된다. 하지만 여기서는 `sortAndTrimGradesList()`가 참조하는 외부 변수가 없으므로(`grades`는 `addGrade()`에서도 참조하므로 제외) 추가적으로 클로저에 유지되는 변수는 없다.

`getGrade()` 함수는 어떤가? `.map()`의 콜백 함수로 전달되어 `manageStudentGrades()` 함수 바깥 스코프에서 실행되는건 맞지만 `addGrade()` 혹은 `sortAndTrimGradesList()`에서 참조하고 있지는 않다.

그렇다면 `manageStudentGrades()`를 실행할 때 `studentRecords`로서 넘기는 (매우) 큰 배열을 갖는 변수는 어떨까? 이 변수도 감싸지는 걸까? 만약 클로저에 의해 감싸진다면 많은 학생들의 데이터를 저장하는 배열은 가비지 컬렉트되지 않을 것이고, 그에 따라 프로그램이 소모하는 메모리 크기가 더욱 커질 것이다. 하지만 코드를 다시한번 자세히 살펴보면, 어떠한 내부 함수도 `studentRecords`를 참조하지는 않는다.

따라서 앞서 살펴본 것처럼 클로저가 변수 단위로 적용된다는 점을 고려해볼때, `getGrade`와 `studentRecords`는 어떠한 내부 함수도 참조하지 않기 때문에 클로저에 저장되지 않는다고 할 수 있다. 따라서 이 두 변수(identifier)들은 `manageStudentGrade()` 함수가 종료되면 정상적으로 가비지 컬렉트될 것이다.

실제로 `addGrade` 함수 내부에 브레이크 포인트를 걸어서 디버깅을 해보면 다음과 같이 클로저 내부엔 `grades`와 `sortAndTrimGradesList`만 존재하고 `studentRecords`는 존재하지 않음을 알 수 있다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/closure/closure_debug.png" alt="See Closure in Debug Mode" />
    <figcaption>디버깅 환경: VSCode, Node v14.17.5</figcaption>
</figure>

\> 3편에 계속...