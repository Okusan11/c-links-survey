import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  FormLabel,
} from '@mui/material';

/**
 * --- 共通化された「必須ラベル」コンポーネント ---
 */
interface RequiredFormLabelProps {
  label: string;
}

const RequiredFormLabel: React.FC<RequiredFormLabelProps> = ({ label }) => {
  return (
    <FormLabel sx={{ textAlign: 'left', mb: 1 }}>
      {label}
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
  );
};

/**
 * 1. 型定義
 */
type ServiceKey = 'cut' | 'color' | 'perm' | 'straightPerm' | 'treatment' | 'headSpa' | 'hairSet';

interface ServiceDefinition {
  key: ServiceKey;
  label: string;
  satisfiedOptions: string[];
  improvementOptions: string[];
}

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

  // 4. 「当サロンをどこで知ったか」の選択リスト + その他入力欄
  const [heardFrom, setHeardFrom] = useState<string[]>(state?.heardFrom || []);
  const [otherHeardFrom, setOtherHeardFrom] = useState<string>(state?.otherHeardFrom || '');

  // 5. サービス（利用目的）の選択
  const [usagePurpose, setUsagePurpose] = useState<ServiceKey[]>(state?.usagePurpose || []);

  // 7. サービスごとの満足点/改善点
  const [satisfiedPoints, setSatisfiedPoints] = useState<Partial<Record<ServiceKey, string[]>>>({});
  const [improvementPoints, setImprovementPoints] = useState<Partial<Record<ServiceKey, string[]>>>(
    {}
  );

  // 8. チェックボックス変更ハンドラ
  const handleSimpleCheckboxChange = <T extends string>(
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    const value = event.target.value as T;
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

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

  // 9. フォーム送信時のエラーチェック
  const [errors, setErrors] = useState({
    heardFrom: false,
    visitDate: false,
    usagePurpose: false,
    satisfiedPoints: false,
    improvementPoints: false,
    otherHeardFrom: false,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    let newErrors = {
      heardFrom: false,
      visitDate: false,
      usagePurpose: false,
      satisfiedPoints: false,
      improvementPoints: false,
      otherHeardFrom: false,
    };

    // 必須チェック1: 当サロンをどこで知ったか
    if (heardFrom.length === 0) {
      newErrors.heardFrom = true;
    }
    // その他が含まれる場合はテキスト未入力ならエラー
    if (heardFrom.includes('その他') && !otherHeardFrom) {
      newErrors.otherHeardFrom = true;
    }

    // 必須チェック2: 利用日時
    if (!visitDate.year || !visitDate.month || !visitDate.day) {
      newErrors.visitDate = true;
    }

    // 必須チェック3: ご利用目的
    if (usagePurpose.length === 0) {
      newErrors.usagePurpose = true;
    }

    // 必須チェック4: 満足点
    if (Object.keys(satisfiedPoints).length === 0) {
      newErrors.satisfiedPoints = true;
    }

    // 必須チェック5: 改善点
    if (Object.keys(improvementPoints).length === 0) {
      newErrors.improvementPoints = true;
    }

    setErrors(newErrors);

    // エラーがあればreturn
    if (
      newErrors.heardFrom ||
      newErrors.otherHeardFrom ||
      newErrors.visitDate ||
      newErrors.usagePurpose ||
      newErrors.satisfiedPoints ||
      newErrors.improvementPoints
    ) {
      return;
    }

    // usagePurpose の key → ラベル配列
    const usagePurposeLabels = usagePurpose.map((key) => {
      const service = surveyConfig?.serviceDefinitions.find((sd) => sd.key === key);
      return service ? service.label : key;
    });

    console.log('送信するstateの中身', {
      visitDate,
      heardFrom,
      otherHeardFrom,
      usagePurpose,
      usagePurposeLabels,
      satisfiedPoints,
      improvementPoints,
    });

    navigate('/googleaccount', {
      state: {
        visitDate,
        heardFrom,
        otherHeardFrom,
        usagePurpose,
        usagePurposeLabels,
        satisfiedPoints,
        improvementPoints,
      },
    });
  };

  // 10. 年月日のセレクト用配列
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => String(2020 + i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  // Paper スタイル
  const questionPaperStyle = {
    p: 2,
    mb: 3,
  };

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
        mx: 'auto',
        backgroundColor: '#e0f7fa',
        p: 3,
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
          お客様からのご意見を今後のサービス向上に役立てたいと考えておりますので、
          以下のアンケートにご協力いただけますと幸いです。
        </div>
        <Typography variant="body2" color="textSecondary" mt={2}>
          ※ アンケートは約1分で完了します。
        </Typography>
      </Typography>

      {/* 当サロンをどこでお知りになりましたか */}
      <Paper elevation={2} sx={questionPaperStyle}>
        <FormControl
          fullWidth
          required
          error={errors.heardFrom || errors.otherHeardFrom}
          margin="normal"
        >
          <RequiredFormLabel label="当サロンをどこでお知りになりましたか？" />
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
                label={option}
              />
            ))}

            {/* その他チェック時のみテキスト入力表示 */}
            {heardFrom.includes('その他') && (
              <TextField
                label="その他（具体的に）"
                variant="outlined"
                value={otherHeardFrom}
                onChange={(e) => setOtherHeardFrom(e.target.value)}
                sx={{ mt: 2 }}
              />
            )}
          </FormGroup>
          {(errors.heardFrom || errors.otherHeardFrom) && (
            <FormHelperText>
              「どこで知ったか」を1つ以上選択し、その他を選んだ場合は入力してください。
            </FormHelperText>
          )}
        </FormControl>
      </Paper>

      {/* サロンをご利用された日時 */}
      <Paper elevation={2} sx={questionPaperStyle}>
        <FormControl fullWidth required error={errors.visitDate} margin="normal">
          <RequiredFormLabel label="当サロンをご利用された日時" />
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={4}>
              <Select
                value={visitDate.year}
                onChange={(e) => setVisitDate({ ...visitDate, year: e.target.value })}
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
            <Grid item xs="auto">
              <Typography>年</Typography>
            </Grid>
            <Grid item xs={3}>
              <Select
                value={visitDate.month}
                onChange={(e) => setVisitDate({ ...visitDate, month: e.target.value })}
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
            <Grid item xs="auto">
              <Typography>月</Typography>
            </Grid>
            <Grid item xs={3}>
              <Select
                value={visitDate.day}
                onChange={(e) => setVisitDate({ ...visitDate, day: e.target.value })}
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
            <Grid item xs="auto">
              <Typography>日</Typography>
            </Grid>
          </Grid>
          {errors.visitDate && (
            <FormHelperText>サロンをご利用された日時を選択してください。</FormHelperText>
          )}
        </FormControl>
      </Paper>

      {/* 利用目的(サービス) */}
      <Paper elevation={2} sx={questionPaperStyle}>
        <FormControl fullWidth required error={errors.usagePurpose} margin="normal">
          <RequiredFormLabel label="どのサービスをご利用されましたか？（複数選択可）" />
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
                label={service.label}
              />
            ))}
          </FormGroup>
          {errors.usagePurpose && (
            <FormHelperText>1つ以上選択してください。</FormHelperText>
          )}
        </FormControl>
      </Paper>

      {/* 選択されたサービスごとの満足点・改善点 */}
      {usagePurpose.map((serviceKey) => {
        const service = surveyConfig.serviceDefinitions.find((s) => s.key === serviceKey);
        if (!service) return null;

        return (
          <Paper key={service.key} elevation={2} sx={questionPaperStyle}>
            {/* 満足した点 */}
            <FormControl
              component="fieldset"
              fullWidth
              required
              error={errors.satisfiedPoints}
              margin="normal"
            >
              <RequiredFormLabel
                label={`${service.label}のサービスで満足した点を選択してください（複数選択可）`}
              />
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
                    label={option}
                  />
                ))}
              </FormGroup>
              {errors.satisfiedPoints && (
                <FormHelperText>
                  {`${service.label}の満足点を1つ以上選択してください。`}
                </FormHelperText>
              )}
            </FormControl>

            {/* 改善してほしい点 */}
            <FormControl
              component="fieldset"
              fullWidth
              required
              error={errors.improvementPoints}
              margin="normal"
            >
              <RequiredFormLabel
                label={`${service.label}のサービスで改善してほしい点を選択してください（複数選択可）`}
              />
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
                    label={option}
                  />
                ))}
              </FormGroup>
              {errors.improvementPoints && (
                <FormHelperText>
                  {`${service.label}の改善点を1つ以上選択してください。`}
                </FormHelperText>
              )}
            </FormControl>
          </Paper>
        );
      })}

      {/* ボタン部分から「戻る」ボタンを削除 */}
      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Button variant="contained" color="primary" type="submit">
          次へ
        </Button>
      </Box>
    </Box>
  );
};

export default SurveyForm;
