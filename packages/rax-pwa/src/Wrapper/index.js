import { render, createElement, useState, useEffect } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import TabBar from '../TabBar/index';

let updateComponentTrigger = () => { };

export default function Wrapper(props) {
  console.log(props);
  const { history, tabBar } = props;
  const [updateTemp, setUpdateTemp] = useState(null);

  updateComponentTrigger = setUpdateTemp;

  useEffect(() => {
    history.listen(() => {
      updateComponentTrigger(Date.now());
    });
  }, []);

  return (
    <View >
      <Text >Welcome to Your Rax App</Text>
      <TabBar
        {...tabBar}
        _history={history}
        _pathname={history.location.pathname}
      />
    </View>
  );
}