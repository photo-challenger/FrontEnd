import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import styled from 'styled-components/native';

const BaseTextarea = forwardRef(
  ({ title, placeholder, readOnly, inputType }, ref) => {
    return (
      <Container>
        {title && <Title>{title}</Title>}
        <Textarea
          placeholder={placeholder}
          editable={!readOnly}
          keyboardType={inputType}
          placeholderTextColor="#C0C0C0"
          multiline={true}
          ref={ref}
          numberOfLines={4} // 기본 줄 수 설정 (필요에 따라 조정 가능)
        />
        <Underline />
      </Container>
    );
  },
);

const Container = styled.View`
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 14px;
  color: #555;
  margin-bottom: 4px;
`;

const Textarea = styled.TextInput`
  font-size: 16px;
  color: #000;
  padding: 4px 0;
`;

const Underline = styled.View`
  height: 1px;
  background-color: #e0e0e0;
  margin-top: 4px;
`;

export default BaseTextarea;
