---
name: blue-team
description: 藍隊防禦技術。檢測工程、SOC運營、應急響應、數字取證。當使用者提到藍隊、檢測規則、Sigma、YARA、SIEM、告警、應急響應、取證、SOC時使用。
---

# ❄ 玄冰秘典 · 藍隊防禦 (Blue Team)


## 防禦鏈

```
預防 → 檢測 → 響應 → 恢復
  │       │       │       │
  └─ 加固 ─┴─ SIEM ─┴─ IR ─┴─ 取證
```

## 檢測工程

### Sigma 規則

```yaml
# Mimikatz 檢測
title: Mimikatz Credential Dumping
id: 0d65953c-7f75-4f4b-9a16-8b8f9f2b6d5e
status: stable
description: Detects Mimikatz credential dumping via LSASS access
references:
    - https://attack.mitre.org/techniques/T1003/001/
tags:
    - attack.credential_access
    - attack.t1003.001
logsource:
    category: process_access
    product: windows
detection:
    selection:
        TargetImage|endswith: '\lsass.exe'
        GrantedAccess:
            - '0x1010'
            - '0x1038'
            - '0x1410'
    filter_system:
        SourceImage|startswith:
            - 'C:\Windows\System32\'
    condition: selection and not filter_system
level: high
---
# 可疑 PowerShell
title: Suspicious PowerShell Download
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        CommandLine|contains:
            - 'IEX'
            - 'Invoke-Expression'
            - 'DownloadString'
            - 'Net.WebClient'
            - '-enc'
            - 'FromBase64String'
    condition: selection
level: high
---
# DCSync 檢測
title: DCSync Attack
logsource:
    product: windows
    service: security
detection:
    selection:
        EventID: 4662
        Properties|contains:
            - '1131f6ad-9c07-11d1-f79f-00c04fc2dcd2'
            - '1131f6aa-9c07-11d1-f79f-00c04fc2dcd2'
    filter_dc:
        SubjectUserName|endswith: '$'
    condition: selection and not filter_dc
level: critical
```

### Sigma 轉換
```bash
# 安裝
pip install sigma-cli

# 轉換為各平臺格式
sigma convert -t splunk -p sysmon rules/
sigma convert -t elasticsearch rules/
sigma convert -t azure-monitor rules/
```

### YARA 規則

```yara
rule Mimikatz_Memory {
    meta:
        description = "Detects Mimikatz in memory"
        severity = "critical"
    strings:
        $s1 = "mimikatz" ascii wide nocase
        $s2 = "sekurlsa::logonpasswords" ascii wide
        $s3 = "lsadump::dcsync" ascii wide
        $func = "kuhl_m_" ascii
    condition:
        2 of ($s*) or $func
}

rule Cobalt_Strike_Beacon {
    meta:
        description = "Detects Cobalt Strike Beacon"
    strings:
        $config = { 69 68 69 68 69 6B 69 68 }
        $sleep = "sleeptime" ascii
        $jitter = "jitter" ascii
    condition:
        $config or all of ($sleep, $jitter)
}

rule Webshell_Generic {
    meta:
        description = "Generic webshell detection"
    strings:
        $php = "<?php" nocase
        $eval = /eval\s*\(\s*\$_(GET|POST|REQUEST)/ nocase
        $system = /system\s*\(\s*\$_(GET|POST)/ nocase
    condition:
        $php and any of ($eval, $system)
}
```

## 關鍵日誌源

### Windows 安全日誌
```python
CRITICAL_EVENTS = {
    # 登入事件
    '4624': 'Successful Logon',
    '4625': 'Failed Logon',
    '4648': 'Explicit Credential Logon',

    # 程序事件
    '4688': 'Process Creation',
    '4689': 'Process Termination',

    # 賬戶事件
    '4720': 'User Account Created',
    '4728': 'Member Added to Security Group',
    '4732': 'Member Added to Local Group',

    # Kerberos
    '4768': 'TGT Request',
    '4769': 'Service Ticket Request',
    '4771': 'Pre-Auth Failed',

    # 目錄服務
    '4662': 'Directory Service Access',
}
```

