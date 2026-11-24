# Field Kit runbook

One machine. One record. One pack. One verdict.

v1 is Ed25519. It is not post-quantum. The verifier does not use the network or a wall clock. A paid Stripe session does not open the private Operator Pack repo by itself.

## 1. Get the verifier

Public source and unsigned v1.0.0 binaries:

https://github.com/danpennic-sys/quantumguard

Check `SHA256SUMS.txt` before you trust a binary. Those release binaries are not HSM-signed.

Operator Pack ($490 once, or $1,495/year) is the signed-binary, air-gap runbook, `LICENSE.json`, and support layer:

- https://buy.stripe.com/5kQaEYc9AewBaJleoN0ZW01
- https://buy.stripe.com/cNibJ24H8gEJcRteoN0ZW02

This kit is not QuantumGuard, Inc.

## 2. Make a key on the sealing machine

```bash
node fieldkit.mjs keygen --out fieldkit-key.json
```

Leave `fieldkit-key.json` on that machine. Do not commit it. Do not email it.

## 3. Fill a template by hand

`templates/quote.json`, `change-order.json`, `daily.json`, or `invoice.json`.

Type the date, the customer, and the total yourself. Do not let a tool invent them.

## 4. Seal

```bash
node fieldkit.mjs seal templates/quote.json --key fieldkit-key.json --out quote-pack.json
```

## 5. Dispute check

```bash
qg verify quote-pack.json
```

`PASS` exit 0. `FAIL` exit 1. `INDETERMINATE` exit 3. Usage and I/O errors exit 2.

`node fieldkit.mjs verify` is the same contract, for a quick look. It is not the frozen `qg` binary.

## 6. File it

Keep the pack, the public key printed at keygen, and the `qg` version you ran. Store them with the job, not in a chat thread.

## 7. When it does not say PASS

- `FAIL` means the bytes no longer match the signature. Do not repair the signature. Seal a new pack and keep both files.
- `INDETERMINATE` means this is not a readable v1 bundle. It is not a "no."

## 8. Air gap

Copy `qg` and the pack on media. Verification does not need DNS, an account, or this website.

## 9. Setup, first 10 buyers

Email danpennic@gmail.com with the subject `Field Kit setup` and the Stripe receipt. We do steps 1 through 5 together. The private key is generated on your machine.
