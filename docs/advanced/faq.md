# FAQ

## Can I use NGXS with Angular 5?
3.x supports Angular 6 and RxJs 6 out of the box. However, you can still use it with Angular 5 by upgrading your RxJs version
and using the RxJs compatibility package in your project.

## Is this ready for production?
Yes, we made a huge effort with 2.0 to ensure stability and good test coverage. There are several individuals who
are using this in production today.

## Could we not reduce the boilerplate more by just calling the method directly?
The main goal of NGXS is to make state management easy with as little boilerplate as possible. The question
is often raised that we could reduce the boilerplate even more by just letting you call the method
on the state rather than having action classes to dispatch. This is not really possible to do
and keep a global state with rich debugging and hot reload capability. When we invoke a function
we have to go to the global state and slice out that portion and pass it to the method. There is no
good way to do this when calling methods directly. Additionally by using action dispatching,
you can share actions between states and higher order states very easily.
