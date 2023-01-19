import React from 'react'
import cn from 'clsx'
import classes from './style/index.styl'

/**
 * Params for constructing a Greet.
 */
export interface GreetProps {
  name?: string
}

export function Greet(props: GreetProps): React.ReactElement {
  const { name= 'world' } = props
  return (
    <div className={cn(classes.container)}>
      Hello, <span className={cn(classes.name)}>{name}</span>!
    </div>
  )
}

export default Greet
