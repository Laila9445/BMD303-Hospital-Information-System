import styled from 'styled-components';
import { Search } from 'lucide-react';

const Wrapper = styled.div`
  position: relative;
`;

const Icon = styled(Search)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px 8px 34px;
  font-size: 13px;
  color: #111827;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &::placeholder { color: #9ca3af; }
  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
`;

const SearchBar = ({ value, onChange, placeholder = 'Search…' }) => {
  return (
    <Wrapper>
      <Icon size={15} />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Wrapper>
  );
};

export default SearchBar;
