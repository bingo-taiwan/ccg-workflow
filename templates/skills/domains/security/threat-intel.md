---
name: threat-intel
description: 威脅情報。OSINT、威脅狩獵、情報分析、IOC管理。當使用者提到威脅情報、OSINT、開源情報、威脅狩獵、IOC、TTP、ATT&CK時使用。
---

# 👁 天眼秘典 · 威脅情報 (Threat Intelligence)


## 情報層次

```
┌─────────────────────────────────────────────────────────────┐
│                    威脅情報金字塔                             │
├─────────────────────────────────────────────────────────────┤
│                      戰略情報                                │
│                   (決策層/長期趨勢)                          │
│                    ─────────────                             │
│                     戰術情報                                 │
│                  (TTP/攻擊手法)                              │
│                   ─────────────                              │
│                    運營情報                                  │
│                 (攻擊活動/APT)                               │
│                  ─────────────                               │
│                   技術情報                                   │
│                (IOC/IP/域名/Hash)                            │
└─────────────────────────────────────────────────────────────┘
```

## OSINT 資訊收集

### 域名/IP 情報
```bash
# DNS 查詢
dig +short example.com
dig +short -x 1.2.3.4
host example.com

# WHOIS
whois example.com
whois 1.2.3.4

# 子域名列舉
subfinder -d example.com
amass enum -d example.com
```

### 線上情報平臺
```yaml
IP/域名信譽:
  - VirusTotal: https://www.virustotal.com
  - AbuseIPDB: https://www.abuseipdb.com
  - Shodan: https://www.shodan.io
  - Censys: https://search.censys.io
  - GreyNoise: https://www.greynoise.io

惡意軟體分析:
  - Any.Run: https://any.run
  - Hybrid Analysis: https://www.hybrid-analysis.com
  - Joe Sandbox: https://www.joesandbox.com
  - MalwareBazaar: https://bazaar.abuse.ch

威脅情報:
  - AlienVault OTX: https://otx.alienvault.com
  - MISP: https://www.misp-project.org
  - ThreatFox: https://threatfox.abuse.ch
```

### 搜尋引擎 Dorking
```
# Google Dorks
site:example.com filetype:pdf
site:example.com inurl:admin
site:example.com intitle:"index of"
"password" filetype:log site:example.com

# Shodan
hostname:example.com
org:"Target Company"
ssl.cert.subject.cn:example.com
http.title:"Dashboard"

# Censys
services.http.response.html_title:"Admin"
services.tls.certificates.leaf.subject.common_name:example.com
```

### 社交媒體情報
```yaml
平臺:
  - LinkedIn: 員工資訊、組織架構
  - GitHub: 程式碼洩露、API金鑰
  - Twitter: 安全事件、漏洞披露
  - Pastebin: 資料洩露

GitHub Dorks:
  - "example.com" password
  - "example.com" api_key
  - "example.com" secret
  - org:example filename:.env
```

## IOC 管理

### IOC 型別
```yaml
網路層:
  - IP 地址
  - 域名
  - URL
  - User-Agent

主機層:
  - 檔案 Hash (MD5/SHA1/SHA256)
  - 檔案路徑
  - 登錄檔鍵
  - 程序名

行為層:
  - YARA 規則
  - Sigma 規則
  - Snort 規則
```

### IOC 格式 (STIX/TAXII)
```json
{
  "type": "indicator",
  "id": "indicator--xxx",
  "created": "2024-01-01T00:00:00.000Z",
  "pattern": "[file:hashes.SHA256 = 'abc123...']",
  "pattern_type": "stix",
  "valid_from": "2024-01-01T00:00:00.000Z",
  "labels": ["malicious-activity"],
  "kill_chain_phases": [{
    "kill_chain_name": "mitre-attack",
    "phase_name": "execution"
  }]
}
```

### IOC 自動化查詢
```python
#!/usr/bin/env python3
"""IOC 批次查詢"""
import requests

class IOCChecker:
    def __init__(self, vt_api_key):
        self.vt_key = vt_api_key

    def check_hash(self, file_hash):
        """VirusTotal Hash 查詢"""
        url = f"https://www.virustotal.com/api/v3/files/{file_hash}"
        headers = {"x-apikey": self.vt_key}
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            stats = data['data']['attributes']['last_analysis_stats']
            return {
                'malicious': stats['malicious'],
                'suspicious': stats['suspicious'],
                'harmless': stats['harmless']
            }
        return None

    def check_ip(self, ip):
        """AbuseIPDB 查詢"""
        url = "https://api.abuseipdb.com/api/v2/check"
        params = {"ipAddress": ip, "maxAgeInDays": 90}
        # 需要 API Key
        pass

    def check_domain(self, domain):
        """域名信譽查詢"""
        pass
```

## ATT&CK 對映

### TTP 分析
```yaml
# 攻擊者畫像
APT_Profile:
  name: "APT-XX"
  aliases: ["Group A", "Group B"]
  targets:
    - 金融行業
    - 政府機構
  techniques:
    initial_access:
      - T1566.001: Spearphishing Attachment
      - T1566.002: Spearphishing Link
    execution:
      - T1059.001: PowerShell
      - T1059.003: Windows Command Shell
    persistence:
      - T1547.001: Registry Run Keys
      - T1053.005: Scheduled Task
    c2:
      - T1071.001: Web Protocols
      - T1573.001: Encrypted Channel
  tools:
    - Cobalt Strike
    - Mimikatz
    - Custom Malware
```

