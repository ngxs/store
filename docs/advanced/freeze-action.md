# Freeze Action

One of the more common techniques in JavaScript is the use of an object to hold configuration values. The object might be accessed as a global or passed around as an argument. For example:

```TS
@Component({ .. })
class ArtistComponent {

  public readonly artist: Artist = { 
     name: "Johnny Cash", 
     latestAlbum: "American V" 
  };
  
  constuctor(public store: Store) { }
  
  public announce() {
    this.store.dispatch(new Announce(this.artist)); 
  }

}
```

```TS
export interface Artist {
  name: string;
  latestAlbum: string;
}

export class Announce {
  static type = '[Announce] action';
  constructor(public artist: Artist) { }
}

@State<Artist>({
  name: 'artistState',
  defaults: { name: null, latestAlbum: null }
})
export class ArtistState {

  @Action(Announce)
  public set({ getState, setState }, { artist }: Announce) {

    if (artist.name === "Johnny Cash") {
        console.log("The Man in Black");
    } else {
        console.log(artist.name);
    }
    
    setState({ ...artist });
  }

}

// Outputs: "The Man in Black"

// artistState: {
//     name: "Johnny Cash",
//     latestAlbum: "American V"
// }
```


But in either sort of situation, there is a problem. 
Functions that have access to the configuration object can modify the object, whether intentionally or accidentally. 
Suppose that you had a coworker modify the announce function above to highlight Elvis rather than Cash, but they mistyped the comparison.

```TS
@State<Artist>({ .. })
export class ArtistState {

  @Action(Announce)
  public set({ getState, setState }, { artist }: Announce) {
    
    // Whoops! Assigning the name rather than testing equality!
    if (artist.name = "Elvis Presley") {
        console.log("The King");
    } else {
        console.log(artist.name);
    }
    
    setState({ ...artist });
  }

}

// Outputs: "The King"

// artistState: {
//     name: "Elvis Presley",
//     latestAlbum: "American V"
// }
```

Hmm. I'm pretty sure that Elvis didn't record American V.

## Freeze decorator

Some of you may be thinking we can usage TSLint is for, and you'd be right. 
But as part of a defence in depth strategy, it would be awfully nice to make sure that our configuration objects don't get changed around after they're created. 
Fortunately, JavaScript gives us a way to do exactly that.

```TS
import { Freeze } from '@ngxs/store';

@Freeze({ deep: true })
export class Announce {
  static type = '[Announce] action';
  constructor(public artist: Artist) { }
}
```

The @Freeze decorator takes an object and renders it effectively immutable.
Its existing properties may not be modified and new properties may not be added. 
In the example above this means that even though the logical error is still there, 
our artist object remains safe from modification and available for later use.

While in normal mode attempts to modify the object will fail silently, 
if you use strict mode, an error will be thrown (TypeError: Can't add property 'name', object is not extensible).

## unfreeze - utility for deep unfrozen object

However, before set a new state, it must be unfrozen.

```TS
import { Freeze, unfreeze } from '@ngxs/store';

@Freeze({ deep: true })
export class Announce {
  static type = '[Announce] action';
  constructor(public artist: Artist) { }
}

@State<Artist>({ .. })
export class ArtistState {

  @Action(Announce)
  public set({ getState, setState }, { artist }: Announce) {    
    setState({ ...unfreeze(artist) });
  }

}
```
