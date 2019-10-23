import { render, createElement, useState, useEffect } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import TabBar from '../TabBar/index';

export default function Wrapper(props) {
  console.log(props);
  const { tabBar } = props;
  return (
    <View >
      <Text >Welcome to Your Rax App</Text>
      <TabBar {...tabBar} />
    </View>
  );
}