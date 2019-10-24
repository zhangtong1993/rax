import { createElement, Fragment, useState, useEffect } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import TabBar from '../TabBar/index';

let updateComponentTrigger = () => { };

export default function Wrapper(props) {
  console.log(props);
  const { history, routes, _appConfig, _component } = props;
  const { maxAlivePageNum = 3, tabBar } = _appConfig;

  const [updateTemp, setUpdateTemp] = useState(null);

  const Component = _component;
  const currentPathname = history.location.pathname;
  const currentPage = routes.find(route => route.path === currentPathname);

  const showTabBar =
    // have tabBar config
    typeof tabBar === 'object'
    && Array.isArray(tabBar.items)
    // current page need show tabBar
    && tabBar.items.find(item => item.pagePath === currentPage.path);
  const isAlivePage = currentPage.keepAlive;

  const pageProps = {};
  Object.keys(props).forEach((key) => {
    if (key !== '_appConfig' && key !== '_component') {
      pageProps[key] = props[key];
    }
  });

  updateComponentTrigger = setUpdateTemp;

  // alive page use div other use component

  useEffect(() => {
    history.listen(() => {
      updateComponentTrigger(Date.now());
    });
  }, []);

  return (
    <Fragment>
      {isAlivePage ? null : <Component {...pageProps} />}

      <View style={{ display: isAlivePage ? 'block' : 'none' }}>
        <Text >Welcome to Your Rax App</Text>
      </View>

      {showTabBar ? (
        <TabBar
          {...tabBar}
          history={history}
          pathname={currentPathname}
        />
      ) : null}
    </Fragment>
  );
}