## Concepts
There are 4 major concepts to NGXS:

- Actions: Classes dispatched to stores with optional payload
- Selects: State slice selectors
- State: Class definition of the state's action listenerings
- Store: Global state dispatcher and selector

These concepts create a circular control flow traveling from an component
dispatching an action, to a store reacting to the action back to the component
through a state select.

<p align="center">
  <img src="../assets/diagram.png">
</p>
