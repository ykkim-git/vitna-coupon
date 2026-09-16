// 잠금 화면 비밀번호의 SHA-256 해시를 출력한다.
//   npm run gate-hash -- 새비밀번호
import { createHash } from 'node:crypto'

const password = process.argv.slice(2).join(' ')

if (!password) {
  console.error('사용법: npm run gate-hash -- <비밀번호>')
  process.exit(1)
}

const hash = createHash('sha256').update(password).digest('hex')

console.log()
console.log(`  비밀번호 : ${password}`)
console.log(`  해시     : ${hash}`)
console.log()
console.log('  src/lib/gate.js 의 PASSWORD_SHA256 값을 위 해시로 바꾸세요.')
console.log()
