#!/usr/bin/env node
/**
 * Field Kit sealer. CONTRACT-v1, Ed25519 over the raw SHA-256 bytes.
 * This script is a local check. The dispute verdict is `qg verify`.
 * v1 is not post-quantum.
 */
import { webcrypto } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const subtle = webcrypto.subtle;

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  const entries = Object.entries(value)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

function usage() {
  fail(`fieldkit — seal a record into a CONTRACT-v1 pack

  node fieldkit.mjs keygen --out key.json
  node fieldkit.mjs seal record.json --key key.json --out pack.json
  node fieldkit.mjs verify pack.json

The dispute command is still: qg verify pack.json
Verdicts: PASS, FAIL, INDETERMINATE. v1 is Ed25519, not post-quantum.`);
}

async function keygen(outPath) {
  const pair = await subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const publicRaw = new Uint8Array(await subtle.exportKey("raw", pair.publicKey));
  const pkcs8 = new Uint8Array(await subtle.exportKey("pkcs8", pair.privateKey));
  const doc = {
    alg: "ed25519",
    public_key: bytesToHex(publicRaw),
    private_key_pkcs8_hex: bytesToHex(pkcs8),
    note: "Private key. Keep on this machine. Do not commit it.",
  };
  writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`);
  console.log(`wrote ${outPath}`);
  console.log(`public_key ${doc.public_key}`);
}

async function loadKey(path) {
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const raw = hexToBytes(doc.private_key_pkcs8_hex || "");
  const pub = hexToBytes(doc.public_key || "");
  if (!raw || !pub || pub.length !== 32) fail(`key file ${path} is missing Ed25519 fields`);
  const privateKey = await subtle.importKey("pkcs8", raw, { name: "Ed25519" }, false, ["sign"]);
  return { privateKey, publicKey: bytesToHex(pub) };
}

async function seal(recordPath, keyPath, outPath) {
  if (!existsSync(keyPath)) {
    console.error(`no key at ${keyPath}; generating one`);
    await keygen(keyPath);
  }
  const record = JSON.parse(readFileSync(recordPath, "utf8"));
  const { privateKey, publicKey } = await loadKey(keyPath);
  const payload = new TextEncoder().encode(canonicalJson(record));
  const hash = new Uint8Array(await subtle.digest("SHA-256", payload));
  const signature = new Uint8Array(await subtle.sign({ name: "Ed25519" }, privateKey, hash));
  const bundle = {
    version: "1",
    payload: Buffer.from(payload).toString("base64"),
    payload_hash: bytesToHex(hash),
    signature: bytesToHex(signature),
    public_key: publicKey,
    alg: "ed25519",
  };
  writeFileSync(outPath, `${JSON.stringify(bundle, null, 2)}\n`);
  console.log(`wrote ${outPath}`);
  console.log("page-or-script check is not the dispute verdict. Run: qg verify " + outPath);
}

async function verify(packPath) {
  let bundle;
  try {
    bundle = JSON.parse(readFileSync(packPath, "utf8"));
  } catch {
    console.log("INDETERMINATE");
    console.log("malformed JSON");
    process.exit(3);
  }
  const bad =
    !bundle ||
    bundle.version !== "1" ||
    bundle.alg !== "ed25519" ||
    typeof bundle.payload !== "string" ||
    typeof bundle.payload_hash !== "string" ||
    typeof bundle.signature !== "string" ||
    typeof bundle.public_key !== "string";
  if (bad) {
    console.log("INDETERMINATE");
    console.log("not a version 1 ed25519 bundle");
    process.exit(3);
  }
  const payload = Buffer.from(bundle.payload, "base64");
  const hash = hexToBytes(bundle.payload_hash);
  const signature = hexToBytes(bundle.signature);
  const publicKey = hexToBytes(bundle.public_key);
  if (!hash || hash.length !== 32 || !signature || signature.length !== 64 || !publicKey || publicKey.length !== 32) {
    console.log("INDETERMINATE");
    console.log("hash, signature, or key is the wrong size");
    process.exit(3);
  }
  const actual = bytesToHex(new Uint8Array(await subtle.digest("SHA-256", payload)));
  const key = await subtle.importKey("raw", publicKey, { name: "Ed25519" }, false, ["verify"]);
  const signatureOk = await subtle.verify({ name: "Ed25519" }, key, signature, hash);
  const hashOk = actual === bundle.payload_hash.toLowerCase();
  if (hashOk && signatureOk) {
    console.log("PASS");
    console.log("local contract check only — confirm with qg verify");
    process.exit(0);
  }
  console.log("FAIL");
  console.log(hashOk ? "signature does not check" : "payload_hash does not match SHA-256 of payload");
  process.exit(1);
}

const [cmd, ...rest] = process.argv.slice(2);
function flag(name, fallback) {
  const i = rest.indexOf(name);
  if (i === -1) return fallback;
  return rest[i + 1] || fallback;
}

if (cmd === "keygen") await keygen(flag("--out", "fieldkit-key.json"));
else if (cmd === "seal") {
  const positional = rest.filter((arg, i) => !arg.startsWith("--") && !rest[i - 1]?.startsWith("--"));
  if (!positional[0]) usage();
  await seal(positional[0], flag("--key", "fieldkit-key.json"), flag("--out", "pack.json"));
}
else if (cmd === "verify") {
  const positional = rest.filter((arg, i) => !arg.startsWith("--") && !rest[i - 1]?.startsWith("--"));
  if (!positional[0]) usage();
  await verify(positional[0]);
} else usage();
