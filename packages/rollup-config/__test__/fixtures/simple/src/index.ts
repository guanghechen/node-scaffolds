import data from './data.json'
import { isFileSync } from './util'

export { isFileSync } from './util'

console.log('data:', data)
console.log(isFileSync(__filename))

export default () => data
