import React, { useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import FilterDropdown from './components/FilterDropdown/FilterDropdown';
import UrlInputForm from './components/UrlInputForm/UrlInputForm';
import BookmarkModal from './components/BookmarkModal/BookmarkModal';
import BookmarkPanel from './components/BookmarkPanel/BookmarkPanel';
import { FilterOption, Article } from './types';
import { fetchArticles, insertArticle, deleteArticle } from './services/articles';
import { summarizeUrl } from './services/summarize';
import { fetchBookmarks, insertBookmark, Bookmark } from './services/bookmarks';

const STORAGE_KEY = 'semis_read';

function getReadIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f1f3f5;
    color: #212529;
  }
`;

type Tab = 'feed' | 'bookmarks';

function App() {
  const [tab, setTab] = useState<Tab>('feed');
  const [filter, setFilter] = useState<FilterOption>({ top: '', sub: '', source: '', company: '' });
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState('');
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkTarget, setBookmarkTarget] = useState<Article | null>(null);

  const loadArticles = useCallback(async () => {
    setLoadingList(true);
    setListError('');
    try {
      const data = await fetchArticles(filter);
      setArticles(data);
    } catch (e) {
      setListError('목록을 불러오지 못했습니다.');
    } finally {
      setLoadingList(false);
    }
  }, [filter]);

  const loadBookmarks = useCallback(async () => {
    const data = await fetchBookmarks();
    setBookmarks(data);
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);
  useEffect(() => { loadBookmarks(); }, [loadBookmarks]);

  const handleSubmit = async (url: string, category: FilterOption) => {
    const ai = await summarizeUrl(url);
    await insertArticle(url, category, ai);
    await loadArticles();
  };

  const markRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);
    saveReadIds(next);
    setReadIds(next);
  };

  const markUnread = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const next = new Set(readIds);
    next.delete(id);
    saveReadIds(next);
    setReadIds(next);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!window.confirm('삭제하시겠습니까?')) return;
    await deleteArticle(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleBookmarkSave = async (quote: string) => {
    if (!bookmarkTarget) return;
    await insertBookmark(bookmarkTarget.id, bookmarkTarget.title, bookmarkTarget.url, quote);
    await loadBookmarks();
  };

  const sorted = [
    ...articles.filter((a) => !readIds.has(a.id)),
    ...articles.filter((a) => readIds.has(a.id)),
  ];

  const unreadCount = articles.filter((a) => !readIds.has(a.id)).length;

  return (
    <>
      <GlobalStyle />
      <Header>
        <HeaderInner>
          <Logo>Semis</Logo>
          <Subtitle>반도체·디스플레이 기술 큐레이션</Subtitle>
          <NavRight>
            {unreadCount > 0 && <UnreadBadge>{unreadCount} 안읽음</UnreadBadge>}
            <TabButton $active={tab === 'feed'} onClick={() => setTab('feed')}>피드</TabButton>
            <TabButton $active={tab === 'bookmarks'} onClick={() => setTab('bookmarks')}>
              북마크 {bookmarks.length > 0 && `(${bookmarks.length})`}
            </TabButton>
          </NavRight>
        </HeaderInner>
      </Header>

      <Main>
        {tab === 'feed' && (
          <>
            <UrlInputForm onSubmit={handleSubmit} />
            <FilterDropdown filter={filter} onChange={setFilter} />

            {loadingList && <StatusText>불러오는 중...</StatusText>}
            {listError && <ErrorText>{listError}</ErrorText>}

            {!loadingList && articles.length === 0 && (
              <Placeholder>
                <PlaceholderText>아직 저장된 아티클이 없습니다.</PlaceholderText>
              </Placeholder>
            )}

            <ArticleList>
              {sorted.map((article) => {
                const isRead = readIds.has(article.id);
                return (
                  <ArticleItem key={article.id} $read={isRead}>
                    <ArticleMeta>
                      {!isRead && <UnreadDot />}
                      {article.company && (
                        <CompanyBadge company={article.company}>{article.company}</CompanyBadge>
                      )}
                      <CategoryBadge>{article.topCategory}</CategoryBadge>
                      <CategoryBadge $secondary>{article.subCategory}</CategoryBadge>
                      <SourceBadge>{article.sourceType}</SourceBadge>
                      <DateText>{new Date(article.createdAt).toLocaleDateString('ko-KR')}</DateText>
                      {isRead && (
                        <UnreadButton onClick={(e) => markUnread(e, article.id)}>
                          안읽음으로
                        </UnreadButton>
                      )}
                      {article.manuallyAdded && (
                        <DeleteButton onClick={(e) => handleDelete(e, article.id)}>삭제</DeleteButton>
                      )}
                    </ArticleMeta>
                    <ArticleTitle
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      $read={isRead}
                      onClick={() => markRead(article.id)}
                    >
                      {article.title || article.url}
                    </ArticleTitle>
                    {article.summary && !isRead && (
                      <ArticleSummary>{article.summary}</ArticleSummary>
                    )}
                    {article.tags.length > 0 && !isRead && (
                      <TagRow>
                        {article.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </TagRow>
                    )}
                    <QuoteButton onClick={() => setBookmarkTarget(article)}>
                      문구 저장
                    </QuoteButton>
                  </ArticleItem>
                );
              })}
            </ArticleList>
          </>
        )}

        {tab === 'bookmarks' && (
          <BookmarkPanel bookmarks={bookmarks} onChange={loadBookmarks} />
        )}
      </Main>

      {bookmarkTarget && (
        <BookmarkModal
          articleTitle={bookmarkTarget.title}
          onSave={handleBookmarkSave}
          onClose={() => setBookmarkTarget(null)}
        />
      )}
    </>
  );
}

export default App;

const Header = styled.header`
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderInner = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #228be6;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.span`
  font-size: 13px;
  color: #868e96;
