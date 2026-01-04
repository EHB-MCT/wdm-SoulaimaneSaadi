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

## Fix 2: PUNISH_END Logic Implementation
**Date:** 2026-01-03  
**File:** backend/routes/events.js  
**Lines:** 4, 47-85

### Problem:
Missing PUNISH_END logic to handle restrictions and auto-return.

### Solution:
Added Item import and PUNISH_END block with:

```javascript
// Added import:
import Item from "../models/Item.js";

// Added PUNISH_END logic:
if (req.body.type === "PUNISH_END") {
  // Count today's punishments
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const punishToday = await Event.countDocuments({
    childId: req.body.childId,
    type: "PUNISH_END",
    timestamp: { $gte: startOfToday }
  });

  // If >= 3 → restrict until tomorrow + auto-return
  if (punishToday >= 3) {
    const child = await Child.findById(req.body.childId);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    child.isRestricted = true;
    child.restrictedUntil = tomorrow;

    // Auto-return current item
    if (child.currentItem) {
      const item = await Item.findOne({ name: child.currentItem });
      if (item) {
        item.isAvailable = true;
        await item.save();
      }

      const returnedItemName = child.currentItem;
      child.currentItem = "";

      const autoReturnEvent = new Event({
        childId: child._id,
        type: "LOAN_END",
        timestamp: new Date(),
        label: returnedItemName
      });
      await autoReturnEvent.save();
    }

    await child.save();
  }
}
```

### Reason:
3 punishments today → restricted until tomorrow 00:00, with automatic item return and LOAN_END event creation.