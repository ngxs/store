# Why?

Why another state management solution? We asked ourselves that same question before we started on NGXS. After trial and error of several different redux based solutions we decided that they didn’t represent the type of API we wanted and expected from Angular.

### Simple
NGXS tries to make things as simple and accessible as possible. There can be a lot of boilerplate code in state management, thus a main goal of NGXS is to reduce boilerplate allowing you to do more things with less. It is also not necessary to be super familiar with RxJs.

RxJs is great and is made use of heavily internally within the project, but the library tries to do as much for you as it can. NGXS drives to let users take advantage of the benefits of Observables but in many cases treat them as an implementation detail of the library rather than a prerequisite.

The other thing that NGXS gets rid of is switch statements. The library is responsible for knowing when functions need to be called.

### Dependency Injection (DI)
A core feature of Angular is dependency injection. It can be a very useful tool and NGXS makes sure that users can use
DI in their state management code. This means Angular services can be injected into state classes making it easier to take advantage of more Angular features.

### Action Life Cycles
Actions in NGXS are asynchronous. This allows actions to have a life cycle,
meaning we can now listen for when a single action or a collection of actions is complete making complex workflows predictable.
It is very common to want to do something after an action is completed and NGXS makes it simple to do.

### Promises
Observables are great but they aren't a silver bullet. Sometimes Promises are the preferred option. NGXS allows either to be returned from an action method.

### Community
NGXS is entirely community built and driven. The project exists to help people build applications and the team is open to any suggestions that help with that goal.
