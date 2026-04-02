---
name: devsecops
description: DevSecOps。CI/CD安全、供應鏈安全、合規自動化。當使用者提到 DevSecOps、CI/CD、供應鏈安全、SAST、DAST時使用。
---

# 🔧 煉器秘典 · DevSecOps


## 安全左移

```
┌─────────────────────────────────────────────────────────────┐
│                    安全左移                                  │
├─────────────────────────────────────────────────────────────┤
│  計劃 → 編碼 → 構建 → 測試 → 釋出 → 部署 → 運維 → 監控     │
│    │      │      │      │      │      │      │      │       │
│  威脅   SAST   SCA   DAST   簽名   配置   日誌   告警       │
│  建模   IDE    依賴   滲透   驗證   加固   審計   響應       │
└─────────────────────────────────────────────────────────────┘
```

## CI/CD 安全

### GitHub Actions
```yaml
name: Security Pipeline

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # SAST - 靜態分析
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: p/security-audit

      # SCA - 依賴掃描
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'

      # Secret 掃描
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2

      # 容器掃描
      - name: Build and scan image
        run: |
          docker build -t myapp:${{ github.sha }} .
          trivy image myapp:${{ github.sha }}
```

### GitLab CI
```yaml
stages:
  - test
  - security
  - build
  - deploy

sast:
  stage: security
  image: semgrep/semgrep
  script:
    - semgrep --config=p/security-audit .

dependency_scan:
  stage: security
  image: aquasec/trivy
  script:
    - trivy fs --severity HIGH,CRITICAL .

container_scan:
  stage: security
  image: aquasec/trivy
  script:
    - trivy image $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

## 安全掃描工具

### SAST (靜態分析)
```yaml
工具:
  - Semgrep: 多語言，規則豐富
  - SonarQube: 企業級
  - CodeQL: GitHub 原生
  - Bandit: Python 專用

整合:
  - IDE 外掛
  - Pre-commit hooks
  - CI/CD pipeline
```

### SCA (依賴掃描)
```yaml
工具:
  - Trivy: 全能掃描
  - Snyk: 商業方案
  - OWASP Dependency-Check
  - npm audit / pip-audit

檢查項:
  - 已知漏洞 (CVE)
  - 許可證合規
  - 過期依賴
```

### DAST (動態分析)
```yaml
工具:
  - OWASP ZAP
  - Nuclei
  - Burp Suite

整合:
  - 部署後自動掃描
  - 定期掃描
  - PR 環境掃描
```

## 供應鏈安全

### 依賴管理
```yaml
原則:
  - 鎖定依賴版本
  - 定期更新
  - 審查新依賴
  - 使用私有倉庫

工具:
  - Dependabot
  - Renovate
  - Snyk
```

### 映象安全
```yaml
原則:
  - 使用官方基礎映象
  - 最小化映象
  - 掃描漏洞
  - 簽名驗證

工具:
  - Trivy
  - Cosign (簽名)
  - Notary
```

### SBOM (軟體物料清單)
```bash
# 生成 SBOM
syft packages dir:. -o spdx-json > sbom.json

# 掃描 SBOM
grype sbom:sbom.json
```

## 安全門禁

```yaml
阻斷條件:
  - Critical 漏洞
  - 高危依賴
  - Secret 洩露
  - 許可證違規

警告條件:
  - High 漏洞
  - 中危依賴
  - 程式碼質量問題
```

## 合規自動化

```yaml
檢查項:
  - CIS Benchmark
  - PCI DSS
  - SOC 2
  - GDPR

工具:
  - Open Policy Agent (OPA)
  - Checkov
  - Terrascan
```

