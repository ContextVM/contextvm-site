# File Summary

## Purpose

This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format

The content is organized as follows:

1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
   a. A header with the file path (## File: path/to/file)
   b. The full contents of the file in a code block

## Usage Guidelines

- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes

- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure

```
docs/
  examples/
    advanced-examples.svelte
    buttons.svelte
    index.mdx
    playground.svelte
  form/
    _extra-ui-options.ts
    _form-state.svelte
    _ui-schema-example.ts
    components.mdx
    fields-validation-mode.mdx
    merger.mdx
    options.mdx
    schema.mdx
    state.mdx
    theme.mdx
    translation.mdx
    ui-schema.mdx
    validator.mdx
  guides/
    async-validation.svelte
    controlled-form.svelte
    custom-components.mdx
    demo-schemas.ts
    errors-list.svelte
    fields-resolution.mdx
    fields-validation.svelte
    focus-on-first-error.svelte
    form-state.svelte
    form-value-type-inference-typebox.ts
    form-value-type-inference.mdx
    form-value-type-inference.ts
    icons-demo.svelte
    icons.svelte
    labels-and-icons.mdx
    live-validation.svelte
    manual-mode.mdx
    manual-mode.svelte
    multiple-forms.mdx
    multiple-forms.svelte
    prevent-page-reload.mdx
    prevent-page-reload.svelte
    programmatic-control.mdx
    programmatic-control.svelte
    quickstart.mdx
    reusable-defaults.mdx
    simple-setup.svelte
    state-transformation.mdx
    ui-schema.svelte
    validation.mdx
  themes/
    basic/
      form.svelte
      ui-options.ts
    shadcn4/
      form.svelte
      ui-options.ts
    basic.mdx
    shadcn4.mdx
  _on-submit.ts
  _schema.ts
  _theme-form.svelte
  _validator.ts
  _with-basic.svelte
  _with-shadcn4.svelte
  index.mdx
examples/
  basic-starter/
    src/
      lib/
        form-defaults.ts
      routes/
        +page.svelte
      app.d.ts
      app.html
    .gitignore
    .npmrc
    package.json
    svelte.config.js
    tsconfig.json
    vite.config.ts
  shadcn4-starter/
    src/
      lib/
        form-defaults.ts
        utils.ts
      routes/
        +layout.svelte
        +page.svelte
      app.css
      app.d.ts
      app.html
    .gitignore
    .npmrc
    components.json
    package.json
    svelte.config.js
    tsconfig.json
    vite.config.ts
```

# Files

## File: docs/examples/advanced-examples.svelte

```
<script lang="ts">
  import { identity } from "@sjsf/form/lib/function";

  import {
    ACTUAL_THEMES,
    EXAMPLES,
    THEME_TITLES,
    VALIDATORS,
    type ActualTheme,
    type Validator,
  } from "@/shared";
  import { openProject, Platform, PLATFORMS } from "@/web-ide";

  import Buttons from "./buttons.svelte";

  let platform: Platform = $state.raw(Platform.StackBlitz);
  let theme: ActualTheme = $state.raw("basic");
  let validator: Validator = $state.raw("ajv8");
</script>

<div class="pickers">
  <button style="display: none;">Avoid starlight styles pollution</button>
  <label>
    <span>Platform</span>
    <select bind:value={platform}>
      {#each PLATFORMS as v (v)}
        <option value={v}>
          {v}
        </option>
      {/each}
    </select>
  </label>
  <label>
    <span>Validator</span>
    <select bind:value={validator}>
      {#each VALIDATORS as v (v)}
        <option value={v}>
          {v}
        </option>
      {/each}
    </select>
  </label>
  <label>
    <span>Theme</span>
    <select bind:value={theme}>
      {#each ACTUAL_THEMES as t (t)}
        <option value={t}>
          {THEME_TITLES[t]}
        </option>
      {/each}
    </select>
  </label>
</div>

<Buttons
  items={EXAMPLES}
  onClick={(example) => {
    openProject({
      platform,
      example,
      theme,
      validator,
    });
  }}
  label={identity}
/>

<style>
  .pickers {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: 1fr;
    column-gap: 2rem;
    & select {
      width: 100%;
      background-color: var(--sl-color-bg);
      padding: 0.5rem;
      border-radius: 0.5rem;
      color: inherit;
      /* appearance: none; */
    }
  }
</style>
```

## File: docs/examples/buttons.svelte

```
<script lang="ts" generics="T">
  interface Props {
    items: T[];
    onClick: (item: T) => void;
    label: (item: T) => string;
  }

  const { items, onClick, label }: Props = $props();
</script>

<div class="buttons">
  <button style="display: none;">Avoid starlight styles pollution</button>
  {#each items as item (item)}
    <button class="button" onclick={() => onClick(item)}>
      {label(item)}
    </button>
  {/each}
</div>

<style>
  .buttons {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 0.5rem;
  }
  .button {
    min-width: fit-content;
    appearance: none;
    cursor: pointer;
    text-align: center;
    user-select: none;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    display: inline-flex;
    padding-inline: 1.25rem;
    padding-block: 0.15rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 2rem;
    background-color: var(--sl-color-bg);
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    /* box-shadow: var(--sl-shadow-md); */
    &:hover, &:focus {
      background-color: var(--sl-color-gray-5);
      border-color: var(--sl-color-text-accent);
    }
  }
</style>
```

## File: docs/examples/index.mdx

```
---
title: Examples
---

import Playground from './playground.svelte'
import AdvancedExamples from './advanced-examples.svelte'

## Playground

You can familiarize yourself with the capabilities of the form
using prepared examples of JSON and UI schemas on our playground

<Playground client:load />

## Online Code Editor

We have also prepared advanced examples revealing the possibilities
of customization and adaptation for different scenarios

<AdvancedExamples client:load />
```

## File: docs/examples/playground.svelte

```
<script lang="ts">
  import lz from "lz-string";
  import { PLAYGROUND_LINK } from "@/i18n";

  import Buttons from "./buttons.svelte";

  const samples = import.meta.glob("apps/playground2/src/samples/*.ts", {
    eager: false,
    import: "default",
  });
</script>

<Buttons
  items={Object.keys(samples)}
  onClick={async (key) => {
    const sample = await samples[key]();
    window.open(
      `${PLAYGROUND_LINK}#${lz.compressToEncodedURIComponent(JSON.stringify(sample))}`
    );
  }}
  label={(key) => key.substring(27, key.length - 3)}
/>
```

## File: docs/form/\_extra-ui-options.ts

```typescript
import { fromRecord } from '@sjsf/form/lib/resolver';
import { createForm } from '@sjsf/form';
```

## File: docs/form/\_form-state.svelte

```
<script lang="ts">
  import { BasicForm, createForm, type Schema } from "@sjsf/form";

  import * as defaults from "@/components/form-defaults";

  const schema: Schema = {
    type: "string",
    minLength: 10,
  };

  const form = createForm({
    ...defaults,
    initialValue: "initial",
    schema,
    onSubmit: console.log,
  });
</script>

<BasicForm {form} novalidate />

<pre>{JSON.stringify(
    { value: form.value, errors: Object.fromEntries(form.errors) },
    null,
    2
  )}</pre>
```

## File: docs/form/\_ui-schema-example.ts

```typescript
import type { Schema, UiSchemaRoot } from "@sjsf/form";
⋮----
// ui schema for `foo` field
⋮----
// ui schema for `bar` field
```

## File: docs/form/components.mdx

```
---
title: Components
sidebar:
  order: 5
---

import { Code } from '@astrojs/starlight/components'

import basicFromCode from '#/form/src/form/basic-form.svelte?raw'

The `@sjsf/form` package exports several basic ui components for creating forms:

- `Content`
- `SubmitButton`
- `Form`
- `BasicForm`
- `SimpleForm`
- `ErrorMessage`
- `Datalist`
- `Text`
- `Field`

Components are linked through the context of the form, example:

<Code code={basicFromCode} lang="svelte" title="basic-form.svelte" />
```

## File: docs/form/fields-validation-mode.mdx

````
---
title: Fields validation mode
sidebar:
  order: 11
---

```typescript
type FieldsValidationMode = number;

/** Validation is triggered on input event */
export const ON_INPUT = 1;
/** Validation is triggered on change event */
export const ON_CHANGE = ON_INPUT << 1;
/** Validation is triggered on blur event */
export const ON_BLUR = ON_CHANGE << 1;
/** Validation is triggered on add/remove item in array */
export const ON_ARRAY_CHANGE = ON_BLUR << 1;
/** Validation is triggered on add/remove/rename property in object */
export const ON_OBJECT_CHANGE = ON_ARRAY_CHANGE << 1;

/** Validation is not triggered before first change event */
export const AFTER_CHANGED = ON_OBJECT_CHANGE << 1;
/** Validation is not triggered before first blur event */
export const AFTER_TOUCHED = AFTER_CHANGED << 1;
/** Validation is not triggered before first form submission */
export const AFTER_SUBMITTED = AFTER_TOUCHED << 1;
```
````

## File: docs/form/merger.mdx

````
---
title: Merger
---

```typescript
export interface Merger {
  /**
   * Merges schema and its `allOf` schemas into a single schema
   */
  mergeAllOf(schema: Schema): Schema;
}

export interface FormMerger extends Merger {
  /**
   * Merges defaults of `schema` into `formData`
   */
  mergeFormDataAndSchemaDefaults(
    formData: SchemaValue | undefined,
    schema: Schema
  ): SchemaValue | undefined;
}
```
````

## File: docs/form/options.mdx

````
---
title: Options
sidebar:
  order: 0
---

```typescript
export type InitialErrors<V extends Validator> =
  | ValidationError<PossibleError<V>>[]
  | Iterable<readonly [Id, FieldError<PossibleError<V>>[]]>;

const UI_OPTIONS_REGISTRY_KEY = "uiOptionsRegistry";

export type UiOptionsRegistryOption = keyof UiOptionsRegistry extends never
  ? {
      [UI_OPTIONS_REGISTRY_KEY]?: UiOptionsRegistry;
    }
  : {
      [UI_OPTIONS_REGISTRY_KEY]: UiOptionsRegistry;
    };

export interface ValueRef<T> {
  current: T;
}

