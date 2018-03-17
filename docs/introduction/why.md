# Why another state mangement framework?
I didn't set out to make my own state mangement system for fun but I solve problems and as 
I used the various different solutions out there, I felt a gap in between what I wanted it to
do and what it did. I actually spent a lot of time trying to avoid creating my own. I created 
a library called `ngrx-actions` that wraps NGRX and applies many of the patterns you see in this
library but the more I toiled on it, the more it felt like a hack and I was always going to be
at the mercy of NGRX.

So what were the gaps that I found and wanted to fix with this library?

### In a gist
Redux was built for React. All the concepts around it such as pure function reducers
are all centered around the egronomics of how React works, preferring functions over
classes/etc. Redux was built for React though and it lacked the nescarry plumbing to
make it work well with Angular, thus NGRX was born. To me, NGRX still feels like a 
port of Redux rather than reimagining how the principles of CQRS would look like
in the Angular world.

### Switch Statements
Switch statements are a great factory pattern that we can apply to state mangement but
to be frank they are somewhat a dated approach given all the new language features in
JavaScript/TypeScript we have today.

### Its more Angular-like code style
Angular uses classes and decorators extensively. If you were not implementing a redux
pattern in your code base it is very unlikely you would actually have a pure function 
with a switch statement at all. I wanted to take the Angular code style to state mangement
by using classes to describe state containers and decorators to describe actions to take
on the state.

### Depedency Injection
Angular is completely built around depedency injection. We use it EVERYWHERE! It gives us
so many useful tools for development but with pure functions you can't access these functions.
In React land, you don't have DI so if you need to access a service like layer in your reducer
you simply use the out-of-the-box service locator pattern and just import and use it. With Angular
we want to use our DI and we can't with Redux patterns.

### Boilerplate Hell
In a typical NGRX setup you have: Actions, Effects, Reducers, Selects. Thats four files
for what could easily be contained in one file. But wait, what about seperation of concerns?
Is it really though? All these items are dealing with the same state container, whether that
is mutating the state or reaching out to a service and mutating the state from that service.
NGXS does its best to reduce all this by creating simple state containers and actions associated
to those.

### String Constants
No developer likes string constants so why do we use them so extensively in frameworks like NGRX
and Redux? With NGXS when you a dispatch an action, you dispatch a class and we use that class's
signature to determine how to route it eliminating the need for any string constants ANYWHERE!

### Effects are painful
NGRX Effects are a awesome approach to observable event streams but they are painful to construct,
read, maintain and tech JR devs. You pretty much has to be a RXJS expert to write them effectively
and its really easy to cause unwanted side effects.

### Listening to Dispatched Actions
Its extremely common for a user to dispatch a action that will reach out to a service and save
something and then after that happens you need to show something in your component related
to the result of that. There is not an easy way to know when that action chain has been completed,
oftentimes you end up creating pseudo models in your state and listening for those in your view.
To be honest, that feels like a hack to me and something that shouldn't even be in the state
to begin with. We need a easy way to just listen to when something we dispatch is completed,
you can subscribe to dispatches with NGXS.

### Promises
Observables are great but they aren't a silver bullet. Sometimes you just want to deal with promises,
with NGXS you can use either.