### ATT&CK Navigator
```python
# 生成 ATT&CK Navigator 層
def generate_navigator_layer(techniques):
    layer = {
        "name": "Threat Actor Coverage",
        "versions": {"attack": "13", "navigator": "4.8"},
        "domain": "enterprise-attack",
        "techniques": []
    }

    for tech_id, score in techniques.items():
        layer["techniques"].append({
            "techniqueID": tech_id,
            "score": score,
            "color": "#ff6666" if score > 50 else "#ffcc66"
        })

    return layer
```

## 威脅狩獵

### 狩獵流程
```
假設生成 → 資料收集 → 分析調查 → 發現驗證 → 知識沉澱
    │           │           │           │           │
    └─ ATT&CK ──┴─ SIEM ────┴─ 查詢 ────┴─ IOC ────┴─ 規則
```

### 狩獵假設模板
```yaml
hypothesis: "攻擊者可能透過 PowerShell 下載執行惡意程式碼"
technique: T1059.001
data_sources:
  - Windows PowerShell 日誌 (4103, 4104)
  - Sysmon 程序建立 (Event ID 1)
query: |
  EventID=4104 AND ScriptBlockText CONTAINS
  ("IEX" OR "Invoke-Expression" OR "DownloadString" OR "Net.WebClient")
expected_results:
  - 可疑指令碼塊
  - 外部 URL 下載
  - 編碼命令
response:
  - 隔離主機
  - 提取樣本
  - 擴充套件狩獵
```

### 狩獵查詢庫
```sql
-- 異常 PowerShell 執行
SELECT timestamp, hostname, user, command_line
FROM process_events
WHERE process_name = 'powershell.exe'
  AND (command_line LIKE '%IEX%'
       OR command_line LIKE '%DownloadString%'
       OR command_line LIKE '%-enc%')

-- 異常網路連線
SELECT timestamp, process_name, remote_address, remote_port
FROM network_events
WHERE remote_port NOT IN (80, 443, 53, 22)
  AND remote_address NOT LIKE '10.%'
  AND remote_address NOT LIKE '192.168.%'

-- 可疑檔案建立
SELECT timestamp, process_name, file_path
FROM file_events
WHERE file_path LIKE '%\Temp\%'
  AND file_path LIKE '%.exe'
  AND process_name IN ('powershell.exe', 'cmd.exe', 'wscript.exe')
```

## 情報共享

### MISP 整合
```python
from pymisp import PyMISP

misp = PyMISP(url, key, ssl=False)

# 建立事件
event = misp.new_event(
    distribution=0,
    info="Phishing Campaign 2024-01",
    analysis=2,
    threat_level_id=2
)

# 新增 IOC
misp.add_attribute(event, type='ip-dst', value='1.2.3.4')
misp.add_attribute(event, type='domain', value='malicious.com')
misp.add_attribute(event, type='sha256', value='abc123...')

# 新增標籤
misp.tag(event, 'tlp:amber')
misp.tag(event, 'misp-galaxy:mitre-attack-pattern="T1566"')
```

## 工具清單

| 工具 | 用途 |
|------|------|
| MISP | 威脅情報平臺 |
| OpenCTI | 威脅情報管理 |
| TheHive | 事件響應平臺 |
| Maltego | 關係分析 |
| Shodan | 網路空間搜尋 |
| VirusTotal | 惡意軟體分析 |
| ATT&CK Navigator | TTP 視覺化 |

## 威脅建模

### 建模流程
```
資產識別 → 架構分解 → 威脅列舉 → 風險評級 → 緩解措施 → 驗證
```

### STRIDE 速查
| 威脅 | 含義 | 緩解 |
|------|------|------|
| Spoofing | 身份偽造 | 強認證、MFA |
| Tampering | 資料篡改 | 完整性校驗、簽名 |
| Repudiation | 否認操作 | 審計日誌、數字簽名 |
| Info Disclosure | 資訊洩露 | 加密、訪問控制 |
| DoS | 拒絕服務 | 限流、冗餘 |
| EoP | 許可權提升 | 最小許可權、輸入驗證 |

### PASTA 七階段
```
定義目標 → 技術範圍 → 應用分解 → 威脅分析 → 漏洞分析 → 攻擊建模 → 風險管理
```

### 攻擊樹建模
```yaml
# OR節點: 任一子成功即成功, 風險=1-∏(1-Pi)
# AND節點: 全部子成功才成功, 風險=∏Pi
# 每節點屬性: goal, cost, skill, detection, success_rate, mitigations
```

### 風險矩陣
```
>=15 嚴重(立即) / >=10 高(優先) / >=6 中(計劃) / <6 低(監控)
風險分 = 可能性(1-5) x 影響(1-5)
```

### 威脅建模檢查清單
```yaml
準備: 識別關鍵資產 + 定義安全目標 + 組建跨職能團隊
建模: 資料流圖+信任邊界 + STRIDE/PASTA列舉 + 風險評級 + 緩解措施
驗證: 安全測試 + 定期更新模型 + 跟蹤緩解實施 + 事件後覆盤
```

### 工具
| 工具 | 特點 |
|------|------|
| Microsoft Threat Modeling Tool | STRIDE 自動化 |
| OWASP Threat Dragon | 開源、DFD 支援 |
| Threagile | CLI、程式碼化建模 |
| PyTM | Python 程式設計式建模 |

---

