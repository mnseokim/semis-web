import { supabase } from '../lib/supabase';

export interface Bookmark {
  id: string;
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  quote: string;
  createdAt: string;
}

interface BookmarkRow {
  id: string;
  article_id: string;
  article_title: string;
  article_url: string;
  quote: string;
  created_at: string;
}

function rowToBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    articleId: row.article_id,
    articleTitle: row.article_title,
    articleUrl: row.article_url,
    quote: row.quote,
    createdAt: row.created_at,
  };
}

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as BookmarkRow[]).map(rowToBookmark);
}

export async function insertBookmark(
  articleId: string,
  articleTitle: string,
  articleUrl: string,
  quote: string
): Promise<void> {
  const { error } = await supabase.from('bookmarks').insert({
    article_id: articleId,
    article_title: articleTitle,
    article_url: articleUrl,
    quote,
  });
  if (error) throw error;
}

export async function deleteBookmark(id: string): Promise<void> {
  const { error } = await supabase.from('bookmarks').delete().eq('id', id);
  if (error) throw error;
}
