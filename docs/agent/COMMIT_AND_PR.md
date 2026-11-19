# 커밋 및 PR 작성 규칙

## 공통 제목 형식

```text
<type>: <summary>
<type>(<scope>): <summary>
```

- 제목은 기존 커밋과 같이 영어로 작성한다. 요약은 `add`, `fix`, `remove` 같은 동사 원형으로 시작하고 마침표를 생략한다.
- `scope`는 선택 사항이다. `editor`, `player`, `auth`처럼 변경 영역을 짧게 쓰면 제목을 이해하기 쉬울 때 사용한다.

| 유형 | 용도 |
| --- | --- |
| `feat` | 기능 추가 또는 확장 |
| `fix` | 기존 동작의 오류 수정 |
| `docs` | 문서 변경 |
| `style` | 코드 포매팅 변경 |
| `refactor` | 동작을 유지하는 코드 구조 변경 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가 또는 수정 |
| `build` | 빌드 설정이나 의존성 변경 |
| `ci` | CI 워크플로 변경 |
| `chore` | 저장소 정리 등 유지보수 |

```text
docs: organize agent reference files
fix(player): keep audio in sync after seeking
```

## 커밋 메시지

제목에는 커밋의 목적을 한 줄로 담는다. 변경 이유나 호환성에 대한 설명이 필요하면 제목 다음에 빈 줄을 두고 본문을 작성한다.

```text
fix(player): keep audio in sync after seeking

Render the frame at the new playback position when seeking while paused.
```

기존 사용 방식에 호환성 변경이 있으면 제목의 콜론 앞에 `!`를 붙이고, 메시지 끝에 `BREAKING CHANGE: <영향과 마이그레이션 방법>`을 적는다.

## PR 제목과 본문

PR 제목은 다음 브랜치에 들어갈 전체 변경을 나타내며 공통 제목 형식을 사용한다. 본문은 리뷰어가 변경 목적과 검증 범위를 파악할 수 있게 작성한다. 검증에는 실제 실행한 명령 또는 수동 확인 절차와 결과를 적는다. 검증을 실행하지 못했다면 그 항목과 이유를 적는다.

```markdown
## 요약

- 변경 목적과 사용자가 확인할 수 있는 주요 변경 사항

## 검증

- 실행한 명령 또는 수동 확인 절차와 결과
```

관련 이슈가 있으면 `관련 이슈` 섹션에 `Refs #123`을 적는다. 병합으로 이슈를 닫으려는 경우에는 `Closes #123`을 사용한다. UI 변경에는 리뷰에 필요한 스크린샷이나 GIF를, 호환성 변경에는 영향과 마이그레이션 방법을 추가한다.
