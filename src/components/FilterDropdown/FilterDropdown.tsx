import React from 'react';
import styled from 'styled-components';
import { FilterOption, TopCategory, SubCategory, SourceType, Company } from '../../types';
import { TOP_CATEGORIES, SUB_CATEGORIES, SOURCE_TYPES, COMPANIES } from '../../data/filterOptions';

interface Props {
  filter: FilterOption;
  onChange: (filter: FilterOption) => void;
}

const FilterDropdown: React.FC<Props> = ({ filter, onChange }) => {
  const subOptions = filter.top ? SUB_CATEGORIES[filter.top] : [];
  const hasFilter = filter.top || filter.sub || filter.source || filter.company;

  return (
    <Container>
      <Label>기술 필터</Label>
      <SelectRow>
        <Select
          value={filter.top}
          onChange={(e) => onChange({ ...filter, top: e.target.value as TopCategory | '', sub: '' })}
        >
          <option value="">전체 분야</option>
          {TOP_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>

        <Select
          value={filter.sub}
          onChange={(e) => onChange({ ...filter, sub: e.target.value as SubCategory | '' })}
          disabled={!filter.top}
        >
          <option value="">세부 기술</option>
          {subOptions.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </Select>

        <Select
          value={filter.source}
          onChange={(e) => onChange({ ...filter, source: e.target.value as SourceType | '' })}
        >
          <option value="">소스 유형</option>
          {SOURCE_TYPES.map((src) => (
            <option key={src} value={src}>{src}</option>
          ))}
        </Select>

        <Select
          value={filter.company}
          onChange={(e) => onChange({ ...filter, company: e.target.value as Company | '' })}
        >
          <option value="">전체 기업</option>
          {COMPANIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </SelectRow>

      {hasFilter && (
        <ActiveFilters>
          {filter.top && <Tag>{filter.top}</Tag>}
          {filter.sub && <Tag>{filter.sub}</Tag>}
          {filter.source && <Tag>{filter.source}</Tag>}
          {filter.company && <CompanyTag>{filter.company}</CompanyTag>}
          <ClearButton onClick={() => onChange({ top: '', sub: '', source: '', company: '' })}>
            전체 초기화
          </ClearButton>
        </ActiveFilters>
      )}
    </Container>
  );
};

export default FilterDropdown;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const Label = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SelectRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 8px 32px 8px 12px;
  border: 1.5px solid #dee2e6;
  border-radius: 8px;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23868e96' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 10px center;
  background-size: 12px;
  appearance: none;
  font-size: 14px;
  color: #212529;
  cursor: pointer;
  min-width: 120px;
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

const ActiveFilters = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  display: inline-block;
  padding: 3px 10px;
  background: #e7f5ff;
  color: #1971c2;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`;

const CompanyTag = styled.span`
  display: inline-block;
  padding: 3px 10px;
  background: #fff3bf;
  color: #e67700;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`;

const ClearButton = styled.button`
  padding: 3px 10px;
  background: none;
  border: 1px solid #adb5bd;
  border-radius: 20px;
  font-size: 12px;
  color: #868e96;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-left: auto;

  &:hover {
    background: #f1f3f5;
    color: #495057;
  }
`;
