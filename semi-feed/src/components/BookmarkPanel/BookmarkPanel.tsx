import React from 'react';
import styled from 'styled-components';
import { Bookmark, deleteBookmark } from '../../services/bookmarks';

interface Props {
  bookmarks: Bookmark[];
  onChange: () => void;
}

const BookmarkPanel: React.FC<Props> = ({ bookmarks, onChange }) => {
  const handleDelete = async (id: string) => {
    await deleteBookmark(id);
    onChange();
  };

  if (bookmarks.length === 0) {
    return (
      <Empty>저장된 문구가 없습니다.</Empty>
    );
  }

  return (
    <List>
      {bookmarks.map((bm) => (
        <Item key={bm.id}>
          <Quote>"{bm.quote}"</Quote>
          <Meta>
            <ArticleLink href={bm.articleUrl} target="_blank" rel="noopener noreferrer">
              {bm.articleTitle || bm.articleUrl}
            </ArticleLink>
            <DateText>{new Date(bm.createdAt).toLocaleDateString('ko-KR')}</DateText>
            <RemoveButton onClick={() => handleDelete(bm.id)}>삭제</RemoveButton>
          </Meta>
        </Item>
      ))}
    </List>
  );
};

export default BookmarkPanel;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Item = styled.div`
  background: #fff;
  border: 1px solid #e9ecef;
  border-left: 3px solid #228be6;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Quote = styled.p`
  margin: 0;
  font-size: 14px;
  color: #212529;
  line-height: 1.6;
  font-style: italic;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ArticleLink = styled.a`
  font-size: 12px;
  color: #228be6;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
  &:hover { text-decoration: underline; }
`;

const DateText = styled.span`
  font-size: 11px;
  color: #adb5bd;
  margin-left: auto;
`;

const RemoveButton = styled.button`
  padding: 2px 8px;
  background: none;
  border: 1px solid #ffc9c9;
  border-radius: 4px;
  font-size: 11px;
  color: #f03e3e;
  cursor: pointer;
  &:hover { background: #fff5f5; }
`;

const Empty = styled.p`
  text-align: center;
  font-size: 14px;
  color: #adb5bd;
  padding: 48px 0;
`;
