---
title: 'Git Pro 2nd Edition 요약 Part1'
date: 2020-08-27
category: 'Git'
draft: false
---

[원문](https://git-scm.com/book/en/v2)

[2편](../git_pro_summary_2)

<hr class="custom-hr">

# Chapter1. Getting Started

## 버전 컨트롤 이란?

- 여러 파일들의 시간에 따른 변화들을 기록하여, 추후 해당 버전들로 돌아갈 수 있도록 관리하는 시스템. 이 때 버전 컨트롤 시스템으로 관리하는 파일들의 타입은 프로그래밍 파일뿐만이 아니라 어떠한 파일들도 될 수 있다.
- 버전 컨트롤 시스템을 사용하여 파일들을 관리하면 특정 파일들만, 혹은 프로젝트 전체를 이전 버전(상태)으로 되돌아 갈 수 있고, 시간에 따른 변화를 비교할 수 있고, 여러 명이서 동시에 작업하는 경우 누가 어떤 이슈, 어떤 문제를 발생시켰는지 파악할 수 있음.
- 즉, 프로젝트를 진행하다 무언가 잘못되면 (최소한의 비용으로) 이전 상태로 되돌아가 복구할 수 있음.

### Local VCS

- 많은 사람들이 사용하는 흔한 방법으로, 파일들을 디렉토리에 나눠 버전을 관리하는 방법이 있는데 이 방법은 간편하긴 하지만 에러에 취약함.
- 이러한 문제를 해결하기 위해, 프로그래머들은 오래전에 파일들의 모든 변경 사항을 저장하는 간단한 데이터베이스를 이용하여 로컬 VCS를 개발하였음.

<figure>
    <img src="https://git-scm.com/book/en/v2/images/local.png" alt="Local version control" width="600px" />
    <figcaption>https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control</figcaption>
</figure>

### Centralized VCS

- 여러 개발자들끼리 협력해서 작업하기 위해 개발된 것이 중앙집중형 방식인 CVCS 이다.
- 모든 버전 파일들이 하나의 중앙 서버에 저장되어 있고, 개발자들이 해당 서버에서 파일들을 가져오는 형식. 수년간 이 방식이 VCS의 표준이었음.

<figure>
    <img src="https://git-scm.com/book/en/v2/images/centralized.png" alt="Centralized version control" width="600px" />
    <figcaption>https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control</figcaption>
</figure>

- 로컬 VCS보다 많은 장점을 가지고 있다. 예를 들면 프로젝트에 참여하는 모두가 다른 사람이 어느 작업을 하는지 알 수 있고, 관리자는 작업 분배를 수월하게 할 수 있음.
- 하지만 단점도 존재하는데, 그 중 가장 심각한 단점은 중앙 집중형이다 보니 서버가 다운되면 아무도 작업을 진행할 수 없게됨. 만약 서버에 저장된 데이터가 날아가버린다면, 그리고 백업을 제대로 하지 않았다면 사람들이 로컬 컴퓨터에 가지고 있는 파일 이외의 데이터를 영영 복구할 수 없게됨.
- 사실 이와 같은 문제는 로컬 VCS에서도 발생하는데, 프로젝트의 모든 데이터를 한 공간에 저장하면 모든것을 잃어버릴 수 있다는 리스크가 존재.

### Distributed VCS

- CVCS의 단점을 보완하기 위해 개발된 방식. 단순히 서버로부터 파일의 스냅샷만 가져오는것이 아니라 히스토리 전체를 포함한 저장소를 통째로 로컬로 가져온다 ("미러링" 한다). 이렇게 가져온 데이터를 가지고 작업을 한 뒤 그 결과물을 다시 서버로 업로드 하는 방식이다.

<figure>
    <img src="https://git-scm.com/book/en/v2/images/distributed.png" alt="Distributed version control" width="600px" />
    <figcaption>https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control</figcaption>
</figure>

## Git이란 무엇인가?

- Git을 효율적으로 사용하기 위해선 Git의 동작 원리를 아는 것이 중요하다.

### 차이가 아니라 스냅샷

- Git 이외의 다른 시스템(CVS, Subversion, Perforce, Bazaar 등)들은 시간에 따른 파일의 "변화"를 기록. 이를 델타(Δ) 기반 버전 컨트롤 이라고도 함.

<figure>
    <img src="https://git-scm.com/book/en/v2/images/deltas.png" alt="Storing data as changes to a base version of each file" width="600px" />
    <figcaption>https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F</figcaption>
</figure>

- 이와는 달리 Git은 특정 시점에서의 파일들의 "스냅샷"을 기록. 즉, 파일들의 변화된 부분만 기록하는 것이 아니라 변화된 파일 통째로 기록. 효율성을 위해 파일의 내용이 변경되지 않았다면 해당 파일을 새로 (중복되어) 저장하지 않고 이전에 이미 저장된 데이터를 가리키도록 링크를 생성.

<figure>
    <img src="https://git-scm.com/book/en/v2/images/snapshots.png" alt="Storing data as changes to a base version of each file" width="600px" />
    <figcaption>https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F</figcaption>
</figure>

### 거의 모든 동작이 로컬에서 일어난다.

- Git을 사용하면 프로젝트 **전체**의 히스토리가 로컬 컴퓨터에 저장되기 때문에 작업을 할 때 서버로부터, 혹은 다른 컴퓨터로부터 데이터를 받아올 필요가 없다.
- 따라서 인터넷이 연결되지 않은 상황에서도 여전히 프로젝트에 대한 작업을 진행할 수 있다.

### Git의 무결성

- Git은 데이터를 저장하기 전 항상 체크섬을 구해서 이 체크섬으로 데이터를 관리한다.
- 체크섬을 만들때는 SHA-1 해시를 사용하여 파일의 내용 혹은 디렉토리의 구조를 바탕으로 만든다. 이렇게 만들어진 체크섬은 40자 길이의 16진수 문자열이다. SHA-1은 아래와 같이 생겼다:
  > 24b9da6552252987aa493b52f8696cd6d3b00373
- Git이 데이터베이스에 데이터를 저장할 때 파일 이름이 아니라 해당 해시값으로 저장하므로, 사실상 거의 모든곳에서 위 해시값을 볼 수 있다.

### 세 가지 상태

- **추후 Git을 원활하게 학습하기 위해서 이 부분을 잘 알아야 한다.**
- 파일들이 존재할 수 있는 상태가 Git에는 크게 세 가지가 있다: `modified`, `staged`, `committed`.
  - `Modified` 상태는 파일을 변경하였지만 아직 데이터베이스에 커밋하지 않은 상태를 뜻한다.
  - `Staged`는 현재 변경된 파일들 중 곧 커밋할 것이라고 표시한 상태를 뜻한다.
  - `Committed`는 로컬 데이터베이스에 데이터가 안전하게 저장된 상태를 뜻한다.
- 위 세 가지 상태는 Git 프로젝트의 세 단계 `Git 디렉토리`, `워킹 트리`, `Staging Area`와 연관되어 있다:

  <figure>
      <img src="https://git-scm.com/book/en/v2/images/areas.png" alt="Working tree, staging area, and Git directory" width="600px" />
      <figcaption>https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F</figcaption>
  </figure>

- 워킹 트리(워킹 디렉토리)는 Git 디렉토리로 부터 꺼내와서 디스크에 올려져 있는 파일들이다. 프로젝트의 특정 버전을 check out한 것이다.
- Staging area는 일반적으로 Git 디렉토리 내에 위치하는 파일로 "index"라고도 한다. 다음 커밋에 어떤 파일들이 포함될 것인가에 대한 정보를 저장한다.
- Git 디렉토리는 프로젝트의 데이터/메타데이터가 저장되는 곳이다. Git에서 가장 중요한 부분이라 할 수 있으며 다른 컴퓨터(흔히 remote)에 있는 저장소를 `clone`하면 생성된다.
- 흔히 Git을 사용할 때의 작업 흐름은 다음과 같다:
  1. 워킹 트리에 있는 파일을 수정한다.
  2. 다음 커밋에 포함시킬 파일들을 선택적으로 골라 staging area에 추가한다.
  3. 커밋을 하여 staging area에 있는 파일들의 스냅샷을 Git 디렉토리에 (영구적으로) 보관한다.
- 어떤 파일의 특정 버전이 Git 디렉토리에 존재하면 해당 파일은 `committed` 상태이다. 파일을 수정하고 staging area에 추가했다면 해당 파일은 `staged` 상태이다. 그리고 check out한 이후 수정을 했지만 staging area에 올리지 않은 상태라면 해당 파일은 `modified` 상태이다. 추후 이러한 상태들에 대해 더 자세히 살펴볼 것이다.
