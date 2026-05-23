#!/usr/bin/env python3
"""
Patch ALL MLKit/MLImage framework binaries so arm64 slices report
LC_BUILD_VERSION platform = iOS Simulator (7) instead of iOS Device (2).

Strategy: patch bytes DIRECTLY in each arm64 slice (whether it is an ar
archive or a raw Mach-O) — no ar extract/repack, no symbol table corruption,
no duplicate-filename issues.

Usage:
  python3 patch_all_mlkit.py <pods_root>
"""

import sys, struct, os, subprocess, tempfile, shutil, glob

LC_BUILD = 0x32   # 50
PLAT_IOS = 2
PLAT_SIM = 7


# ── Core patch: scan raw bytes for every LC_BUILD_VERSION and flip platform ─

def patch_bytes(data: bytes) -> tuple[bytes, int]:
    """Return (patched_data, num_patches). Works on any binary blob."""
    data = bytearray(data)
    count = 0
    limit = len(data) - 24
    i = 0
    while i <= limit:
        if struct.unpack_from('<I', data, i)[0] == LC_BUILD:
            if struct.unpack_from('<I', data, i + 8)[0] == PLAT_IOS:
                struct.pack_into('<I', data, i + 8, PLAT_SIM)
                count += 1
        i += 1
    return bytes(data), count


# ── lipo helpers ─────────────────────────────────────────────────────────────

def lipo_info(binary: str) -> str:
    return subprocess.check_output(
        ['lipo', '-info', binary], stderr=subprocess.STDOUT
    ).decode()

def has_arch(info: str, arch: str) -> bool:
    return arch in info

def is_fat(info: str) -> bool:
    return 'Architectures in the fat file' in info

def thin(binary: str, arch: str) -> str:
    tmp = tempfile.mktemp(suffix=f'.{arch}')
    subprocess.check_call(['lipo', binary, '-thin', arch, '-output', tmp])
    return tmp


# ── Main framework patcher ───────────────────────────────────────────────────

def patch_framework_binary(binary_path: str) -> int:
    print(f"\n── Patching: {os.path.basename(binary_path)}")

    info = lipo_info(binary_path)

    if not has_arch(info, 'arm64'):
        print("  No arm64 slice — skipping.")
        return 0

    fat = is_fat(info)
    arm64_slice = thin(binary_path, 'arm64') if fat else None
    x86_slice   = thin(binary_path, 'x86_64') if (fat and has_arch(info, 'x86_64')) else None

    # Read the arm64 slice (or the whole file if single-arch)
    src = arm64_slice if arm64_slice else binary_path
    raw = open(src, 'rb').read()

    patched, count = patch_bytes(raw)

    if count == 0:
        print("  Already patched or no iOS platform markers found.")
        # cleanup temp slices
        for f in [arm64_slice, x86_slice]:
            if f and os.path.exists(f): os.unlink(f)
        return 0

    # Write patched arm64 slice to a temp file
    patched_arm64 = tempfile.mktemp(suffix='.arm64.patched')
    open(patched_arm64, 'wb').write(patched)
    if arm64_slice: os.unlink(arm64_slice)

    # Rebuild fat binary
    bak = binary_path + '.bak'
    if not os.path.exists(bak):
        shutil.copy2(binary_path, bak)

    if x86_slice:
        fat_out = tempfile.mktemp(suffix='.fat')
        subprocess.check_call(['lipo', '-create', x86_slice, patched_arm64, '-output', fat_out])
        os.unlink(x86_slice)
        os.unlink(patched_arm64)
        shutil.copy2(fat_out, binary_path)
        os.unlink(fat_out)
    else:
        # Single-arch: replace directly
        shutil.copy2(patched_arm64, binary_path)
        os.unlink(patched_arm64)

    print(f"  ✓ {count} LC_BUILD_VERSION patches applied → {os.path.basename(binary_path)}")
    return count


# ── Entry point ──────────────────────────────────────────────────────────────

if __name__ == '__main__':
    pods_root = sys.argv[1] if len(sys.argv) > 1 else \
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Pods'))
    pods_root = os.path.abspath(pods_root)

    binaries = []
    for fw in glob.glob(os.path.join(pods_root, '**', '*.framework'), recursive=True):
        if '.xcframework' in fw:
            continue   # pre-sliced XCFramework internals — skip
        fw_name = os.path.splitext(os.path.basename(fw))[0]
        binary  = os.path.join(fw, fw_name)
        if os.path.isfile(binary):
            binaries.append(binary)

    if not binaries:
        print("No framework binaries found under", pods_root)
        sys.exit(1)

    print(f"Found {len(binaries)} framework binaries to check/patch.")
    grand_total = 0
    for b in sorted(binaries):
        grand_total += patch_framework_binary(b)

    print(f"\n{'='*60}")
    print(f"DONE — {grand_total} total LC_BUILD_VERSION patches applied.")
