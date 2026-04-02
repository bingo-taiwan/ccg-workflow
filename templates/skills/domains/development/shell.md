---
name: shell
description: Shell 指令碼開發。Bash、自動化、系統管理。當使用者提到 Shell、Bash、指令碼、自動化、Linux命令時使用。
---

# 📜 符籙秘典 · Shell


## Bash 基礎

### 變數與字串
```bash
#!/bin/bash

# 變數
name="Alice"
age=25
readonly PI=3.14

# 字串操作
str="Hello World"
echo ${#str}           # 長度: 11
echo ${str:0:5}        # 擷取: Hello
echo ${str/World/Bash} # 替換: Hello Bash
echo ${str,,}          # 小寫: hello world
echo ${str^^}          # 大寫: HELLO WORLD

# 預設值
echo ${var:-default}   # 如果 var 未設定，返回 default
echo ${var:=default}   # 如果 var 未設定，設定並返回 default
```

### 陣列
```bash
# 索引陣列
arr=("a" "b" "c")
echo ${arr[0]}         # 第一個元素
echo ${arr[@]}         # 所有元素
echo ${#arr[@]}        # 陣列長度

# 遍歷
for item in "${arr[@]}"; do
    echo "$item"
done

# 關聯陣列 (Bash 4+)
declare -A map
map[name]="Alice"
map[age]=25
echo ${map[name]}
```

### 條件判斷
```bash
# 字串比較
if [[ "$str1" == "$str2" ]]; then
    echo "Equal"
fi

# 數值比較
if [[ $a -eq $b ]]; then echo "Equal"; fi
if [[ $a -lt $b ]]; then echo "Less"; fi
if [[ $a -gt $b ]]; then echo "Greater"; fi

# 檔案測試
if [[ -f "$file" ]]; then echo "File exists"; fi
if [[ -d "$dir" ]]; then echo "Directory exists"; fi
if [[ -r "$file" ]]; then echo "Readable"; fi
if [[ -w "$file" ]]; then echo "Writable"; fi
if [[ -x "$file" ]]; then echo "Executable"; fi

# 邏輯運算
if [[ $a -gt 0 && $b -gt 0 ]]; then echo "Both positive"; fi
if [[ $a -gt 0 || $b -gt 0 ]]; then echo "At least one positive"; fi
```

### 迴圈
```bash
# for 迴圈
for i in {1..5}; do
    echo $i
done

for file in *.txt; do
    echo "Processing $file"
done

# while 迴圈
while read -r line; do
    echo "$line"
done < file.txt

# until 迴圈
count=0
until [[ $count -ge 5 ]]; do
    echo $count
    ((count++))
done
```

### 函式
```bash
# 定義函式
greet() {
    local name="$1"
    echo "Hello, $name!"
    return 0
}

# 呼叫
greet "Alice"
result=$?  # 獲取返回值

# 返回字串
get_date() {
    echo "$(date +%Y-%m-%d)"
}
today=$(get_date)
```

## 實用指令碼模板

### 帶引數的指令碼
```bash
#!/bin/bash
set -euo pipefail

usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS] <input>

Options:
    -o, --output FILE   Output file
    -v, --verbose       Verbose mode
    -h, --help          Show this help
EOF
    exit 1
}

# 預設值
OUTPUT=""
VERBOSE=false

# 解析引數
while [[ $# -gt 0 ]]; do
    case "$1" in
        -o|--output)
            OUTPUT="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        -*)
            echo "Unknown option: $1"
            usage
            ;;
        *)
            INPUT="$1"
            shift
            ;;
    esac
done

# 檢查必需引數
if [[ -z "${INPUT:-}" ]]; then
    echo "Error: Input is required"
    usage
fi

# 主邏輯
main() {
    if $VERBOSE; then
        echo "Processing $INPUT..."
    fi
    # 處理邏輯
}

main
```

### 日誌函式
```bash
#!/bin/bash

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

die() {
    log_error "$1"
    exit 1
}
```

### 錯誤處理
```bash
#!/bin/bash
set -euo pipefail

# 錯誤處理
trap 'echo "Error on line $LINENO"; exit 1' ERR

# 清理函式
cleanup() {
    rm -f "$TEMP_FILE"
}
trap cleanup EXIT

TEMP_FILE=$(mktemp)
```

## 常用命令組合

### 文字處理
```bash
# grep - 搜尋
grep -r "pattern" .
grep -v "exclude"          # 排除
grep -i "case insensitive" # 忽略大小寫
grep -E "regex"            # 正則

# sed - 替換
sed 's/old/new/g' file
sed -i 's/old/new/g' file  # 原地修改
sed -n '10,20p' file       # 列印行

# awk - 處理
awk '{print $1}' file      # 第一列
awk -F: '{print $1}' /etc/passwd
awk 'NR>1 {sum+=$1} END {print sum}' file

# 組合
cat file | grep "pattern" | awk '{print $2}' | sort | uniq -c
```

### 檔案操作
```bash
# 查詢
find . -name "*.txt"
find . -type f -mtime -7   # 7天內修改
find . -size +100M         # 大於100M
find . -name "*.log" -exec rm {} \;

# 批次重新命名
for f in *.txt; do
    mv "$f" "${f%.txt}.md"
done

# 批次處理
find . -name "*.py" | xargs grep "TODO"
```

### 網路
```bash
# curl
curl -s https://api.example.com/data
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' URL
curl -o output.file URL

# 埠檢查
nc -zv host 80
ss -tulpn | grep :80
```

## 最佳實踐

```bash
#!/bin/bash
# 1. 使用 set 選項
set -euo pipefail

# 2. 引用變數
echo "$variable"

# 3. 使用 [[ ]] 而非 [ ]
if [[ -f "$file" ]]; then

# 4. 使用 $() 而非反引號
result=$(command)

# 5. 使用 local 宣告區域性變數
func() {
    local var="value"
}

# 6. 檢查命令是否存在
command -v git &>/dev/null || die "git not found"

# 7. 使用 shellcheck 檢查
# shellcheck script.sh
```

---

