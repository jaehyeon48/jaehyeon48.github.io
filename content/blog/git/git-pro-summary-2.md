---
title: 'Git Pro 2nd Edition 요약 Part2'
date: 2020-08-28
category: 'git'
draft: false
---

[원문](https://git-scm.com/book/en/v2)

[1편](../git_pro_summary_1)

<hr class="custom-hr">

## Git Repository 생성

- 일반적으로 Git repository를 생성하는 데에는 크게 두 가지 방법이 존재한다:
  1. 아직 VCS로 관리되고 있지 않은 로컬 디렉토리를 Git repository로 변경.
  2. 외부의 Git repository를 `clone`.

### 기존에 존재하는 디렉토리를 Git repository로 초기화

- 우선, CLI를 통해 Git repository로 초기화하고자 하는 디렉토리로 이동하여 다음 명령어를 입력:

```sh
git init
```

- 위 명령을 입력하면 `.git` 이라는 하위 디렉토리를 생성. 이 하위 디렉토리에는 저장소에 필요한 모든 파일들이 저장됨.
- Git으로 하여금 파일을 관리하도록 하고 싶다면 우선 `git add` 명령어를 통해 파일을 tracking하고, `git commit` 명령어를 통해 파일을 커밋해야함.

### Cloning 하기

- 오픈소스 저장소와 같이 기존에 존재하는 Git repository를 복사하고 싶다면 `git clone` 명령어를 이용.
- `git clone`을 사용하게 되면 해당 프로젝트의 히스토리를 "전부" 받아옴.
- 저장소를 복제할 땐 `git clone <url>`과 같은 방식으로 수행:

```sh
$ git clone https://github.com/libgit2/libgit2
```

- 위 명령을 수행하면 `libgit2`라는 디렉토리를 만들어서, `.git` 하위 디렉토리를 생성하고 저장소의 모든 데이터를 `.git`에 저장한 후 최신 버전을 check out함.

- 이 때, 생성되는 디렉토리의 이름을 `libgit2` 대신 다른 이름으로 하고 싶다면 다음과 같이 해야함:

```sh
$ git clone https://github.com/libgit2/libgit2 mylibgit
```

- 위 명령을 수행하면 다른 모든 과정은 동일하지만 새로 생성되는 디렉토리의 이름이 `mylibgit`이 됨.

- 위 예시에서는 `https://` 프로토콜을 사용했지만 이외에도 `git://`과 같이 다양한 프로토콜을 사용할 수도 있음.

## 저장소에 변경사항 기록하기

- 현재 워킹 디렉토리에 있는 각 파일들은 `tracked`(관리대상) 상태이거나, 혹은 `untracked`(관리대상이 아님) 상태이다.
- `tracked` 파일은 이미 이전 스냅샷에 포함된 파일이며, `unmodified`, `modified`, `staged` 중 하나의 상태이다.
- 이외의 파일은 모두 `untracked` 파일이다. 즉, 이전 스냅샷에도 없고 staging area에도 존재하지 않는 파일들은 `untracked` 상태이다.
- 저장소를 처음 `clone`하고 나면 아직 수정한 파일이 없으므로 모든 파일이 `unmodified` 상태에 있게 된다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/git/git_pro_summary_2/git_file_states.png" alt="Git file states" />
    <figcaption>Git 파일 상태</figcaption>
</figure>

- 마지막 커밋 이후 아직 아무런 수정도 하지 않은 상태에서 어떤 파일을 수정하게 되면 Git은 수정된 파일을 `modified`로 인식한다. 이 때 실제 커밋을 하기 위해선 이 수정한 파일을 staging area에 올려 `staged` 상태로 만들고, 커밋 명령을 통해 staging area에 있는 파일들을 커밋한다. Git을 사용하면 이러한 라이프 사이클을 계속해서 반복한다.

<figure>
    <img src="https://git-scm.com/book/en/v2/images/lifecycle.png" alt="The lifecycle of the status of your files" />
    <figcaption>https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control</figcaption>
</figure>
