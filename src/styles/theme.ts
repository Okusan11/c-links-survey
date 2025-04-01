import { SxProps, Theme } from '@mui/material';

// 共通のスタイル定義
export const containerStyle: SxProps<Theme> = {
  maxWidth: 600,
  margin: '0 auto',
  backgroundColor: '#e0f7fa',
  padding: 3,
  borderRadius: 2,
};

export const questionBoxStyle: SxProps<Theme> = {
  backgroundColor: '#fff',
  padding: 2,
  borderRadius: 2,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: 3,
};

export const titleStyle: SxProps<Theme> = {
  textAlign: 'center',
  marginBottom: 4,
};

export const buttonContainerStyle: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 4,
};

export const rightAlignedButtonContainerStyle: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: 4,
};

export const requiredLabelStyle: SxProps<Theme> = {
  color: 'white',
  backgroundColor: 'red',
  borderRadius: 1,
  padding: '0 4px',
  marginLeft: 1,
  display: 'inline-block',
  fontSize: '0.8rem',
}; 