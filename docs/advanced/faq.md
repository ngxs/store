# FAQ

## Can I use NGXS with Angular 6?
Yes! We require you have RXJS `compat` installed until we release a official version for RX6.

## Is this ready for production?
Yes, we made a huge effort with 2.0 to ensure stability and good test coverage. There are several individuals who
are using this in production today.

## Could we not reduce the boilerplate more by just calling the method directly?
NGXS main goal is to make state mangement easy with as little boilerplate as possible. The question
is often raised that we could reduce the boilerplate even more by just letting you call the method
on the state rather than having action classes to dispatch. This is not really possible to do
and keep a global state with rich debugging and hot reload capability. When we invoke a function
we have to goto the global state and slice out that portion and pass it to the method. There is no
good way to do this when calling methods directly. Additionally by using action dispatching
you can share actions between states and making higher order states very easily.
