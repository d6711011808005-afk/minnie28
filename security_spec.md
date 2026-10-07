# Security Specification

## 1. Data Invariants
- Each transaction must belong to the authenticated user (`userId == request.auth.uid`).
- A user can only access, create, update, and delete their own transactions under `/users/{userId}/transactions/{transactionId}`.
- Transaction amount must be positive (`amount > 0`).
- Transaction type must be strictly `'income'` or `'expense'`.
- Subcollections under `/users/{userId}` require `request.auth.uid == userId`.
- Cross-user data snooping or modifying is strictly prohibited.

## 2. The "Dirty Dozen" Payloads (Negative Tests)
1. Unauthenticated write to `/users/{userId}/transactions/{tId}`.
2. User A writing to User B's `/users/userB/transactions/{tId}`.
3. Setting negative amount `amount: -500`.
4. Setting invalid type `type: "invalid_type"`.
5. Missing required field `amount`.
6. Oversized note exceeding 500 characters.
7. Path traversal or invalid character ID in path `{tId}`.
8. User A reading User B's transactions list.
9. Modifying someone else's budget in `/users/userB/profile/settings`.
10. Impersonating another `userId` inside transaction payload.
11. Updating `userId` to a different user ID after creation.
12. Injecting unknown extra properties into transaction document.

## 3. Security Rules Architecture
- Default deny: `match /{document=**} { allow read, write: if false; }`
- User gate: `match /users/{userId}` requires `isSignedIn() && request.auth.uid == userId`.
- Standalone validation helper: `isValidTransaction(data)`.
- Reusable primitives: `isSignedIn()`, `isValidId()`, `isOwner(userId)`.
