export type TopCategory = '반도체' | '디스플레이';

export type SubCategory =
  | 'HBM'
  | 'NAND'
  | 'DRAM'
  | 'SSD'
  | 'OLED'
  | 'LCD'
  | 'MicroLED';

export type SourceType = '공식블로그' | '기술아티클' | '소비자리뷰';

export type Company = '삼성' | 'SK하이닉스';

export interface FilterOption {
  top: TopCategory | '';
  sub: SubCategory | '';
  source: SourceType | '';
  company: Company | '';
}

export interface Article {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  topCategory: TopCategory;
  subCategory: SubCategory;
  sourceType: SourceType;
  company: Company | null;
  manuallyAdded: boolean;
  createdAt: string;
}
