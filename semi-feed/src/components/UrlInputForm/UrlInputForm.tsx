import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FilterOption, TopCategory, SubCategory, SourceType } from '../../types';
import { TOP_CATEGORIES, SUB_CATEGORIES, SOURCE_TYPES } from '../../data/filterOptions';

interface Props {
  onSubmit: (url: string, category: FilterOption) => Promise<void>;
}

const UrlInputForm: React.FC<Props> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<FilterOption>({ top: '', sub: '', source: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subOptions = category.top ? SUB_CATEGORIES[category.top] : [];

  const isValid = url.trim() !== '' && category.top !== '' && category.sub !== '' && category.source !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError('URL과 모든 카테고리를 선택해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit(url.trim(), category);
      setUrl('');
      setCategory({ top: '', sub: '', source: '', company: '' });
    } catch (err) {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const top = e.target.value as TopCategory | '';
    setCategory({ top, sub: '', source: category.source, company: category.company });
  };

  return (
    <Container>
      <Title>아티클 추가</Title>
      <Form onSubmit={handleSubmit}>
        <UrlRow>
          <UrlInput
            type="url"
            placeholder="https://news.samsungsemiconductor.com/kr/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </UrlRow>

        <CategoryRow>
          <Select
            value={category.top}
            onChange={handleTopChange}
            disabled={loading}
          >
            <option value="">분야 선택</option>
            {TOP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>

          <Select
            value={category.sub}
            onChange={(e) =>
              setCategory({ ...category, sub: e.target.value as SubCategory | '' })
            }
            disabled={!category.top || loading}
          >
            <option value="">세부 기술</option>
            {subOptions.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </Select>

          <Select
            value={category.source}
            onChange={(e) =>
              setCategory({ ...category, source: e.target.value as SourceType | '' })
            }
            disabled={loading}
          >
            <option value="">소스 유형</option>
            {SOURCE_TYPES.map((src) => (
              <option key={src} value={src}>{src}</option>
            ))}
          </Select>
        </CategoryRow>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <SubmitButton type="submit" disabled={loading || !isValid}>
          {loading ? <Spinner /> : 'AI 요약 생성'}
        </SubmitButton>
      </Form>
    </Container>
  );
};

export default UrlInputForm;

const Container = styled.div`
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px 24px;
`;

const Title = styled.h2`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: #212529;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UrlRow = styled.div`
  display: flex;
  gap: 8px;
`;

const UrlInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  color: #212529;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: #adb5bd;
  }

  &:focus {
    outline: none;
    border-color: #4dabf7;
    box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.15);
  }

  &:disabled {
    background: #f8f9fa;
    color: #adb5bd;
  }
`;

const CategoryRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  flex: 1;
  min-width: 120px;
  padding: 9px 32px 9px 12px;
  border: 1.5px solid #dee2e6;
  border-radius: 8px;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23868e96' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 10px center;
  background-size: 12px;
  appearance: none;
  font-size: 14px;
  color: #212529;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    outline: none;
    border-color: #4dabf7;
    box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.15);
  }

  &:disabled {
    background-color: #f1f3f5;
    color: #adb5bd;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  margin: 0;
  font-size: 13px;
  color: #f03e3e;
`;

const SubmitButton = styled.button`
  padding: 11px;
  background: #228be6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: #1971c2;
  }

  &:disabled {
    background: #a5d8ff;
    cursor: not-allowed;
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;
