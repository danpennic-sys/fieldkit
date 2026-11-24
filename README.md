# Field Kit

One local sealer. Four records. One verifier.

A quote, change order, daily, or invoice becomes a [QuantumGuard CONTRACT-v1](https://github.com/danpennic-sys/quantumguard) pack. The dispute command is:

```bash
qg verify pack.json
```

It answers `PASS`, `FAIL`, or `INDETERMINATE`. Nothing else.

## What is in this repo

- `fieldkit.mjs` — keygen, seal, and a local contract check
- `templates/` — quote, change order, daily, invoice
- `RUNBOOK.md` — the short procedure
- `example/` — one sample quote pack and the `qg` v1.0.0 stdout from 2026-11-23

## What this repo is not

- Not the frozen verifier. That stays in [danpennic-sys/quantumguard](https://github.com/danpennic-sys/quantumguard).
- Not post-quantum. v1 is Ed25519. `pqc` on the sample check is null.
- Not QuantumGuard, Inc.
- Not the paid Operator Pack. Signed binaries, the air-gap runbook, and `LICENSE.json` are the commercial layer.

Operator Pack, single site:

- $490 once: https://buy.stripe.com/5kQaEYc9AewBaJleoN0ZW01
- $1,495/year: https://buy.stripe.com/cNibJ24H8gEJcRteoN0ZW02

A paid Stripe session does not open the private repo by itself. Email the receipt to danpennic@gmail.com.

First 10 buyers: subject `Field Kit setup`. The private key is generated on your machine.

## Use

```bash
node fieldkit.mjs keygen --out fieldkit-key.json
node fieldkit.mjs seal templates/quote.json --key fieldkit-key.json --out quote-pack.json
qg verify quote-pack.json
```

`fieldkit-key.json` holds the private key. Do not commit it.

Source of this kit is MIT OR Apache-2.0, at your option. The Operator Pack is not included and is not under those licenses.
