# News

## Next Release 3.0 - 4/5/18
Our next release that was planned to be 2.1 is now 3.0. The reason is as we continued
to use NGXS in large production apps we found issues with minification of class names.
In a gist, compilers will change the name of the class and there is a likelihood it could
overlap with another class name in a closure. 3.0 is a breaking change because now actions
will be required to have a static type. We REALLY wanted to avoid requiring this and not
having a breaking change but this is such an issue we were required to do so.

## 2.1 Beta - 4/2/18
2.1 has kicked off and its packed with lots of new features and fixes! Some notable items
that are available now via beta package are:

- Forms Plugin
- Websocket Plugin
- Cancellable Actions
- State snapshots
- Life cycle events

Just to name a few! You can take advantage of all of these features today but it is
important to note they are in beta state and not fully tested/stable yet so use at
your own risk! We plan to launch 2.1 official in the coming weeks.

## 2.0 Release - 3/27/18
Today we launched 2.0, a huge improvement from our 1.0 release. It's really exciting
to see the community come together to make this a truly great project! We had
quite a few breaking changes over the duration of the 2.0 release and I want to 
apologize for that. The 1.0 release was me working in a silo, as the community
started using it and having ideas it evolved quite a bit and I wanted to get that
feedback integrated as soon as possible so we have a great foundation to start off.
I can assure you moving forward we will have proper deprecation cycles before any
breaking changes so please dont worry about that. Looking forward to the next release,
we have lots planned around new plugins and big core features under the hood like
cancellable actions and whatnot so stay tuned for updates!
