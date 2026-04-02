---
name: infrastructure
description: 雲原生基礎設施。Kubernetes、Helm、Kustomize、Operator、CRD、GitOps、ArgoCD、Flux、IaC、Terraform、Pulumi、CDK。當使用者提到 K8s、Helm、GitOps、IaC 時路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 雲原生基礎設施 · Infrastructure

## 域概覽

```
                    GitOps 控制平面
                          |
        +-----------------+-----------------+
        |                 |                 |
    ArgoCD/Flux      Kubernetes         IaC 層
        |                 |                 |
   Git Repo ------> Helm/Kustomize --> Terraform/Pulumi
        |                 |                 |
    宣告式配置        容器編排          雲資源管理
```

---

## Kubernetes 容器編排

### Helm Chart 開發

標準結構：`Chart.yaml` + `values.yaml` + `templates/` + `charts/`

核心要點：
- Chart.yaml：`apiVersion: v2`, dependencies 宣告子 Chart（condition 控制啟用）
- values.yaml 設計：image / replicaCount / resources / autoscaling / service / ingress / probes / env / persistence
- Deployment 模板：使用 `_helpers.tpl` 定義 `fullname` / `labels` / `selectorLabels`
- 配置校驗：`checksum/config: {{ include ... | sha256sum }}` 觸發滾動更新
- 安全上下文：`runAsNonRoot: true, runAsUser: 1000`

關鍵命令：
- `helm lint` / `helm template --debug` 驗證
- `helm install -f values-prod.yaml` 部署
- `helm upgrade --reuse-values` 升級
- `helm rollback <release> <revision>` 回滾
- `helm push <chart>.tgz oci://registry` 推送 OCI

### Kustomize 配置管理

目錄結構：`base/` + `overlays/{dev,staging,production}/`

核心能力：
- base/kustomization.yaml：resources / commonLabels / images / configMapGenerator / secretGenerator
- overlay：namespace / patchesStrategicMerge / patchesJson6902 / replicas / images / configMapGenerator(behavior: merge)
- 命令：`kubectl apply -k overlays/production` / `kubectl diff -k`

### Operator 模式

- CRD 定義：openAPIV3Schema 宣告 spec/status，subresources(status/scale)
- Controller 核心迴圈：Get CR → 構建期望狀態 → Create/Update 子資源 → 更新 Status
- OwnerReferences：子資源關聯 CR，級聯刪除
- 初始化：`operator-sdk init` → `create api` → `make manifests` → `make install`

### 部署策略

| 策略 | 實現方式 | 適用場景 |
|------|----------|----------|
| 滾動更新 | `strategy.rollingUpdate` maxSurge/maxUnavailable | 預設策略 |
| 藍綠部署 | 兩個 Deployment + Service selector 切換 | 零停機切換 |
| 金絲雀 | stable(9) + canary(1) 共享 Service | 漸進式驗證 |
| Flagger | `Canary` CRD + 自動分析指標 | 自動化金絲雀 |

### K8s Checklist

- [ ] 健康檢查：livenessProbe + readinessProbe 必配
- [ ] 資源限制：requests + limits 防止資源耗盡
- [ ] HPA：CPU/Memory/自定義指標自動擴縮容
- [ ] PDB：`minAvailable` 防止滾動更新中斷
- [ ] ResourceQuota + LimitRange：名稱空間資源配額
- [ ] 映象使用 Digest 確保一致性
- [ ] Pod 反親和性分散到不同節點
- [ ] 金鑰外部化：External Secrets Operator

---

## GitOps 持續部署

### ArgoCD vs Flux

| 特性 | ArgoCD | Flux |
|------|--------|------|
| Web UI | 功能強大 | 無（可用 Weave GitOps） |
| 多租戶 | Projects + RBAC | 需額外配置 |
| 多叢集 | 原生支援 | 原生支援 |
| 映象自動更新 | 需 Image Updater | 原生支援 |
| 漸進式交付 | Argo Rollouts | Flagger |
| CNCF | Graduated | Graduated |

### ArgoCD 核心模式

