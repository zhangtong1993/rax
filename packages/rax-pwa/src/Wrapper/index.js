import { createElement, Fragment, useState, useEffect } from 'rax';
import View from 'rax-view';
import TabBar from '../TabBar/index';

import styles from './index.css';

let updatePageTrigger = () => { };

const alivePages = [];
const alivePagesCache = {};

const activatePageComponent = (route, pageProps, maxAlivePageNum) => {
  route.component()
    .then(fn => fn())
    .then((Page) => {
      alivePagesCache[route.path] = createElement(Page, pageProps);
      // remove redundance page cache
      if (Object.keys(alivePagesCache).length > maxAlivePageNum) {
        delete alivePagesCache[Object.keys(alivePagesCache)[0]];
      }
      updatePageTrigger(Date.now());
    });
};

export default function Wrapper(props) {
  console.log(props);
  const { history, routes, _appConfig, _component } = props;
  const { maxAlivePageNum = 3, tabBar } = _appConfig;

  const [updateTemp, setUpdateTemp] = useState(null);
  updatePageTrigger = setUpdateTemp;

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

  useEffect(() => {
    history.listen(() => {
      updatePageTrigger(Date.now());
    });
    // get alive page list
    routes.forEach((route) => {
      if (route.keepAlive) {
        alivePages.push(route);
      }
    });
    updatePageTrigger(Date.now());
  }, []);

  return (
    <Fragment>
      {isAlivePage ? null : <Component {...pageProps} />}

      <View
        style={{
          ...styles.container,
          display: isAlivePage ? 'block' : 'none'
        }}
      >
        {alivePages.map((alivePage, index) => {
          const alivePageRoute = routes.find(it => it.path === alivePage.path);
          const isCurrentPage = alivePageRoute.path === currentPage.path;
          const alivePageComponent = alivePagesCache[alivePageRoute.path] || null;
          if (isCurrentPage && !alivePageComponent) activatePageComponent(alivePageRoute, pageProps, maxAlivePageNum);
          return (
            <View
              key={`alivePage${index}`}
              style={{
                ...styles.alivePage,
                display: isCurrentPage ? 'block' : 'none'
              }}>
              {alivePageComponent}
            </View>
          );
        })}
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