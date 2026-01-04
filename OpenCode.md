# OpenCode Fixes

## Fix 1: React className Error
**Date:** 2026-01-03  
**Error:** Objects are not valid as a React child (found: [object RegExp])  
**File:** admin-frontend/src/App.jsx  
**Lines:** 111-114

### Problem:
String concatenation in className was causing React to try to render a RegExp object.

### Solution:
Changed from string concatenation to template literal:

```javascript
// Before (causing error):
className={
  "child-card " +
  (selectedChildId === c._id ? "selected" : "")
}

// After (fixed):
className={`child-card ${selectedChildId === c._id ? "selected" : ""}`}
```

### Reason:
Template literals provide cleaner string interpolation and avoid potential type coercion issues that can occur with string concatenation in React components.