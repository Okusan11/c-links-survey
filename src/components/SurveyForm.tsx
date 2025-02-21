import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

/**
 * 1. 型定義
 */
// 1-1. サービスキーの型
type ServiceKey = 'cut' | 'color' | 'perm' | 'straightPerm' | 'treatment' | 'headSpa' | 'hairSet';

// 1-2. サービスごとの定義
interface ServiceDefinition {
  key: ServiceKey;
  label: string;
  satisfiedOptions: string[];
  improvementOptions: string[];
}

// 1-3. SSMに格納したJSON全体を受け取るための型
interface SurveyConfig {
  heardFromOptions: string[];
  serviceDefinitions: ServiceDefinition[];
}

const SurveyForm: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // 2. SSMパラメータ（JSON）をパースして保持
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);

  useEffect(() => {
    const rawConfig = process.env.REACT_APP_SURVEY_CONFIG;
    if (!rawConfig) {
      console.error('REACT_APP_SURVEY_CONFIG is not defined!');
      return;
    }
    try {
      const parsed = JSON.parse(rawConfig) as SurveyConfig;
      setSurveyConfig(parsed);
    } catch (err) {
      console.error('Failed to parse REACT_APP_SURVEY_CONFIG:', err);
    }
  }, []);

  // 3. 日付等のステート管理
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1);
  const currentDay = String(currentDate.getDate());

  const [visitDate, setVisitDate] = useState({
    year: String(currentYear),
    month: currentMonth,
    day: currentDay,
  });

  // 4. 「当サロンをどこで知ったか」の選択リスト
  const [heardFrom, setHeardFrom] = useState<string[]>(state?.heardFrom || []);

  // 5. サービス（利用目的）の選択
  const [usagePurpose, setUsagePurpose] = useState<ServiceKey[]>(state?.usagePurpose || []);

  // 7. サービスごとの満足点/改善点
  const [satisfiedPoints, setSatisfiedPoints] = useState<Partial<Record<ServiceKey, string[]>>>({});
  const [improvementPoints, setImprovementPoints] = useState<Partial<Record<ServiceKey, string[]>>>(
    {}
  );

  /**
   * 8. チェックボックス変更ハンドラ
   */
  // (A) シンプル配列
  const handleSimpleCheckboxChange = <T extends string>(
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    const value = event.target.value as T;
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // (B) サービスごと
  const handleServicePointsCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    serviceKey: ServiceKey,
    setter: React.Dispatch<React.SetStateAction<Partial<Record<ServiceKey, string[]>>>>
  ) => {
    const value = event.target.value;
    setter((prev) => {
      const currentValues = prev[serviceKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [serviceKey]: newValues };
    });
  };

  /**
   * 9. フォーム送信
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (heardFrom.length === 0) {
      alert('当サロンをどこでお知りになりましたか？を1つ以上選択してください。');
      return;
    }
    if (!visitDate.year || !visitDate.month || !visitDate.day) {
      alert('サロンをご利用された日時を選択してください。');
      return;
    }
    if (usagePurpose.length === 0) {
      alert('ご利用目的を1つ以上選択してください。');
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

    // ここで usagePurpose の key に対応するラベルを配列に変換
    const usagePurposeLabels = usagePurpose.map((key) => {
      const service = surveyConfig?.serviceDefinitions.find((sd) => sd.key === key);
      return service ? service.label : key;
    });

    console.log('送信するstateの中身', {
      visitDate,
      heardFrom,
      usagePurpose,
      usagePurposeLabels,
      satisfiedPoints,
      improvementPoints,
    });

    // 画面遷移をすべて /googleaccount に統一
    navigate('/googleaccount', {
      state: {
        visitDate,
        heardFrom,
        usagePurpose,
        usagePurposeLabels,
        satisfiedPoints,
        improvementPoints,
      },
    });
  };

  /**
   * 10. 年月日のセレクト用配列
   */
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => String(2020 + i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  /**
   * 11. レンダリング
   */
  if (!surveyConfig) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h6" color="error">
          アンケートを読み込んでいます...
        </Typography>
      </Box>
    );
  }

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
        当サロン利用後のアンケート
      </Typography>

      <Typography variant="body1" textAlign="left" mb={4}>
        <div>この度は当サロンをご利用いただきありがとうございます。</div>
        <div>
          お客様からのご意見を今後のサービス向上に役立てたいと考えておりますので、以下のアンケートにご協力いただけますと幸いです。
        </div>
        <Typography variant="body2" color="textSecondary" mt={2}>
          ※ アンケートは約1分で完了します。
        </Typography>
      </Typography>

      {/* 当サロンをどこでお知りになりましたか */}
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
            当サロンをどこでお知りになりましたか？
            <Typography
              component="span"
              sx={{
                color: 'white',
                backgroundColor: 'red',
                borderRadius: 1,
                padding: '0 4px',
                marginLeft: 1,
                fontSize: '0.8rem',
              }}
            >
              必須
            </Typography>
          </FormLabel>
          <FormGroup>
            {surveyConfig.heardFromOptions.map((option) => (
              <FormControlLabel
                key={option}
                sx={{ mb: 1 }}
                control={
                  <Checkbox
                    value={option}
                    checked={heardFrom.includes(option)}
                    onChange={(e) => handleSimpleCheckboxChange<string>(e, setHeardFrom)}
                  />
                }
                label={
                  <Typography
                    sx={{
                      whiteSpace: 'pre-line',
                      lineHeight: 1,
                    }}
                  >
                    {option}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </FormControl>
      </Box>

      {/* サロンをご利用された日時 */}
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
            当サロンをご利用された日時
            <Typography
              component="span"
              sx={{
                color: 'white',
                backgroundColor: 'red',
                borderRadius: 1,
                padding: '0 4px',
                marginLeft: 1,
                fontSize: '0.8rem',
              }}
            >
              必須
            </Typography>
          </FormLabel>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Select
              value={visitDate.year}
              onChange={(e) => setVisitDate({ ...visitDate, year: e.target.value })}
              sx={{ flex: 1, mr: 1 }}
            >
              <MenuItem value="">
                <em>選択</em>
              </MenuItem>
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
            <Typography>年</Typography>

            <Select
              value={visitDate.month}
              onChange={(e) => setVisitDate({ ...visitDate, month: e.target.value })}
              sx={{ flex: 1, mx: 1 }}
            >
              <MenuItem value="">
                <em>選択</em>
              </MenuItem>
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
            <Typography>月</Typography>

            <Select
              value={visitDate.day}
              onChange={(e) => setVisitDate({ ...visitDate, day: e.target.value })}
              sx={{ flex: 1, ml: 1 }}
            >
              <MenuItem value="">
                <em>選択</em>
              </MenuItem>
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

      {/* 利用目的(サービス) */}
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
            どのサービスをご利用されましたか？ (複数選択可)
            <Typography
              component="span"
              sx={{
                color: 'white',
                backgroundColor: 'red',
                borderRadius: 1,
                padding: '0 4px',
                marginLeft: 1,
                fontSize: '0.8rem',
              }}
            >
              必須
            </Typography>
          </FormLabel>
          <FormGroup>
            {surveyConfig.serviceDefinitions.map((service) => (
              <FormControlLabel
                key={service.key}
                sx={{ mb: 1 }}
                control={
                  <Checkbox
                    value={service.key}
                    checked={usagePurpose.includes(service.key)}
                    onChange={(e) => handleSimpleCheckboxChange<ServiceKey>(e, setUsagePurpose)}
                  />
                }
                label={
                  <Typography
                    sx={{
                      whiteSpace: 'pre-line',
                      lineHeight: 1,
                    }}
                  >
                    {service.label}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </FormControl>
      </Box>

      {/* 選択されたサービスごとの満足点・改善点 */}
      {usagePurpose.map((serviceKey) => {
        const service = surveyConfig.serviceDefinitions.find((s) => s.key === serviceKey);
        if (!service) return null;

        return (
          <Box
            key={service.key}
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
                {`${service.label}のサービスで満足した点 (複数選択可)`}
                <Typography
                  component="span"
                  sx={{
                    color: 'white',
                    backgroundColor: 'red',
                    borderRadius: 1,
                    padding: '0 4px',
                    marginLeft: 1,
                    fontSize: '0.8rem',
                  }}
                >
                  必須
                </Typography>
              </FormLabel>
              <FormGroup>
                {service.satisfiedOptions.map((option) => (
                  <FormControlLabel
                    key={option}
                    sx={{ mb: 1 }}
                    control={
                      <Checkbox
                        value={option}
                        checked={satisfiedPoints[serviceKey]?.includes(option) || false}
                        onChange={(e) =>
                          handleServicePointsCheckboxChange(e, serviceKey, setSatisfiedPoints)
                        }
                      />
                    }
                    label={
                      <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1 }}>
                        {option}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </FormControl>

            {/* 改善してほしい点 */}
            <FormControl component="fieldset" fullWidth margin="normal" required>
              <FormLabel component="legend">
                {`${service.label}のサービスで改善してほしい点 (複数選択可)`}
                <Typography
                  component="span"
                  sx={{
                    color: 'white',
                    backgroundColor: 'red',
                    borderRadius: 1,
                    padding: '0 4px',
                    marginLeft: 1,
                    fontSize: '0.8rem',
                  }}
                >
                  必須
                </Typography>
              </FormLabel>
              <FormGroup>
                {service.improvementOptions.map((option) => (
                  <FormControlLabel
                    key={option}
                    sx={{ mb: 1 }}
                    control={
                      <Checkbox
                        value={option}
                        checked={improvementPoints[serviceKey]?.includes(option) || false}
                        onChange={(e) =>
                          handleServicePointsCheckboxChange(e, serviceKey, setImprovementPoints)
                        }
                      />
                    }
                    label={
                      <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1 }}>
                        {option}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Box>
        );
      })}

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
