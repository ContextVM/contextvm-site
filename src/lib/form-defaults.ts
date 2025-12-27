import { createFormValidator } from '@sjsf/ajv8-validator';
import { resolver } from '@sjsf/form/resolvers/basic';
import { translation } from '@sjsf/form/translations/en';
import { theme } from '@sjsf/shadcn4-theme';
import { createFormMerger } from '@sjsf/form/mergers/modern';
import { createFormIdBuilder } from '@sjsf/form/id-builders/modern';
import * as components from '@sjsf/shadcn4-theme/new-york';

// Create a validator instance
const validator = createFormValidator();

// Export the form defaults
export const formDefaults = {
	validator,
	resolver,
	theme,
	translation,
	merger: createFormMerger,
	idBuilder: createFormIdBuilder
};

// Export the components for theme context setup
export { components };

// Re-export types and utilities for convenience
export type { Schema } from '@sjsf/form';
export type { UiSchemaRoot } from '@sjsf/form';
export { createForm } from '@sjsf/form';
