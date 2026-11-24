# Recorded check

Sample only. Hale Properties is not a real customer job.

| Item | Value |
| --- | --- |
| Binary | `qg_linux_amd64` from [quantumguard v1.0.0](https://github.com/danpennic-sys/quantumguard/releases/tag/v1.0.0) |
| SHA-256 | `15970129db44b05bd9d2dfa9289d34a21ec0395a4f4e5c237af31517076d5955` |
| Signed? | No. Release binaries are not HSM-signed. |
| Command | `qg verify example/quote-pack.json` |
| Exit | 0 |
| stdout | `example/qg-verify.json` (`PASS`, reason `valid`, `pqc` null) |
| Date | 2026-11-23 |

`pqc: null` means this check made no post-quantum claim.

The reserved Rust / ML-DSA track is not this kit and was not part of this check.

A one-byte change to the payload, checked with the same binary, returned `FAIL` (exit 1): payload hash mismatch. Empty input returned `INDETERMINATE` (exit 3). Those two files are not stored here; they were produced only to see the other verdicts.
