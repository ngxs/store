## Concepts
There are 4 major concepts to NGXS:

- Store: Global state dispatcher and selector
- Actions: Classes dispatched to stores with optional payload
- State: Class definition of the state's action listeners
- Selects: State slice selectors

These concepts create a circular control flow traveling from a component
dispatching an action, to a store reacting to the action, back to the component
through a state select.

<p align="center">
  <img src="../assets/diagram.png">
</p>
