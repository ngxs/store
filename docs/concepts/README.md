## Concepts
There are 4 major concepts to NGXS:

- Events: Classes dispatched to stores with optional payload
- Actions: Events that perform async operations
- Mutations: Events that mutate the store data
- Selects: State getters

These concepts create a circular control flow traveling from an component
dispatching an event, to a store reacting to the event back to the component
through a state select.

<p align="center">
  <img src="assets/diagram.png">
</p>
