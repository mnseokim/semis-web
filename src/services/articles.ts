import { supabase } from '../lib/supabase';
import { Article, FilterOption } from '../types';

interface ArticleRow {
  id: string;
  url: string;
  title: string | null;
  summary: string | null;
  tags: string[];
  top_category: string;
  sub_category: string;
  source_type: string;
  company: string | null;
  manually_added: boolean;
  created_at: string;
}

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    url: row.url,
    title: row.title ?? '',
    summary: row.summary ?? '',
    tags: row.tags ?? [],
    topCategory: row.top_category as Article['topCategory'],
    subCategory: row.sub_category as Article['subCategory'],
    sourceType: row.source_type as Article['sourceType'],
    company: row.company as Article['company'],
    manuallyAdded: row.manually_added,
    createdAt: row.created_at,
  };
}

export async function fetchArticles(filter: FilterOption): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (filter.top) query = query.eq('top_category', filter.top);
  if (filter.sub) query = query.eq('sub_category', filter.sub);
  if (filter.source) query = query.eq('source_type', filter.source);
  if (filter.company) query = query.eq('company', filter.company);

  const { data, error } = await query;
  if (error) throw error;
  return (data as ArticleRow[]).map(rowToArticle);
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) throw error;
}

export async function insertArticle(
  url: string,
  category: FilterOption,
  ai: { title: string; summary: string; tags: string[] }
): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .insert({
      url,
      title: ai.title,
      summary: ai.summary,
      tags: ai.tags,
      top_category: category.top,
      sub_category: category.sub,
      source_type: category.source,
      company: category.company || null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToArticle(data as ArticleRow);
}
