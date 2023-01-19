import React from 'react'
import data from './data.json'
import Greet from './Greet'

export * from './Greet'
export default () => <Greet name={data.name} />
