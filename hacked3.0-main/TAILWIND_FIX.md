# Tailwind CSS Fix Applied

## Issue
The `ModelSelector.module.scss` file was using `@apply` directive with Tailwind utilities in a CSS module, but Tailwind CSS v4 requires the `@reference` directive for CSS modules.

## Error Message
```
Cannot apply unknown utility class `p-2`. 
Are you using CSS modules or similar and missing `@reference`?
```

## Solution Applied
Added `@reference;` at the top of the file:

### Before:
```scss
.modelSelector {
    .select {
      @apply flex-1 p-2 rounded-lg border-2 transition-all;
      // ...
    }
}
```

### After:
```scss
@reference;

.modelSelector {
    .select {
      @apply flex-1 p-2 rounded-lg border-2 transition-all;
      // ...
    }
}
```

## Fixed File
- `app/components/chat/ModelSelector.module.scss`

## Status
✅ Fixed - The AI server should now start without errors

## Reference
https://tailwindcss.com/docs/functions-and-directives#reference-directive
