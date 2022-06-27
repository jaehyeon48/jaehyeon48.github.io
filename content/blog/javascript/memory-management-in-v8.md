---
title: '자바스크립트 V8 엔진의 메모리 구조와 가비지 컬렉션'
date: 2022-06-28
category: 'JavaScript'
draft: false
---

이 포스트에선 자바스크립트 V8 엔진의 메모리 구조가 어떻게 되어있고, 어떤 식으로 메모리를 관리하는지 살펴보겠습니다.

## 자바스크립트 V8 엔진의 메모리 구조

우선, 자바스크립트 V8 엔진의 메모리 구조는 아래 그림과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/v8-memory-structure.png" alt="자바스크립트 V8 엔진의 메모리 구조" />
    <figcaption>자바스크립트 V8 엔진의 메모리 구조. 출처: https://deepu.tech/memory-management-in-v8/</figcaption>
</figure>

V8 엔진에서 메모리는 크게 *스택*과 *힙*으로 구성됩니다:

- `스택(Stack)`: 원시 타입 변수, 함수 인자, 객체를 가리키는 포인터 등이 저장되는 공간입니다.
- `힙(Heap)`: 객체 타입과 같이 동적인 데이터를 저장하는 공간입니다. 힙 영역은 다음과 같이 더 세분화할 수 있습니다:
  - `New space`: **Young generation**이라고도 하는 이 영역은 짧은 생명 주기(short- lived)를 가지는 새로 생성된 객체가 저장되는 공간입니다. 두 개의 `semi-space`가 있으며, **Scavenger(Minor GC)**가 이 영역을 관리합니다.
  - `Old space`: **Old generation**이라고도 하는 이 영역은 `New space`에서 두 번의 Minor GC가 발생할 동안 가비지 컬렉트 되지 않고 살아남은 객체들이 이동하는 공간입니다. **Major GC(Mark-Sweep & Mark-Compact)**가 이 영역을 관리하며, 다음의 두 영역으로 다시 나뉩니다:
    - `Old pointer space`: 살아남은 객체 중에서 다른 객체를 참조하는 객체가 저장되는 영역입니다.
    - `Old data space`: 살아남은 객체 중에서 데이터만 가지는 객체가 저장되는 영역입니다.
  - `Large object space`: 다른 영역의 크기보다 큰 객체들이 저장되는 공간으로, 각 객체는 [mmap](https://en.wikipedia.org/wiki/Mmap)(메모리 맵) 영역을 가집니다. 여기에 저장된 객체들은 가비지 컬렉트 되지 않습니다.
  - `Code-space`: **JIT 컴파일러**(V8의 TurboFan)에 의해 컴파일된 코드가 저장되는 공간으로, 실행 가능한 메모리가 존재하는 유일한 영역입니다. "코드"들은 `Large object space`에 저장될 수도 있고, 이 경우에도 여전히 실행가능 합니다.
  - `Cell space, property cell space, map space`: 각각 **Cells**, **PropertyCells**, **Maps**가 존재하는 영역입니다. 각 영역에는 크기가 모두 같은 객체들이 저장되며, 어떤 객체를 참조하는지에 대한 제약이 있기 때문에 수집이 간단합니다. 

각 영역은 mmap(Windows의 경우 [MapViewOfFile](https://docs.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-mapviewoffile))시스템 콜을 통해 운영체제로부터 할당받은 페이지로 구성되어 있으며, 각 페이지의 크기는 `Large object space` 영역을 제외하고 1MB입니다.

## 자바스크립트 V8 엔진의 메모리 사용 (스택 vs. 힙)

자바스크립트 V8 엔진의 메모리 구조가 어떻게 되었는지 살펴봤으니, 자바스크립트 프로그램이 실제로 실행될 때 어떤 방식으로 메모리를 사용하는지 살펴보겠습니다. 아래의 코드를 살펴봅시다:

```js
class Employee {
  constructor(name, salary, sales) {
    this.name = name;
    this.salary = salary;
    this.sales = sales;
  }
}

const BONUS_PERCENTAGE = 10;

function getBonusPercentage(salary) {
  const percentage = (salary * BONUS_PERCENTAGE) / 100;
  return percentage;
}

function findEmployeeBonus(salary, noOfSales) {
  const bonusPercentage = getBonusPercentage(salary);
  const bonus = bonusPercentage * noOfSales;
  return bonus;
}

let john = new Employee("John", 5000, 5);
john.bonus = findEmployeeBonus(john.salary, john.sales);
console.log(john.bonus);
```

아래 슬라이드를 통해 위 코드가 실행될 때 메모리가 어떻게 사용되는지 살펴보실 수 있습니다:

<div style="width: 100%; display: flex; justify-content: center;">
<iframe class="speakerdeck-iframe" frameborder="0" src="//speakerdeck.com/player/e89e2e48a797417eb8692897dcada584?" title="null" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" style="border: 0px; background: padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 700px; height: 400px;">
</iframe>
</div>

<br />
<br />

위 슬라이드에서 확인할 수 있는 것은,
  - **글로벌 스코프**는 스택의 "글로벌 프레임"에 저장됩니다.
  - 함수를 호출할 때마다 해당 함수가 프레임 블록으로 스택에 추가되고, 함수가 종료(리턴)되면 스택에서 제거됩니다. 그리고 함수 인자, 함수 내의 지역 변수 및 리턴값은 이 프레임 블록에 저장됩니다.
  - `String`, `Number`와 같은 원시 타입은 스택에 바로 저장됩니다.
  - 모든 객체 타입은 힙에 생성되고, 스택 포인터를 통해 스택에서 힙을 참조합니다.
  - 메인 프로세스의 실행이 완료되면 스택에서 힙에 있는 객체를 참조하지 않으므로 힙에 남아있는 객체들은 고아(orphan)가 됩니다.

또한, 스택은 V8 엔진이 아니라 운영체제가 관리하기 때문에 크게 신경 쓸 것이 없습니다. 하지만 힙은 운영체제가 자동으로 관리하지 않고, 또 다양한 동적 데이터를 저장하는 가장 큰 메모리 영역이기 때문에 제대로 신경 쓰지 않으면 메모리를 너무 많이 잡아먹게 될 수도 있습니다. 또한, 시간이 지남에 따라 파편화(fragmented)되어 앱을 느리게 할 수도 있습니다.

이러한 일을 방지하기 위해, **가비지 컬렉션**이라는 기능이 존재하는데, 가비지 컬렉션을 수행할 때 힙에 존재하는 데이터와 포인터(레퍼런스)를 구분하는 것이 중요하기 때문에 V8은 **tagged pointer**를 이용해서 이 둘을 구분합니다. Tagged pointer는 각 워드의 끝에 하나의 비트를 할당하여 해당 데이터가 포인터인지 데이터인지를 나타냅니다.

## 자바스크립트 V8 엔진의 가비지 컬렉션

V8 엔진이 메모리를 어떻게 할당하는지 살펴봤으니, 어떻게 메모리를 관리하는지도 살펴보겠습니다.

현재 사용 가능한 힙 영역보다 더 많은 양의 메모리를 할당받으려고 하면 **out of memory** 에러가 발생하게 됩니다. 또한 힙 영역이 제대로 관리되지 않으면 **memory leak**이 발생할 수 있습니다.

V8 엔진이 사용하는 가비지 컬렉터는 [generational GC](https://en.wikipedia.org/wiki/Tracing_garbage_collection#Generational_GC_(ephemeral_GC))의 일종으로, 앞서 메모리 구조 섹션에서 살펴본 것처럼 객체의 나이를 기준으로 힙 영역을 여러 하위 영역으로 세분화하여 가비지 컬렉션을 수행합니다. V8 엔진이 수행하는 가비지 컬렉션에는 크게 두 단계가 존재합니다.

### Minor GC (Scavenger)

*Scavenger*라고도 하는 **Minor GC**는 `New space` 영역에 존재하는 어린(주로 1MB ~ 8MB의 크기)객체를 가비지 컬렉트합니다.

`New space` 영역에선 "할당 포인터"를 사용하여 새로운 객체를 위한 메모리 영역을 할당하는데, 객체가 새로 할당될 때마다 포인터 값이 증가하다가 `New space` 영역의 끝에 다다르면 Minor GC가 수행됩니다. Minor GC는 [Cheney 알고리즘](https://en.wikipedia.org/wiki/Cheney's_algorithm)을 사용하는데, 꽤 자주 수행되며 별도의 헬퍼 스레드를 이용할 뿐만 아니라 실행 속도또한 굉장히 빠릅니다.

Minor GC가 수행되는 과정을 살펴보면 다음과 같습니다.

우선, 앞서 살펴봤듯이 `New space` 영역은 **To-space**와 **From-space** 두 개의 semi-space로 나뉩니다. 항상 `Old space`에 할당되는 실행 가능한 코드와 같은 객체를 제외하곤 대부분 `From-space`에 할당되는데, `From-space`가 꽉 차게 되면 Minor GC가 실행됩니다:

<div style="width: 100%; display: flex; justify-content: center;">
<iframe class="speakerdeck-iframe" frameborder="0" src="//speakerdeck.com/player/5fff2548e55c4bb0a9c837c7eb598bee?" title="null" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" style="border: 0px; background: padding-box rgba(0, 0, 0, 0.1); margin: 0px auto; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 700px; height: 413px;"></iframe>
</div>

<br />
<br />

1. 제일 처음에, 1~6번 객체가 `From-space`에 존재한다고 하고, 7번 객체를 생성하는 상황이라고 가정하겠습니다.
2. V8 엔진이 7번 객체를 `From-space`에 저장하기 위한 공간이 있는지 살펴봅니다. 하지만 현재 `From-space`에는 여유 공간이 없으므로 V8이 Minor GC를 수행합니다.
3. GC 루트(스택 포인터)에서 시작하여 `From-space`의 객체 그래프를 재귀적으로 탐색해가면서 현재 사용 중인 객체들을 찾아낸 뒤 이 객체들을 `To-space`로 옮깁니다. 또한 `To-space`로 옮겨진 객체가 참조하고 있던 객체들 또한 `To-space`로 옮겨지고, 이 객체들을 가리키던 포인터도 갱신됩니다. 이 과정이 끝나면 `To-space`를 압축하여 메모리 단편화(fragmentation)을 줄입니다.
  <figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/minor-gc-1.png" alt="현재 사용되고 있는 객체를 To-space로 옮김" />
    <figcaption>현재 사용되고 있는 객체를 To-space로 옮김. 출처: https://v8.dev/blog/trash-talk</figcaption>
  </figure>
4. `To-space`로 옮겨지지 못하고 `From-space`에 남겨진 객체들은 "가비지"로 취급되어 가비지 컬렉트 됩니다.
5. `To-space`와 `From-space`를 맞바꿔서 기존에 `To-space`로 옮겨진 객체는 다시 `From-space`에 존재하게 되고, `To-space`는 비어있게 됩니다. 앞선 과정과 마찬가지로, 새로운 객체는 `From-space`에 할당됩니다.
6. 시간이 흘러 `From-space`에 8번, 9번 객체가 들어온 상태이고, 10번 객체를 새로 할당하는 상황이라고 하겠습니다.
7. **2.**번과 마찬가지로, 10번 객체를 할당할만한 공간이 없기 때문에 V8 엔진은 Minor GC를 다시 수행합니다.
8. 앞서 살펴본 것과 동일한 과정이 진행되는데, 이때 두 번의 Minor GC 이후에도 살아남은 객체는 `Old space`로 옮겨집니다.
  <figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/minor-gc-2.png" alt="두 번의 Minor GC에도 살아남은 객체는 Old space로 옮겨짐" />
    <figcaption>두 번의 Minor GC에도 살아남은 객체는 Old space로 옮겨짐. 출처: https://v8.dev/blog/trash-talk</figcaption>
  </figure>
9. Minor GC를 수행한 뒤, `To-space`와 `From-space`를 맞바꿉니다. 그리고 이러한 과정이 반복됩니다.

또한, [write barrier](https://www.memorymanagement.org/glossary/w.html#term-write-barrier)를 사용하여 `Old space`에서 `New space`를 참조하는 레퍼런스를 기록합니다. 이를 통해 Minor GC를 수행할 때마다 `Old space` 영역을 살펴볼 필요 없이, 현재 사용되고 있는 객체가 무엇인지 빠르게 파악할 수 있습니다.

### Major GC (Full Mark-Compact)

Major GC는 `Old space` 영역을 담당하는데, Minor GC에 의해 객체들을 `New space`에서 `Old space`로 옮길 때 `Old space`의 여유 공간이 부족한 경우 실행됩니다.

Minor GC의 경우, 데이터 크기가 작은 경우에 적합하지만, `Old space`와 같이 크기가 큰 영역에 적용하기엔 메모리 오버헤드가 존재합니다. 따라서 Major GC는 [Mark-Compact 알고리즘](https://en.wikipedia.org/wiki/Mark%E2%80%93compact_algorithm)을 사용하는데, 크게 세 가지 단계로 나뉩니다:

- `Marking`: 첫 번째 단계로, 현재 사용되는 객체(살아있는 객체)를 파악하는 단계입니다. 이때 어떤 객체가 "살아있음"을 판단하는 근거로 GC 루트(스택 포인터)에서 시작하여 해당 객체에 도달할 수 있는지(reachable)를 살펴봅니다. 힙 영역을 유향 그래프라고 했을 때, 이 그래프에 DFS를 수행하는 것으로 볼 수 있습니다.
- `Sweeping`: Marking 단계에서 표시되지 않은 객체가 사용하던 메모리 공간은 **free-list**에 저장됩니다. free-list는 탐색하기 쉽도록 크기순으로 세분화되는데, 이후에 메모리를 할당하고자 할 때 free-list에서 적절한 크기의 메모리 공간을 찾아 할당하게 됩니다.
- `Compacting`: Sweeping 단계를 수행한 뒤, 필요한 경우 메모리 단편화를 해결하기 위해 메모리 압축 작업을 진행합니다. 살아남은 객체를 현재 압축을 진행하지 않는 다른 메모리 페이지에 복사하는 방식으로 진행하는데, 만약 살아남은 객체가 많다면 객체를 복사하는 오버헤드가 커질 수 있습니다. 따라서, 단편화가 그리 심하지 않은 페이지는 Sweeping 단계까지만 수행하고 단편화가 많이 진행된 페이지에만 압축을 진행합니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/major-gc.gif" alt="Major GC 동작" />
  <figcaption>Major GC 동작. 출처: https://deepu.tech/memory-management-in-v8/</figcaption>
</figure>

## Orinoco

앞서 살펴본 알고리즘은 자바스크립트 V8 엔진뿐만 아니라 다른 언어의 가비지 컬렉터에도 사용되는 일반적인 알고리즘입니다. 이러한 가비지 컬렉터들의 중요한 성능 지표 중 하나가 "GC를 수행하면서 얼마 동안 메인 스레드를 블로킹하는가?"인데, 전통적인 블로킹 방식(stop-the-world)의 GC들의 경우, 메인 스레드를 오랜 시간 블로킹하여 페이지가 버벅거리는 등 UX가 저해되는 문제가 있었습니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/traditional-gc.png" alt="전통적인 블로킹 방식 GC" />
  <figcaption>전통적인 블로킹 방식 GC. 출처: https://deepu.tech/memory-management-in-v8/</figcaption>
</figure>

현재 사용되고 있는 V8 엔진의 가비지 컬렉터를 **Orinoco**라고 하는데, Orinoco는 병렬적(parallel), 점진적(incremental), 동시적(concurrent)으로 GC를 수행하여 최대한 메인 스레드를 블로킹하지 않는 방식을 사용합니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/orinoco.png" alt="Orinoco 로고" />
  <figcaption>Orinoco 로고. 출처: https://v8.dev/blog/trash-talk</figcaption>
</figure>

### 병렬적 방식

**병렬적(Parallel)** 방식은 메인 스레드와 헬퍼 스레드가 거의 똑같은 양의 작업을 동시에 수행하는 방법으로, 여전히 블로킹 방식이긴 하지만 사용하는 헬퍼 스레드의 개수만큼 블로킹 되는 시간을 절감할 수 있습니다. 세 방식 중 가장 쉬운 방법이며, 여러 헬퍼 스레드가 동시에 하나의 객체에 접근하지 못하도록 동기화 작업을 할 필요는 있습니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/orinoco-parallel.png" alt="병렬적 방식" />
  <figcaption>병렬적 방식. 출처: https://v8.dev/blog/trash-talk</figcaption>
</figure>

### 점진적 방식

**점진적(Incremental)** 방식은 메인 스레드가 다른 작업들과 번갈아 가면서 GC를 수행하는 방식입니다. GC 수행 → 스크립트 수행 → GC 수행 → 스크립트 수행 ... 과 같이 진행되는데, 스크립트와 번갈아 실행됨에 따라 힙의 상태가 변경되어 이전 작업이 무용지물이 될 수 있어 앞서 병렬적 방식보다 어려운 방식입니다.

GC가 메인 스레드에서 실행되는 총시간은 변함없지만 (사실, 일반적으론 살짝 늘어납니다), 스크립트와 번갈아 실행됨에 따라 메인 스레드가 한 번에 블로킹 되는 시간을 줄일 수 있어 정상적으로 화면을 렌더링하거나 유저와 상호작용할 수 있게 됩니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/orinoco-increment.png" alt="점진적 방식" />
  <figcaption>점진적 방식. 출처: https://v8.dev/blog/trash-talk</figcaption>
</figure>

### 동시적 방식

**동시적(Concurrent)** 방식은 병렬적 방식과 비슷한데, 차이점이라면 동시적 방식에선 GC가 헬퍼 스레드에서만 수행된다는 점입니다. GC와 스크립트가 동시에 실행될 수 있기 때문에, GC 도중에 힙의 상태가 바뀔 수 있어 세 방식 중 가장 어려운 방식입니다. 또한, 병렬적 방식과 마찬가지로 여러 헬퍼 스레드가 같은 객체에 접근할 수 있기 때문에 동기화 처리 또한 필요합니다.

동기화 처리로 인한 오버헤드가 존재하긴 하지만 메인 스레드를 블로킹하지 않고 GC를 처리할 수 있다는 장점이 있습니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/orinoco-concurrent.png" alt="동시적 방식" />
  <figcaption>동시적 방식. 출처: https://v8.dev/blog/trash-talk</figcaption>
</figure>

### V8 에서 사용하는 방식

#### Minor GC

Minor GC의 경우, 병렬적 방식을 사용하여 `New space`에 대한 GC를 수행할 때 여러 헬퍼 스레드를 사용해서 작업을 분할합니다.
<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/minor-gc-uses-parallel.png" alt="병렬적 방식을 사용하는 Minor GC" />
  <figcaption>병렬적 방식을 사용하는 Minor GC. 출처: https://v8.dev/blog/trash-talk</figcaption>
</figure>

이처럼 병렬적으로 Minor GC를 수행함으로써 Minor GC 수행시간을 20% ~ 50% 가량 단축할 수 있었습니다.

#### Major GC

Major GC의 경우, 힙의 최대 크기에 다다르면 marking 작업을 헬퍼 스레드에서 동시적 방식으로 시작합니다. 헬퍼 스레드에서 마킹 작업을 수행하는 와중에 메인 스레드에서 실행 중인 스크립트에서 객체에 대한 새로운 참조를 생성하는 경우, [write barrier]()를 사용하여 새로운 참조를 기록합니다.

마킹 작업을 끝마치면 *메인 스레드*에서 빠르게 마킹 작업을 마무리하는데, 이 과정에서 루트부터 다시 탐색하여 살아있는 객체가 제대로 마킹되었는지 체크합니다. 이후 헬퍼 스레드와 함께 병렬 방식으로 압축 작업을 진행하는데, 이와 동시에 헬퍼 스레드에서 동시적으로 sweeping 작업을 수행합니다.

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@main/assets/images/javascript/memory-management-in-v8/major-gc-uses-combined.png" alt="복합적인 방식을 사용하는 Major GC" />
  <figcaption>복합적인 방식을 사용하는 Major GC. 출처: https://v8.dev/blog/trash-talk</figcaption>
</figure>

이와 같은 방식으로 Major GC를 수행함으로써 무거운 WebGL 게임이 돌아가는 환경에서 블로킹 타임을 최대 50%가량 줄일 수 있었습니다.

## 레퍼런스

- [🚀 Visualizing memory management in V8 Engine (JavaScript, NodeJS, Deno, WebAssembly) | Technorage](https://deepu.tech/memory-management-in-v8/)
- [Trash talk: the Orinoco garbage collector · V8](https://v8.dev/blog/trash-talk)
