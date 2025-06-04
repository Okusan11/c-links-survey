# 動的サービスキー管理ガイド

## 概要

このシステムは従来の固定的なServiceKey定義から、動的にサービスを管理できる柔軟な仕組みに変更されました。
SSMパラメータの設定を変更するだけで、コードを変更することなく新しいサービスを追加できます。

## 主な変更点

### 1. 型定義の変更

**Before:**
```typescript
export type ServiceKey = 'cut' | 'color' | 'perm' | 'straightPerm' | 'treatment' | 'headSpa' | 'hairSet';
```

**After:**
```typescript
export type ServiceKey = string;  // より柔軟に
```

### 2. 新しいヘルパー関数

- `isValidServiceKey()` - サービスキーの有効性チェック
- `getServiceKeys()` - 利用可能なサービスキー一覧取得
- `getServiceDefinition()` - 特定のサービス定義取得

## 使用方法

### 基本的な使用例

```typescript
import { 
  getSurveyConfig, 
  getAvailableServiceKeys, 
  getServiceDefinitionByKey,
  validateServiceKey 
} from '../config/surveyConfig';

// 1. 利用可能なサービス一覧を取得
const serviceKeys = await getAvailableServiceKeys();
console.log('Available services:', serviceKeys);

// 2. 特定のサービス定義を取得
const colorService = await getServiceDefinitionByKey('color');
if (colorService) {
  console.log('Color service:', colorService.label);
}

// 3. サービスキーの有効性をチェック
const isValid = await validateServiceKey('newService');
if (isValid) {
  // 有効なサービスキーの場合の処理
}
```

### コンポーネントでの使用例

```typescript
import React, { useState, useEffect } from 'react';
import { 
  getServiceDefinitionsSorted, 
  getServiceKeyLabelMap 
} from '../config/surveyConfig';

const DynamicServiceComponent: React.FC = () => {
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [serviceLabelMap, setServiceLabelMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // サービス定義をアルファベット順で読み込み
    getServiceDefinitionsSorted().then(setServices);
    
    // サービスキー→ラベルのマッピングを作成
    getServiceKeyLabelMap().then(setServiceLabelMap);
  }, []);

  return (
    <div>
      <h2>動的サービス一覧</h2>
      {services.map(service => (
        <div key={service.key}>
          <h3>{service.label} ({service.key})</h3>
          <p>満足点選択肢: {service.satisfiedOptions.length}個</p>
          <p>改善点選択肢: {service.improvementOptions.length}個</p>
        </div>
      ))}
    </div>
  );
};
```

### フォーム検証での使用例

```typescript
import { validateServiceKey } from '../config/surveyConfig';

const validateFormData = async (formData: any) => {
  const errors: string[] = [];

  // 選択されたサービスキーが有効かチェック
  if (formData.usagePurpose) {
    for (const serviceKey of formData.usagePurpose) {
      const isValid = await validateServiceKey(serviceKey);
      if (!isValid) {
        errors.push(`Invalid service key: ${serviceKey}`);
      }
    }
  }

  return errors;
};
```

## 新しいサービス追加手順

### 1. SSMパラメータの更新

AWS CLI を使用してパラメータを更新：

```bash
# 現在の設定を取得
aws ssm get-parameter --name /c-links-survey/customer-survey-config --query "Parameter.Value" --output text > current-config.json

# JSONファイルを編集して新しいサービスを追加
# 例: "massage" サービスを追加

# 更新したJSONでパラメータを上書き
aws ssm put-parameter --name /c-links-survey/customer-survey-config --type "String" --value "$(cat updated-config.json)" --overwrite
```

### 2. 新しいサービスの設定例

```json
{
  "key": "massage",
  "label": "マッサージ",
  "satisfiedOptions": [
    "リラックスできて疲れが取れた",
    "施術者の技術が高く安心できた",
    "痛みやコリが改善された",
    "特になし"
  ],
  "improvementOptions": [
    "施術時間をもう少し長くしてほしい",
    "リラクゼーション環境を改善してほしい",
    "料金をもう少し安くしてほしい",
    "特になし"
  ]
}
```

### 3. デプロイ

- コードの変更は不要
- CodePipelineが自動実行され、新しい設定が反映されます

## デバッグとトラブルシューティング

### 利用可能なサービス情報の確認

```typescript
import { logAvailableServices } from '../config/surveyConfig';

// 開発時にコンソールで実行
logAvailableServices();
```

### よくある問題

1. **JSONパースエラー**
   - SSMパラメータのJSON形式を確認
   - 末尾のセミコロンやカンマを削除

2. **サービスキーが見つからない**
   - `validateServiceKey()`で有効性を事前チェック
   - `getAvailableServiceKeys()`で利用可能なキー一覧を確認

3. **型エラー**
   - ServiceKeyはstringになったため、従来のユニオン型チェックは無効
   - 実行時の検証に`isValidServiceKey()`を使用

## ベストプラクティス

1. **サービスキーの命名規則**
   - 小文字とキャメルケースを使用
   - 分かりやすい英語の名前を付ける

2. **型安全性の確保**
   - コンポーネント内では必ず`validateServiceKey()`でチェック
   - 存在しないサービスキーに対する適切なエラーハンドリング

3. **パフォーマンス**
   - サービス設定は一度取得してキャッシュ
   - 不要な再取得を避ける

4. **テスト**
   - 新しいサービス追加時は既存機能への影響を確認
   - フォーム送信テストを実施

## 将来の拡張可能性

この動的システムにより、以下のような拡張が容易になります：

- 季節限定サービスの追加・削除
- サロンごとの異なるサービス設定
- A/Bテスト用の選択肢変更
- 多言語対応（サービス名の国際化）
- サービス分類やカテゴリの追加 