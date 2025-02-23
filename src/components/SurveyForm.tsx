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
  FormLabel,
  TextField,
  MenuItem,
  Select,
  Typography,
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

  // 4. 「当サロンをどこで知ったか」の選択リスト + その他入力欄
  const [heardFrom, setHeardFrom] = useState<string[]>(state?.heardFrom || []);
  const [otherHeardFrom, setOtherHeardFrom] = useState<string>(state?.otherHeardFrom || '');

  // 5. サービス（利用目的）の選択
  const [usagePurpose, setUsagePurpose] = useState<ServiceKey[]>(state?.usagePurpose || []);

  // 6. サービスごとの満足点/改善点
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
    if (visitDate.year || !visitDate.month || !visitDate.day) {
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

    // ここでusagePurposeのkeyに対応するラベルを配列に変換
    const usagePurposeLabels = usagePurpose.map((key) => {
      const service = surveyConfig?.serviceDefinitions.find((sd) => sd.key === key);
      return service ? service.label : key;
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

  /**
   * 10. 年月日のセレクト用配列
   */
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => String(2020 + i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  /**
   * 11. 共通スタイルオブジェクト
   */
  const questionBoxStyle = {
    backgroundColor: '#fff',
    padding: 1,
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: 3,
  } as const;

  /**
   * 12. レンダリング
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
      <Box sx={questionBoxStyle}>
        <FormControl fullWidth margin="normal" error={errors.heardFrom || errors.otherHeardFrom} required>
          <RequiredFormLabel label="当サロンをどこでお知りになりましたか？"　/>
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
                      lineHeight: 1.5,
                    }}
                  >
                    {option}
                  </Typography>
                }
              />
            ))}
            {/* その他をチェックしたらテキスト入力欄表示 */}
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
      </Box>

      {/* サロンをご利用された日時 */}
      <Box sx={questionBoxStyle}>
        <FormControl fullWidth margin="normal" error={errors.visitDate} required>
          <RequiredFormLabel label="当サロンをご利用された日時" />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Select
              value={visitDate.year}
              onChange={(e) => setVisitDate({ ...visitDate, year: e.target.value })}
              sx={{ flex: 1, mr: 1, mt: 1 }}
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
          {errors.visitDate && (
            <FormHelperText>サロンをご利用された日時を選択してください。</FormHelperText>
          )}
        </FormControl>
      </Box>

      {/* 利用目的(サービス) */}
      <Box sx={questionBoxStyle}>
        <FormControl fullWidth margin="normal" error={errors.usagePurpose} required>
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
                label={
                  <Typography
                    sx={{
                      whiteSpace: 'pre-line',
                      lineHeight: 1.5,
                    }}
                  >
                    {service.label}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
          {errors.usagePurpose && (
            <FormHelperText>1つ以上選択してください。</FormHelperText>
          )}
        </FormControl>
      </Box>

      {/* 選択されたサービスごとの満足点・改善点 */}
      {usagePurpose.map((serviceKey) => {
        const service = surveyConfig.serviceDefinitions.find((s) => s.key === serviceKey);
        if (!service) return null;

        return (
          <Box key={service.key} sx={questionBoxStyle}>
            {/* 満足した点 */}
            <FormControl component="fieldset" fullWidth margin="normal" error={errors.satisfiedPoints} required>
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
                    label={
                      <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                        {option}
                      </Typography>
                    }
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
            <FormControl component="fieldset" fullWidth margin="normal" error={errors.improvementPoints} required>
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
                    label={
                      <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                        {option}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
              {errors.improvementPoints && (
                <FormHelperText>
                  {`${service.label}の改善点を1つ以上選択してください。`}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
        );
      })}

      {/* ボタン */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button variant="contained" color="primary" type="submit">
          次へ
        </Button>
      </Box>
    </Box>
  );
};

export default SurveyForm;
