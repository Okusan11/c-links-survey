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
type PurposeType = 'デイケア' | 'リハビリテーション' | 'ショートステイ' | '長期入居';

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
    デイケア: {
      satisfied: [
        'スタッフの対応が親切で明るい',
        'レクリエーション活動が豊富で楽しい',
        '送迎サービスが時間通りで安心',
        '食事が美味しく栄養バランスが良い',
        '施設内が清潔で快適',
        '特になし',
      ],
      improvement: [
        'レクリエーションの種類を増やしてほしい',
        'スタッフの人数を増やしてほしい',
        '利用時間の延長を検討してほしい',
        '送迎エリアを拡大してほしい',
        '個別のケアプランを充実させてほしい',
        '特になし',
      ],
    },
    リハビリテーション: {
      satisfied: [
        '専門スタッフによる質の高いリハビリ',
        '個別のプログラムを作成してくれる',
        '最新の機器を使用している',
        '進捗状況を詳しく説明してくれる',
        'モチベーションを高めてくれるサポート',
        '特になし',
      ],
      improvement: [
        'リハビリの予約が取りにくい',
        '待ち時間を短くしてほしい',
        'スタッフの入れ替わりが多い',
        'リハビリ室が混雑している',
        '家庭での継続ケアの指導を充実させてほしい',
        '特になし',
      ],
    },
    ショートステイ: {
      satisfied: [
        '急な利用にも柔軟に対応してくれた',
        'スタッフが親身になってくれた',
        '部屋が清潔で過ごしやすい',
        '食事が美味しく特別食にも対応',
        '家族への連絡がスムーズだった',
        '特になし',
      ],
      improvement: [
        '予約が取りにくい時がある',
        '持ち物の管理を徹底してほしい',
        'スタッフからの説明が不足していた',
        '夜間の対応体制を強化してほしい',
        '料金体系を分かりやすくしてほしい',
        '特になし',
      ],
    },
    長期入居: {
      satisfied: [
        '24時間の介護体制で安心できる',
        'スタッフが家族のように接してくれる',
        '医療サポートが充実している',
        '施設内のイベントや活動が豊富',
        'プライバシーが尊重されている',
        '特になし',
      ],
      improvement: [
        '部屋の設備を新しくしてほしい',
        '食事のメニューにバリエーションを増やしてほしい',
        'スタッフとのコミュニケーションを増やしてほしい',
        '面会時間を柔軟に対応してほしい',
        '月々の費用について詳細な説明が欲しい',
        '特になし',
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
      <Typography variant="h4" component="h1" textAlign="center" mb={4}>
        施設利用後のアンケート
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
                  value="ケアマネジャーからのご紹介"
                  onChange={(e) => handleSimpleCheckboxChange<string>(e, setHeardFrom)}
                  checked={heardFrom.includes('ケアマネジャーからのご紹介')}
                />
              }
              label="ケアマネジャーからのご紹介"
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
                  value="デイケア"
                  onChange={(e) => handleSimpleCheckboxChange<PurposeType>(e, setUsagePurpose)}
                  checked={usagePurpose.includes('デイケア')}
                />
              }
              label="デイケア"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="リハビリテーション"
                  onChange={(e) => handleSimpleCheckboxChange<PurposeType>(e, setUsagePurpose)}
                  checked={usagePurpose.includes('リハビリテーション')}
                />
              }
              label="リハビリテーション"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="ショートステイ"
                  onChange={(e) => handleSimpleCheckboxChange<PurposeType>(e, setUsagePurpose)}
                  checked={usagePurpose.includes('ショートステイ')}
                />
              }
              label="ショートステイ"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="長期入居"
                  onChange={(e) => handleSimpleCheckboxChange<PurposeType>(e, setUsagePurpose)}
                  checked={usagePurpose.includes('長期入居')}
                />
              }
              label="長期入居"
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
