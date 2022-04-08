import {
  PropertyPath,
  MemoObjectIterator,
  List,
  Many,
  PartialDeep,
  ObjectIteratee,
  Cancelable,
  ThrottleSettings,
  ValueIteratee,
  ListIterator,
  ObjectIterator,
  ListIteratee,
  AnyKindOfDictionary,
  PropertyName,
  PartialObject
} from "./internal-types";
import {
  Dictionary,
  NumericDictionary,
  AnyFunction
} from "@ncac/marionext-types";

export namespace _ {
  const asyncTag = "[object AsyncFunction]",
    funcTag = "[object Function]",
    genTag = "[object GeneratorFunction]",
    proxyTag = "[object Proxy]",
    nullTag = "[object Null]",
    undefinedTag = "[object Undefined]",
    argsTag = "[object Arguments]",
    arrayTag = "[object Array]",
    objectTag = "[object Object]",
    mapTag = "[object Map]",
    promiseTag = "[object Promise]",
    setTag = "[object Set]",
    weakMapTag = "[object WeakMap]",
    boolTag = "[object Boolean]",
    dateTag = "[object Date]",
    errorTag = "[object Error]",
    numberTag = "[object Number]",
    regexpTag = "[object RegExp]",
    stringTag = "[object String]";

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  const cloneableTags = {};
  cloneableTags[argsTag] =
    cloneableTags[arrayTag] =
    cloneableTags[boolTag] =
    cloneableTags[dateTag] =
    cloneableTags[mapTag] =
    cloneableTags[numberTag] =
    cloneableTags[objectTag] =
    cloneableTags[regexpTag] =
    cloneableTags[setTag] =
    cloneableTags[stringTag] =
      true;
  cloneableTags[errorTag] =
    cloneableTags[funcTag] =
    cloneableTags[weakMapTag] =
      false;

  const nativeNow = Date.now;
  const HOT_COUNT = 800,
    HOT_SPAN = 16;

  const nativeMax = Math.max;
  const nativeMin = Math.min;
  const nativeFloor = Math.floor;
  const nativeRandom = Math.random;
  const objectCreate = Object.create;

  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
  const funcToString = Function.prototype.toString;
  const objectCtorString = funcToString.call(Object);
  const nativeObjectToString = Object.prototype.toString;
  const nativeKeys = overArg(Object.keys, Object);

