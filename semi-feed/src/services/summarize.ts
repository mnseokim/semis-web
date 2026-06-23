import { supabase } from '../lib/supabase';

export interface AISummary {
  title: string;
  summary: string;
  tags: string[];
}

export async function summarizeUrl(url: string): Promise<AISummary> {
  const { data, error } = await supabase.functions.invoke('summarize', {
    body: { url },
  });

  if (error) throw error;
  return data as AISummary;
}