### Sysmon 事件
```python
SYSMON_EVENTS = {
    '1': 'Process Create',
    '3': 'Network Connection',
    '7': 'Image Loaded',
    '8': 'CreateRemoteThread',
    '10': 'ProcessAccess',
    '11': 'FileCreate',
    '12': 'Registry Key Create/Delete',
    '13': 'Registry Value Set',
    '17': 'Pipe Created',
    '22': 'DNS Query',
    '23': 'FileDelete',
}
```

## SOC 運營

### 告警分級
```yaml
P1 - Critical (15分鐘響應):
  - 確認的入侵活動
  - 勒索軟體執行
  - 資料外洩
  - 特權賬戶被控

P2 - High (1小時響應):
  - 可疑橫向移動
  - 憑證竊取嘗試
  - C2 通訊檢測
  - 異常特權操作

P3 - Medium (4小時響應):
  - 可疑程序執行
  - 異常網路連線
  - 策略違規

P4 - Low (24小時響應):
  - 資訊性告警
  - 合規檢查
```

### 告警質量指標
```python
class AlertMetrics:
    def calculate(self, alerts):
        total = len(alerts)
        tp = sum(1 for a in alerts if a['verified'] == 'true_positive')
        fp = sum(1 for a in alerts if a['verified'] == 'false_positive')

        return {
            'true_positive_rate': tp / total * 100,
            'false_positive_rate': fp / total * 100,
            'mean_time_to_detect': self._mttd(alerts),
            'mean_time_to_respond': self._mttr(alerts),
        }
```

## 應急響應

### IR 流程
```
┌─────────────────────────────────────────────────────────────┐
│                    應急響應流程                               │
├─────────────────────────────────────────────────────────────┤
│  1. 準備 (Preparation)                                       │
│  └─ 工具準備、流程文件、聯絡人清單                           │
│                        ↓                                     │
│  2. 識別 (Identification)                                    │
│  └─ 確認事件、評估範圍、初步分類                             │
│                        ↓                                     │
│  3. 遏制 (Containment)                                       │
│  └─ 隔離系統、阻斷通訊、保護證據                             │
│                        ↓                                     │
│  4. 根除 (Eradication)                                       │
│  └─ 清除惡意軟體、修復漏洞、重置憑證                         │
│                        ↓                                     │
│  5. 恢復 (Recovery)                                          │
│  └─ 系統恢復、監控加強、業務恢復                             │
│                        ↓                                     │
│  6. 總結 (Lessons Learned)                                   │
│  └─ 事件報告、改進措施、知識沉澱                             │
└─────────────────────────────────────────────────────────────┘
```

### 快速遏制
```bash
# Windows - 隔離主機
netsh advfirewall set allprofiles state on
netsh advfirewall firewall add rule name="Block All" dir=out action=block

# Linux - 隔離主機
iptables -P INPUT DROP
iptables -P OUTPUT DROP
iptables -A INPUT -s TRUSTED_IP -j ACCEPT

# 禁用賬戶
net user compromised_user /active:no
passwd -l compromised_user

# 終止惡意程序
taskkill /F /PID <pid>
kill -9 <pid>
```

### 證據收集
```bash
# Windows
wmic process list full > processes.txt
netstat -ano > netstat.txt
reg export HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run run.reg
wevtutil epl Security security.evtx

# Linux
ps auxf > processes.txt
netstat -tulpn > netstat.txt
cat /etc/passwd > passwd.txt
last > logins.txt
cp /var/log/auth.log .
```

## 數字取證

### 記憶體取證
```bash
# 記憶體獲取
# Windows - WinPMEM
winpmem_mini_x64.exe memory.raw

# Linux - LiME
insmod lime.ko "path=/tmp/memory.lime format=lime"

# 分析 - Volatility
vol.py -f memory.raw imageinfo
vol.py -f memory.raw --profile=Win10x64 pslist
vol.py -f memory.raw --profile=Win10x64 netscan
vol.py -f memory.raw --profile=Win10x64 malfind
vol.py -f memory.raw --profile=Win10x64 dlllist
```

### 磁碟取證
```bash
# 映象獲取
dd if=/dev/sda of=disk.img bs=4M status=progress

# 掛載分析
mount -o ro,loop disk.img /mnt/evidence

# 時間線分析
log2timeline.py timeline.plaso disk.img
psort.py -o l2tcsv timeline.plaso -w timeline.csv

# 檔案恢復
foremost -i disk.img -o recovered/
photorec disk.img
```

