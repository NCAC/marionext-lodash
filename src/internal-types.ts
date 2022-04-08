import { Dictionary, NumericDictionary } from "@ncac/marionext-types";
export type Many<T> = T | ReadonlyArray<T>;

export type AnyKindOfDictionary =
  | Dictionary<{} | null | undefined>
  | NumericDictionary<{} | null | undefined>;

export type PartialDeep<T> = {
  [P in keyof T]?: PartialDeep<T[P]>;
};

export type GlobalPartial<T> = Partial<T>;

export type PartialObject<T> = GlobalPartial<T>;

export type NotVoid = {} | null | undefined;

export type PropertyName = string | number | symbol;

export type PropertyPath = Many<PropertyName>;

export type IterateeShorthand<T> =
  | PropertyName
  | [PropertyName, any]
  | PartialDeep<T>;

export type ListIteratee<T> = ListIterator<T, NotVoid> | IterateeShorthand<T>;

export type ObjectIteratee<TObject> =
  | ObjectIterator<TObject, NotVoid>
  | IterateeShorthand<TObject[keyof TObject]>;

export type ValueIteratee<T> = ((value: T) => NotVoid) | IterateeShorthand<T>;

export type List<T> = ArrayLike<T>;
export type ListIterator<T, TResult> = (
  value: T,
  index: number,
  collection: List<T>
) => TResult;

export type ObjectIterator<TObject, TResult> = (
  value: TObject[keyof TObject],
  key: string,
  collection: TObject
) => TResult;

export type MemoObjectIterator<T, TResult, TList> = (
  prev: TResult,
  curr: T,
  key: string,
  list: TList
) => TResult;

export interface ThrottleSettings {
  /**
   * If you'd like to disable the leading-edge call, pass this as false.
   */
  leading?: boolean;

  /**
   * If you'd like to disable the execution on the trailing-edge, pass false.
   */
  trailing?: boolean;
}

export interface Cancelable {
  cancel(): void;
  flush(): void;
}