- Application：source(repoURL/path/targetRevision) + destination(server/namespace)
- syncPolicy：`automated(prune: true, selfHeal: true)` + retry
- ignoreDifferences：忽略 HPA 修改的 `/spec/replicas`
- ApplicationSet：Git 目錄生成器，一套模板管理多環境
- 多叢集：`argocd cluster add` 註冊叢集
- Notifications：ConfigMap 配置 Slack/Email 通知模板
- Rollouts：`Canary` CRD + steps(setWeight/pause) + AnalysisTemplate(Prometheus 查詢)

### Flux 核心模式

- GitRepository：`interval: 1m`, ref branch, secretRef
- Kustomization：path + prune + healthChecks + postBuild substitute
- HelmRepository + HelmRelease：chart + values + install/upgrade remediation
- ImageRepository + ImagePolicy + ImageUpdateAutomation：自動檢測新映象並提交 Git

### 多環境管理

```
fleet-infra/
├── clusters/{dev,staging,production}/  # 每叢集入口
├── infrastructure/base + overlays/     # 基礎元件
└── apps/base + overlays/              # 應用配置
```

### 金鑰管理

- Sealed Secrets：`kubeseal` 加密 → 提交 Git → Controller 解密
- External Secrets Operator：SecretStore(AWS SM) + ExternalSecret → 自動同步

### GitOps Checklist

- [ ] Git 為唯一真相源，所有變更透過 PR
- [ ] 自動同步 + 自愈（selfHeal）
- [ ] 金鑰加密儲存（Sealed Secrets / External Secrets）
- [ ] 漸進式交付（Rollouts / Flagger）
- [ ] 多環境目錄隔離
- [ ] 回滾策略：保留歷史版本

---

## 基礎設施即程式碼 (IaC)

### 工具對比

| 工具 | 語言 | 狀態管理 | 雲支援 | 學習曲線 |
|------|------|----------|--------|----------|
| Terraform | HCL | 顯式(S3/TF Cloud) | 全平臺 | 中等 |
| Pulumi | Python/TS/Go | 自動(Pulumi Cloud) | 全平臺 | 較低 |
| AWS CDK | Python/TS | CloudFormation | AWS | 中等 |

### Terraform 核心模式

專案結構：`modules/{vpc,eks,rds}/` + `environments/{dev,staging,prod}/`

- Provider：版本鎖定 `required_providers` + `default_tags`
- Backend：S3 + DynamoDB 鎖 + KMS 加密
- 模組化：`variable` → `resource` → `output`，環境透過 `module` 引用
- 遠端狀態：`data "terraform_remote_state"` 跨模組引用
- 命令流：`init` → `validate` → `fmt` → `plan -out=tfplan` → `apply tfplan`
- 狀態管理：`state list/show/mv/rm` / `import` 匯入現有資源
- Workspace：`workspace new/select` 多環境隔離

### Pulumi 核心模式

- ComponentResource：自定義資源組（VPC/EKS 封裝為類）
- Config：`pulumi.Config()` 讀取 stack 配置
- Outputs：`pulumi.export()` 匯出值
- 命令：`preview` → `up` → `stack output` / `destroy`

### AWS CDK 核心模式

- Stack：繼承 `Stack`，使用 L2 Constructs（`ec2.Vpc` / `eks.Cluster`）
- 跨 Stack 引用：透過建構函式引數傳遞
- 命令：`synth` → `diff` → `deploy --all` / `bootstrap`

### IaC Checklist

- [ ] 模組化：可複用元件抽象為模組
- [ ] 環境隔離：不同環境不同 State
- [ ] 遠端狀態 + 狀態鎖定
- [ ] Provider 版本鎖定
- [ ] 金鑰管理：Secrets Manager / SSM
- [ ] 統一資源標籤
- [ ] Plan 後人工審查再 Apply
- [ ] CI/CD 整合自動化

---

## 最佳實踐

| 層級 | 工具選擇 | 原則 |
|------|----------|------|
| 應用部署 | Helm + Kustomize | 模板化 + 環境差異 |
| 持續交付 | ArgoCD / Flux | Git 為唯一真相源 |
| 基礎設施 | Terraform / Pulumi | 宣告式 + 狀態管理 |
| 配置管理 | External Secrets | 金鑰外部化 |
| 可觀測性 | Prometheus + Grafana | 指標 + 視覺化 |

## 觸發詞

Kubernetes、K8s、Helm、Kustomize、Operator、CRD、GitOps、ArgoCD、Flux、IaC、Terraform、Pulumi、CDK、基礎設施即程式碼