### 日誌分析
```bash
# Windows 事件日誌
# 使用 EvtxECmd 解析
EvtxECmd.exe -f Security.evtx --csv output/

# Linux 日誌
grep "Failed password" /var/log/auth.log
grep "Accepted" /var/log/auth.log | awk '{print $1,$2,$3,$9,$11}'
zcat /var/log/auth.log.*.gz | grep "sudo"
```

## 威脅狩獵

### 狩獵假設
```yaml
# 基於 ATT&CK 的狩獵假設
hypothesis: "攻擊者可能使用 PowerShell 下載並執行惡意程式碼"
technique: T1059.001
data_sources:
  - Windows PowerShell 日誌
  - Sysmon 程序建立
query: |
  EventID=4104 AND ScriptBlockText CONTAINS ("IEX" OR "DownloadString")
```

### 狩獵查詢示例
```sql
-- 異常父子程序關係
SELECT parent_name, process_name, command_line
FROM processes
WHERE parent_name = 'winword.exe'
  AND process_name IN ('cmd.exe', 'powershell.exe', 'wscript.exe')

-- 異常網路連線
SELECT process_name, remote_address, remote_port
FROM network_connections
WHERE remote_port NOT IN (80, 443, 53)
  AND process_name NOT IN ('chrome.exe', 'firefox.exe')

-- 可疑計劃任務
SELECT name, command, trigger
FROM scheduled_tasks
WHERE command LIKE '%powershell%' OR command LIKE '%cmd%'
```

## 工具清單

| 工具 | 用途 |
|------|------|
| Sigma | 通用檢測規則 |
| YARA | 惡意軟體檢測 |
| Splunk/Elastic | SIEM 平臺 |
| Volatility | 記憶體取證 |
| Autopsy | 磁碟取證 |
| Velociraptor | 端點響應 |
| TheHive | 事件管理 |
| MISP | 威脅情報 |

## 金鑰管理

### 金鑰生命週期
```
生成 → 儲存 → 分發 → 使用 → 輪轉 → 撤銷 → 銷燬
```

### 核心工具
| 工具 | 型別 | 特點 |
|------|------|------|
| HashiCorp Vault | 平臺 | 動態金鑰、AppRole、多後端 |
| AWS KMS | 雲服務 | 託管金鑰、信封加密、自動輪轉 |
| AWS Secrets Manager | 雲服務 | 自動輪轉、Lambda整合 |
| Sealed Secrets | K8s | GitOps 友好、加密儲存 |
| External Secrets | K8s | 多後端同步（Vault/AWS/GCP） |

### 金鑰管理檢查清單
```yaml
生成與儲存:
  - [ ] 加密強隨機數生成器
  - [ ] 金鑰長度符合標準（AES-256, RSA-2048+）
  - [ ] 集中儲存在金鑰管理系統 + 靜態加密 + 訪問控制

分發與使用:
  - [ ] 最小許可權 + 短期憑證優先（動態金鑰）
  - [ ] 禁止硬編碼，使用環境變數或掛載卷
  - [ ] 傳輸加密（TLS）

輪轉與撤銷:
  - [ ] 定期自動輪轉（P0年度/P1季度/P2月度/P3小時）
  - [ ] 支援緊急撤銷 + 輪轉後驗證 + 審計日誌

監控:
  - [ ] 記錄所有金鑰訪問 + 異常檢測告警 + 定期合規審計
```

### Vault 關鍵操作速查
```bash
# KV 讀寫
vault kv put secret/myapp/config db_password="xxx" api_key="yyy"
vault kv get -field=db_password secret/myapp/config

# 動態資料庫憑證
vault read database/creds/readonly

# AppRole 登入
vault write auth/approle/login role_id="<id>" secret_id="<id>"
```

### 金鑰分類策略
| 級別 | 型別 | 輪轉週期 | 儲存 |
|------|------|----------|------|
| P0 | 根金鑰、主金鑰 | 年度 | HSM |
| P1 | 資料加密金鑰 | 季度 | Vault |
| P2 | API 金鑰 | 月度 | Secrets Manager |
| P3 | 會話令牌 | 小時 | Redis |

---