  const reIsDeepProp = /\.|\[(?:[^[\]]*|(['"])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    rePropName =
      /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
    reEscapeChar = /\\(\\)?/g,
    reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
    reIsNative = RegExp(
      "^" +
        funcToString
          .call(hasOwnProperty)
          .replace(reRegExpChar, "\\$&")
          .replace(
            /hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,
            "$1.*?"
          ) +
        "$"
    ),
    reIsHostCtor = /^\[object .+?Constructor\]$/,
    reIsUint = /^(?:0|[1-9]\d*)$/,
    reFlags = /\w*$/,
    rsAstralRange = "\\ud800-\\udfff",
    rsComboMarksRange = "\\u0300-\\u036f",
    reComboHalfMarksRange = "\\ufe20-\\ufe2f",
    rsComboSymbolsRange = "\\u20d0-\\u20ff",
    rsComboRange =
      rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = "\\ufe0e\\ufe0f",
    rsZWJ = "\\u200d",
    reHasUnicode = RegExp(
      "[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]"
    ),
    rsAstral = "[" + rsAstralRange + "]",
    rsCombo = "[" + rsComboRange + "]",
    rsFitz = "\\ud83c[\\udffb-\\udfff]",
    rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")",
    rsNonAstral = "[^" + rsAstralRange + "]",
    rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}",
    rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]",
    reOptMod = rsModifier + "?",
    rsOptVar = "[" + rsVarRange + "]?",
    rsOptJoin =
      "(?:" +
      rsZWJ +
      "(?:" +
      [rsNonAstral, rsRegional, rsSurrPair].join("|") +
      ")" +
      rsOptVar +
      reOptMod +
      ")*",
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol =
      "(?:" +
      [
        rsNonAstral + rsCombo + "?",
        rsCombo,
        rsRegional,
        rsSurrPair,
        rsAstral
      ].join("|") +
      ")",
    /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
    reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g"),
    reTrim = /^\s+|\s+$/g,
    reIsBadHex = /^[-+]0x[0-9a-f]+$/i,
    reIsBinary = /^0b[01]+$/i,
    reIsOctal = /^0o[0-7]+$/i,
    reUnescapedHtml = /[&<>"']/g,
    reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

  /** Used to map characters to HTML entities. */
  const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  const INFINITY = 1 / 0;
  const MAX_INTEGER = 1.7976931348623157e308;
  const MAX_MEMOIZE_SIZE = 500;
  const MAX_SAFE_INTEGER = 9007199254740991;
  const MAX_ARRAY_LENGTH = 4294967295;
  const LARGE_ARRAY_SIZE = 200;

  const NAN = 0 / 0;

  /** Built-in method references without a dependency on `root`. */
  const freeParseInt = parseInt;

  const FUNC_ERROR_TEXT = "Expected a function";
  const HASH_UNDEFINED = "__hash_undefined__";
  const PLACEHOLDER = "__placeholder__";

  const COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4,
    CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    WRAP_PARTIAL_FLAG = 32,
    WRAP_BIND_FLAG = 1,
    WRAP_BIND_KEY_FLAG = 2,
    WRAP_CURRY_BOUND_FLAG = 4,
    WRAP_CURRY_FLAG = 8,
    WRAP_CURRY_RIGHT_FLAG = 16,
    WRAP_PARTIAL_RIGHT_FLAG = 64,
    WRAP_ARY_FLAG = 128,
    WRAP_REARG_FLAG = 256;

  function constant(value) {
    return function () {
      return value;
    };
  }

  /**
   * Checks if value is a callable function.
   */
  export const isFunction = function isFunction(
    value: any
  ): value is AnyFunction {
    if (!isObject(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns "object" for typed arrays and other constructors.
    var tag = baseGetTag(value);
    return (
      tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag
    );
  };

  export function makeCallback<T>(fn: T): T extends AnyFunction ? T : () => T {
    if (isFunction(fn)) {
      return fn as any;
    } else {
      return function () {
        return fn;
      } as any;
    }
  }

  const nativeCreate = getNative(Object, "create");
  function getNative(object, key): any {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }
  function baseIsNative(value) {
    if (!isObject(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  function toSource(func) {
    if (func != null) {
      try {
        return Function.prototype.toString.call(func);
      } catch (e) {}
      try {
        return func + "";
      } catch (e) {}
    }
    return "";
  }
  interface Hash {
    __data__: {};
    size: number;
    new (): Hash;
    clear(): void;
    set(key: any, value: any): any;
    has(key: any): boolean;
    delete(key: any): any;
    get(key: any): any;
  }
  class Hash {
    constructor(entries?: any) {
      var index = -1,
        length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    clear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    set(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
      return this;
    }
    has(key) {
      var data = this.__data__;
      return nativeCreate
        ? data[key] !== undefined
        : hasOwnProperty.call(data, key);
    }
    delete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    get(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }
  }

  interface ListCache {
    new (): ListCache;
    clear(): void;
    set(key: any, value: any): any;
    delete(key: any): boolean;
    get(key: any): any;
    has(key): boolean;
    __data__: any[];
    size: number;
  }
  class ListCache {
    constructor(entries?: any) {
      var index = -1,
        length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    clear() {
      this.__data__ = [];
      this.size = 0;
    }
    set(key, value) {
      var data = this.__data__,
        index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    delete(key) {
      var data = this.__data__,
        index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        Array.prototype.splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    get(key) {
      var data = this.__data__,
        index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }
    has(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
  }

  interface Stack {
    __data__: ListCache | MapCache;
    size: number;
    set(key: any, value: any): Stack;
    get(key: any): any;
    delete(key: any): any;
    clear(): void;
    has(key: any): boolean;
  }
  class Stack {
    constructor(entries?: any) {
      var data = (this.__data__ = new ListCache(entries));
      this.size = data.size;
    }
    set(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    get(key) {
      return this.__data__.get(key);
    }
    delete(key) {
      var data = this.__data__,
        result = data["delete"](key);

      this.size = data.size;
      return result;
    }
    clear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    has(key) {
      return this.__data__.has(key);
    }
  }

  interface SetCache {
    new (values?: any): SetCache;
    __data__: MapCache;
    size: number;
    add(value): SetCache;
    push(value): SetCache;
    has(value): boolean;
  }
  class SetCache {
    constructor(values?: any) {
      var index = -1,
        length = values == null ? 0 : values.length;

      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }
    add(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    has(value) {
      return this.__data__.has(value);
    }
  }

  function assocIndexOf(array, key): number {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  function eq(value, other): boolean {
    return value === other || (value !== value && other !== other);
  }

  interface MapCache {
    new (): MapCache;
    clear(): void;
    set(key: any, value: any): void;
    delete(key: any): any;
    get(key: any): any;
    size: number;
    __data__: {
      hash: Hash;
      map: Map<any, any> | ListCache;
      string: Hash;
    };
  }
  class MapCache {
    constructor(entries?: any) {
      var index = -1,
        length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    clear() {
      this.size = 0;
      this.__data__ = {
        hash: new Hash(),
        map: new (Map || ListCache)(),
        string: new Hash()
      };
    }
    set(key, value) {
      var data = getMapData(this, key),
        size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    delete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    get(key) {
      return getMapData(this, key).get(key);
    }
    has(key) {
      return getMapData(this, key).has(key);
    }
  }

  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == "string" ? "string" : "hash"]
      : data.map;
  }

  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "boolean"
      ? value !== "__proto__"
      : value === null;
  }

  interface memoize {
    <T extends (...args: any[]) => any>(
      func: T,
      resolver?: (...args: any[]) => any
    ): T & MemoizedFunction;
    Cache: typeof MapCache;
  }
  const memoize = <memoize>function (func, resolver) {
    if (
      typeof func != "function" ||
      (resolver != null && typeof resolver != "function")
    ) {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = <memoized>function () {
      var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache)();
    return memoized;
  };
  function memoizeCapped(func) {
    var result = memoize(func, function (key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });

    var cache = result.cache;
    return result;
  }
  interface memoized {
    (...args: any[]): memoized;
    cache?: any;
  }
  interface MemoizedFunction {
    cache: MapCache;
  }

  const stringToPath: (...args) => string = memoizeCapped(function (string) {
    var result = [];
    if (string.charCodeAt(0) === 46 /* . */) {
      result.push("");
    }
    string.replace(rePropName, function (match, number, quote, subString) {
      result.push(
        quote ? subString.replace(reEscapeChar, "$1") : number || match
      );
    });
    return result;
  });

  function isPrototype(value) {
    var Ctor = value && value.constructor,
      proto = (typeof Ctor == "function" && Ctor.prototype) || Object.prototype;
    return value === proto;
  }

  /**
   * Creates an array of the own enumerable property names of object.
   */
  export function keys(object?: any): string[] {
    if (!isPrototype(object)) {
      return Object.keys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }

  function toString(value): string {
    return value == null ? "" : baseToString(value);
  }

  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == "string") {
      return value;
    }
    if (Array.isArray(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return arrayMap(value, baseToString) + ""; // TODO : make it with native Array.map
    }

    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }

  function arrayMap(array, iteratee) {
    var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  /**
   * Checks if value is classified as a Number primitive or object.
   */
  export function isNumber(value): value is number {
    return (
      typeof value == "number" ||
      (isObjectLike(value) && baseGetTag(value) == numberTag)
    );
  }

  /**
   * Checks if value is classified as a String primitive or object.
   */
  export function isString(value): value is string {
    return (
      typeof value == "string" ||
      (!Array.isArray(value) &&
        isObjectLike(value) &&
        baseGetTag(value) == stringTag)
    );
  }

  /**
   * Checks if value is the language type of Object. (e.g. arrays, functions, objects, regexes, new Number(0),
   * and new String(''))
   */
  export function isObject(value: any): boolean {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }

  /**
   * Checks if value is a plain object, that is, an object created by the Object constructor or one with a
   * [[Prototype]] of null.
   */
  export function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return (
      typeof Ctor == "function" &&
      Ctor instanceof Ctor &&
      funcToString.call(Ctor) == objectCtorString
    );
  }

  /**
   * Checks if value is classified as a RegExp object.
   */
  export function isRegExp(value): value is RegExp {
    return isObjectLike(value) && baseGetTag(value) == regexpTag;
  }
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /**
   * Checks if value is empty. A value is considered empty unless it’s an arguments object, array, string, or
   * jQuery-like collection with a length greater than 0 or an object with own enumerable properties.
   */
  export function isEmpty(value) {
    if (value == null) {
      return true;
    }
    if (
      isArrayLike(value) &&
      (Array.isArray(value) ||
        typeof value == "string" ||
        typeof value.splice == "function" ||
        isArguments(value))
    ) {
      return !value.length;
    }
    var tag = baseGetTag(value);
    if (tag == mapTag || tag == setTag) {
      return !value.size;
    }
    if (isPrototype(value)) {
      return !keys(value).length;
    }
    for (var key in value) {
      if (hasOwnProperty.call(value, key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if value is undefined.
   */
  export function isUndefined(value): value is undefined {
    return value === undefined;
  }

  /**
   * Checks if value is null.
   */
  export function isNull(value): value is null {
    return value === null;
  }

  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return nativeObjectToString.call(value);
  }

  function castPath(value, object) {
    if (Array.isArray(value)) {
      return value;
    }
    return isKey(value, object) ? [value] : stringToPath(toString(value));
  }

  function isKey(value, object?: any) {
    if (Array.isArray(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "boolean" || value == null) {
      return true;
    }
    return (
      reIsPlainProp.test(value) ||
      !reIsDeepProp.test(value) ||
      (object != null && value in Object(object))
    );
  }
  function toKey(value) {
    if (typeof value == "string") {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }

  /**
   * This method is like _.get except that if the resolved value is a function it’s invoked with the this binding
   * of its parent object and its result is returned.
   */
  export function result<TResult>(
    object: any,
    path: PropertyPath,
    defaultValue?: TResult | ((...args: any[]) => TResult)
  ): TResult {
    path = castPath(path, object);

    var index = -1,
      length = path.length;

    // Ensure the loop is entered when path is empty.
    if (!length) {
      length = 1;
      object = undefined;
    }
    while (++index < length) {
      var value = object == null ? undefined : object[toKey(path[index])];
      if (value === undefined) {
        index = length;
        value = defaultValue;
      }
      object = isFunction(value) ? value.call(object) : value;
    }
    return object;
  }

  function baseFor(object, iteratee, keysFunc) {
    var index = -1,
      iterable = Object(object),
      props = keysFunc(object),
      length = props.length;

    while (length--) {
      var key = props[++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  }

  function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
    eachFunc(collection, function (value, index, collection) {
      accumulator = initAccum
        ? ((initAccum = false), value)
        : iteratee(accumulator, value, index, collection);
    });
    return accumulator;
  }

  const baseEach = createBaseEach(baseForOwn);

  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }

  function createBaseEach(eachFunc) {
    return function (collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      return eachFunc(collection, iteratee);
    };
  }

  function identity(value) {
    return value;
  }

  function getMatchData(object) {
    var result: any[] = keys(object),
      length = result.length;

    while (length--) {
      var key = result[length],
        value = object[key];

      result[length] = [key, value, isStrictComparable(value)];
    }
    return result;
  }

  function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }
    return function (object) {
      return object === source || baseIsMatch(object, source, matchData);
    };
  }

  function baseIsMatch(object, source, matchData, customizer?: any) {
    var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

    if (object == null) {
      return !length;
    }
    object = Object(object);
    while (index--) {
      var data = matchData[index];
      if (
        noCustomizer && data[2]
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
      ) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0],
        objValue = object[key],
        srcValue = data[1];

      if (noCustomizer && data[2]) {
        if (objValue === undefined && !(key in object)) {
          return false;
        }
      } else {
        var stack = new Stack();
        if (customizer) {
          var result = customizer(
            objValue,
            srcValue,
            key,
            object,
            source,
            stack
          );
        }
        if (
          !(result === undefined
            ? baseIsEqual(
                srcValue,
                objValue,
                COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG,
                customizer,
                stack
              )
            : result)
        ) {
          return false;
        }
      }
    }
    return true;
  }

  function baseMatchesProperty(path, srcValue) {
    if (isKey(path) && isStrictComparable(srcValue)) {
      return matchesStrictComparable(toKey(path), srcValue);
    }
    return function (object) {
      var objValue = get(object, path);
      return objValue === undefined && objValue === srcValue
        ? hasIn(object, path)
        : baseIsEqual(
            srcValue,
            objValue,
            COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG
          );
    };
  }
  function hasIn(object, path) {
    return object != null && hasPath(object, path, baseHasIn);
  }
  function baseHasIn(object, key) {
    return object != null && key in Object(object);
  }
  function hasPath(object, path, hasFunc) {
    path = castPath(path, object);

    var index = -1,
      length = path.length,
      result = false;

    while (++index < length) {
      var key = toKey(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object == null ? 0 : object.length;
    return (
      !!length &&
      isLength(length) &&
      isIndex(key, length) &&
      (Array.isArray(object) || isArguments(object))
    );
  }

  function baseIsEqual(
    value,
    other,
    bitmask?: any,
    customizer?: any,
    stack?: any
  ) {
    if (value === other) {
      return true;
    }
    if (
      value == null ||
      other == null ||
      (!isObjectLike(value) && !isObjectLike(other))
    ) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(
      value,
      other,
      bitmask,
      customizer,
      baseIsEqual,
      stack
    );
  }
  function baseIsEqualDeep(
    object,
    other,
    bitmask,
    customizer,
    equalFunc,
    stack
  ) {
    var objIsArr = Array.isArray(object),
      othIsArr = Array.isArray(other),
      objTag = objIsArr ? arrayTag : baseGetTag(object),
      othTag = othIsArr ? arrayTag : baseGetTag(other);

    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;

    var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack());
      return equalByTag(
        object,
        other,
        objTag,
        bitmask,
        customizer,
        equalFunc,
        stack
      );
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");

      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

        stack || (stack = new Stack());
        return equalFunc(
          objUnwrapped,
          othUnwrapped,
          bitmask,
          customizer,
          stack
        );
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack());
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }

  function equalByTag(
    object,
    other,
    tag,
    bitmask,
    customizer,
    equalFunc,
    stack
  ) {
    switch (tag) {
      case boolTag:
      case dateTag:
      case numberTag:
        // Coerce booleans to `1` or `0` and dates to milliseconds.
        // Invalid dates are coerced to `NaN`.
        return eq(+object, +other);

      case errorTag:
        return object.name == other.name && object.message == other.message;

      case regexpTag:
      case stringTag:
        // Coerce regexes to strings and treat strings, primitives and objects,
        // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
        // for more details.
        return object == other + "";
    }

    return false;
  }
  function equalObjects(obj, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(obj),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
        return false;
      }
    }
    // Assume cyclic values are equal.
    var stacked = stack.get(obj);
    if (stacked && stack.get(other)) {
      return stacked == other;
    }
    var result = true;
    stack.set(obj, other);
    stack.set(other, obj);

    var skipCtor: boolean | number = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = obj[key],
        othValue = other[key];

      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, objValue, key, other, obj, stack)
          : customizer(objValue, othValue, key, obj, other, stack);
      }
      // Recursively compare objects (susceptible to call stack limits).
      if (
        !(compared === undefined
          ? objValue === othValue ||
            equalFunc(objValue, othValue, bitmask, customizer, stack)
          : compared)
      ) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
      var objCtor = obj.constructor,
        othCtor = other.constructor;

      // Non `Object` object instances with different constructors are not equal.
      if (
        objCtor != othCtor &&
        "constructor" in obj &&
        "constructor" in other &&
        !(
          typeof objCtor == "function" &&
          objCtor instanceof objCtor &&
          typeof othCtor == "function" &&
          othCtor instanceof othCtor
        )
      ) {
        result = false;
      }
    }
    stack["delete"](obj);
    stack["delete"](other);
    return result;
  }

  function getAllKeys(obj) {
    return keys(obj);
  }

  function isStrictComparable(value) {
    return value === value && !isObject(value);
  }

  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  function isLength(value): boolean {
    return (
      typeof value == "number" &&
      value > -1 &&
      value % 1 == 0 &&
      value <= MAX_SAFE_INTEGER
    );
  }
  function isIndex(value, length?: number) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;

    return (
      !!length &&
      (type == "number" || (type != "symbol" && reIsUint.test(value))) &&
      value > -1 &&
      value % 1 == 0 &&
      value < length
    );
  }
  var isArguments = baseIsArguments(
    (function () {
      return arguments;
    })()
  )
    ? baseIsArguments
    : function (value) {
        return (
          isObjectLike(value) &&
          hasOwnProperty.call(value, "callee") &&
          !propertyIsEnumerable.call(value, "callee")
        );
      };
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }

  function matchesStrictComparable(key, srcValue) {
    return function (object) {
      if (object == null) {
        return false;
      }
      return (
        object[key] === srcValue &&
        (srcValue !== undefined || key in Object(object))
      );
    };
  }

  function baseIteratee(value, ...args) {
    // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
    // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
    if (typeof value == "function") {
      return value;
    }
    if (value == null) {
      return identity;
    }
    if (typeof value == "object") {
      return Array.isArray(value)
        ? baseMatchesProperty(value[0], value[1])
        : baseMatches(value);
    }
    return property(value);
  }

  /**
   * Creates a function that invokes `func` with the arguments of the created
   * function. If `func` is a property name, the created function returns the
   * property value for a given element. If `func` is an array or object, the
   * created function returns `true` for elements that contain the equivalent
   * source properties, otherwise it returns `false`.
   *
   * @param {*} [func=_.identity] The value to convert to a callback.
   * @returns {Function} Returns the callback.
   *
   */
  export function iteratee(func: any): Function {
    return baseIteratee(
      typeof func == "function" ? func : baseClone(func, CLONE_DEEP_FLAG)
    );
  }

  function property(path) {
    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
  }
  function baseProperty(key) {
    return function (object) {
      return object == null ? undefined : object[key];
    };
  }
  function basePropertyDeep(path) {
    return function (object) {
      return baseGet(object, path);
    };
  }
  function baseGet(object, path) {
    path = castPath(path, object);

    var index = 0,
      length = path.length;

    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return index && index == length ? object : undefined;
  }

  /**
   * Gets the value at `path` of `object`. If the resolved value is
   * `undefined`, the `defaultValue` is returned in its place.
   *
   * @example
   *
   * const object = { 'a': [{ 'b': { 'c': 3 } }] }
   *
   * get(object, 'a[0].b.c')
   * // => 3
   *
   * get(object, ['a', '0', 'b', 'c'])
   * // => 3
   *
   * get(object, 'a.b.c', 'default')
   * // => 'default'
   */
  export function get(
    object: any,
    path: string | string[],
    defaultValue?: undefined
  ) {
    const result = object == null ? undefined : baseGet(object, path);
    return result === undefined ? defaultValue : result;
  }

  /**
   * Reduces a collection to a value which is the accumulated result of running each
   * element in the collection through the callback, where each successive callback execution
   * consumes the return value of the previous execution. If accumulator is not provided the
   * first element of the collection will be used as the initial accumulator value. The callback
   * is invoked with four arguments: (accumulator, value, index|key, collection).
   */
  export function reduce<T extends object>(
    collection: T | null | undefined,
    callback: MemoObjectIterator<T[keyof T], T[keyof T], T>
  ): T[keyof T] | undefined;
  export function reduce<T extends object, TResult>(
    collection: T | null | undefined,
    callback: MemoObjectIterator<T[keyof T], TResult, T>,
    accumulator: TResult
  ): TResult;
  export function reduce<T extends object, TResult>(
    collection: T,
    iteratee: MemoObjectIterator<T[keyof T], T[keyof T], T>,
    accumulator?: TResult
  ) {
    const initAccum = arguments.length < 3;
    return baseReduce(
      collection,
      baseIteratee(iteratee, 4),
      accumulator,
      initAccum,
      baseEach
    );
  }

  function parent(object, path) {
    return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
  }
  function baseSlice(array, start, end) {
    var index = -1,
      length = array.length;

    if (start < 0) {
      start = -start > length ? 0 : length + start;
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : (end - start) >>> 0;
    start >>>= 0;

    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }
  function last(array) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
  }
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);
      case 1:
        return func.call(thisArg, args[0]);
      case 2:
        return func.call(thisArg, args[0], args[1]);
      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  function baseInvoke(object, path, args) {
    path = castPath(path, object);
    object = parent(object, path);
    var func = object == null ? object : object[toKey(last(path))];
    return func == null ? undefined : apply(func, object, args);
  }

  var defineProperty = (function () {
    try {
      var func = getNative(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e) {}
  })();
  function shortOut(func): any {
    var count = 0,
      lastCalled = 0;

    return function () {
      var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(undefined, arguments);
    };
  }
  const baseSetToString = !defineProperty
    ? identity
    : function (func, string) {
        return defineProperty(func, "toString", {
          configurable: true,
          enumerable: false,
          value: constant(string),
          writable: true
        });
      };
  const setToString = shortOut(baseSetToString);

  function overRest(func, start, transform) {
    start = nativeMax(start === undefined ? func.length - 1 : start, 0);
    return function () {
      var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }

  function baseRest(func, start?: any) {
    return setToString(overRest(func, start, identity), func + "");
  }

  /**
   * Invokes the method at path of object.
   */
  export const invoke: (
    object: any,
    path: PropertyPath,
    ...args: any[]
  ) => any = baseRest(baseInvoke);

  /**
   * Invokes the method named by methodName on each element in the collection returning
   * an array of the results of each invoked method. Additional arguments will be provided
   * to each invoked method. If methodName is a function it will be invoked for, and this
   * bound to, each element in the collection.
   */
  export const invokeMap: (
    collection: object | null | undefined,
    methodName: string,
    ...args: any[]
  ) =>
    | any[]
    | (<TResult>(
        collection: object | null | undefined,
        method: (...args: any[]) => TResult,
        ...args: any[]
      ) => TResult[]) = baseRest(function (collection, path, args) {
    var index = -1,
      isFunc = typeof path == "function",
      result = isArrayLike(collection) ? Array(collection.length) : [];

    baseEach(collection, function (value) {
      result[++index] = isFunc
        ? apply(path, value, args)
        : baseInvoke(value, path, args);
    });
    return result;
  });

  function overArg(func, transform) {
    return function (arg) {
      return func(transform(arg));
    };
  }

  function arrayEach(array, iteratee) {
    var index = -1,
      length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  const baseCreate = (function () {
    function object() {}
    return function (proto) {
      if (!isObject(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object();
      object.prototype = undefined;
      return result;
    };
  })();

  function initCloneArray(array) {
    var length = array.length,
      result = new array.constructor(length);

    // Add properties assigned by `RegExp#exec`.
    if (
      length &&
      typeof array[0] == "string" &&
      hasOwnProperty.call(array, "index")
    ) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }
  function copyArray(source, array?: any[]) {
    var index = -1,
      length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }
  const getPrototype = overArg(Object.getPrototypeOf, Object);

  function baseAssignValue(object, key, value) {
    if (key == "__proto__" && defineProperty) {
      defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        value: value,
        writable: true
      });
    } else {
      object[key] = value;
    }
  }
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (
      !(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))
    ) {
      baseAssignValue(object, key, value);
    }
  }

  function baseTimes(n, iteratee) {
    var index = -1,
      result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  function arrayLikeKeys(value, inherited) {
    var isArr = Array.isArray(value),
      isArg = !isArr && isArguments(value),
      skipIndexes = isArr || isArg,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

    for (var key in value) {
      if (
        (inherited || hasOwnProperty.call(value, key)) &&
        !(
          skipIndexes &&
          // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == "length" ||
            // Skip index properties.
            isIndex(key, length))
        )
      ) {
        result.push(key);
      }
    }
    return result;
  }
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object),
      result = [];

    for (var key in object) {
      if (
        !(
          key == "constructor" &&
          (isProto || !hasOwnProperty.call(object, key))
        )
      ) {
        result.push(key);
      }
    }
    return result;
  }
  function keysIn(object) {
    return isArrayLike(object)
      ? arrayLikeKeys(object, true)
      : baseKeysIn(object);
  }

  function copyObject(source, props, object, customizer?: any) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
      length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }
  function baseAssignIn(object, source) {
    return object && copyObject(source, keysIn(source), object);
  }
  function baseAssign(object, source) {
    return object && copyObject(source, keys(source), object);
  }

  function getAllKeysIn(object) {
    return keysIn(object);
  }

  function initCloneObject(object) {
    return typeof object.constructor == "function" && !isPrototype(object)
      ? baseCreate(getPrototype(object))
      : {};
  }
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }
  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case boolTag:
      case dateTag:
        return new Ctor(+object);

      case mapTag:
        return new Ctor();

      case numberTag:
      case stringTag:
        return new Ctor(object);

      case regexpTag:
        return cloneRegExp(object);

      case setTag:
        return new Ctor();
    }
  }
  function baseClone(
    value,
    bitmask,
    customizer?: Function,
    key?: any,
    object?: {},
    stack?: any
  ) {
    var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

    if (customizer) {
      result = object
        ? customizer(value, key, object, stack)
        : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = Array.isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = baseGetTag(value),
        isFunc = tag == funcTag || tag == genTag;

      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        result = isFlat || isFunc ? {} : initCloneObject(value);
        if (!isDeep) {
          return isFlat
            ? baseAssignIn(result, value)
            : baseAssign(result, value);
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag(value, tag, isDeep);
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new Stack());
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    var keysFunc = isFull
      ? isFlat
        ? getAllKeysIn
        : getAllKeys
      : isFlat
      ? keysIn
      : keys;

    var props = isArr ? undefined : keysFunc(value);
    arrayEach(props || value, function (subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      // Recursively populate clone (susceptible to call stack limits).
      assignValue(
        result,
        key,
        baseClone(subValue, bitmask, customizer, key, value, stack)
      );
    });
    return result;
  }
  /**
   * Creates a shallow clone of value.
   */
  export function clone<T>(value: T): T {
    return baseClone(value, CLONE_SYMBOLS_FLAG);
  }

  /**
   * This method is like _.clone except that it recursively clones value.
   */
  export function cloneDeep<T>(value: T): T {
    return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
  }

  function baseHas(object, key) {
    return object != null && hasOwnProperty.call(object, key);
  }

  /**
   * Checks if `path` is a direct property of `object`.
   */
  export function has<T>(object: T, path: PropertyPath): boolean {
    return object != null && hasPath(object, path, baseHas);
  }

  function hasUnicode(string) {
    return reHasUnicode.test(string);
  }
  function unicodeToArray(string) {
    return string.match(reUnicode) || [];
  }
  function asciiToArray(string) {
    return string.split("");
  }
  function stringToArray(string) {
    return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
  }
  function mapToArray(map) {
    var index = -1,
      result = Array(map.size);

    map.forEach(function (value, key) {
      result[++index] = [key, value];
    });
    return result;
  }
  function setToArray(set) {
    var index = -1,
      result = Array(set.size);

    set.forEach(function (value) {
      result[++index] = value;
    });
    return result;
  }
  function baseValues(object, props) {
    return arrayMap(props, function (key) {
      return object[key];
    });
  }
  function values(object) {
    return object == null ? [] : baseValues(object, keys(object));
  }

  /**
   * Converts value to an array.
   */
  export function toArray<T>(
    value?:
      | List<T>
      | T
      | Dictionary<T>
      | NumericDictionary<T>
      | null
      | undefined
  ): typeof value extends
    | List<T>
    | Dictionary<T>
    | NumericDictionary<T>
    | null
    | undefined
    ? T[]
    : typeof value extends T
    ? Array<T[keyof T]>
    : any[] {
    if (!value) {
      return [];
    }
    if (isArrayLike(value)) {
      return isString(value) ? stringToArray(value) : copyArray(value);
    }

    var tag = baseGetTag(value),
      func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;

    return func(value);
  }

  function flatRest(func) {
    return setToString(overRest(func, undefined, flatten), func + "");
  }
  function flatten(array) {
    var length = array == null ? 0 : array.length;
    return length ? baseFlatten(array, 1) : [];
  }
  function arrayPush(array, values) {
    var index = -1,
      length = values.length,
      offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  function isFlattenable(value) {
    return Array.isArray(value) || isArguments(value);
  }
  function baseFlatten(
    array,
    depth,
    predicate?: any,
    isStrict?: boolean,
    result?: any
  ) {
    var index = -1,
      length = array.length;

    predicate || (predicate = isFlattenable);
    result || (result = []);

    while (++index < length) {
      var value = array[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          // Recursively flatten arrays (susceptible to call stack limits).
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }
  function baseSet(object, path, value, customizer?: any) {
    if (!isObject(object)) {
      return object;
    }
    path = castPath(path, object);

    var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

    while (nested != null && ++index < length) {
      var key = toKey(path[index]),
        newValue = value;

      if (index != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : undefined;
        if (newValue === undefined) {
          newValue = isObject(objValue)
            ? objValue
            : isIndex(path[index + 1])
            ? []
            : {};
        }
      }
      assignValue(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  }

  /**
   * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
   * it's created. Arrays are created for missing index properties while objects
   * are created for all other missing properties. Use `setWith` to customize
   * `path` creation.
   *
   * **Note:** This method mutates `object`.
   *
   * @example
   *
   * const object = { 'a': [{ 'b': { 'c': 3 } }] }
   *
   * set(object, 'a[0].b.c', 4)
   * console.log(object.a[0].b.c)
   * // => 4
   *
   * set(object, ['x', '0', 'y', 'z'], 5)
   * console.log(object.x[0].y.z)
   * // => 5
   */
  export function set(object: any, path: string | string[], value: any) {
    return object == null ? object : baseSet(object, path, value);
  }

  function basePickBy(object, paths, predicate) {
    var index = -1,
      length = paths.length,
      result = {};

    while (++index < length) {
      var path = paths[index],
        value = baseGet(object, path);

      if (predicate(value, path)) {
        baseSet(result, castPath(path, object), value);
      }
    }
    return result;
  }
  function basePick(object, paths) {
    return basePickBy(object, paths, function (value, path) {
      return hasIn(object, path);
    });
  }

  /**
   * Creates an object composed of the picked `object` properties.
   */
  export const pick:
    | (<T extends object, U extends keyof T>(
        object: T,
        ...props: Array<Many<U>>
      ) => Pick<T, U>)
    | (<T>(
        object: T | null | undefined,
        ...props: PropertyPath[]
      ) => PartialDeep<T>) = flatRest(function (object, paths) {
    return object == null ? {} : basePick(object, paths);
  });

  function baseFindKey(collection, predicate, eachFunc) {
    var result;
    eachFunc(collection, function (value, key, collection) {
      if (predicate(value, key, collection)) {
        result = key;
        return false;
      }
    });
    return result;
  }

  /**
   * This method is like _.find except that it returns the key of the first element predicate returns truthy for
   * instead of the element itself.
   *
   * @param object The object to search.
   * @param predicate The function invoked per iteration.
   * @return Returns the key of the matched element, else undefined.
   */
  export function findKey<T>(
    object: T | null | undefined,
    predicate?: ObjectIteratee<T>
  ): string | undefined {
    return baseFindKey(object, baseIteratee(predicate, 3), baseForOwn);
  }

  function createInverter(setter, toIteratee) {
    return function (object, iteratee?: any) {
      return baseInverter(object, setter, toIteratee(iteratee), {});
    };
  }
  function baseInverter(object, setter, iteratee, accumulator) {
    baseForOwn(object, function (value, key, object) {
      setter(accumulator, iteratee(value), key, object);
    });
    return accumulator;
  }

  // INVERT FUNCTION

  /**
   * Creates an object composed of the inverted keys and values of object. If object contains duplicate values,
   * subsequent values overwrite property assignments of previous values unless multiValue is true.
   */
  //  invert(object: object): Dictionary<string>;
  export const invert: (object: object) => Dictionary<string> = createInverter(
    function (result, value, key) {
      if (value != null && typeof value.toString != "function") {
        value = nativeObjectToString.call(value);
      }

      result[value] = key;
    },
    constant(identity)
  );

  function toNumber(value) {
    if (typeof value == "number") {
      return value;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == "function" ? value.valueOf() : value;
      value = isObject(other) ? other + "" : other;
    }
    if (typeof value != "string") {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, "");
    var isBinary = reIsBinary.test(value);
    return isBinary || reIsOctal.test(value)
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : reIsBadHex.test(value)
      ? NAN
      : +value;
  }
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = value < 0 ? -1 : 1;
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }
  function toInteger(value) {
    var result = toFinite(value),
      remainder = result % 1;

    return result === result ? (remainder ? result - remainder : result) : 0;
  }

  /**
   * Creates a slice of array with n elements dropped from the end.
   */
  export function dropRight<T>(
    array: ArrayLike<T> | null | undefined,
    n?: number,
    guard?: any
  ): T[] {
    var length = array == null ? 0 : array.length;
    if (!length) {
      return [];
    }
    n = guard || n === undefined ? 1 : toInteger(n);
    n = length - n;
    return baseSlice(array, 0, n < 0 ? 0 : n);
  }

  /**
   * Creates a function that performs a deep comparison between a given object and source, returning true if the
   * given object has equivalent property values, else false.
   */
  export function matches<T>(source: T): (value: any) => boolean {
    return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
  }

  var now = function () {
    return Date.now();
  };
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options
  ): T & Cancelable {
    var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = "maxWait" in options;
      maxWait = maxing
        ? nativeMax(toNumber(options.maxWait) || 0, wait)
        : maxWait;
      trailing = "trailing" in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
        thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

      return maxing
        ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (
        lastCallTime === undefined ||
        timeSinceLastCall >= wait ||
        timeSinceLastCall < 0 ||
        (maxing && timeSinceLastInvoke >= maxWait)
      );
    }

    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now());
    }

    function debounced(): T & Cancelable {
      var time = now(),
        isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced as T & Cancelable;
  }
  /**
   * Creates a throttled function that only invokes func at most once per every wait milliseconds. The throttled
   * function comes with a cancel method to cancel delayed invocations and a flush method to immediately invoke
   * them. Provide an options object to indicate that func should be invoked on the leading and/or trailing edge
   * of the wait timeout. Subsequent calls to the throttled function return the result of the last func call.
   *
   * Note: If leading and trailing options are true, func is invoked on the trailing edge of the timeout only if
   * the the throttled function is invoked more than once during the wait timeout.
   *
   * @param func The function to throttle.
   * @param wait The number of milliseconds to throttle invocations to.
   * @param options The options object.
   * @param options.leading Specify invoking on the leading edge of the timeout.
   * @param options.trailing Specify invoking on the trailing edge of the timeout.
   * @return Returns the new throttled function.
   */
  export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: ThrottleSettings
  ): T & Cancelable {
    var leading = true,
      trailing = true;

    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    if (isObject(options)) {
      leading = "leading" in options ? !!options.leading : leading;
      trailing = "trailing" in options ? !!options.trailing : trailing;
    }
    return debounce(func, wait, {
      leading: leading,
      maxWait: wait,
      trailing: trailing
    });
  }

  function baseDelay(func, wait, args) {
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    return setTimeout(function () {
      func.apply(undefined, args);
    }, wait);
  }

  /**
   * Invokes func after wait milliseconds. Any additional arguments are provided to func when it’s invoked.
   */
  export const delay: (
    func: (...args: any[]) => any,
    wait: number,
    ...args: any[]
  ) => number = baseRest(function (func, wait, args) {
    return baseDelay(func, toNumber(wait) || 0, args);
  });

  function before(n, func): typeof func {
    var result;
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    n = toInteger(n);
    return function () {
      if (--n > 0) {
        result = func.apply(this, arguments);
      }
      if (n <= 1) {
        func = undefined;
      }
      return result;
    };
  }

  /**
   * Creates a function that is restricted to invoking func once. Repeat calls to the function return the value
   * of the first call. The func is invoked with the this binding and arguments of the created function.
   */
  export function once<T extends AnyFunction>(func: T): T {
    return before(2, func);
  }

  function baseRandom(lower, upper) {
    return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
  }
  function arrayShuffle(array) {
    return shuffleSelf(copyArray(array));
  }
  function shuffleSelf(array, size?: number) {
    var index = -1,
      length = array.length,
      lastIndex = length - 1;

    size = size === undefined ? length : size;
    while (++index < size) {
      var rand = baseRandom(index, lastIndex),
        value = array[rand];

      array[rand] = array[index];
      array[index] = value;
    }
    array.length = size;
    return array;
  }
  function baseShuffle(collection) {
    return shuffleSelf(values(collection));
  }

  /**
   * Creates an array of shuffled values, using a version of the Fisher-Yates shuffle.
   */
  export function shuffle<T>(collection: List<T> | null | undefined): T[];
  export function shuffle<T extends object>(
    collection: T | null | undefined
  ): Array<T[keyof T]>;
  export function shuffle(collection) {
    var func = Array.isArray(collection) ? arrayShuffle : baseShuffle;
    return func(collection);
  }

  function arrayAggregator(array, setter, iteratee, accumulator) {
    var index = -1,
      length = array == null ? 0 : array.length;

    while (++index < length) {
      var value = array[index];
      setter(accumulator, value, iteratee(value), array);
    }
    return accumulator;
  }
  function baseAggregator(collection, setter, iteratee, accumulator) {
    baseEach(collection, function (value, key, collection) {
      setter(accumulator, value, iteratee(value), collection);
    });
    return accumulator;
  }
  function createAggregator(setter, initializer?: any) {
    return function (collection, iteratee) {
      var func = Array.isArray(collection) ? arrayAggregator : baseAggregator,
        accumulator = initializer ? initializer() : {};

      return func(collection, setter, baseIteratee(iteratee, 2), accumulator);
    };
  }

  /**
   * Creates an object composed of keys generated from the results of running each element of collection through
   * iteratee. The corresponding value of each key is an array of the elements responsible for generating the
   * key. The iteratee is invoked with one argument: (value).
   */
  export const groupBy:
    | (<T>(
        collection: List<T> | null | undefined,
        iteratee?: ValueIteratee<T>
      ) => Dictionary<T[]>)
    | (<T extends object>(
        collection: T | null | undefined,
        iteratee?: ValueIteratee<T[keyof T]>
      ) => Dictionary<Array<T[keyof T]>>) = createAggregator(function (
    result,
    value,
    key
  ) {
    if (hasOwnProperty.call(result, key)) {
      result[key].push(value);
    } else {
      baseAssignValue(result, key, [value]);
    }
  });

  function castFunction(value) {
    return typeof value == "function" ? value : identity;
  }

  /**
   * Iterates over elements of collection invoking iteratee for each element. The iteratee is invoked with three arguments:
   * (value, index|key, collection). Iteratee functions may exit iteration early by explicitly returning false.
   */
  export function each<T>(
    collection: List<T>,
    iteratee?: ListIterator<T, any>
  ): List<T>;
  export function each<T extends object>(
    collection: T,
    iteratee?: ObjectIterator<T, any>
  ): T;
  export function each(object, iteratee) {
    return baseEach(object, castFunction(iteratee));
  }

  /**
   * Performs a deep comparison between two values to determine if they are
   * equivalent.
   */
  export function isEqual(value, other) {
    return baseIsEqual(value, other);
  }

  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (
      type == "number"
        ? isArrayLike(object) && isIndex(index, object.length)
        : type == "string" && index in object
    ) {
      return eq(object[index], value);
    }
    return false;
  }

  /**
   * Assigns own enumerable properties of source object(s) to the destination object for all destination
   * properties that resolve to undefined. Once a property is set, additional values of the same property are
   * ignored.
   */
  export function defaults<TObject, TSource>(
    object: TObject,
    source: TSource
  ): TSource & TObject;
  export function defaults<TObject, TSource1, TSource2>(
    object: TObject,
    source1: TSource1,
    source2: TSource2
  ): TSource2 & TSource1 & TObject;
  export function defaults<TObject, TSource1, TSource2, TSource3>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3
  ): TSource3 & TSource2 & TSource1 & TObject;
  export function defaults<TObject, TSource1, TSource2, TSource3, TSource4>(
    object: TObject,
    source1: TSource1,
    source2: TSource2,
    source3: TSource3,
    source4: TSource4
  ): TSource4 & TSource3 & TSource2 & TSource1 & TObject;
  export function defaults<TObject>(object: TObject): TObject;
  export function defaults(object: any, ...sources: any[]): any;
  export function defaults() {
    return baseRest(function (object, sources) {
      object = Object(object);

      var index = -1;
      var length = sources.length;
      var guard = length > 2 ? sources[2] : undefined;

      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        length = 1;
      }

      while (++index < length) {
        var source = sources[index];
        var props = keysIn(source);
        var propsIndex = -1;
        var propsLength = props.length;

        while (++propsIndex < propsLength) {
          var key = props[propsIndex];
          var value = object[key];

          if (
            value === undefined ||
            (eq(value, Object.prototype[key]) &&
              !hasOwnProperty.call(object, key))
          ) {
            object[key] = source[key];
          }
        }
      }

      return object;
    });
  }

  /**
   * Creates an object composed of keys generated from the results of running each element of collection through
   * iteratee. The corresponding value of each key is the number of times the key was returned by iteratee. The
   * iteratee is invoked with one argument: (value).
   */
  export const countBy: <T extends object>(
    collection: T | null | undefined,
    iteratee?: ValueIteratee<T[keyof T]>
  ) => Dictionary<number> = createAggregator(function (result, value, key) {
    if (hasOwnProperty.call(result, key)) {
      ++result[key];
    } else {
      baseAssignValue(result, key, 1);
    }
  });

  function arraySample(array) {
    var length = array.length;
    return length ? array[baseRandom(0, length - 1)] : undefined;
  }
  function baseSample(collection) {
    return arraySample(values(collection));
  }

  /**
   * Gets a random element from collection.
   */
  export function sample<T>(
    collection:
      | List<T>
      | Dictionary<T>
      | NumericDictionary<T>
      | null
      | undefined
  ): T | undefined;
  export function sample<T extends object>(
    collection: T | null | undefined
  ): T[keyof T] | undefined;
  export function sample(collection) {
    var func = Array.isArray(collection) ? arraySample : baseSample;
    return func(collection);
  }

  function baseUnary(func) {
    return function (value) {
      return func(value);
    };
  }
  function baseMap(collection, iteratee) {
    var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

    baseEach(collection, function (value, key, collection) {
      result[++index] = iteratee(value, key, collection);
    });
    return result;
  }
  function baseSortBy(array, comparer) {
    var length = array.length;

    array.sort(comparer);
    while (length--) {
      array[length] = array[length].value;
    }
    return array;
  }
  function compareAscending(value, other) {
    if (value !== other) {
      var valIsDefined = value !== undefined,
        valIsNull = value === null,
        valIsReflexive = value === value;

      var othIsDefined = other !== undefined,
        othIsNull = other === null,
        othIsReflexive = other === other;

      if (
        (!othIsNull && value > other) ||
        (othIsDefined && othIsReflexive && !othIsNull) ||
        (valIsNull && othIsDefined && othIsReflexive) ||
        (!valIsDefined && othIsReflexive) ||
        !valIsReflexive
      ) {
        return 1;
      }
      if (
        (!valIsNull && value < other) ||
        (valIsDefined && valIsReflexive && !valIsNull) ||
        (othIsNull && valIsDefined && valIsReflexive) ||
        (!othIsDefined && valIsReflexive) ||
        !othIsReflexive
      ) {
        return -1;
      }
    }
    return 0;
  }
  function compareMultiple(object, other, orders) {
    var index = -1,
      objCriteria = object.criteria,
      othCriteria = other.criteria,
      length = objCriteria.length,
      ordersLength = orders.length;

    while (++index < length) {
      var result = compareAscending(objCriteria[index], othCriteria[index]);
      if (result) {
        if (index >= ordersLength) {
          return result;
        }
        var order = orders[index];
        return result * (order == "desc" ? -1 : 1);
      }
    }
    return object.index - other.index;
  }
  function baseOrderBy(collection, iteratees, orders) {
    var index = -1;
    iteratees = arrayMap(
      iteratees.length ? iteratees : [identity],
      baseUnary(baseIteratee)
    );

    var result = baseMap(collection, function (value, key, collection) {
      var criteria = arrayMap(iteratees, function (iteratee) {
        return iteratee(value);
      });
      return { criteria: criteria, index: ++index, value: value };
    });

    return baseSortBy(result, function (object, other) {
      return compareMultiple(object, other, orders);
    });
  }

  /**
   * Creates an array of elements, sorted in ascending order by the results of
   * running each element in a collection through each iteratee. This method
   * performs a stable sort, that is, it preserves the original sort order of
   * equal elements. The iteratees are invoked with one argument: (value).
   */
  export function sortBy<T>(
    collection: List<T> | null | undefined,
    ...iteratees: Array<Many<ListIteratee<T>>>
  ): T[];

  export function sortBy<T extends object>(
    collection: T | null | undefined,
    ...iteratees: Array<Many<ObjectIteratee<T>>>
  ): Array<T[keyof T]>;

  export function sortBy() {
    return baseRest((collection, iteratees) => {
      if (collection == null) {
        return [];
      }
      var length = iteratees.length;
      if (
        length > 1 &&
        isIterateeCall(collection, iteratees[0], iteratees[1])
      ) {
        iteratees = [];
      } else if (
        length > 2 &&
        isIterateeCall(iteratees[0], iteratees[1], iteratees[2])
      ) {
        iteratees = [iteratees[0]];
      }
      return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
    });
  }

  function cacheHas(cache, key) {
    return cache.has(key);
  }

  function baseIsNaN(value) {
    return value !== value;
  }
  function baseFindIndex(array, predicate, fromIndex, fromRight?: boolean) {
    var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

    while (fromRight ? index-- : ++index < length) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }
  function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1,
      length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }
  function baseIndexOf(array, value, fromIndex) {
    return value === value
      ? strictIndexOf(array, value, fromIndex)
      : baseFindIndex(array, baseIsNaN, fromIndex);
  }
  function arrayIncludes(array, value) {
    var length = array == null ? 0 : array.length;
    return !!length && baseIndexOf(array, value, 0) > -1;
  }
  function arrayIncludesWith(array, value, comparator) {
    var index = -1,
      length = array == null ? 0 : array.length;

    while (++index < length) {
      if (comparator(value, array[index])) {
        return true;
      }
    }
    return false;
  }
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }
  function baseDifference(array, values, iteratee?: any, comparator?: any) {
    var index = -1,
      includes: any = arrayIncludes,
      isCommon = true,
      length = array.length,
      result = [],
      valuesLength = values.length;

    if (!length) {
      return result;
    }
    if (iteratee) {
      values = arrayMap(values, baseUnary(iteratee));
    }
    if (comparator) {
      includes = arrayIncludesWith;
      isCommon = false;
    } else if (values.length >= LARGE_ARRAY_SIZE) {
      includes = cacheHas;
      isCommon = false;
      values = new SetCache(values);
    }
    outer: while (++index < length) {
      var value = array[index],
        computed = iteratee == null ? value : iteratee(value);

      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values[valuesIndex] === computed) {
            continue outer;
          }
        }
        result.push(value);
      } else if (!includes(values, computed, comparator)) {
        result.push(value);
      }
    }
    return result;
  }
  /**
   *
   * Creates an array excluding all provided values using SameValueZero for equality comparisons.
   */
  export const without: <T>(
    array: List<T> | null | undefined,
    ...values: T[]
  ) => T[] = baseRest(function (array, values) {
    return isArrayLikeObject(array) ? baseDifference(array, values) : [];
  });

  var idCounter = 0;

  /**
   * Generates a unique ID. If prefix is provided the ID is appended to it.
   */
  export function uniqueId(prefix?: string): string {
    var id = ++idCounter;
    return toString(prefix) + id;
  }

  export function noop() {
    // No operation performed.
  }

  export function mergeFunctions(funcs: AnyFunction[]) {
    return function (...args: any[]) {
      funcs.filter((fn) => !!fn).forEach((fn) => fn?.(...args));
    };
  }

  var createSet = !(Set && 1 / setToArray(new Set([, -0]))[1] == INFINITY)
    ? noop
    : function (values) {
        return new Set(values);
      };
  function baseUniq(array, iteratee?: any, comparator?: any) {
    var index = -1,
      includes: any = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen: any = result;

    if (comparator) {
      isCommon = false;
      includes = arrayIncludesWith;
    } else if (length >= LARGE_ARRAY_SIZE) {
      var set = iteratee ? null : createSet(array);
      if (set) {
        return setToArray(set);
      }
      isCommon = false;
      includes = cacheHas;
      seen = new SetCache();
    } else {
      seen = iteratee ? [] : result;
    }
    outer: while (++index < length) {
      var value = array[index],
        computed = iteratee ? iteratee(value) : value;

      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      } else if (!includes(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
    return result;
  }

  /**
   * Creates a duplicate-free version of an array, using
   * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * for equality comparisons, in which only the first occurrence of each element
   * is kept.
   */
  export function uniq<T>(array: List<T> | null | undefined): T[] {
    return array && array.length ? baseUniq(array) : [];
  }

  function unicodeSize(string) {
    var result = (reUnicode.lastIndex = 0);
    while (reUnicode.test(string)) {
      ++result;
    }
    return result;
  }
  const asciiSize = baseProperty("length");
  function stringSize(string) {
    return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
  }
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Gets the size of collection by returning its length for array-like values or the number of own enumerable
   * properties for objects.
   */
  export function size(
    collection:
      | object
      | Array<any>
      | Map<any, any>
      | Set<any>
      | string
      | null
      | undefined
  ): number {
    if (collection == null) {
      return 0;
    }
    if (isArrayLike(collection)) {
      return isString(collection)
        ? stringSize(collection)
        : (collection as Array<any>).length;
    }
    var tag = baseGetTag(collection);
    if (tag == mapTag || tag == setTag) {
      return (collection as Map<any, any> | Set<any>).size;
    }
    return baseKeys(collection).length;
  }

  function basePropertyOf(object) {
    return function (key) {
      return object == null ? undefined : object[key];
    };
  }

  const escapeHtmlChar = basePropertyOf(htmlEscapes);

  /**
   * Converts the characters "&", "<", ">", '"', "'", and "`" in string to their corresponding HTML entities.
   */
  export function escape(string?: string): string {
    string = toString(string);
    return string && reHasUnescapedHtml.test(string)
      ? string.replace(reUnescapedHtml, escapeHtmlChar)
      : string;
  }

  function baseUnset(object, path) {
    path = castPath(path, object);
    object = parent(object, path);
    return object == null || delete object[toKey(last(path))];
  }
  function customOmitClone(value) {
    return isPlainObject(value) ? undefined : value;
  }

  /**
   * The opposite of `_.pick`; this method creates an object composed of the
   * own and inherited enumerable properties of `object` that are not omitted.
   */
  export const omit:
    | (<T extends AnyKindOfDictionary>(
        object: T | null | undefined,
        ...paths: Array<Many<PropertyName>>
      ) => T)
    | (<T extends object, K extends keyof T>(
        object: T | null | undefined,
        ...paths: Array<Many<K>>
      ) => Omit<T, K>)
    | (<T extends object>(
        object: T | null | undefined,
        ...paths: Array<Many<PropertyName>>
      ) => PartialObject<T>) = flatRest(function (object, paths) {
    var result = {};
    if (object == null) {
      return result;
    }
    var isDeep = false;
    paths = arrayMap(paths, function (path) {
      path = castPath(path, object);
      isDeep || (isDeep = path.length > 1);
      return path;
    });
    copyObject(object, getAllKeysIn(object), result);
    if (isDeep) {
      result = baseClone(
        result,
        CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG,
        customOmitClone
      );
    }
    var length = paths.length;
    while (length--) {
      baseUnset(result, paths[length]);
    }
    return result;
  });
}
