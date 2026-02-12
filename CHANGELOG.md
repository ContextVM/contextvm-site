# contextvm-site

## 0.0.4

### Patch Changes

- feat(payments): add CEP-8 payment support and UI integration

This commit introduces CEP-8 payment support for ContextVM, enabling
servers to charge for capabilities and clients to handle payments.

Key changes include:
- Added payment notification handling services and UI components
- Integrated with @contextvm/sdk payments middleware
- Updated dependencies (e.g., @contextvm/sdk v0.4.1)
- Added documentation for ContextVM skills and payments
- Improved server announcement parsing for empty content
- Updated relay configuration with additional default relays

The payment flow allows users to see payment requirements, pay via
Lightning Network (NWC or LNbits), and track payment status in the UI.

## 0.0.3

### Patch Changes

- feat(ui): add search functionality and improve server card display

## 0.0.2

### Patch Changes

- Init: first public release
