<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/event-bus@6.0.0-alpha.1/packages/event-bus#readme">@guanghechen/event-bus</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/event-bus">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/event-bus.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/event-bus">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/event-bus.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/event-bus">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/event-bus.svg"
      />
    </a>
    <a href="#install">
      <img
        alt="Module formats: cjs, esm"
        src="https://img.shields.io/badge/module_formats-cjs%2C%20esm-green.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/event-bus"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>
<br/>


A simple event bus.


## Install

  ```bash
  npm install --save @guanghechen/event-bus
  ```

* yarn

  ```bash
  yarn add @guanghechen/event-bus
  ```


## Usage

* Basic

  ```typescript
  import type { IEvent, IEventHandler } from '@guanghechen/event-bus'
  import { EventBus } from '@guanghechen/event-bus'

  enum EventTypes {
    INIT = 'INIT',
    EXIT = 'EXIT',
  }

  const eventBus = new EventBus<EventTypes>()

  const handle: IEventHandler<EventTypes> = (evt: IEvent<EventTypes>) => {
    console.log('evt:', evt)
  }

  // Listen for specific event
  eventBus.on(EventTypes.INIT, handle)

  // Listen for specific event, and only need to be called once
  eventBus.once(EventTypes.INIT, handle)

  // Listen for all events
  eventBus.subscribe(handle, true)

  // Remove listener
  eventBus.removeListener(EventTypes.INIT, handle)

  // Remove subscriber
  eventBus.unsubscribe(handle)
  ```


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/event-bus@6.0.0-alpha.1/packages/event-bus#readme