export interface FormOptions<T, V extends Validator>
  extends UiOptionsRegistryOption {
  validator: V;
  schema: Schema;
  theme: Theme;
  translation: Translation;
  resolver: (ctx: FormInternalContext<V>) => ResolveFieldType;
  icons?: Icons;
  uiSchema?: UiSchemaRoot;
  extraUiOptions?: ExtraUiOptions;
  merger?: FormMerger;
  fieldsValidationMode?: FieldsValidationMode;
  disabled?: boolean;
  /**
   * @default DEFAULT_ID_PREFIX
   */
  idPrefix?: string;
  /**
   * @default DEFAULT_ID_SEPARATOR
   */
  idSeparator?: string;
  /**
   * @default DEFAULT_ID_PSEUDO_SEPARATOR
   */
  idPseudoSeparator?: string;
  //
  value?: [() => T, (v: T) => void];
  initialValue?: Partial<T>;
  initialErrors?: InitialErrors<V>;
  /**
   * @default waitPrevious
   */
  submissionCombinator?: TasksCombinator<
    [event: SubmitEvent],
    FormValidationResult<AnyFormValueValidatorError<V>>,
    unknown
  >;
  /**
   * @default 500
   */
  submissionDelayedMs?: number;
  /**
   * @default 8000
   */
  submissionTimeoutMs?: number;
  /**
   * @default 300
   */
  fieldsValidationDebounceMs?: number;
  /**
   * @default abortPrevious
   */
  fieldsValidationCombinator?: TasksCombinator<
    [Config, FormValue],
    FieldError<AnyFieldValueValidatorError<V>>[],
    unknown
  >;
  /**
   * @default 500
   */
  fieldsValidationDelayedMs?: number;
  /**
   * @default 8000
   */
  fieldsValidationTimeoutMs?: number;
  /**
   * The function to get the form data snapshot
   *
   * The snapshot is used to validate the form and passed to
   * `onSubmit` and `onSubmitError` handlers.
   *
   * @default (ctx) => $state.snapshot(ctx.value)
   */
  getSnapshot?: (ctx: FormInternalContext<V>) => FormValue;
  /**
   * Submit handler
   *
   * Will be called when the form is submitted and form data
   * snapshot is valid
   *
   * Note that we rely on `validator.validateFormData` to check that the
   * `formData is T`. So make sure you provide a `T` type that
   * matches the validator check result.
   */
  onSubmit?: (value: T, e: SubmitEvent) => void;
  /**
   * Submit error handler
   *
   * Will be called when the form is submitted and form data
   * snapshot is not valid
   */
  onSubmitError?: (
    errors: FieldErrorsMap<AnyFormValueValidatorError<V>>,
    e: SubmitEvent,
    snapshot: FormValue
  ) => void;
  /**
   * Form submission error handler
   *
   * Will be called when the submission fails by a different reasons:
   * - submission is cancelled
   * - error during validation
   * - validation timeout
   */
  onSubmissionFailure?: (state: FailedTask<unknown>, e: SubmitEvent) => void;
  /**
   * Field validation error handler
   */
  onFieldsValidationFailure?: (
    state: FailedTask<unknown>,
    config: Config,
    value: FormValue
  ) => void;
  /**
   * Reset handler
   *
   * Will be called when the form is reset.
   */
  onReset?: (e: Event) => void;
  schedulerYield?: SchedulerYield;
}
```
````

## File: docs/form/schema.mdx

```
---
title: Schema
sidebar:
  order: 3
---

