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
  Grid,
  MenuItem,
  Paper,
  Rating,
  Select,
  Stack,
  Typography,
} from '@mui/material';

/**
 * 1. 型定義
 */
// 1-1. サービスキーの型
type ServiceKey = 'childDevelopmentSupport' | 'afterSchoolDayService' | 'lifeCare';

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

  // 4. 「当施設をどこで知ったか」の選択リスト
  const [heardFrom, setHeardFrom] = useState<string[]>(state?.heardFrom || []);

  // 5. サービス（利用目的）の選択
  const [usagePurpose, setUsagePurpose] = useState<ServiceKey[]>(state?.usagePurpose || []);

  // 6. 満足度
  const [satisfaction, setSatisfaction] = useState<number | null>(4);

  // 7. サービスごとの満足点/改善点
  const [satisfiedPoints, setSatisfiedPoints] = useState<
    Partial<Record<ServiceKey, string[]>>
  >({});
  const [improvementPoints, setImprovementPoints] = useState<
    Partial<Record<ServiceKey, string[]>>
  >({});

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
      alert('当施設をどこでお知りになりましたか？を1つ以上選択してください。');
      return;
    }
    if (!visitDate.year || !visitDate.month || !visitDate.day) {
      alert('施設をご利用された日時を選択してください。');
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
    if (!satisfaction) {
      alert('当施設への満足度を選択してください。');
      return;
    }

    // usagePurpose の key に対応するラベルを変換
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
      satisfaction,
    });

    // 満足度で遷移先を分岐
    if (satisfaction >= 4) {
      navigate('/googleaccount', {
        state: {
          visitDate,
          heardFrom,
          usagePurpose,
          usagePurposeLabels,
          satisfiedPoints,
          improvementPoints,
          satisfaction,
        },
      });
    } else {
      navigate('/nreviewform', {
        state: {
          visitDate,
          heardFrom,
          usagePurpose,
          usagePurposeLabels,
          satisfiedPoints,
          improvementPoints,
          satisfaction,
        },
      });
    }
  };

  /**
   * 10. 年月日のセレクト用配列
   */
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => String(2020 + i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  /**
   * 11. ローディング状態
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
    // メインフォームをStackで全体管理し、各セクションをPaperでラッピング
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, margin: '0 auto' }}>
      <Stack spacing={3}>
        {/* タイトルセクション */}
        <Box textAlign="center" sx={{ mt: 2 }}>
          <Typography variant="h4" component="h1" mb={1}>
            当施設利用後のアンケート
          </Typography>
          <Typography variant="body1" mb={2}>
            この度は当施設をご利用いただきありがとうございます。お客様からのご意見を今後のサービス向上に役立てたいと考えておりますので、以下のアンケートにご協力いただけますと幸いです。
          </Typography>
          <Typography variant="body2" color="textSecondary">
            ※ アンケートは約1分で完了します。
          </Typography>
        </Box>

        {/* 「当施設をどこでお知りになりましたか？」 */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <FormControl component="fieldset" required>
            <FormLabel>
              当施設をどこでお知りになりましたか？
              <Typography
                component="span"
                sx={{
                  color: '#fff',
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
            <FormGroup
              sx={{
                mt: 1,
                '& .MuiFormControlLabel-root': {
                  alignItems: 'flex-start',
                },
                '& .MuiFormControlLabel-label': {
                  whiteSpace: 'normal',
                  lineHeight: 1.2,
                },
              }}
            >
              {surveyConfig.heardFromOptions.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      value={option}
                      checked={heardFrom.includes(option)}
                      onChange={(e) => handleSimpleCheckboxChange<string>(e, setHeardFrom)}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Paper>

        {/* 施設をご利用された日時 */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <FormControl component="fieldset" required>
            <FormLabel>
              施設をご利用された日時
              <Typography
                component="span"
                sx={{
                  color: '#fff',
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
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Select
                    value={visitDate.year}
                    onChange={(e) => setVisitDate({ ...visitDate, year: e.target.value })}
                    fullWidth
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
                </Grid>
                <Grid item>
                  <Typography>年</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Select
                    value={visitDate.month}
                    onChange={(e) => setVisitDate({ ...visitDate, month: e.target.value })}
                    fullWidth
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
                </Grid>
                <Grid item>
                  <Typography>月</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Select
                    value={visitDate.day}
                    onChange={(e) => setVisitDate({ ...visitDate, day: e.target.value })}
                    fullWidth
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
                </Grid>
                <Grid item>
                  <Typography>日</Typography>
                </Grid>
              </Grid>
            </Box>
          </FormControl>
        </Paper>

        {/* 利用目的(サービス) */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <FormControl component="fieldset" required>
            <FormLabel>
              どのような用途で当施設をご利用されましたか？ (複数選択可)
              <Typography
                component="span"
                sx={{
                  color: '#fff',
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
            <FormGroup
              sx={{
                mt: 1,
                '& .MuiFormControlLabel-root': {
                  alignItems: 'flex-start',
                },
                '& .MuiFormControlLabel-label': {
                  whiteSpace: 'normal',
                  lineHeight: 1.2,
                },
              }}
            >
              {surveyConfig.serviceDefinitions.map((service) => (
                <FormControlLabel
                  key={service.key}
                  control={
                    <Checkbox
                      value={service.key}
                      checked={usagePurpose.includes(service.key)}
                      onChange={(e) => handleSimpleCheckboxChange<ServiceKey>(e, setUsagePurpose)}
                    />
                  }
                  label={service.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Paper>

        {/* 選択されたサービスごとの満足点・改善点 */}
        {usagePurpose.map((serviceKey) => {
          const service = surveyConfig.serviceDefinitions.find((s) => s.key === serviceKey);
          if (!service) return null;

          return (
            <Paper key={service.key} elevation={2} sx={{ p: 2 }}>
              {/* 満足した点 */}
              <FormControl component="fieldset" required>
                <FormLabel>
                  {`${service.label}のサービスで満足した点 (複数選択可)`}
                  <Typography
                    component="span"
                    sx={{
                      color: '#fff',
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
                <FormGroup
                  sx={{
                    mt: 1,
                    '& .MuiFormControlLabel-root': {
                      alignItems: 'flex-start',
                    },
                    '& .MuiFormControlLabel-label': {
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                    },
                  }}
                >
                  {service.satisfiedOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          value={option}
                          checked={satisfiedPoints[serviceKey]?.includes(option) || false}
                          onChange={(e) =>
                            handleServicePointsCheckboxChange(e, serviceKey, setSatisfiedPoints)
                          }
                        />
                      }
                      label={option}
                    />
                  ))}
                </FormGroup>
              </FormControl>

              {/* 改善してほしい点 */}
              <FormControl component="fieldset" required sx={{ mt: 2 }}>
                <FormLabel>
                  {`${service.label}のサービスで改善してほしい点 (複数選択可)`}
                  <Typography
                    component="span"
                    sx={{
                      color: '#fff',
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
                <FormGroup
                  sx={{
                    mt: 1,
                    '& .MuiFormControlLabel-root': {
                      alignItems: 'flex-start',
                    },
                    '& .MuiFormControlLabel-label': {
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                    },
                  }}
                >
                  {service.improvementOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          value={option}
                          checked={improvementPoints[serviceKey]?.includes(option) || false}
                          onChange={(e) =>
                            handleServicePointsCheckboxChange(e, serviceKey, setImprovementPoints)
                          }
                        />
                      }
                      label={option}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Paper>
          );
        })}

        {/* 満足度評価 */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <FormControl component="fieldset" required>
            <FormLabel>
              当施設のサービスへの満足度を教えてください。
              <Typography
                component="span"
                sx={{
                  color: '#fff',
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
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mt: 1 }}>
              ※ 5に近いほど満足度が高いことを示します。
            </Typography>
            <Rating
              name="satisfaction-rating"
              value={satisfaction}
              onChange={(_, newValue) => setSatisfaction(newValue)}
              precision={1}
              size="large"
            />
            <Typography component="legend" sx={{ mt: 1 }}>
              現在の満足度: {satisfaction ?? '未評価'}
            </Typography>
          </FormControl>
        </Paper>

        {/* ボタンセクション */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {/* 戻るボタンはサブアクション */}
          <Button variant="text" color="secondary">
            戻る
          </Button>
          {/* 次へボタンはメインアクション */}
          <Button variant="contained" color="primary" type="submit">
            次へ
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SurveyForm;
