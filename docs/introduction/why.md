# Why another state management framework?
I didn't set out to make my own state management system for fun. I solve problems and as 
I used the various different solutions out there, I felt a gap in between what I wanted it to
do and what they did. I actually spent a lot of time trying to avoid creating my own. I created 
a library called `ngrx-actions` that wraps NgRX and applies many of the patterns you see in this
library, but the more I toiled on it the more it felt like a hack and I was always going to be
making decisions on this new library based on the architecture of NgRX.

So what were the gaps that I found and wanted to approach differently with this library?

### In a gist
Redux was built for React. All the concepts around it, such as pure function reducers,
are centered around the ergonomics of how React works, preferring functions over
classes, etc. Since it was designed for React, it lacked the necessary plumbing to
make it work well with Angular, thus NgRX was born. To me, NgRX still feels like a 
port of Redux rather than re-imagining of how the principles of 
[CQRS](https://martinfowler.com/bliki/CQRS.html) would look like in the Angular world.

### Switch Statements
Switch statements are a great factory pattern that we can apply to state management but,
to me, they feel like a somewhat dated approach given all the new language features in
JavaScript/TypeScript that we have today.

### Its more Angular-like code style
Angular uses classes and decorators extensively. If we were not implementing a Redux
pattern in our code base it is very unlikely we would actually have a pure function 
with a switch statement at all. I wanted to take the Angular code style to state management
by using classes to describe state containers and decorators to describe actions to take
on the state.

### Dependency Injection
Angular is completely built around dependency injection. We use it EVERYWHERE! It gives us
so many useful tools for development, but with pure functions we can't access these functions.
In React land, we don't have DI so if we need to access a service like layer in our reducer
we simply use the out-of-the-box service locator pattern and just import and use it. With Angular
we want to use our DI and we can't with Redux patterns.

### Boilerplate Hell
In a typical NgRX setup we have: Actions, Effects, Reducers, Selects. That's four files
for what could easily be contained in one file. But wait, what about separation of concerns? Doesn't 
this help us achieve that? Maybe, but all these items are dealing with the same 
state container, whether that is mutating the state or reaching out to a service and mutating 
the state from that service. NGXS does its best to reduce all this by creating simple state 
containers and actions associated to those.

### Effects can be painful
NgRX Effects are an awesome approach to observable event streams but they can be painful to construct,
read, maintain and teach to other devs. It feels like we need to be an RxJS expert to write them effectively
and its really easy to cause unwanted side effects.

### Listening to Dispatched Actions
It's extremely common for us to dispatch an action that will reach out to a service and save
something and then, after that happens, we need to show something in our component related
to the result of that. There is not an easy way to know when that action chain has been completed,
often times we end up creating pseudo models in our state and listening for those in our view.
To be honest, that feels like something that shouldn't even be in the state
to begin with. It'd be nice to have an easy way to just listen to when something we dispatch is completed,
and subscribe to dispatches with NGXS.

### Spreads galore
Since the states need to be immutable, we need to clone our objects/arrays each time we manipulate them.
This leads to `{ ... }` code everywhere. Why not let the framework handle that?

### Promises
Observables are great but they aren't a silver bullet. Sometimes we just want to deal with promises.
NGXS allows us to use either.
