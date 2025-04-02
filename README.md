# C-Links Survey Frontend

Salon feedback survey form frontend application.

## Environment Setup

この環境では、AWS SSMパラメータストアからアプリケーションの設定値を取得します。
直接の環境変数ファイル（.env）は使用せず、CodePipelineのビルド時にSSMから取得します。

必要なSSMパラメータ：
- `/c-links-survey/api-endpoint-url` - AWS API Gatewayのエンドポイント
- `/c-links-survey/gmap-review-url` - Google Mapsのレビューページ
- `/c-links-survey/service-config` - (オプション) サービス設定のJSON

SSMパラメータの設定方法：
```bash
# APIエンドポイントURLの設定
aws ssm put-parameter --name "/c-links-survey/api-endpoint-url" --value "https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod/review" --type "String" --overwrite

# Google MapsレビューURLの設定 
aws ssm put-parameter --name "/c-links-survey/gmap-review-url" --value "https://g.page/r/your-google-place-id/review" --type "String" --overwrite
```

## AWS SES Integration

The form submits data to AWS Lambda which processes it with:
1. Stores the feedback in DynamoDB
2. Sends an email via AWS SES to the configured recipient

See the backend implementation details in the `aws-cdk` directory.

## CodePipeline Integration

アプリケーションは、GitHub → CodePipeline → CodeBuild → S3 の流れでデプロイされます。
CodeBuildのビルド時にSSMパラメータストアから環境変数を取得し、フロントエンドのビルドに使用します。

## Development

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

## Deploy

After building, deploy the contents of the `build` directory to your hosting service.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
