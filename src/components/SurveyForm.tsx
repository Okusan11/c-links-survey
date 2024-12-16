import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // ナビゲーション用
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Rating,
  Select,
  Typography
} from '@mui/material';

// 利用目的の型を定義
type PurposeType = '児童発達支援事業所' | '放課後等デイサービス' | '生活介護' ;

const SurveyForm: React.FC = () => {
  const { state } = useLocation(); //
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月は0ベースなので+1
  const currentDay = String(currentDate.getDate()).padStart(2, '0');

  // 初期値として本日の日付を設定
  const [visitDate, setVisitDate] = useState({
    year: String(currentYear),
    month: currentMonth,
    day: currentDay,
  });

  const [heardFrom, setHeardFrom] = useState<string[]>(state?.heardFrom || []);
  const [usagePurpose, setUsagePurpose] = useState<PurposeType[]>(state?.usagePurpose || []);
  const [satisfaction, setSatisfaction] = useState<number | null>(4.0);

  type SatisfactionData = {
    [key in PurposeType]?: string[];
  };

  const [satisfiedPoints, setSatisfiedPoints] = useState<SatisfactionData>({});
  const [improvementPoints, setImprovementPoints] = useState<SatisfactionData>({});

  const navigate = useNavigate();

  // 単純な配列を扱う handleSimpleCheckboxChange をジェネリックにする
  const handleSimpleCheckboxChange = <T extends string>(
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    const value = event.target.value as T;
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // 目的別のデータを扱う handlePurposeCheckboxChange
  const handlePurposeCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    purpose: PurposeType,
    setter: React.Dispatch<React.SetStateAction<SatisfactionData>>
  ) => {
    const value = event.target.value;
    setter((prev) => {
      const prevValues = prev[purpose] || [];
      const newValues = prevValues.includes(value)
        ? prevValues.filter((v) => v !== value)
        : [...prevValues, value];
      return { ...prev, [purpose]: newValues };
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // 入力チェック
    if (heardFrom.length === 0) {
      alert('当施設をどこでお知りになりましたか？について1つ以上回答を選択してください。');
      return;
    }
    if (!visitDate.year || !visitDate.month || !visitDate.day) {
      alert('施設をご利用された日時を選択してください。');
      return;
    }
    if (usagePurpose.length === 0) {
      alert('ご利用目的の質問について1つ以上回答を選択してください。');
      return;
    }
    if (Object.keys(satisfiedPoints).length === 0) {
      alert('サービスの満足した点について1つ以上回答を選択してください');
      return;
    }
    if (Object.keys(improvementPoints).length === 0) {
      alert('サービスの改善してほしい点について1つ以上回答を選択してください');
      return;
    }
    if (!satisfaction) {
      alert('当施設への満足度を選択してください。');
      return;
    }

    // 満足度に応じて遷移先を決定
    if (satisfaction >= 4) {
      // 満足度が4または5の場合、GoogleAccount.tsx へ遷移
      navigate('/googleaccount', {
        state: {
          visitDate,
          heardFrom,
          usagePurpose,
          satisfiedPoints,
          improvementPoints,
          satisfaction,
        },
      });
    } else {
      // 満足度が1～3の場合、ReviewForm.tsx へ遷移
      navigate('/nreviewform', {
        state: {
          visitDate,
          heardFrom,
          usagePurpose,
          satisfiedPoints,
          improvementPoints,
          satisfaction,
        },
      });
    }
  };

  // 年、月、日を生成するための配列を作成
  const years = Array.from({ length: 2024 - 1920 + 1 }, (_, i) => String(1920 + i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  // 利用目的ごとの満足点と改善点の選択肢を定義
  const purposeSpecificOptions: Record<
    PurposeType,
    { satisfied: string[]; improvement: string[] }
  > = {
    児童発達支援事業所: {
      satisfied: [
        "スタッフが子どもの特性をよく理解している",
        "個別支援計画がわかりやすく、適切に実施されている",
        "遊びや学習機会がバリエーション豊富で、子どもが楽しめる",
        "親へのフィードバックがこまめで丁寧",
        "安全面への配慮が行き届いている",
        "施設内が清潔で衛生的",
        "特になし"
      ],
      improvement: [
        "スタッフ数を増やして、よりきめ細やかな対応をしてほしい",
        "遊具や教材の更新・拡充を検討してほしい",
        "保護者とのコミュニケーション機会を増やしてほしい",
        "子どもの発達段階に合わせた新たなプログラムの導入を検討してほしい",
        "利用日時や送迎サービスの選択肢を増やしてほしい",
        "特になし"
      ],
    },
    放課後等デイサービス: {
      satisfied: [
        "スタッフの対応が親切で明るい",
        "リハビリの提供が充実している",
        "医療的ケアへの対応が適切に行われている",
        "送迎があって安心できる",
        "施設内が清潔で快適",
        "学習支援や生活指導が丁寧で、学校生活との連動がある",
        "コミュニケーションスキルを育むプログラムが豊富",
        "特になし"
      ],
      improvement: [
        "スタッフが不足しており、個別対応が難しい状況を改善してほしい",
        "送迎時間やルートの選択肢を増やしてほしい",
        "施設や設備の老朽化箇所を整備してほしい",
        "プログラム内容のマンネリ化を防ぐ取り組みを強化してほしい",
        "保護者へ活動内容をより分かりやすく発信してほしい",
        "特になし"
      ],
    },
    生活介護: {
      satisfied: [
        "スタッフが利用者一人ひとりに寄り添い、個別ニーズに対応してくれる",
        "医療的対応や健康管理が適切に行われている",
        "日中活動やレクリエーションが充実しており楽しめる",
        "衛生環境が整っていて清潔感がある",
        "家族やケアマネージャーとの連携が円滑である",
        "食事が栄養バランスに配慮されており選択肢が豊富",
        "特になし"
      ],
      improvement: [
        "スタッフ数やシフト体制の見直しで、よりきめ細やかな対応をしてほしい",
        "バリアフリー化を進め、利用者の移動・介助をしやすくしてほしい",
        "プライバシー確保のための環境改善が必要",
        "利用者の関心に合わせた日中活動のバリエーションを増やしてほしい",
        "外部機関（病院・地域施設）との連携を強化し、外出行事を充実させてほしい",
        "特になし"
      ],
    },
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 600,
        margin: '0 auto',
        backgroundColor: '#e0f7fa',
        padding: 3,
        borderRadius: 2,
      }}
    >
      {/* タイトル */}
      <Typography variant="h4" component="h1" textAlign="center" mb={4} className="text">
        {"当施設利用後の\nアンケート"}
      </Typography>

      <Typography variant="body1" textAlign="left" mb={4}>
        <div>
          この度は当施設をご利用いただきありがとうございました。
        </div>
        <div>
          お客様からのご意見を今後のサービス向上に役立てたいと考えておりますので、以下のアンケートにご協力いただけますと幸いです。
        </div>
        {/* アンケートが短時間で終わることを強調するメッセージを追加 */}
        <Typography variant="body2" color="textSecondary" mt={2}>
          ※ アンケートは約1分で完了します。
        </Typography>
      </Typography>

      {/* 当施設をどこでお知りになりましたか */}
      <Box
        sx={{
          backgroundColor: '#fff',
          padding: 2,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: 3,
        }}
      >
        <FormControl fullWidth margin="normal" required>
          <FormLabel sx={{ textAlign: 'left' }}>
            当施設をどこでお知りになりましたか？
            <Typography
              component="span"
              sx={{
                color: 'white',
                backgroundColor: 'red',
                borderRadius: 1,
                padding: '0 4px',
                marginLeft: 1,
                display: 'inline-block',
                fontSize: '0.8rem',
              }}
            >
              必須
            </Typography>
          </FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  value="Webサイト"
                  onChange={(e) => handleSimpleCheckboxChange<string>(e, setHeardFrom)}
                  checked={heardFrom.includes('Webサイト')}
                />
              }
              label="Webサイト"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="SNS(インスタグラム、Xなど)"
                  onChange={(e) => handleSimpleCheckboxChange<string>(e, setHeardFrom)}
                  checked={heardFrom.includes('SNS(インスタグラム、Xなど)')}
                />
              }
              label="SNS(インスタグラム、Xなど)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="相談員からのご紹介"
                  onChange={(e) => handleSimpleCheckboxChange<string>(e, setHeardFrom)}
                  checked={heardFrom.includes('相談員からのご紹介')}
                />
              }
              label="相談員からのご紹介"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="ご友人・知人からのご紹介"
                  onChange={(e) => handleSimpleCheckboxChange<string>(e, setHeardFrom)}
                  checked={heardFrom.includes('ご友人・知人からのご紹介')}
                />
              }
              label="ご友人・知人からのご紹介"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="広告"
                  onChange={(e) => handleSimpleCheckboxChange<string>(e, setHeardFrom)}
                  checked={heardFrom.includes('広告')}
                />
              }
              label="広告"
            />
          </FormGroup>
        </FormControl>
      </Box>

      {/* 施設をご利用された日時 */}
      <Box
        sx={{
          backgroundColor: '#fff',
          padding: 2,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: 3,
        }}
      >
        <FormControl fullWidth margin="normal" required>
          <FormLabel sx={{ textAlign: 'left' }}>
            施設をご利用された日時
            <Typography
              component="span"
              sx={{
                color: 'white',
                backgroundColor: 'red',
                borderRadius: 1,
                padding: '0 4px',
                marginLeft: 1,
                display: 'inline-block',
                fontSize: '0.8rem',
              }}
            >
              必須
            </Typography>
          </FormLabel>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* 年 */}
            <Select
              value={visitDate.year}
              onChange={(e) => setVisitDate({ ...visitDate, year: e.target.value })}
              displayEmpty
              sx={{ flex: 1, mr: 1 }}
            >
              <MenuItem value=""></MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
            <Typography>年</Typography>

            {/* 月 */}
            <Select
              value={visitDate.month}
              onChange={(e) => setVisitDate({ ...visitDate, month: e.target.value })}
              displayEmpty
              sx={{ flex: 1, mx: 1 }}
            >
              <MenuItem value=""></MenuItem>
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
            <Typography>月</Typography>

            {/* 日 */}
            <Select
              value={visitDate.day}
              onChange={(e) => setVisitDate({ ...visitDate, day: e.target.value })}
              displayEmpty
              sx={{ flex: 1, ml: 1 }}
            >
              <MenuItem value=""></MenuItem>
              {days.map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </Select>
            <Typography>日</Typography>
          </Box>
        </FormControl>
      </Box>

      {/* 利用目的 */}
      <Box
        sx={{
          backgroundColor: '#fff', // 白色で塗りつぶし
          padding: 2,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: 3,
        }}
      >
        <FormControl fullWidth margin="normal" required>
          <FormLabel sx={{ textAlign: 'left' }}>
            どのような用途で当施設をご利用されましたか？ (複数選択可)
            <Typography
              component="span"
              sx={{
                color: 'white',
                backgroundColor: 'red',
                borderRadius: 1,
                padding: '0 4px',
                marginLeft: 1,
                display: 'inline-block',
                fontSize: '0.8rem',
              }}
            >
              必須
            </Typography>
          </FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  value="児童発達支援事業所"
                  onChange={(e) => handleSimpleCheckboxChange<PurposeType>(e, setUsagePurpose)}
                  checked={usagePurpose.includes('児童発達支援事業所')}
                />
              }
              label="児童発達支援事業所"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="放課後等デイサービス"
                  onChange={(e) => handleSimpleCheckboxChange<PurposeType>(e, setUsagePurpose)}
                  checked={usagePurpose.includes('放課後等デイサービス')}
                />
              }
              label="放課後等デイサービス"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="生活介護"
                  onChange={(e) => handleSimpleCheckboxChange<PurposeType>(e, setUsagePurpose)}
                  checked={usagePurpose.includes('生活介護')}
                />
              }
              label="生活介護"
            />
          </FormGroup>
        </FormControl>
      </Box>

      {/* 利用目的に応じた満足点と改善点 */}
      {usagePurpose.map((purpose: PurposeType) => {
        const options = purposeSpecificOptions[purpose];
        return (
          <Box
            key={purpose}
            sx={{
              backgroundColor: '#fff',
              padding: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: 3,
            }}
          >
            {/* 満足した点 */}
            <FormControl component="fieldset" fullWidth margin="normal" required>
              <FormLabel component="legend">
                {`${purpose}のサービスで満足した点を選択してください (複数選択可)`}
                <Typography
                  component="span"
                  sx={{
                    color: 'white',
                    backgroundColor: 'red',
                    borderRadius: 1,
                    padding: '0 4px',
                    marginLeft: 1,
                    display: 'inline-block',
                    fontSize: '0.8rem',
                  }}
                >
                  必須
                </Typography>
              </FormLabel>
              <FormGroup>
                {options.satisfied.map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        value={option}
                        onChange={(e) =>
                          handlePurposeCheckboxChange(e, purpose, setSatisfiedPoints)
                        }
                        checked={satisfiedPoints[purpose]?.includes(option) || false}
                      />
                    }
                    label={option}
                  />
                ))}
              </FormGroup>
            </FormControl>

            {/* 改善してほしい点 */}
            <FormControl component="fieldset" fullWidth margin="normal" required>
              <FormLabel component="legend">
                {`${purpose}のサービスで改善してほしい点を選択してください（複数選択可）`}
                <Typography
                  component="span"
                  sx={{
                    color: 'white',
                    backgroundColor: 'red',
                    borderRadius: 1,
                    padding: '0 4px',
                    marginLeft: 1,
                    display: 'inline-block',
                    fontSize: '0.8rem',
                  }}
                >
                  必須
                </Typography>
              </FormLabel>
              <FormGroup>
                {options.improvement.map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        value={option}
                        onChange={(e) =>
                          handlePurposeCheckboxChange(e, purpose, setImprovementPoints)
                        }
                        checked={improvementPoints[purpose]?.includes(option) || false}
                      />
                    }
                    label={option}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Box>
        );
      })}

      {/* 満足度評価 */}
      <Box
        sx={{
          backgroundColor: '#fff',
          padding: 2,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: 3,
        }}
      >
        <FormControl fullWidth margin="normal" required>
          <FormLabel>
            当施設のサービスへの満足度を教えてください。
            <Typography
              component="span"
              sx={{
                color: 'white',
                backgroundColor: 'red',
                borderRadius: 1,
                padding: '0 4px',
                marginLeft: 1,
                display: 'inline-block',
                fontSize: '0.8rem',
              }}
            >
              必須
            </Typography>
          </FormLabel>
          {/* 満足度の評価方法を説明する注釈を追加 */}
          <Typography variant="body2" color="textSecondary" gutterBottom>
            ※ 5に近いほど満足度が高いことを示します。
          </Typography>
          <Rating
            name="satisfaction-rating"
            value={satisfaction}
            onChange={(event, newValue) => setSatisfaction(newValue)}
            precision={1.0} // 1.0刻みで評価
            size="large"
          />
          <Typography component="legend">
            現在の満足度: {satisfaction ? satisfaction : '未評価'}
          </Typography>
        </FormControl>
      </Box>

      {/* ボタン */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button variant="outlined" color="secondary">
          戻る
        </Button>
        <Button variant="contained" color="primary" type="submit">
          次へ
        </Button>
      </Box>
    </Box>
  );
};

export default SurveyForm;
