#!/usr/bin/env python3
"""
Patch LC_BUILD_VERSION platform field in Mach-O .o files
from iOS (2) to iOS Simulator (7) in-place.

LC_BUILD_VERSION structure (little-endian):
  offset 0:  cmd       (4 bytes) = 0x32 (50)
  offset 4:  cmdsize   (4 bytes)
  offset 8:  platform  (4 bytes)  <-- we patch this: 2 -> 7
  offset 12: minos     (4 bytes)
  offset 16: sdk       (4 bytes)
  offset 20: ntools    (4 bytes)
"""

import sys
import struct
import os

LC_BUILD_VERSION = 0x32  # 50
PLATFORM_IOS = 2
PLATFORM_IOS_SIMULATOR = 7

def patch_file(path):
    with open(path, 'r+b') as f:
        data = bytearray(f.read())

    original = bytes(data)
    patched_count = 0
    i = 0
    # Scan entire file for LC_BUILD_VERSION signatures
    while i <= len(data) - 24:
        cmd = struct.unpack_from('<I', data, i)[0]
        if cmd == LC_BUILD_VERSION:
            cmdsize   = struct.unpack_from('<I', data, i + 4)[0]
            platform  = struct.unpack_from('<I', data, i + 8)[0]
            if platform == PLATFORM_IOS:
                struct.pack_into('<I', data, i + 8, PLATFORM_IOS_SIMULATOR)
                patched_count += 1
                print(f"  [{path}] offset 0x{i:x}: platform {PLATFORM_IOS} -> {PLATFORM_IOS_SIMULATOR}")
        i += 1  # byte-by-byte scan to catch all occurrences

    if patched_count:
        with open(path, 'wb') as f:
            f.write(data)
        print(f"  Wrote {patched_count} patch(es) to {path}")
    else:
        print(f"  No iOS platform bytes found in {path} (already patched or different format)")

    return patched_count

if __name__ == '__main__':
    files = sys.argv[1:] if len(sys.argv) > 1 else []
    if not files:
        # Default: patch all .o files in same directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        files = [os.path.join(script_dir, f)
                 for f in os.listdir(script_dir)
                 if f.endswith('.o')]

    if not files:
        print("No .o files found to patch.")
        sys.exit(1)

    total = 0
    for path in sorted(files):
        print(f"Patching: {path}")
        total += patch_file(path)

    print(f"\nDone. Total patches applied: {total}")
