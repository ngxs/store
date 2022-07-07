type CheckRO_<T> = T extends Readonly<infer O> ? (Readonly<O> extends T ? 1 : 2) : 3;
type CheckRO<T> = T extends Readonly<infer O> ? (O extends T ? 1 : 2) : 3;

type nul = CheckRO<null>;
type und = CheckRO<undefined>;
type str = CheckRO<string>;
type num = CheckRO<number>;
type bool = CheckRO<boolean>;
type big = CheckRO<bigint>;
type sym = CheckRO<symbol>;
type fun = CheckRO<() => string>;
type arr = CheckRO<readonly ['']>;
type obj = CheckRO<{ a: string }>;
type robj = CheckRO<Readonly<{ a: string }>>;
interface MyType {
  a: string;
}
type inter = CheckRO<MyType>;

// Read only can do a round trip
type test1 = { a: string } extends Readonly<{ a: string }> ? true : false;
type test2 = Readonly<{ a: string }> extends { a: string } ? true : false;

type AsReadonly<T> = T extends Readonly<infer O> ? (O extends T ? Readonly<T> : T) : T;

type _nul = AsReadonly<null>;
type _und = AsReadonly<undefined>;
type _str = AsReadonly<string>;
type _num = AsReadonly<number>;
type _bool = AsReadonly<boolean>;
type _big = AsReadonly<bigint>;
type _sym = AsReadonly<symbol>;
type _fun = AsReadonly<() => string>;
type _arr = AsReadonly<readonly ['']>;
type _arrMut = AsReadonly<['']>;
type _obj = AsReadonly<{ a: string }>;
type _robj = AsReadonly<Readonly<{ a: string }>>;
type _inter = AsReadonly<MyType>;
