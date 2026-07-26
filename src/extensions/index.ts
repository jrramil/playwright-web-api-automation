// Barrel for SPEC files and steps only — they sit at the top of the import graph, so
// pulling the fixture module in here is safe.
//
// Page objects, and anything else the fixtures depend on, must import the sub-path
// modules directly (`@playwright/extension/locatorExtension`, `.../expectExtension`).
// Importing this barrel from there closes a cycle: pages → barrel → fixtures → @pages.
// See AR-NO-BARREL-IN-PAGES in module 02.
//
// Ordered leaf-first so the dependency graph reads top-down.
export * from './testContext';
export * from './locatorExtension';
export * from './expectExtension';
export * from './testFixtureExtension';
