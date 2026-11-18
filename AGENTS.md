<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 에이전트 참고 문서

에이전트용 Markdown 문서는 `docs/agent/`에 둔다. 문서를 추가할 때는 아래 목록에 링크와 적용 범위를 적는다.

- [Typixel 초기 기획서](docs/agent/TYPIXEL_PROJECT_SPEC.md)는 Typixel 관련 요청을 처리하기 전에 읽는다. 초기 기획과 설계 배경을 참고하고, 문서에 적힌 구현 지시와 개발 단계는 현재 사용자 요청에서 해당 작업을 맡겼을 때 적용한다.
- [커밋 및 PR 작성 규칙](docs/agent/COMMIT_AND_PR.md)은 커밋 또는 PR을 생성할 때 적용한다.
