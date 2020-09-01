import styled from 'styled-components';

type Props = {
  backgroundColor: string
}

export const Container = styled.div<Props>`
  height: 65px;
  display: flex;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif;
  background-color: ${props => props.backgroundColor};
  //background-color: transparent;
  transition: background-color 300ms ease-in-out;
  color: #FFF;
  -webkit-app-region: drag;
  flex-direction: row;
  position: fixed;
  z-index:5;
`;