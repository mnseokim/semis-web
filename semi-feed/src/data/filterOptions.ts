import { TopCategory, SubCategory, SourceType, Company } from '../types';

export const TOP_CATEGORIES: TopCategory[] = ['반도체', '디스플레이'];

export const SUB_CATEGORIES: Record<TopCategory, SubCategory[]> = {
  반도체: ['HBM', 'NAND', 'DRAM', 'SSD'],
  디스플레이: ['OLED', 'LCD', 'MicroLED'],
};

export const SOURCE_TYPES: SourceType[] = ['공식블로그', '기술아티클', '소비자리뷰'];

export const COMPANIES: Company[] = ['삼성', 'SK하이닉스'];
