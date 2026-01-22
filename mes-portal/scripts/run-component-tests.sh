#!/bin/bash
# React 19 + Jest 환경에서 프로세스 미종료 문제 해결을 위한 래퍼 스크립트

# Jest를 백그라운드로 실행
node --experimental-vm-modules node_modules/.bin/jest --config jest.component.config.ts --runInBand "$@" &
JEST_PID=$!

# Jest 프로세스 모니터링
wait $JEST_PID 2>/dev/null
EXIT_CODE=$?

# 남은 Jest 관련 프로세스 정리
pkill -P $$ 2>/dev/null

exit $EXIT_CODE
