import assert from 'node:assert/strict'
import { diffInstanceTrees } from '../my-ui/src/sync/protocol.ts'

const before = { ClassName: 'Frame', Name: 'Root', Children: [{ ClassName: 'TextLabel', Name: 'Title', Text: 'Old' }] }
const after = { ClassName: 'Frame', Name: 'Root', Children: [{ ClassName: 'TextLabel', Name: 'Title', Text: 'New' }, { ClassName: 'Frame', Name: 'Extra' }] }
const operations = diffInstanceTrees(before, after)
assert.equal(operations.filter((operation) => operation.type === 'upsert').length, 2)
assert.ok(operations.some((operation) => operation.path.endsWith('/Title~0')))
assert.ok(operations.some((operation) => operation.path.endsWith('/Extra~0')))
const deleted = diffInstanceTrees(after, { ClassName: 'Frame', Name: 'Root', Children: [{ ClassName: 'TextLabel', Name: 'Title', Text: 'New' }] })
assert.deepEqual(deleted.filter((operation) => operation.type === 'delete').map((operation) => operation.path), ['/Root~0/Extra~0'])
console.log('Studio sync diff checks passed')
