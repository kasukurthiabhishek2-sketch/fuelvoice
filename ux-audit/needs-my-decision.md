# Needs my decision

These items were deliberately **not** changed because they alter product behavior, policy, or data semantics rather than merely correcting UX implementation.

1. **Automatic IP-based approximate location.** The app can use `ipwho.is` when precise browser location is unavailable. Removing it, adding a consent gate, or changing when it runs changes discovery/privacy behavior.
2. **Admin moderation confirmations.** Adding confirmation dialogs for Ban/Hide/Dismiss/Accept adds interaction steps and changes moderation flow.
3. **Navigation-state preservation.** Guaranteeing exact prior result/scroll restoration after visiting a station requires explicit navigation-state behavior.
4. **Mobile sticky action priority.** Making “File a complaint” or “Write a review” more visually dominant encodes a product priority rather than fixing a correctness defect.
5. **Legacy profile like-count semantics.** The UX layer cannot prove that stored `profile.likeCount` is equivalent to the current Helpful reaction model; any migration/relabel requires a product/data decision.

Everything else approved in the Round 3 report has been implemented and passed Phase 4 verification.
