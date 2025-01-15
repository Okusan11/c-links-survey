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
  Rating,
  Select,
  Typography,
} from '@mui/material';

/**
 * 1. 型定義
 */
type ServiceKey = 'childDevelopmentSupport' | 'afterSchoolDayService' | 'lifeCare';

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

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1);
  const currentDay = String(currentDate.getDate());

  const [visitDate, setVisitDate] = useState({
    year: String(currentYear),
    month: currentMonth,
    day: currentDay,
  });

  const [heardFrom, setHeardFrom] = useState<string[]>(state?.heardFrom || []);
  const [usagePurpose, setUsagePurpose] = useState<ServiceKey[]>(state?.usagePurpose || []);
  const [satisfaction, setSatisfaction] = useState<number | null>(4);

  const [satisfiedPoints, setSatisfiedPoints] = useState<
    Partial<Record<ServiceKey, string[]>>
  >({});
  const [improvementPoints, setImprovementPoints] = useState<
    Partial<Record<ServiceKey, string[]>>
  >({});

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

  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => String(2020 + i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

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
      <Typography variant="h4" component="h1" textAlign="center" mb={4}>
        当施設利用後のアンケート
      </Typography>

      <Typography variant="body1" textAlign="left" mb={4}>
        <div>この度は当施設をご利用いただきありがとうございます。</div>
        <div>
          お客様からのご意見を今後のサービス向上に役立てたいと考えておりますので、以下のアンケートにご協力いただけますと幸いです。
        </div>
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
          <FormLabel>
            当施設をどこでお知りになりましたか？
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

          {/**
           * ここで FormGroup にスタイルを付与して、2行以上になっても
           * 一定の間隔を保つようにする
           */}
          <FormGroup
            sx={{
              '& .MuiFormControlLabel-root': {
                alignItems: 'flex-start', // テキストが複数行でも上揃えに
                marginBottom: 1,          // チェックボックス同士の間隔
              },
              '& .MuiFormControlLabel-label': {
                lineHeight: 1.3,         // 行間を少し広めに
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
          <FormLabel>
            施設をご利用された日時
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
            どのような用途で当施設をご利用されましたか？ (複数選択可)
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
          <FormGroup
            sx={{
              '& .MuiFormControlLabel-root': {
                alignItems: 'flex-start',
                marginBottom: 1,
              },
              '& .MuiFormControlLabel-label': {
                lineHeight: 1.3,
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
              <FormGroup
                sx={{
                  '& .MuiFormControlLabel-root': {
                    alignItems: 'flex-start',
                    marginBottom: 1,
                  },
                  '& .MuiFormControlLabel-label': {
                    lineHeight: 1.3,
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
              <FormGroup
                sx={{
                  '& .MuiFormControlLabel-root': {
                    alignItems: 'flex-start',
                    marginBottom: 1,
                  },
                  '& .MuiFormControlLabel-label': {
                    lineHeight: 1.3,
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
                fontSize: '0.8rem',
              }}
            >
              必須
            </Typography>
          </FormLabel>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            ※ 5に近いほど満足度が高いことを示します。
          </Typography>
          <Rating
            name="satisfaction-rating"
            value={satisfaction}
            onChange={(_, newValue) => setSatisfaction(newValue)}
            precision={1}
            size="large"
          />
          <Typography component="legend">
            現在の満足度: {satisfaction ?? '未評価'}
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
