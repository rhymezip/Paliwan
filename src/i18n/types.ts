export type Language = 'tk' | 'ru' | 'en';

/** A string in every supported language — used by static data. */
export type Localized = Record<Language, string>;

/** The shape of a dictionary with every leaf widened to `string`. */
export type DeepString<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly string[]
      ? string[]
      : DeepString<T[K]>;
};