Currently we only support [JSON Schema Draft-07](https://json-schema.org/draft-07#draft-07)
and [discriminator.propertyName](https://swagger.io/docs/specification/v3_0/data-models/inheritance-and-polymorphism/#discriminator) keyword.

## String formats

Some string formats has special meaning:

- `date-time` - `datetime-local` input type
- `uri` - `url` input type
- `color`, `date`, `time`, `email` - corresponding input type
  - You can use `useDatePickerForDateFormat` function from
    `@sjsf/form/fields/extra-widgets/date-picker` to use `datePickerWidget`
    for `date` format
- `data-url` - file field (with `compat` resolver)

## Details and limitations

- Library only supports local definition referencing. The value in the `$ref` keyword should be a [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) in URI fragment identifier format.
- `$schema` keyword is ignored
- Some keywords are only involved in validation.
  - `contains`
  - `propertyNames`
  - `not`
- `exclusiveMaximum`, `exclusiveMinimum` are not currently passed to input elements.
- `writeOnly`, `contentMediaType` and `contentEncoding` has no special meaning.
- `additionalProperties: false` produces incorrect schemas when used with schema dependencies.
- Properties declared inside the `anyOf`/`oneOf` should not overlap with properties "outside" of the `anyOf`/`oneOf`.
- By default the `allOf` keyword uses [json-schema-merge-allof](https://github.com/mokkabonna/json-schema-merge-allof) to merge subschemas.
```

## File: docs/form/state.mdx

````
---
title: State
sidebar:
  order: 1
---

```typescript
export interface FormValidationResult<E> {
  formValue: FormValue;
  formErrors: FieldErrorsMap<E>;
}

export type FormSubmission<V> = Task<
  [event: SubmitEvent],
  FormValidationResult<AnyFormValueValidatorError<V>>,
  unknown
>;

export type FieldsValidation<V> = Task<
  [config: Config, value: FieldValue],
  FieldError<AnyFieldValueValidatorError<V>>[],
  unknown
>;

export interface FormState<T, V extends Validator> {
  readonly submission: FormSubmission<V>;
  readonly fieldsValidation: FieldsValidation<V>;
  /**
   * An accessor that maintains form state consistency:
   *
   * - A snapshot of the form state is returned on access
   * - Default values from JSON Schema are taken into account during assignment
   */
  value: T | undefined;
  isSubmitted: boolean;
  isChanged: boolean;
  errors: FieldErrorsMap<PossibleError<V>>;
  submit(e: SubmitEvent): void;
  reset(e: Event): void;
}
```
````

## File: docs/form/theme.mdx

````
---
title: Theme
sidebar:
  order: 2
---

Essentially theme is a simple function:

```js
const fromRecord = (record) => (type) => record[type]
const theme = fromRecord(components)
```

## Component types

All components can be divided into four **logical** types:

- components
  - `form`
  - `submitButton`
  - `button`
  - `layout`
  - `title`
  - `label`
  - `description`
  - `help`
  - `errorsList`
- widgets
  - `textWidget`
  - `numberWidget`
  - `selectWidget`
  - `checkboxWidget`
- templates
  - `fieldTemplate`
  - `objectTemplate`
  - `objectPropertyTemplate`
  - `arrayTemplate`
  - `arrayItemTemplate`
  - `multiFieldTemplate`
- fields
  - `stringField`
  - `numberField`
  - `integerField`
  - `booleanField`
  - `objectField`
  - `arrayField`
  - `tupleField`
  - `nullField`
  - `oneOfField`
  - `anyOfField`

Also found out that the above components are enough to display any JSON schema.

## Foundational components

The `FoundationalComponentType` is a subset of all components
(`ComponentType`) that can be explicitly used in form elements.

For example, we can use `form` as an argument for `getComponent` because
`form` is `FoundationalComponentType`:

```svelte
<script lang="ts">
  ...
  const Form = $derived(getComponent(ctx, "form", config));
</script>

<Form bind:ref {config} {children} {attributes} />
```

The main purpose of this list is to determine which components you can replace
using the `ui:components` property from `UiSchema`.

This is an extensible list, but by default it corresponds to the components
listed in [Component types](#component-types).

## Extra components

If the default set of components is insufficient, you can add the necessary
components yourself.

The `@sjsf/form` library provides definitions and implementation of several extra
fields, as well as a set of definitions for extra widgets.

### Fields

Here is a list of extra fields that can be imported from `@sjsf/form/fields/extra-fields/*`.

- `boolean-select`
- `enum`
- `file`
- `files`
- `multi-enum`
- `tags`

To use them you can import them directly

```ts
import EnumField from "@sjsf/form/fields/extra-fields/enum";
```

or use an `include` import

```ts
import "@sjsf/form/fields/extra-fields/enum-include";
```

and replace the compatible field with it in `uiSchema`.

```ts
const uiSchema: UISchema = {
  "ui:components": {
    stringField: EnumField,
    // Or if you used the `include` import
    stringField: "enumField"
  }
}
```

### Widgets

There are several types of extra widgets already defined in the library
(`@sjsf/form/fields/extra-widgets/*`):

- `checkboxes`
- `date-picker`
- `file`
- `multi-select`
- `radio-buttons`
- `radio` (group)
- `range`
- `rating`
- `switch`
- `tags`
- `textarea`

However, the ability to use them depends on the availability of a corresponding
implementation in your chosen theme.
````

## File: docs/form/translation.mdx

```
---
title: Translation
---

import { Code } from '@astrojs/starlight/components'

import code from '#/form/src/form/translation?raw'

<Code code={code} lang='typescript' />
```

## File: docs/form/ui-schema.mdx

````
---
title: UI Schema
sidebar:
  order: 4
---

import { Code, LinkCard } from '@astrojs/starlight/components'

import uiSchemaExampleCode from './_ui-schema-example.ts?raw'
import extraUiOptionsCode from './_extra-ui-options.ts?raw'

UI schema allows you to customize the appearance of the form and influence its
behavior.

The UI schema object follows the tree structure of the form field hierarchy,
and defines how each property should be rendered.

```typescript
export interface UiSchemaContent {
  /**
   * Extendable set of UI options
   */
  "ui:options"?: ResolvableUiOptions;
  /**
   * Components override
   */
  "ui:components"?: Partial<{
    [T in FoundationalComponentType]:
      | Exclude<CompatibleComponentType<T>, T>
      | ComponentDefinitions[T];
  }>;
  items?: UiSchemaDefinition | UiSchemaDefinition[];
  anyOf?: UiSchemaDefinition[];
  oneOf?: UiSchemaDefinition[];
  combinationFieldOptionSelector?: UiSchemaDefinition;
  additionalProperties?: UiSchemaDefinition;
  additionalPropertyKeyInput?: UiSchemaDefinition;
  additionalItems?: UiSchemaDefinition;
}

export type UiSchema = UiSchemaContent & {
  // This is should be `UiSchemaDefinition` type, but
  // https://github.com/microsoft/TypeScript/issues/17867
  [key: string]: UiSchemaContent[keyof UiSchemaContent];
};

export interface UiSchemaRef {
  $ref: string;
}

export type UiSchemaDefinition = UiSchema | UiSchemaRef;

export type UiSchemaRoot = UiSchemaDefinition & {
  "ui:globalOptions"?: UiOptions;
  "ui:definitions"?: Record<string, UiSchema>;
};
```
## Evaluation rules

Usually UI schema corresponds to the data structure described by json schema.

For example, with this JSON schema, the following UI schema would be correct:

<Code code={uiSchemaExampleCode} lang="typescript" />

Special cases:

### Ref

If the UI Schema contains a `$ref` key with a value of type `string`,
the `ui:definitions` field of the root UI schema will be searched
for the value of the `$ref` key, other fields will be ignored.

```
{
  "ui:definitions": {
    "foo": {
      ...
    }
  },
  properties: {
    foo: {
      $ref: "foo"
    }
  }
}
```

### Array

Instead of defining indices in the UI schema, the `items` keyword should be used
to specify the UI schema for the elements of the array.

For a fixed array `items` also can be an array.
If you have additional items you should use `additionalItems` keyword
to specify the UI schema for them.

```
{
  items: [<uiSchema>, ...],
  additionalItems: <uiSchema>
}
```

### Object

You should use `additionalProperties` keyword to specify the UI schema for
additional properties.

You can use `additionalPropertyKeyInput` keyword to define an UI schema for
the additional property key input field.

### oneOf/anyOf

You can define separate UI schemas for each `oneOf/anyOf` branch
using the corresponding keyword in the UI schema.
Otherwise the UI schema of the current field will be used.

```
{
  oneOf: [<uiSchema>, ...]
}
```

## UI components

Using the `ui:components` property, you can replace any
[form component](../theme/#component-types) with a compatible one
using the name of the connected component or
the component itself directly.

Component `A` is compatible with component `B` if the properties and bindings
of component `B` extend the properties and bindings of component `A`.

```ts
export type CompatibleComponentType<T extends ComponentType> = {
  [C in ComponentType]: Expand<ComponentProps[T]> extends Expand<
    ComponentProps[C]
  >
    ? ComponentBindings[T] extends ComponentBindings[C]
      ? C
      : never
    : never;
}[ComponentType];
```

## UI options

The `UiOptions` type is an extensible set of components options. By default it
looks like this:

```typescript
type ItemTitle = (
  title: string,
  index: number,
  fixedItemsCount: number
) => string;

type AdditionalPropertyKey = (key: string, attempt: number) => string;

interface UiOptions {
  /**
   * Overrides the title of the field.
   */
  title?: string;
  /**
   * Overrides the description of the field (over the widget).
   */
  description?: string;
  /**
   * List of labels for enum values in the schema.
   */
  enumNames?: string[];
  /**
   * List of enum values that are disabled. Values are compared by strict equality.
   */
  disabledEnumValues?: SchemaValue[];
  /**
   * Order of properties in the object schema.
   * You must specify all properties or use the wildcard `*`.
   */
  order?: string[];
  /**
   * Allow adding new properties to the object schema with `additionalProperties`.
   * @default true
   */
  expandable?: boolean;
  /**
   * Allow adding new items to the array schema.
   * @default true
   */
  addable?: boolean;
  /**
   * Allow reordering items in the array schema.
   * If you want an orderable array of file fields, set this to `true` explicitly.
   * @default true
   */
  orderable?: boolean;
  /**
   * Allow removing items from the array schema.
   * @default true
   */
  removable?: boolean;
  /**
   * Allow duplicating items in the array schema.
   * @default false
   */
  copyable?: boolean;
  /**
   * Overrides the logic for creating a title for array elements
   */
  itemTitle?: ItemTitle;
  /**
   * Overrides the logic for creating a new key for an additional property
   */
  additionalPropertyKey?: AdditionalPropertyKey;
  /**
   * Help text for the field (under the widget).
   */
  help?: string;
  /**
   * Hide the title of the field.
   * If you want to show a title of the `boolean` field this should be set to `false` explicitly.
   * @default false
   */
  hideTitle?: boolean;
  /**
   * Overrides whether to use the `title` or `label` component in the `field` template
   */
  useLabel?: boolean;
  /**
   * Overrides form translation
   */
  translations?: Partial<TranslatorDefinitions>;
}
```

### Registry

You can use UI options registry to ensure serializability of the UI schema.

```typescript
export interface UiOptionsRegistry {}

export type ResolvableUiOption<T> =
  | {
      [K in keyof UiOptionsRegistry]: UiOptionsRegistry[K] extends T
        ? `registry:${K}`
        : never;
    }[keyof UiOptionsRegistry]
  | T;

export type ResolvableUiOptions = {
  [K in keyof UiOptions]: ResolvableUiOption<UiOptions[K]>;
};
```

To do this, you need to extend the `UiOptionsRegistry` interface and replace
the non-serializable value with `registry:${key}` in `UiOptions`.
Example:

```typescript
import { type ItemTitle, createForm } from "@sjsf/form"

declare module "@sjsf/form" {
  interface UiOptionsRegistry {
    myItemTitle: ItemTitle
  }
}

const form = createForm({
  ...,
  uiSchema: {
    "ui:options": {
      itemTitle: "registry:myItemTitle"
    }
  },
  uiOptionsRegistry: {
    myItemTitle: (title, index) => `${title} [${index}]`
  }
})
```

### Conventions

- Each `component`/`widget` in the theme should define at least one UI option
  to allow customization of it
- All parameters must be prefixed by the theme name (e.g. `daisyui5RadioButtons`).
- Only a `basic` theme can define options without a prefix and other themes
  should use the `basic` theme UI options for the corresponding `components`/`widgets`
  if their properties are compatible.
- Using UI options of one component in another (even if they are compatible)
  is forbidden, e.g. `text` and `textarea` widgets must use separate options.


Check your theme page for an extended list of UI options:

<LinkCard title="Basic" href="../../themes/basic/#ui-options" />
<LinkCard title="daisyUI" href="../../themes/daisyui5/#ui-options" />
<LinkCard title="Flowbite" href="../../themes/flowbite3/#ui-options" />
<LinkCard title="Skeleton" href="../../themes/skeleton3/#ui-options" />
<LinkCard title="shadcn-svelte" href="../../themes/shadcn4/#ui-options" />



## Extra UI options

This property allows you to specify UI options for all components of a certain
type or set them dynamically.

:::caution

has no effect on the `title` UI option

:::

<Code code={extraUiOptionsCode} lang="typescript" />
````

## File: docs/form/validator.mdx

````
---
title: Validator
---

Validator - a set of functions called by the form to check the data:

- `isValid` (called to correctly handle the following keywords `oneOf`, `anyOf` and `if,then,else`, required)
- `validateFormValue` (optional)
- `validateFormValueAsync` (optional)
- `validateFieldValue` (optional)
- `validateFieldValueAsync` (optional)
- `validateAdditionalPropertyKey` (optional)

You can easily extend/modify the validator to suit your needs.

```ts
import type { ErrorObject } from "ajv";
import { isSchemaObjectValue } from "@sjsf/form/core";
import type { FormValueValidator } from "@sjsf/form";
import { createFormValidator } from "@sjsf/ajv8-validator";

export function createValidator() {
  const validator = createFormValidator();
  return {
    ...validator,
    validateFormValue(rootSchema, formValue) {
      const errors = validator.validateFormValue(rootSchema, formValue);
      // Your logic
      return errors
    },
  } satisfies FormValueValidator<ErrorObject>;
}
```

## API

```typescript
export interface Validator {
  isValid(
    schema: SchemaDefinition,
    rootSchema: Schema,
    formValue: SchemaValue | undefined
  ): boolean;
}

export interface ValidationError<E> {
  instanceId: Id;
  propertyTitle: string;
  message: string;
  error: E;
}

export interface FormValueValidator<E> {
  validateFormValue: (
    rootSchema: Schema,
    formValue: FormValue
  ) => ValidationError<E>[];
}

export interface AsyncFormValueValidator<E> {
  validateFormValueAsync: (
    signal: AbortSignal,
    rootSchema: Schema,
    formValue: FormValue
  ) => Promise<ValidationError<E>[]>;
}

export type AnyFormValueValidator<E> =
  | FormValueValidator<E>
  | AsyncFormValueValidator<E>;

export interface FieldValueValidator<E> {
  validateFieldValue: (
    field: Config,
    fieldValue: FieldValue
  ) => ValidationError<E>[];
}

export interface AsyncFieldValueValidator<E> {
  validateFieldValueAsync: (
    signal: AbortSignal,
    field: Config,
    fieldValue: FieldValue
  ) => Promise<ValidationError<E>[]>;
}

export type AnyFieldValueValidator<E> =
  | FieldValueValidator<E>
  | AsyncFieldValueValidator<E>;

export interface AdditionalPropertyKeyValidator {
  validateAdditionalPropertyKey: (key: string, schema: Schema) => string[];
}
```
````

## File: docs/guides/async-validation.svelte

```
<script lang="ts">
  import Ajv, { type AsyncSchema, type SchemaValidateFunction } from "ajv";
  import {
    addFormComponents,
    createAsyncFormValidator,
  } from "@sjsf/ajv8-validator";
  import { ON_INPUT, BasicForm, createForm } from "@sjsf/form";

  import * as defaults from "@/components/form-defaults";

  const ajv = addFormComponents(new Ajv());
  const validate: SchemaValidateFunction = async (schema, data) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (Math.random() > 0.7) {
      throw new Error("async error");
    }
    return data.length >= schema.minimum && data.length <= schema.maximum;
  };
  ajv.addKeyword({
    keyword: "asyncLength",
    async: true,
    type: "string",
    validate,
  });

  const schema: AsyncSchema = {
    $async: true,
    type: "string",
    pattern: "^\\d+$",
    asyncLength: {
      minimum: 3,
      maximum: 6,
    },
  };

  const form = createForm({
    ...defaults,
    validator: createAsyncFormValidator({ ajv }),
    schema,
    fieldsValidationMode: ON_INPUT,
    onSubmit: console.log,
  });
</script>

<p>
  The form accepts a sequence of digits (checked synchronously) with the number
  of digits from 3 to 6 (checked asynchronously, with a 70% chance of successful
  verification)
</p>
<p>
  form validation: {form.submission.status}, fields validation: {form
    .fieldsValidation.status}, errors: {form.errors.size > 0}
</p>
<BasicForm {form} novalidate autocomplete="off" />
```

## File: docs/guides/controlled-form.svelte

```
<script lang="ts">
  import { BasicForm, createForm, type Schema } from "@sjsf/form";

  import * as defaults from "@/components/form-defaults";

  const schema: Schema = {
    type: "string",
  };

  let value = $state("initial");

  const form = createForm({
    ...defaults,
    schema,
    value: [() => value, (v) => (value = v)],
    onSubmit: console.log,
  });
</script>

<BasicForm {form} />

<pre>{JSON.stringify(value, null, 2)}</pre>
```

## File: docs/guides/custom-components.mdx

````
---
title: Custom components
sidebar:
  order: 12
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

You can create your own form components. Any built-in component can be replaced
with a custom one, giving you full control over rendering and behavior.

## Component creation

To create a component, you just need to create a Svelte component
with a compatible `$props` type.
The easiest way to do this is to use the `ComponentProps` property registry as follows:

```ts
import type { ComponentProps } from "@sjsf/form";

let {
  value = $bindable(),
  config,
  handlers,
}: ComponentProps["numberWidget"] = $props();
```

You will then be able to replace `numberWidget` with your component via the UI schema:

```ts
import type { Schema, UiSchema } from "@sjsf/form";

import MyNumberWidget from "./my-number-widget";

const schema: Schema = {
  type: "number"
}

const uiSchema: UiSchema = {
  "ui:components": {
    "numberWidget": MyNumberWidget
  }
}
```

You can also register a new or overwrite an old component in the selected theme as follows:

```ts
import { extendByRecord, overrideByRecord } from "@sjsf/form/lib/resolver";
import { theme } from "@sjsf/some-theme";

import MyNumberWidget from "./my-number-widget";

// Register a new component

declare module "@sjsf/form" {
  interface ComponentProps {
    // NOTE: Prefer to declare new components using some prefix to avoid
    // conflicts in the future
    myNumberWidget: ComponentProps["numberWidget"];
  }
  interface ComponentBindings {
    myNumberWidget: "value";
  }
}

export const myTheme = extendByRecord(theme, { myNumberWidget: MyNumberWidget });

// Override the default component

export const myTheme = overrideByRecord(theme, { numberWidget: MyNumberWidget })
```

## Retrieving attributes

Each component is responsible for constructing the set of attributes it needs.
This decouples the SJSF from any specific UI library.

In simple cases, you can use information from `config` and the `uiOption` function
to generate attributes:

```ts
const { config, uiOption }: ComponentProps["arrayTemplate"] = $props();

const description = $derived(uiOption("description") ?? config.schema.description);
```

### UI options

You can define new UI options as follows:

```ts
declare module "@sjsf/form" {
  interface UiOptions {
    // NOTE: Prefer to declare new UI options using some prefix to avoid
    // conflicts in the future
    myUiOption?: boolean;
  }
}
```

Then use the `uiOption` function to get the value of the UI option:

```ts
const { uiOption } = $props();

const value = $derived(uiOption("myUiOption") ?? false);

// Equivalent to:
import { retrieveUiOption } from "@sjsf/form";
const { config } = $props();
const ctx = getFormContext();
const value = $derived(retrieveUiOption(ctx, config, "myUiOption") ?? false);
```

When `uiOption` is used, the value defined via `extraUiOptions` will replace
the value from the UI schema.
You can use the `uiOptionProps` function to merge object values from
the UI schema and `extraUiOptions`:

```ts
import type { RadioGroupItemProps, WithoutChildrenOrChild } from 'bits-ui';

import { getFormContext, uiOptionProps, type ComponentProps } from '@sjsf/form';

declare module '@sjsf/form' {
  interface UiOptions {
    shadcnRadioItem?: Omit<WithoutChildrenOrChild<RadioGroupItemProps>, 'value'>;
  }
}

const ctx = getFormContext();
const { config, handlers }: ComponentProps['radioWidget'] = $props();

const itemAttributes = $derived(
  uiOptionProps('shadcnRadioItem')(
    {
      onclick: handlers.oninput,
      onblur: handlers.onblur
    },
    config,
    ctx
  )
);
```

### Helpers

For more complex interactive components, you may need to consider many properties
and their priorities.
The library provides a set of functions for forming attributes for both
standard HTML elements and custom components. These functions can be categorized
into two categories based on their level of abstraction:

1. **properties**

These functions are designed to form a set of properties by combining them in the
desired order, have the suffix `Prop` or `Props`. Example:

```ts
import type { HTMLButtonAttributes } from "svelte/elements";

import {
  composeProps,
  disabledProp,
  getFormContext,
  uiOptionProps,
  uiOptionNestedProps,
  type ComponentProps,
} from "@sjsf/form";
import type { ButtonType } from "@sjsf/form/fields/components";

declare module "@sjsf/form" {
  interface UiOptions {
    button?: HTMLButtonAttributes;
    buttons?: {
      [B in ButtonType]?: HTMLButtonAttributes;
    };
  }
}

const { type, onclick, config, disabled }: ComponentProps["button"] = $props();

const ctx = getFormContext();

const props = $derived(composeProps(
  ctx,
  config,
  {
    disabled,
    type: "button",
    onclick,
  } satisfies HTMLButtonAttributes,
  uiOptionProps("button"),
  uiOptionNestedProps("buttons", (p) => p[type]),
  disabledProp
))
```

2. **attributes**

These functions are pre-prepared compositions of functions from the
previous category, have the suffix `Attributes`. Examples:

<Tabs>
  <TabItem label="Number widget">
    ```ts
    import type { HTMLInputAttributes } from "svelte/elements";

    declare module "@sjsf/form" {
      interface UiOptions {
        number?: HTMLInputAttributes;
      }
    }

    import { getFormContext, inputAttributes, type ComponentProps } from "@sjsf/form";

    let {
      value = $bindable(),
      config,
      handlers,
    }: ComponentProps["numberWidget"] = $props();

    const ctx = getFormContext();

    const attributes = $derived(
      inputAttributes(ctx, config, "number", handlers, {
        type: "number",
        style: "flex-grow: 1",
      })
    );
    ```
  </TabItem>
  <TabItem label="Custom widget">
    ```ts
    import type { ComponentProps as SvelteComponentProps } from 'svelte';
    import { Switch as SkeletonSwitch } from '@skeletonlabs/skeleton-svelte';
    import '@sjsf/form/fields/extra-widgets/switch';

    declare module '@sjsf/form' {
      interface UiOptions {
        skeleton3Switch?: SvelteComponentProps<typeof SkeletonSwitch>;
      }
    }

    import { customInputAttributes, getFormContext, type ComponentProps } from '@sjsf/form';

    let { config, value = $bindable(), handlers, errors }: ComponentProps['switchWidget'] = $props();

    const ctx = getFormContext();

    const attributes = $derived(customInputAttributes(ctx, config, 'skeleton3Switch', {
      ids: {
        hiddenInput: config.id
      },
      required: config.required,
      readOnly: config.schema.readOnly,
      invalid: errors.length > 0,
      onCheckedChange: (e) => {
        value = e.checked;
        handlers.onchange?.();
      },
      checked: value
    }))
    ```
  </TabItem>
</Tabs>


## Retrieving theme components

If you need to use theme components inside your custom component, you have two options:

1. **Import the component directly**

```ts
import Button from "@sjsf/your-theme/components/button.svelte";
```

2. **Use the `getComponent` function**

```ts
import { getComponent, getFormContext } from "@sjsf/form";

const { config } = $props();
const ctx = getFormContext();
const Button = $derived(getComponent(ctx, "button", config));
```

To use `getComponent` with a custom component, add it to the `FoundationalComponents` registry:

```ts
declare module "@sjsf/form" {
  interface FoundationalComponents {
    myNumberWidget: {};
  }
}

// Now the following code works:
import { getComponent, type UiSchema } from "@sjsf/form";
const Widget = $derived(getComponent(ctx, "myNumberWidget", config));

const uiSchema: UiSchema = {
  "ui:components": {
    myNumberWidget: "numberWidget"
  }
};
```

You can also use the `getFieldComponent` function to get the component
responsible for displaying/processing the current value:

```svelte
<script lang="ts">
  import { getFormContext, getFieldComponent } from "@sjsf/form";

  let { value = $bindable(), config, uiOption } = $props();
  const ctx = getFormContext();
  const Field = $derived(getFieldComponent(ctx, config));
</script>

<Field type="field" bind:value={value as undefined} {config} {uiOption} />
```

## FoundationalFieldType

To use a custom component in a `resolver` function - it must be declared as
`FoundationalComponentType` (`keyof FoundationalComponents`) and its properties
must be compatible with the `FieldCommonProps<any>` type.

The compatibility is checked as follows:

```ts
type IsFoundationalField<T extends FoundationalComponentType> =
  FieldCommonProps<any> extends ComponentProps[T]
    ? ComponentProps[T] extends FieldCommonProps<any>
      ? true
      : false
    : false;
```
````

## File: docs/guides/demo-schemas.ts

```typescript
import type { Schema, UiSchemaRoot } from '@sjsf/form';
```

## File: docs/guides/errors-list.svelte

```
<script lang="ts">
  import { BasicForm, createForm } from "@sjsf/form";

  import * as defaults from "@/components/form-defaults";

  import { objectSchema } from "./demo-schemas";

  const form = createForm({
    ...defaults,
    schema: objectSchema,
  });
</script>

<BasicForm {form} novalidate />

{#if form.errors.size > 0}
  <div style="padding-top: 1rem;">
    <span style="font-size: larger; font-weight: bold;">Errors</span>
    <ui style="color: red;">
      {#each form.errors as [field, fieldErrors] (field)}
        {#each fieldErrors as err}
          <li>"{err.propertyTitle}" {err.message}</li>
        {/each}
      {/each}
    </ui>
  </div>
{/if}
```

## File: docs/guides/fields-resolution.mdx

````
---
title: Fields resolution
sidebar:
  order: 3
---

import { Code } from '@astrojs/starlight/components'

import basicResolverCode from '#/form/src/form/resolvers/basic?raw'
import compatResolverCode from '#/form/src/form/resolvers/compat?raw'

To determine which field to use to display your JSON schema,
the form uses `resolver` function.

Let's take a look at the `basic` resolver implementation
(`@sjsf/form/resolvers/basic`):

<Code code={basicResolverCode} lang='typescript' />

As you can see `resolver` just selects the field according to the schema type.

This approach is simple and straightforward, but in some cases it can lead to
additional work.
Suppose you have the following scheme:

```ts
const schema: Schema = {
  enum: ["foo", "bar", "baz"]
}
```

For this scheme, the `basic` resolver will select `stringField`,
and `stringField` will display the `textWidget` widget by default
although you probably wanted to see select or radio widgets.

To achieve this you need to specify in the UI scheme the field:

```ts
const uiSchema: UiSchema = {
  "ui:components": {
    // The `selectWidget` will now be displayed by default
    stringField: "enumField",
    // You can also replace `selectWidget` with `radioWidget`
    // selectWidget: "radioWidget"
  }
}
```

Or you can modify `resolver` so that `enumField` is always used
when a scheme with `enum` is detected:

```ts
return ({ schema }) => {
  if (schema.enum !== undefined) {
    return "enumField"
  }
  ...
}
```

It is recommended that you copy the `basic` resolver code into your project and
modify it to suit your needs.

As an example (or temporary solution) you can use the `compat` resolver
(`@sjsf/form/resolvers/compat`) that reproduces resolution logic from v1:

<Code code={compatResolverCode} lang='typescript' />
````

## File: docs/guides/fields-validation.svelte

```
<script lang="ts">
  import { ON_CHANGE, ON_INPUT } from "@sjsf/form";

  import MyForm from "@/components/my-form.svelte";

  import { objectSchema, objectUiSchema } from "./demo-schemas";
</script>

<MyForm
  schema={objectSchema}
  uiSchema={objectUiSchema}
  fieldsValidationMode={ON_INPUT | ON_CHANGE}
/>
```

## File: docs/guides/focus-on-first-error.svelte

```
<script lang="ts">
  import { createFocusOnFirstError } from "@sjsf/form/focus-on-first-error";

  import MyForm from '@/components/my-form.svelte';

  import { objectSchema, objectUiSchema } from "./demo-schemas";
</script>

<MyForm
  schema={objectSchema}
  uiSchema={objectUiSchema}
  onSubmitError={createFocusOnFirstError()}
/>
```

## File: docs/guides/form-state.svelte

```
<script lang="ts">
  import { BasicForm, createForm, type Schema } from "@sjsf/form";

  import * as defaults from "@/components/form-defaults";

  const schema: Schema = {
    type: "string",
    minLength: 10,
  };

  const form = createForm({
    ...defaults,
    initialValue: "initial",
    schema,
    onSubmit: console.log,
  });
</script>

<BasicForm {form} novalidate />

<pre>{JSON.stringify(
    { value: form.value, errors: Object.fromEntries(form.errors) },
    null,
    2
  )}</pre>
```

## File: docs/guides/form-value-type-inference-typebox.ts

```typescript
import { Type, type Static } from "@sinclair/typebox";
import { createForm, type UiSchema } from "@sjsf/form";
⋮----
// { text: string } | undefined
```

## File: docs/guides/form-value-type-inference.mdx

```
---
title: Form value type inference
sidebar:
  order: 6
---

import { Code } from '@astrojs/starlight/components'

import Npm from "@/components/npm.astro";

import code from './form-value-type-inference?raw'
import typebox from './form-value-type-inference-typebox?raw'

## json-schema-to-ts

You can use [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts/tree/main)
to infer types from JSON schema.

### Installation

<Npm pkg="json-schema-to-ts" dev />

### Usage

<Code code={code} lang="typescript" />

## TypeBox

[TypeBox](https://github.com/sinclairzx81/typebox) offers a unified type that can be statically checked by TypeScript and
runtime asserted using standard Json Schema validation.

### Installation

<Npm pkg="@sinclair/typebox" />

### Usage

<Code code={typebox} lang="typescript" />
```

## File: docs/guides/form-value-type-inference.ts

```typescript
import { createForm, type Schema } from "@sjsf/form";
import type { FromSchema } from "json-schema-to-ts";
⋮----
// { text: string } | undefined
```

## File: docs/guides/icons-demo.svelte

```
<script lang="ts">
  import type { Icons } from "@sjsf/form";
  import { icons as radix } from "@sjsf/radix-icons";
  import { icons as lucide } from "@sjsf/lucide-icons";
  import { icons as flowbite } from "@sjsf/flowbite-icons";
  import { icons as moving } from "@sjsf/moving-icons";
  import { AllIcons } from "testing/demo";

  import type { IconsPackage } from "@/shared";

  const { pkg }: { pkg: IconsPackage } = $props();

  const icons = {
    flowbite,
    lucide,
    moving,
    radix,
  } satisfies Record<IconsPackage, Icons>;
</script>

<AllIcons
  style="width: 100%; display: flex; align-items: center; justify-content: center"
  icons={icons[pkg]}
/>
```

## File: docs/guides/icons.svelte

```
<script lang="ts">
  import type { Snippet } from "svelte";

  import { fromRecord } from "@sjsf/form/lib/resolver";

  import MyForm from "@/components/my-form.svelte";

  const { children }: { children: Snippet } = $props();
</script>

<MyForm
  schema={{
    title: "With icons",
  }}
  icons={fromRecord({
    submit: children,
  })}
/>
```

## File: docs/guides/labels-and-icons.mdx

```
---
title: Labels and icons
sidebar:
  order: 5
---

import { LinkCard, LinkButton, Code, Card, Icon } from '@astrojs/starlight/components';

import Npm from '@/components/npm.astro';
import FormCard from '@/components/form-card.astro';

import Icons from './icons.svelte';
import iconsCode from './icons.svelte?raw';

import IconsShowCase from './_icons.astro';

## Translation

A required component of the form is `translate`, which is used in multiple places, including buttons and labels.

Translations are imported from `@sjsf/form/translations/{locale}`, currently supported locales:

- `en`
- `ru`

<LinkCard title="Translation API reference" href="../../form/translation/" />

## Icons

Text is good, but you can do better by adding icons!

<Code code={iconsCode} lang='svelte' />

<FormCard>
  <Icons client:only="svelte">Hello <Icon name="seti:svelte" /> from <Icon name="astro" /></Icons>
</FormCard>

There are also ready-made sets of icons for the control buttons.

<IconsShowCase />
```

## File: docs/guides/live-validation.svelte

```
<script lang="ts">
  import { createForm, BasicForm, type Schema, groupErrors } from "@sjsf/form";
  import { resolver } from "@sjsf/form/resolvers/basic";
  import { translation } from "@sjsf/form/translations/en";
  import { theme } from "@sjsf/basic-theme";
  import { createFormValidator } from "@sjsf/ajv8-validator";

  const validator = createFormValidator();

  const schema: Schema = {
    type: "string",
    minLength: 10,
  };

  const form = createForm({
    theme,
    initialValue: "initial",
    schema,
    resolver,
    validator,
    translation,
    onSubmit: console.log,
  });

  $effect(() => {
    form.errors = groupErrors(validator.validateFormValue(schema, form.value));
  });
</script>

<BasicForm {form} />
```

## File: docs/guides/manual-mode.mdx

````
---
title: Manual mode
sidebar:
  order: 9
---

import { Code } from '@astrojs/starlight/components';

import FormCard from '@/components/form-card.astro';

import Form from './manual-mode.svelte';
import formCode from './manual-mode.svelte?raw';

Manual mode gives you complete control over form layout and field placement.

<Code code={formCode} lang="svelte" />

<FormCard>
  <Form client:only="svelte" />
</FormCard>

## Caveats

### Field names

To make the field names inference work - it is necessary to define
the type of form value, for example, like this:

```ts
const form = createForm<ValueType, typeof validator>(...)
```

### Nested structures

You must initialize nested structures (objects and arrays).
In the following example, if you want to display the `foo.bar` field,
you should initialize the `foo` object through the `initialValue` option.

```ts
const schema = {
  type: "object",
  properties: {
    foo: {
      type: "object",
      properties: {
        bar: {
          type: "string",
        },
      },
    },
  },
} as const satisfies Schema;

const initialValue = {
  foo: {}
}
```

### Required attribute

Calculating the value of the `required` property from the JSON schema can be tricky,
if it is calculated incorrectly - specify it manually.

```svelte
<Field {form} name="foo" required />
```

### Form context

Unlike other form components (`Form`, `SubmitButton`, etc.),
`Field` does not require setting the form context.
````

## File: docs/guides/manual-mode.svelte

```
<script lang="ts">
  import { type Schema, createForm, Field, formHandlers } from "@sjsf/form";
  import type { FromSchema } from "json-schema-to-ts";

  import * as defaults from "@/components/form-defaults";

  const schema = {
    type: "object",
    properties: {
      login: {
        title: "Login",
        type: "string",
        minLength: 3,
      },
      password: {
        title: "Password",
        type: "string",
        minLength: 6,
      },
    },
    required: ["login", "password"],
    additionalProperties: false,
  } as const satisfies Schema;

  const form = createForm({
    ...defaults,
    schema,
    onSubmit(value: FromSchema<typeof schema>) {
      console.log(value);
    },
  });
</script>

<form
  novalidate
  {@attach formHandlers(form)}
  style="display: flex; flex-direction: column; gap: 1rem;"
>
  <Field {form} name="login" />
  <Field
    {form}
    name="password"
    uiSchema={{ "ui:options": { text: { type: "password" } } }}
  />
  <button type="submit">Submit</button>
</form>
```

## File: docs/guides/multiple-forms.mdx

```
---
title: Multiple forms
sidebar:
  order: 8
---

import { Code } from '@astrojs/starlight/components';
import { DEFAULT_ID_PREFIX } from '@sjsf/form'

import FormCard from '@/components/form-card.astro';

import Form from './multiple-forms.svelte';
import formCode from './multiple-forms.svelte?raw';

To use multiple forms on the same page, you must specify a custom `idPrefix`
to avoid id collision in the DOM.

The default value of `idPrefix` is <code>{DEFAULT_ID_PREFIX}</code>.

<Code code={formCode} lang='svelte' />

<FormCard>
  <Form client:only="svelte" />
</FormCard>
```

## File: docs/guides/multiple-forms.svelte

```
<script lang="ts">
  import type { Schema } from "@sjsf/form";
  import { createFormValidator } from "@sjsf/ajv8-validator";

  import MyForm from "@/components/my-form.svelte";

  const schema: Schema = {
    type: "string",
  };
</script>

<div style="display: flex; gap: 1rem; justify-content: space-around;">
  <MyForm
    {schema}
    initialValue="foo"
    idPrefix="form1"
    validator={createFormValidator({
      idPrefix: "form1",
    })}
    onSubmit={(v: string) => window.alert(v)}
  />
  <MyForm
    {schema}
    initialValue="bar"
    idPrefix="form2"
    validator={createFormValidator({
      idPrefix: "form2",
    })}
    onSubmit={(v: string) => window.alert(v)}
  />
</div>
```

## File: docs/guides/prevent-page-reload.mdx

```
---
title: Prevent page reload
sidebar:
  order: 10
---

import { Code } from '@astrojs/starlight/components';

import FormCard from '@/components/form-card.astro';

import Form from './prevent-page-reload.svelte'
import formCode from './prevent-page-reload.svelte?raw'

You can prevent data loss due to accidentally closing or reloading a tab by using
the `preventPageReload` function.

## Example

Try to change the value of the form and reload the page.

<Code code={formCode} lang="svelte" />

<FormCard>
  <Form client:only="svelte" />
</FormCard>
```

## File: docs/guides/prevent-page-reload.svelte

```
<script lang="ts">
  import { Content, createForm, setFormContext2 } from "@sjsf/form";
  import { preventPageReload } from "@sjsf/form/prevent-page-reload.svelte";

  import * as defaults from "@/components/form-defaults";

  const form = createForm({
    ...defaults,
    schema: { type: "string" },
  });
  setFormContext2(form);

  preventPageReload(form);
</script>

<Content />

<button
  style="width: 100%; padding: 0.5rem; margin-top: 1rem;"
  onclick={() => {
    window.location.reload();
  }}
>
  Reload page
</button>
```

## File: docs/guides/programmatic-control.mdx

```
---
title: Programmatic control
sidebar:
  order: 7
---

import { Code, Card } from '@astrojs/starlight/components';

import Form from './programmatic-control.svelte';
import formCode from './programmatic-control.svelte?raw';

You can bind to the from element to control it programmatically:

<Code code={formCode} lang="svelte" />

<Card>
  <Form client:only="svelte" />
</Card>
```

## File: docs/guides/programmatic-control.svelte

```
<script lang="ts">
  import {
    Content,
    createForm,
    Form,
    setFormContext2,
    type Schema,
  } from "@sjsf/form";

  import * as defaults from "@/components/form-defaults";

  const schema: Schema = {
    type: "string",
    minLength: 10,
  };

  const form = createForm({
    ...defaults,
    schema,
    initialValue: "initial",
    onSubmit: (v) => window.alert(v),
  });
  setFormContext2(form);

  let ref: HTMLFormElement | undefined;
</script>

<Form bind:ref>
  <Content />
</Form>
<button
  onclick={(_e) => {
    ref?.requestSubmit();
    // or
    // form.submit(new SubmitEvent("submit", { submitter: _e.currentTarget }));
    // (`target` and `currentTarget` will not be properly set)
  }}>My submit</button
>
<button
  onclick={() => {
    ref?.reset();
    // or
    // form.reset(new Event("reset"))
    // (`target` and `currentTarget` will not be properly set)
  }}
>
  My reset
</button>
```

## File: docs/guides/quickstart.mdx

```
---
title: Quickstart
sidebar:
  order: 0
---

import { Code, Card, LinkCard } from '@astrojs/starlight/components';

import { peerDependencies as formPeerDeps } from '#/form/package.json'

import { createThemeInstall } from '@/shared'
import FormCard from '@/components/form-card.astro'
import Npm from "@/components/npm.astro";

import SimpleSetupForm from "./simple-setup.svelte";
import simpleSetupCode from './simple-setup.svelte?raw';

import UiSchemaForm from './ui-schema.svelte';
import uiSchemaCode from './ui-schema.svelte?raw';

import FormStateForm from './form-state.svelte';
import formStateCode from './form-state.svelte?raw';

import ControlledForm from './controlled-form.svelte';
import controlledFormCode from './controlled-form.svelte?raw';

## Installation

<Npm pkg={createThemeInstall("basic")} />

Svelte <code>{formPeerDeps.svelte}</code> is required

## Usage

Let's start with the simplest setup:

<Code code={simpleSetupCode} lang="svelte" />

<FormCard>
  <SimpleSetupForm client:only="svelte" />
</FormCard>

In the example above, we create a form based on json schema and
use HTML5 validation to validate the form.

Although this is an extremely simple example, it turned out to be quite verbose, and here's why:

- **Explicit Configuration**: The library favors explicit configuration over "magic" defaults.
- **Tree-Shakeable Architecture**: Each feature is located in its own [submodule](https://nodejs.org/api/packages.html#subpath-exports)
so you can import only the functionality you need, keeping your bundle lean and optimized.
- **Highly Customizable**: We provide extensive customization options so that you can tailor every aspect of the library to your needs.

<LinkCard title="Schema" href="../../form/schema/" />

<LinkCard title="Form options" href="../../form/options/" />

## UI Schema

With the `uiSchema` parameter you can customize the appearance of the form.

:::note

We'll talk about `MyForm` component in the [Reusable defaults](../reusable-defaults/) guide.

:::

<Code code={uiSchemaCode} lang="svelte" />

<FormCard>
  <UiSchemaForm client:only="svelte" />
</FormCard>

<LinkCard title="UI Schema" href="../../form/ui-schema/" />

## Form state

Use a factory to create a form to access its state.

:::tip

Use getters to pass reactive parameters to the `createForm` function.

:::

<Code code={formStateCode} lang="svelte" />

<FormCard>
  <FormStateForm client:only="svelte" />
</FormCard>

<LinkCard title="Form state" href="../../form/state/" />

### "Controlled" form

You can also specify the `value` option instead of the `initialValue`
to access the internal state of the form.

:::note

I believe that such use of the library should be limited,
so here is a list of situations in which this approach can be used
(if you doubt it, welcome to the [discussions](https://github.com/x0k/svelte-jsonschema-form/discussions)):

- Simultaneous editing of data from multiple locations (e.g., form + sidebar)

:::

<Code code={controlledFormCode} lang="svelte" />

<FormCard>
  <ControlledForm client:only="svelte" />
</FormCard>
```

## File: docs/guides/reusable-defaults.mdx

````
---
title: Reusable defaults
sidebar:
  order: 4
---

import { Code } from '@astrojs/starlight/components';

import defaultsCode from '@/components/form-defaults.ts?raw';
import customFormCode from '@/components/my-form.ts?raw';
import customFormComponentCode from '@/components/my-form.svelte?raw';


Even with a simple setup, resulting code is very verbose.
Therefore, it is convenient to create a file with a re-export of the selected
resolver, theme, validator and translation.

<Code code={defaultsCode} lang="typescript" title="form-defaults.ts" />

And use it like this:

```typescript
import * as defaults from '$lib/form-defaults'

const form = createForm({ ...defaults, ... })
```

## Factory

You could go further and create a wrapper around the `createForm`.

<Code code={customFormCode} lang="typescript" title="my-form.ts" />

:::note

Note that you can simplify the above code if certain restrictions are met:

- If you are sure that you will always call the `createForm` function with passing the object literal, you can use the following code instead of `Proxy`:

`Object.setPrototypeOf(options, defaults)`

- If you are sure you will not use getters as options, then use `Object.assign` instead of `Proxy`:

`Object.assign({}, defaults, options)`

:::

## Component

You also can create your own form component.

<Code code={customFormComponentCode} lang="svelte" title="my-form.svelte" />
````

## File: docs/guides/simple-setup.svelte

```
<script lang="ts">
  import { SimpleForm } from "@sjsf/form";
  import { resolver } from "@sjsf/form/resolvers/basic";
  import { translation } from "@sjsf/form/translations/en";
  import { theme } from "@sjsf/basic-theme";
</script>

<SimpleForm
  {theme}
  {translation}
  {resolver}
  schema={{
    type: "object",
    title: 'Form title',
    properties: {
      text: {
        type: "string",
        title: "Text input",
      },
    },
    required: ["text"],
  }}
  validator={{ isValid: () => true }}
  onSubmit={(v: { text: string }) => window.alert(v.text)}
/>
```

## File: docs/guides/state-transformation.mdx

````
---
title: State transformation
sidebar:
  order: 11
---

In some cases it may be necessary to transform the form state before it is passed to the validator.

You can do this by providing `getSnapshot` property.

## Omit extra data

One of the transformation options you can apply is deleting unnecessary data.

For this you can use `omitExtraData` function.

:::note

The `omitExtraData` function does not perform data validation!

:::

```svelte
<script lang="ts">
  import { defaultMerger } from '@sjsf/form/core'
  import { createForm } from "@sjsf/form";
  import { translation } from "@sjsf/form/translations/en";
  import { theme } from "@sjsf/basic-theme";
  import { omitExtraData } from "@sjsf/form/omit-extra-data";

  import { schema, uiSchema, initialValue } from "./schema";
  import { validator } from "./validator";

  const form = createForm({
    theme,
    initialValue,
    schema,
    uiSchema,
    validator,
    translation,
    getSnapshot(ctx) {
      return omitExtraData(validator, defaultMerger, schema, $state.snapshot(ctx.value))
    },
    onSubmit(value) {
      console.log("transformed", value);
    },
    onSubmitError(errors, _, value) {
      console.log("errors", errors);
      console.log("transformed", value);
    }
  })
</script>
```
````

## File: docs/guides/ui-schema.svelte

```
<script lang="ts">
  import type { Schema, UiSchemaRoot } from "@sjsf/form";

  import MyForm from "@/components/my-form.svelte";

  const schema: Schema = {
    type: "string",
    title: "Text input",
  };

  const uiSchema: UiSchemaRoot = {
    "ui:options": {
      title: "Custom title",
      help: "Help text",
      text: {
        placeholder: "placeholder",
      },
    },
  };
</script>

<MyForm {schema} {uiSchema} onSubmit={(v) => window.alert(v)} />
```

## File: docs/guides/validation.mdx

```
---
title: Validation
sidebar:
  order: 1
---

import { Code, Card, LinkCard, Tabs, TabItem } from '@astrojs/starlight/components';
import { DEFAULT_FIELDS_VALIDATION_DEBOUNCE_MS } from '@sjsf/form';

import FormCard from '@/components/form-card.astro'

import LiveValidation from './live-validation.svelte'
import liveValidationCode from './live-validation.svelte?raw'

import FieldsValidation from './fields-validation.svelte'
import fieldsValidationCode from './fields-validation.svelte?raw'

import AsyncValidation from './async-validation.svelte'
import asyncValidationCode from './async-validation.svelte?raw'

import FocusOnFirsError from './focus-on-first-error.svelte'
import focusOnFirstErrorCode from './focus-on-first-error.svelte?raw'

import ErrorsList from './errors-list.svelte'
import errorsListCode from './errors-list.svelte?raw'

By default, form data when submitted will be validated using HTML5 validation and the provided validator.

:::tip

To disable HTML5 validation pass `novalidate` attribute to the form element.

:::

## Live validation (not recommended)

You can easily implement live validation by utilizing Svelte 5 reactivity

<Code code={liveValidationCode} lang="svelte" />

<FormCard>
  <LiveValidation client:only="svelte" />
</FormCard>

While it is possible, this approach has low efficiency because
it is usually not meaningful to validate the entire form when only one field is changed.

## Fields validation

Instead of performing a full form validation every time a field is changed,
we propose to validate only the field being changed and
full validation of the form on submission.

:::note

By default, fields validation is performed with a debounce of {DEFAULT_FIELDS_VALIDATION_DEBOUNCE_MS}ms.

This behavior can be changed using the `fieldsValidationDebounceMs` option.

:::

<Code code={fieldsValidationCode} lang="svelte" />

<FormCard>
  <FieldsValidation client:only="svelte" />
</FormCard>

The form in the example above, will validate fields on `input` and `change` events.

<LinkCard title="Fields validation mode API reference" href="../../form/fields-validation-mode/" />

## Async validation

The form supports asynchronous validation.

:::note

By default

- a new form validation process can only be started after the previous one is completed;
- a new fields validation process aborts the previous one;
- fields validation abort errors are not displayed.

You can change this behavior by passing the `submissionCombinator` and `fieldsValidationCombinator` options.

:::


<Tabs>
  <TabItem label="Form">
    <FormCard title='Async form' >
      <AsyncValidation client:only="svelte" />
    </FormCard>
  </TabItem>
  <TabItem label="form.svelte">
    <Code code={asyncValidationCode} lang="svelte" />
  </TabItem>
</Tabs>

Please see your validator page for more information.

<LinkCard title="Ajv" href="../../validators/ajv/#async-validation" />
<LinkCard title="Zod" href="../../validators/zod4/#async-validation" />
<LinkCard title="Standard Schema" href="../../validators/standard-schema/#async-validation" />

## Focus on first error

You can achieve focus on the first error by using the `createFocusOnFirstError` function.

<Code code={focusOnFirstErrorCode} lang="svelte" />

<FormCard>
  <FocusOnFirsError client:only="svelte" />
</FormCard>

1. `focusOnFirstError` will try to find a focusable element and focus it.
2. If it's not found, it will try to find an errors list and scroll it into view.
3. If it's not found, it will return `false`, so you can extend the behavior.

## Errors list

If necessary, you can create a list of errors

<Code code={errorsListCode} lang="svelte" />

<FormCard>
  <ErrorsList client:only="svelte" />
</FormCard>
```

## File: docs/themes/basic/form.svelte

```
<script lang="ts">
  import { BasicForm, createForm } from "@sjsf/form";
  import { theme } from "@sjsf/basic-theme";
  import { specs } from '@sjsf/basic-theme/specs';

  import * as defaults from "@/components/form-defaults";

  import { createSchemas } from "../_demo-schema";

  const form = createForm({
    ...defaults,
    ...createSchemas(specs),
    theme,
  });
</script>

<BasicForm {form} novalidate />

<pre>{JSON.stringify(form.value, null, 2)}</pre>
```

## File: docs/themes/basic/ui-options.ts

```typescript
import type {
  HTMLAttributes,
  HTMLButtonAttributes,
  HTMLFormAttributes,
  HTMLInputAttributes,
  HTMLLabelAttributes,
  HTMLSelectAttributes,
  HTMLTextareaAttributes,
} from "svelte/elements";
import type { ButtonType, LayoutType } from "@sjsf/form/fields/components";
⋮----
export interface UiOptions {
  /**
   * Overrides the attributes of any button component.
   */
  button?: HTMLButtonAttributes;
  /**
   * Overrides the attributes of a button with a specific type.
   * This override takes precedence over the `button` override, but does not replace it.
   */
  buttons?: {
    [B in ButtonType]?: HTMLButtonAttributes;
  };
  /**
   * Overrides the attributes of the description.
   */
  descriptionAttributes?: HTMLAttributes<HTMLDivElement>;
  /**
   * Overrides the attributes of the errors list.
   */
  errorsList?: HTMLAttributes<HTMLUListElement>;

  form?: HTMLFormAttributes;
  /**
   * Overrides the attributes of the help.
   */
  helpAttributes?: HTMLAttributes<HTMLDivElement>;
  /**
   * Overrides the attributes of the field label.
   */
  labelAttributes?: HTMLLabelAttributes;
  /**
   * Overrides the attributes of any layout component.
   */
  layout?: HTMLAttributes<HTMLDivElement>;
  /**
   * Overrides the attributes of a layout with a specific type.
   * This override takes precedence over the `layout` override, but does not replace it.
   */
  layouts?: {
    [L in LayoutType]?: HTMLAttributes<HTMLDivElement>;
  };
  submitButton?: HTMLButtonAttributes;
  /**
   * Overrides the attributes of the field title
   */
  titleAttributes?: HTMLAttributes<HTMLDivElement>;

  checkbox?: HTMLInputAttributes;

  number?: HTMLInputAttributes;

  select?: HTMLSelectAttributes;

  text?: HTMLInputAttributes;

  checkboxes?: HTMLInputAttributes;

  datePicker?: HTMLInputAttributes;

  file?: HTMLInputAttributes;

  multiSelect?: HTMLSelectAttributes;

  radio?: HTMLInputAttributes;

  range?: HTMLInputAttributes;

  textarea?: HTMLTextareaAttributes;
}
⋮----
/**
   * Overrides the attributes of any button component.
   */
⋮----
/**
   * Overrides the attributes of a button with a specific type.
   * This override takes precedence over the `button` override, but does not replace it.
   */
⋮----
/**
   * Overrides the attributes of the description.
   */
⋮----
/**
   * Overrides the attributes of the errors list.
   */
⋮----
/**
   * Overrides the attributes of the help.
   */
⋮----
/**
   * Overrides the attributes of the field label.
   */
⋮----
/**
   * Overrides the attributes of any layout component.
   */
⋮----
/**
   * Overrides the attributes of a layout with a specific type.
   * This override takes precedence over the `layout` override, but does not replace it.
   */
⋮----
/**
   * Overrides the attributes of the field title
   */
```

## File: docs/themes/shadcn4/form.svelte

```
<script lang="ts">
  import { BasicForm, createForm } from "@sjsf/form";
  import { theme, setThemeContext } from "@sjsf/shadcn4-theme";
  import * as components from "@sjsf/shadcn4-theme/new-york";
  import { specs } from "@sjsf/shadcn4-theme/specs";
  import { BitsConfig } from "bits-ui";

  import { createAstro } from "@/astro.svelte";
  import * as defaults from "@/components/form-defaults";

  import { createSchemas } from "../_demo-schema";

  const astro = createAstro();

  const form = createForm({
    ...defaults,
    ...createSchemas(specs),
    theme,
  });

  setThemeContext({ components });

  let portalEl = $state.raw() as HTMLDivElement;
</script>

<BitsConfig defaultPortalTo={portalEl}>
  <BasicForm
    {form}
    novalidate
    class="flex flex-col gap-4 {astro.darkOrLight}"
    style="margin-bottom: 1rem;"
  />
</BitsConfig>
<div bind:this={portalEl}></div>

<pre>{JSON.stringify(form.value, null, 2)}</pre>
```

## File: docs/themes/shadcn4/ui-options.ts

```typescript
import type { ComponentProps } from "svelte";
import type {
  HTMLAttributes,
  HTMLFormAttributes,
  HTMLInputAttributes,
  HTMLInputTypeAttribute,
  HTMLTextareaAttributes,
} from "svelte/elements";
import type {
  CalendarSingleRootProps,
  CheckboxRootProps,
  LabelRootProps,
  RadioGroupItemProps,
  RadioGroupRootProps,
  SelectMultipleRootProps,
  SelectSingleRootProps,
  SelectTriggerProps,
  SliderSingleRootProps,
  SwitchRootProps,
  WithElementRef,
  WithoutChildrenOrChild,
  CommandInputProps,
  SingleToggleGroupRootPropsWithoutHTML,
  BitsPrimitiveDivAttributes,
  Without,
  ToggleGroupRootPropsWithoutHTML,
  ToggleGroupItemProps,
} from "bits-ui";
import type { ButtonType, LayoutType } from "@sjsf/form/fields/components";
import type { Button } from "@sjsf/shadcn4-theme/new-york";
⋮----
type InputType = Exclude<HTMLInputTypeAttribute, "file">;
⋮----
type InputProps = WithElementRef<
  Omit<HTMLInputAttributes, "type"> &
    (
      | { type: "file"; files?: FileList }
      | { type?: InputType; files?: undefined }
    )
>;
⋮----
type ToggleVariants = {
  variant?: "default" | "outline" | undefined;
  size?: "default" | "sm" | "lg" | undefined;
};
⋮----
type ToggleGroupProps = SingleToggleGroupRootPropsWithoutHTML &
  Without<BitsPrimitiveDivAttributes, ToggleGroupRootPropsWithoutHTML> &
  ToggleVariants;
⋮----
export interface UiOptions {
  shadcn4Button?: ComponentProps<typeof Button>;
  shadcn4Buttons?: {
    [B in ButtonType]: ComponentProps<typeof Button>;
  };
  /**
   * Overrides the attributes of the description.
   */
  descriptionAttributes?: HTMLAttributes<HTMLDivElement>;
  /**
   * Overrides the attributes of the errors list.
   */
  errorsList?: HTMLAttributes<HTMLUListElement>;

  form?: HTMLFormAttributes;
  /**
   * Overrides the attributes of the help.
   */
  helpAttributes?: HTMLAttributes<HTMLDivElement>;

  shadcn4Label?: LabelRootProps;
  /**
   * Overrides the attributes of any layout component.
   */
  layout?: HTMLAttributes<HTMLDivElement>;
  /**
   * Overrides the attributes of a layout with a specific type.
   * This override takes precedence over the `layout` override, but does not replace it.
   */
  layouts?: {
    [L in LayoutType]?: HTMLAttributes<HTMLDivElement>;
  };
  shadcn4SubmitButton?: ComponentProps<typeof Button>;
  /**
   * Overrides the attributes of the field title
   */
  titleAttributes?: HTMLAttributes<HTMLDivElement>;

  shadcn4Checkbox?: WithoutChildrenOrChild<CheckboxRootProps>;

  shadcn4Number?: InputProps;

  shadcn4Select?: Omit<SelectSingleRootProps, "type">;
  shadcn4SelectTrigger?: SelectTriggerProps;

  shadcn4Text?: InputProps;

  shadcn4Checkboxes?: WithoutChildrenOrChild<CheckboxRootProps>;

  shadcn4ComboboxTrigger?: ComponentProps<typeof Button>;
  shadcn4ComboboxInput?: CommandInputProps;
  shadcn4ComboboxEmptyText?: string;

  shadcn4DatePicker?: Omit<
    WithoutChildrenOrChild<CalendarSingleRootProps>,
    "type"
  >;
  shadcn4DatePickerTrigger?: ComponentProps<typeof Button>;
  shadcn4DateFormatter?: (date: Date) => string;

  file?: HTMLInputAttributes;

  shadcn4MultiSelect?: Omit<SelectMultipleRootProps, "type">;
  shadcn4MultiSelectTrigger?: SelectTriggerProps;

  shadcn4RadioButtons?: ToggleGroupProps;
  shadcn4RadioButtonsItem?: ToggleGroupItemProps & ToggleVariants;

  shadcn4RadioGroup?: WithoutChildrenOrChild<RadioGroupRootProps>;
  shadcn4RadioItem?: Omit<WithoutChildrenOrChild<RadioGroupItemProps>, "value">;

  shadcn4Range?: Omit<WithoutChildrenOrChild<SliderSingleRootProps>, "type">;

  shadcn4Switch?: WithoutChildrenOrChild<SwitchRootProps>;

  textarea?: HTMLTextareaAttributes;
}
⋮----
/**
   * Overrides the attributes of the description.
   */
⋮----
/**
   * Overrides the attributes of the errors list.
   */
⋮----
/**
   * Overrides the attributes of the help.
   */
⋮----
/**
   * Overrides the attributes of any layout component.
   */
⋮----
/**
   * Overrides the attributes of a layout with a specific type.
   * This override takes precedence over the `layout` override, but does not replace it.
   */
⋮----
/**
   * Overrides the attributes of the field title
   */
```

## File: docs/themes/basic.mdx

```
---
title: Basic
sidebar:
  order: 0
---

import { Code, Card, TabItem, Tabs } from '@astrojs/starlight/components';
import { specs, extraWidgets } from '@sjsf/basic-theme/specs';

import { withTag } from '@/shared';
import Npm from '@/components/npm.astro';
import FormCard from '@/components/form-card.astro';

import Form from './basic/form.svelte';
import uiOptionsCode from './basic/ui-options?raw';
import { createExtraImports, createSchemas, replacer } from "./_demo-schema";

export const schemas = createSchemas(specs)

## Installation

<Npm pkg={withTag('basic')} />

## Extra widgets

You can connect extra widgets using the following `include` imports:

:::note

For a widget to be applied, it must be explicitly specified in the
[UI schema](../../form/ui-schema/#ui-components)
or used in the field as the default widget.

:::

<Code lang='ts' code={createExtraImports("basic", extraWidgets)} />

## UI options

<Code code={uiOptionsCode} lang="typescript" />

## Widgets demo

<Tabs>
  <TabItem label='Form'>
    <FormCard>
      <Form client:only="svelte" />
    </FormCard>
  </TabItem>
  <TabItem label="JSON Schema" >
    <Code lang="json" code={JSON.stringify(schemas.schema, replacer, 2)} />
  </TabItem>
  <TabItem label="UI Schema">
    <Code lang="json" code={JSON.stringify(schemas.uiSchema, replacer, 2)} />
  </TabItem>
</Tabs>
```

## File: docs/themes/shadcn4.mdx

````
---
title: shadcn-svelte
sidebar:
  order: 4
---

import { Code, Card, LinkButton, Tabs, TabItem } from '@astrojs/starlight/components';
import { specs, extraWidgets } from '@sjsf/shadcn4-theme/specs';
import styles from '@sjsf/shadcn4-theme/styles.css?inline';

import { peerDependencies, optionalDependencies } from '#/shadcn4-theme/package.json'

import { withTag } from '@/shared';
import Npm from '@/components/npm.astro';
import Picker from '@/components/picker.astro';
import FormCard from '@/components/form-card.astro';

import Form from './shadcn4/form.svelte';
import uiOptionsCode from './shadcn4/ui-options?raw';
import { createSchemas, replacer, createExtraImports } from "./_demo-schema";

export const schemas = createSchemas(specs)

<Picker>
  <a href="../shadcn/" data-active={false}>tw3</a>
  <a href="." data-active={true}>tw4</a>
</Picker>

## Installation

<Npm pkg={withTag("shadcn4")} />

:::note

This is `shadcn-svelte` based theme (Tailwind v4).

:::

bits-ui <code>{peerDependencies['bits-ui']}</code> and @internationalized/date
<code>{optionalDependencies['@internationalized/date']}</code> may be required.

### Install shadcn-svelte

<LinkButton href="https://next.shadcn-svelte.com/docs/installation" variant='secondary' target="_blank" icon="external">
  Installation - shadcn-svelte
</LinkButton>

### Configuration

Register the theme source path by adding the following line to the `app.css` file:.

```css
@source "../node_modules/@sjsf/shadcn4-theme/dist";
```

## Components

Since `shadcn-svelte` is not a component library you should provide your components via `setThemeContext`.

:::note

You should prefer to use components from your code base to avoid code duplication

:::

```typescript
import { setThemeContext } from '@sjsf/shadcn4-theme';
import * as components from '@sjsf/shadcn4-theme/new-york';

setThemeContext({ components })
```

## Extra widgets

You can connect extra widgets using the following `include` imports:

:::note

For a widget to be applied, it must be explicitly specified in the
[UI schema](../../form/ui-schema/#ui-components)
or used in the field as the default widget.

:::

<Code lang='ts' code={createExtraImports("shadcn4", extraWidgets)} />

## UI options

<Code code={uiOptionsCode} lang="typescript" />

## Widgets demo

<Tabs>
  <TabItem label='Form'>
    <FormCard style={styles}>
      <Form client:only="svelte" />
    </FormCard>
  </TabItem>
  <TabItem label="JSON Schema" >
    <Code lang="json" code={JSON.stringify(schemas.schema, replacer, 2)} />
  </TabItem>
  <TabItem label="UI Schema">
    <Code lang="json" code={JSON.stringify(schemas.uiSchema, replacer, 2)} />
  </TabItem>
</Tabs>
````

## File: docs/\_on-submit.ts

```typescript
export const onSubmit = ()
```

## File: docs/\_schema.ts

```typescript
import type { Schema, UiSchemaRoot } from '@sjsf/form';
```

## File: docs/\_theme-form.svelte

```
<script lang="ts">
  import type { Component } from "svelte";

  import type { ActualTheme } from "@/shared";

  import WithBasic from "./_with-basic.svelte";
  import WithDaisyui5 from "./_with-daisyui5.svelte";
  import WithFlowbite3 from "./_with-flowbite3.svelte";
  import WithShadcn from "./_with-shadcn4.svelte";
  import WithSkeleton3 from "./_with-skeleton3.svelte";

  let { theme }: { theme: ActualTheme } = $props();

  const ThemeForm = (
    {
      basic: WithBasic,
      daisyui5: WithDaisyui5,
      flowbite3: WithFlowbite3,
      shadcn4: WithShadcn,
      skeleton3: WithSkeleton3,
    } satisfies Record<ActualTheme, Component>
  )[theme];
</script>

<ThemeForm />
```

## File: docs/\_validator.ts

```typescript
import type { ErrorObject } from "ajv";
import { createFormValidator } from "@sjsf/ajv8-validator";
import { isSchemaObjectValue } from "@sjsf/form/core";
import { pathToId, type FormValueValidator } from "@sjsf/form";
⋮----
class StarError
⋮----
export function createValidator(idPrefix: string)
⋮----
validateFormValue(rootSchema, formValue)
```

## File: docs/\_with-basic.svelte

```
<script lang="ts">
  import { createForm, BasicForm } from "@sjsf/form";
  import { resolver } from "@sjsf/form/resolvers/basic";
  import { translation } from "@sjsf/form/translations/en";
  import { theme } from "@sjsf/basic-theme";
  import "@sjsf/basic-theme/extra-widgets/textarea-include";

  import { schema, uiSchema, initialValue } from "./_schema";
  import { createValidator } from "./_validator";
  import { onSubmit } from "./_on-submit";

  const idPrefix = "basic";
  const validator = createValidator(idPrefix);
  const form = createForm({
    idPrefix,
    validator,
    theme,
    resolver,
    initialValue,
    schema,
    uiSchema,
    translation,
    onSubmit,
  });
</script>

<BasicForm {form} />

<pre>{JSON.stringify(form.value, null, 2)}</pre>
```

## File: docs/\_with-shadcn4.svelte

```
<script lang="ts">
  import { BasicForm, createForm } from "@sjsf/form";
  import { resolver } from "@sjsf/form/resolvers/basic";
  import { translation } from "@sjsf/form/translations/en";
  import { theme, setThemeContext } from "@sjsf/shadcn4-theme";
  import * as components from "@sjsf/shadcn4-theme/new-york";
  import "@sjsf/shadcn4-theme/extra-widgets/textarea-include";

  import { createAstro } from "@/astro.svelte";

  import { schema, uiSchema, initialValue } from "./_schema";
  import { createValidator } from "./_validator";
  import { onSubmit } from "./_on-submit";

  const idPrefix = "shadcn";
  const validator = createValidator(idPrefix);
  const form = createForm({
    idPrefix,
    validator,
    resolver,
    theme,
    initialValue,
    schema,
    uiSchema,
    translation,
    onSubmit,
  });
  const astro = createAstro();

  setThemeContext({ components });
</script>

<BasicForm {form} class="flex flex-col gap-4 {astro.darkOrLight}" />

<pre style="padding-top: 1rem;">{JSON.stringify(form.value, null, 2)}</pre>
```

## File: docs/index.mdx

```
---
title: svelte-jsonschema-form
description: Svelte JSON Schema Form
template: splash
hero:
  tagline: Svelte 5 library for creating forms based on JSON schema.
  actions:
    - text: Get Started
      link: guides/quickstart/
      icon: right-arrow
    - text: Playground
      link: https://x0k.github.io/svelte-jsonschema-form/playground2
      icon: external
      variant: minimal
    - text: Form Builder
      link: https://x0k.github.io/svelte-jsonschema-form/builder
      icon: external
      variant: minimal
---

import { Code, Card, CardGrid, LinkCard } from '@astrojs/starlight/components';

import Themes from './_themes.astro';

## Installation

Choose your favorite theme:

<Themes />

## License

This project includes modifications of code from [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form), which is licensed under the Apache License, Version 2.0.
The rest of the project is under the MIT license.
```

## File: examples/basic-starter/src/lib/form-defaults.ts

```typescript
import { createFormValidator } from "@sjsf/ajv8-validator";
⋮----
// NOTE: One validator will be used for all forms
```

## File: examples/basic-starter/src/routes/+page.svelte

```
<script lang="ts">
  import { createForm, BasicForm, type Schema } from "@sjsf/form";

  import * as defaults from "$lib/form-defaults";

  const schema = {
    type: "object",
    title: "Basic form",
    properties: {
      hello: {
        title: "Hello",
        type: "string",
      },
    },
    required: ["hello"],
  } as const satisfies Schema;

  const form = createForm({
    ...defaults,
    schema,
    onSubmit: console.log,
  });
</script>

<BasicForm {form} />
```

## File: examples/basic-starter/src/app.d.ts

```typescript
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
⋮----
// interface Error {}
// interface Locals {}
// interface PageData {}
// interface PageState {}
// interface Platform {}
```

## File: examples/basic-starter/src/app.html

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

## File: examples/basic-starter/.gitignore

```
node_modules

# Output
.output
.vercel
.netlify
.wrangler
/.svelte-kit
/build

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.*
!.env.example
!.env.test

# Vite
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
```

## File: examples/basic-starter/.npmrc

```
engine-strict=true
```

## File: examples/basic-starter/package.json

```json
{
	"name": "basic-starter",
	"private": true,
	"version": "0.0.1",
	"type": "module",
	"scripts": {
		"dev": "vite dev",
		"preview": "vite preview",
		"prepare": "svelte-kit sync || echo ''",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
	},
	"devDependencies": {
		"@sveltejs/adapter-auto": "^6.0.0",
		"@sveltejs/kit": "^2.16.0",
		"@sveltejs/vite-plugin-svelte": "^5.0.0",
		"svelte": "^5.33.0",
		"svelte-check": "^4.0.0",
		"typescript": "^5.0.0",
		"vite": "^6.2.6"
	},
	"dependencies": {
		"@sjsf/ajv8-validator": "^2.0.0",
		"@sjsf/basic-theme": "^2.0.0",
		"@sjsf/form": "^2.0.0",
		"ajv": "^8.17.1"
	}
}
```

## File: examples/basic-starter/svelte.config.js

```javascript
/** @type {import('@sveltejs/kit').Config} */
⋮----
// Consult https://svelte.dev/docs/kit/integrations
// for more information about preprocessors
preprocess: vitePreprocess(),
⋮----
// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
// See https://svelte.dev/docs/kit/adapters for more information about adapters.
adapter: adapter(),
```

## File: examples/basic-starter/tsconfig.json

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
	// Path aliases are handled by https://svelte.dev/docs/kit/configuration#alias
	// except $lib which is handled by https://svelte.dev/docs/kit/configuration#files
	//
	// If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
	// from the referenced tsconfig.json - TypeScript does not merge them in
}
```

## File: examples/basic-starter/vite.config.ts

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
```

## File: examples/shadcn4-starter/src/lib/form-defaults.ts

```typescript
import { createFormValidator } from "@sjsf/ajv8-validator";
⋮----
// NOTE: One validator will be used for all forms
```

## File: examples/shadcn4-starter/src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
⋮----
export function cn(...inputs: ClassValue[])
⋮----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
```

## File: examples/shadcn4-starter/src/routes/+layout.svelte

```
<script lang="ts">
  import { setThemeContext } from "@sjsf/shadcn4-theme";
  import * as components from "@sjsf/shadcn4-theme/new-york";

  import "../app.css";

  const { children } = $props();

  setThemeContext({ components });
</script>

{@render children()}
```

## File: examples/shadcn4-starter/src/routes/+page.svelte

```
<script lang="ts">
  import { createForm, BasicForm, type Schema } from "@sjsf/form";

  import * as defaults from "$lib/form-defaults";

  const schema = {
    type: "object",
    title: "Basic form",
    properties: {
      hello: {
        title: "Hello",
        type: "string",
      },
    },
    required: ["hello"],
  } as const satisfies Schema;

  const form = createForm({
    ...defaults,
    schema,
    onSubmit: console.log,
  });

</script>

<BasicForm {form} />
```

## File: examples/shadcn4-starter/src/app.css

```css
/* Workaround for StackBlitz, use @source in production */
⋮----
/* @source "../node_modules/@sjsf/shadcn4-theme/dist"; */
⋮----
:root {
⋮----
.dark {
⋮----
@theme inline {
⋮----
@layer base {
⋮----
* {
body {
⋮----
html {
```

## File: examples/shadcn4-starter/src/app.d.ts

```typescript
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
⋮----
// interface Error {}
// interface Locals {}
// interface PageData {}
// interface PageState {}
// interface Platform {}
```

## File: examples/shadcn4-starter/src/app.html

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

## File: examples/shadcn4-starter/.gitignore

```
node_modules

# Output
.output
.vercel
.netlify
.wrangler
/.svelte-kit
/build

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.*
!.env.example
!.env.test

# Vite
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
```

## File: examples/shadcn4-starter/.npmrc

```
engine-strict=true
```

## File: examples/shadcn4-starter/components.json

```json
{
	"$schema": "https://next.shadcn-svelte.com/schema.json",
	"tailwind": {
		"css": "src/app.css",
		"baseColor": "zinc"
	},
	"aliases": {
		"components": "$lib/components",
		"utils": "$lib/utils",
		"ui": "$lib/components/ui",
		"hooks": "$lib/hooks",
		"lib": "$lib"
	},
	"typescript": true,
	"registry": "https://next.shadcn-svelte.com/registry"
}
```

## File: examples/shadcn4-starter/package.json

```json
{
	"name": "shadcn4-starter",
	"private": true,
	"version": "0.0.1",
	"type": "module",
	"scripts": {
		"dev": "vite dev",
		"preview": "vite preview",
		"prepare": "svelte-kit sync || echo ''",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
	},
	"devDependencies": {
		"@lucide/svelte": "^0.501.0",
		"@sveltejs/adapter-auto": "^6.0.0",
		"@sveltejs/kit": "^2.16.0",
		"@sveltejs/vite-plugin-svelte": "^5.0.0",
		"@tailwindcss/vite": "^4.0.0",
		"clsx": "^2.1.1",
		"svelte": "^5.33.0",
		"svelte-check": "^4.0.0",
		"tailwind-merge": "^3.3.0",
		"tailwind-variants": "^1.0.0",
		"tailwindcss": "^4.0.0",
		"tw-animate-css": "^1.3.4",
		"typescript": "^5.0.0",
		"vite": "^6.2.6"
	},
	"dependencies": {
		"@sjsf/ajv8-validator": "^2.0.0",
		"@sjsf/basic-theme": "^2.0.0",
		"@sjsf/form": "^2.0.0",
		"@sjsf/shadcn4-theme": "^2.0.0",
		"ajv": "^8.17.1",
		"bits-ui": "^2.5.0"
	}
}
```

## File: examples/shadcn4-starter/svelte.config.js

```javascript
/** @type {import('@sveltejs/kit').Config} */
⋮----
// Consult https://svelte.dev/docs/kit/integrations
// for more information about preprocessors
preprocess: vitePreprocess(),
⋮----
// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
// See https://svelte.dev/docs/kit/adapters for more information about adapters.
adapter: adapter(),
```

## File: examples/shadcn4-starter/tsconfig.json

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
	// Path aliases are handled by https://svelte.dev/docs/kit/configuration#alias
	// except $lib which is handled by https://svelte.dev/docs/kit/configuration#files
	//
	// If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
	// from the referenced tsconfig.json - TypeScript does not merge them in
}
```

## File: examples/shadcn4-starter/vite.config.ts

```typescript
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
```