`;

const NavRight = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UnreadBadge = styled.span`
  padding: 3px 10px;
  background: #ff6b6b;
  color: #fff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 5px 12px;
  border-radius: 20px;
  border: 1.5px solid ${({ $active }) => ($active ? '#228be6' : '#dee2e6')};
  background: ${({ $active }) => ($active ? '#228be6' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : '#495057')};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
`;

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #868e96;
  text-align: center;
  padding: 24px;
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #f03e3e;
  text-align: center;
  padding: 24px;
`;

const Placeholder = styled.div`
  padding: 48px 24px;
  background: #fff;
  border: 1px dashed #ced4da;
  border-radius: 12px;
  text-align: center;
`;

const PlaceholderText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #adb5bd;
`;

const ArticleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ArticleItem = styled.div<{ $read: boolean }>`
  background: ${({ $read }) => ($read ? '#f8f9fa' : '#fff')};
  border: 1px solid ${({ $read }) => ($read ? '#e9ecef' : '#dee2e6')};
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  opacity: ${({ $read }) => ($read ? 0.6 : 1)};
  transition: opacity 0.2s ease;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const UnreadDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff6b6b;
  flex-shrink: 0;
`;

const CategoryBadge = styled.span<{ $secondary?: boolean }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $secondary }) => ($secondary ? '#e7f5ff' : '#228be6')};
  color: ${({ $secondary }) => ($secondary ? '#1971c2' : '#fff')};
`;

const COMPANY_COLORS: Record<string, { bg: string; color: string }> = {
  '삼성': { bg: '#1c7ed6', color: '#fff' },
  'SK하이닉스': { bg: '#e03131', color: '#fff' },
};

const CompanyBadge = styled.span<{ company: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ company }) => COMPANY_COLORS[company]?.bg ?? '#868e96'};
  color: ${({ company }) => COMPANY_COLORS[company]?.color ?? '#fff'};
`;

const SourceBadge = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: #f1f3f5;
  color: #495057;
`;

const DateText = styled.span`
  font-size: 12px;
  color: #adb5bd;
  margin-left: auto;
`;

const UnreadButton = styled.button`
  padding: 2px 8px;
  background: none;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 11px;
  color: #868e96;
  cursor: pointer;
  &:hover { background: #f1f3f5; }
`;

const DeleteButton = styled.button`
  padding: 2px 8px;
  background: none;
  border: 1px solid #ffc9c9;
  border-radius: 4px;
  font-size: 11px;
  color: #f03e3e;
  cursor: pointer;
  &:hover { background: #fff5f5; }
`;

const ArticleTitle = styled.a<{ $read: boolean }>`
  font-size: 15px;
  font-weight: ${({ $read }) => ($read ? 400 : 600)};
  color: ${({ $read }) => ($read ? '#868e96' : '#212529')};
  text-decoration: none;
  &:hover { color: #228be6; text-decoration: underline; }
`;

const ArticleSummary = styled.p`
  margin: 0;
  font-size: 13px;
  color: #495057;
  line-height: 1.6;
`;

const TagRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  font-size: 12px;
  color: #1971c2;
  background: #e7f5ff;
  padding: 2px 8px;
  border-radius: 20px;
`;

const QuoteButton = styled.button`
  align-self: flex-start;
  padding: 3px 10px;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  font-size: 11px;
  color: #868e96;
  cursor: pointer;
  &:hover { border-color: #228be6; color: #228be6; }
`;
