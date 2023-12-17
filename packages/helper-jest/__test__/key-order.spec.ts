import { keyOrderSerializer } from '../src'

const serializer = keyOrderSerializer(['name', 'gender'], () => true)

describe('key-order', () => {
  test('plain', () => {
    expect.addSnapshotSerializer(serializer)
    expect({
      age: 1,
      name: 'alice',
      gender: 'male',
      other: 'waw',
    }).toMatchInlineSnapshot(`
      {
        "name": "alice",
        "gender": "male",
        "age": 1,
        "other": "waw",
      }
    `)
  })

  test('nested', () => {
    expect.addSnapshotSerializer(serializer)
    expect({
      age: 1,
      name: 'alice',
      gender: 'male',
      extra: [
        {
          age: 3,
          gender: 'female',
          name: 'bob',
        },
      ],

      other: 'waw',
    }).toMatchInlineSnapshot(`
      {
        "name": "alice",
        "gender": "male",
        "age": 1,
        "extra": [
          {
            "name": "bob",
            "gender": "female",
            "age": 3,
          },
        ],
        "other": "waw",
      }
    `)
  })
})
