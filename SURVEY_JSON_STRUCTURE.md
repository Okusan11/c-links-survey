# アンケートシステム JSON送信データ構造

このドキュメントは、C-Links Survey アンケートシステムがAWS API Gateway経由でLambda関数に送信するJSONデータ構造を説明します。

## 概要

アンケートシステムは、顧客の来店回数（初回、2回目、3回以上）に応じて異なるアンケート質問を表示し、その回答をJSONデータとしてAWS API Gatewayに送信します。

## 送信タイミング

1. **Googleアカウント確認画面**: `hasGoogleAccount === 'yes-confirmed'` の場合（Google レビューへリダイレクト前）
2. **確認画面**: 最終送信時（通常の投稿完了時）

## 共通フィールド

すべての顧客タイプで共通して送信されるフィールド：

```json
{
  "customerType": "new" | "second-visit" | "repeater",
  "hasGoogleAccount": "yes" | "no" | "yes-confirmed",
  "feedback": "string | null",
  "isGoogleReview": true | false
}
```

## 1. 初回来店のお客様 (customerType: "new")

### データ構造

```json
{
  "customerType": "new",
  "hasGoogleAccount": "yes-confirmed",
  "feedback": "初回の感想です",
  "isGoogleReview": true,
  "heardFrom": ["Web検索", "SNS", "その他"],
  "otherHeardFrom": "友人の紹介",
  "impressionRatings": {
    "staff": 5,
    "atmosphere": 4,
    "technology": 5,
    "price": 4,
    "location": 3
  },
  "willReturn": "ぜひ利用したい",
  "otherWillReturn": null,
  "isNewCustomer": true
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `heardFrom` | `string[]` | どこで知ったか（複数選択可） |
| `otherHeardFrom` | `string \| null` | 「その他」を選択した場合の自由記述 |
| `impressionRatings` | `Record<string, number>` | 印象評価（1-5点） |
| `willReturn` | `string` | また来たいと思うか |
| `otherWillReturn` | `string \| null` | 再来店意向の「その他」自由記述 |
| `isNewCustomer` | `boolean` | 新規顧客フラグ（常に `true`） |

### 印象評価の項目

```typescript
interface ImpressionRatings {
  staff: number;        // スタッフの対応
  atmosphere: number;   // 店内の雰囲気
  technology: number;   // 技術力
  price: number;        // 料金
  location: number;     // 立地・アクセス
}
```

## 2. 2回目来店のお客様 (customerType: "second-visit")

### データ構造

```json
{
  "customerType": "second-visit",
  "hasGoogleAccount": "no",
  "feedback": "2回目の感想です",
  "isGoogleReview": false,
  "returnReasons": ["前回のサービスに満足したため", "技術力が高いと感じたため"],
  "otherReturnReasons": null,
  "satisfaction": "とても満足",
  "otherSatisfaction": null,
  "usagePurpose": ["cut", "color"],
  "usagePurposeKeys": ["cut", "color"],
  "usagePurposeLabels": ["カット", "カラー"],
  "satisfiedPoints": {
    "cut": ["技術力", "仕上がり"],
    "color": ["色の提案力", "仕上がり"]
  },
  "improvementPoints": {
    "cut": [],
    "color": ["価格"]
  },
  "otherSatisfiedPoints": {
    "cut": null,
    "color": null
  },
  "otherImprovementPoints": {
    "cut": null,
    "color": "もう少し安くなると嬉しいです"
  },
  "isSecondVisit": true
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `returnReasons` | `string[]` | 再来店いただいた理由（複数選択可） |
| `otherReturnReasons` | `string \| null` | 再来店理由の「その他」自由記述 |
| `satisfaction` | `string` | 初回来店と比べた満足度 |
| `otherSatisfaction` | `string \| null` | 満足度の「その他」自由記述 |
| `usagePurpose` | `string[]` | 利用したサービスのキー |
| `usagePurposeKeys` | `string[]` | バックエンド用サービスキー（usagePurposeと同じ） |
| `usagePurposeLabels` | `string[]` | サービス名（日本語ラベル） |
| `satisfiedPoints` | `Record<string, string[]>` | サービス別満足点 |
| `improvementPoints` | `Record<string, string[]>` | サービス別改善点 |
| `otherSatisfiedPoints` | `Record<string, string \| null>` | サービス別満足点の「その他」自由記述 |
| `otherImprovementPoints` | `Record<string, string \| null>` | サービス別改善点の「その他」自由記述 |
| `isSecondVisit` | `boolean` | 2回目顧客フラグ（常に `true`） |

## 3. 3回以上来店のお客様 (customerType: "repeater")

### データ構造

```json
{
  "customerType": "repeater",
  "hasGoogleAccount": "yes",
  "feedback": null,
  "isGoogleReview": false,
  "satisfaction": "満足",
  "otherSatisfaction": null,
  "usagePurpose": ["cut", "perm", "treatment"],
  "usagePurposeKeys": ["cut", "perm", "treatment"],
  "usagePurposeLabels": ["カット", "パーマ", "トリートメント"],
  "satisfiedPoints": {
    "cut": ["技術力", "スタッフの対応"],
    "perm": ["技術力", "仕上がり"],
    "treatment": ["効果", "その他"]
  },
  "improvementPoints": {
    "cut": [],
    "perm": ["価格"],
    "treatment": []
  },
  "otherSatisfiedPoints": {
    "cut": null,
    "perm": null,
    "treatment": "髪がとても滑らかになりました"
  },
  "otherImprovementPoints": {
    "cut": null,
    "perm": "もう少し安くなると嬉しいです",
    "treatment": null
  },
  "isRepeater": true
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `satisfaction` | `string` | 前回来店と比べた満足度 |
| `otherSatisfaction` | `string \| null` | 満足度の「その他」自由記述 |
| `usagePurpose` | `string[]` | 利用したサービスのキー |
| `usagePurposeKeys` | `string[]` | バックエンド用サービスキー（usagePurposeと同じ） |
| `usagePurposeLabels` | `string[]` | サービス名（日本語ラベル） |
| `satisfiedPoints` | `Record<string, string[]>` | サービス別満足点 |
| `improvementPoints` | `Record<string, string[]>` | サービス別改善点 |
| `otherSatisfiedPoints` | `Record<string, string \| null>` | サービス別満足点の「その他」自由記述 |
| `otherImprovementPoints` | `Record<string, string \| null>` | サービス別改善点の「その他」自由記述 |
| `isRepeater` | `boolean` | リピーター顧客フラグ（常に `true`） |

**注意**: 3回以上来店の顧客には `returnReasons`（再来店理由）は含まれません。

## サービス定義

サービスキーとラベルの対応は、SSMパラメータ `survey-config` から動的に取得されます：

```json
{
  "serviceDefinitions": [
    {
      "key": "cut",
      "label": "カット",
      "satisfiedOptions": ["技術力", "スタッフの対応", "仕上がり", "その他"],
      "improvementOptions": ["技術力", "価格", "待ち時間", "その他"]
    },
    {
      "key": "color",
      "label": "カラー",
      "satisfiedOptions": ["色の提案力", "技術力", "仕上がり", "その他"],
      "improvementOptions": ["色の提案力", "価格", "待ち時間", "その他"]
    }
  ]
}
```

## APIエンドポイント

- **URL**: SSMパラメータ `/c-links-survey/api-endpoint-url` から取得
- **Method**: POST
- **Content-Type**: application/json
- **送信先**: AWS API Gateway → Lambda関数 (`customer_survey.py`)

## 送信フロー

1. **UnifiedSurvey.tsx**: アンケート回答収集
2. **GoogleAccount.tsx**: Googleアカウント確認 → Google レビュー送信時
3. **Confirmation.tsx**: 最終確認 → 通常投稿送信時

## バックエンド処理

Lambda関数 (`customer_survey.py`) が以下の処理を実行：

1. JSONデータの解析
2. S3への回答データ保存
3. SESによるメール通知送信

## 注意事項

- `usagePurposeKeys` と `usagePurposeLabels` はバックエンド互換性のために重複して送信
- `isGoogleReview` フラグでGoogle レビュー投稿か通常投稿かを判別
- 「その他」選択時の自由記述は別フィールド（`other*`）で送信
- サービス別評価は選択したサービスのみ送信（未選択サービスは含まれない）