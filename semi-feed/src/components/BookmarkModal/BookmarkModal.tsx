import React, { useState } from 'react';
import styled from 'styled-components';

interface Props {
  articleTitle: string;
  onSave: (quote: string) => Promise<void>;
  onClose: () => void;
}

const BookmarkModal: React.FC<Props> = ({ articleTitle, onSave, onClose }) => {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!quote.trim()) return;
    setLoading(true);
    await onSave(quote.trim());
    setLoading(false);
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>문구 저장</Title>
        <ArticleName>{articleTitle}</ArticleName>
        <Textarea
          placeholder="저장할 문구를 붙여넣거나 입력해주세요."
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          autoFocus
          rows={4}
        />
        <ButtonRow>
          <CancelButton onClick={onClose}>취소</CancelButton>
          <SaveButton onClick={handleSave} disabled={!quote.trim() || loading}>
            {loading ? '저장 중...' : '저장'}
          </SaveButton>
        </ButtonRow>
      </Modal>
    </Overlay>
  );
};

export default BookmarkModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #212529;
`;

const ArticleName = styled.p`
  margin: 0;
  font-size: 12px;
  color: #868e96;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #dee2e6;
  border-radius: 8px;
  font-size: 13px;
  color: #212529;
  line-height: 1.6;
  resize: none;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #4dabf7;
    box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.15);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 13px;
  color: #495057;
  cursor: pointer;
  &:hover { background: #f1f3f5; }
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  background: #228be6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover:not(:disabled) { background: #1971c2; }
  &:disabled { background: #a5d8ff; cursor: not-allowed; }
`;
