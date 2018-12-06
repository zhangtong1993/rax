import {PureComponent, Component, createElement, findDOMNode, PropTypes} from 'rax';
import {isWeex, isWeb} from 'universal-env';
import View from '../StaticView';
import Throttle from './throttle';
import Timer from './timer';
import RefreshControl from 'rax-refreshcontrol';

const FULL_WIDTH = 750;
const DEFAULT_SCROLL_CALLBACK_THROTTLE = 50;
const DEFAULT_END_REACHED_THRESHOLD = 500;

class Cell extends PureComponent {
  static contextTypes = {
    isInARecyclerView: PropTypes.bool
  };

  render() {
    if (isWeex && this.context.isInARecyclerView) {
      return <cell {...this.props} append="tree" />;
    } else {
      return <View {...this.props} />;
    }
  }
}

class Header extends PureComponent {
  static contextTypes = {
    isInARecyclerView: PropTypes.bool
  };
  state = {
    fixed: false
  }
  appear = (e) => {
    this.setState({fixed: false});
  }
  disAppear = (e) => {
    let hook = findDOMNode(this.refs.hook)
    if (hook.getBoundingClientRect().y <= 0) {
      this.setState({fixed: true});
    }
  }
  render() {
    if (isWeex && this.context.isInARecyclerView) {
      return <header {...this.props} append="tree" />;
    } else {
      return (<View {...this.props}  style={{
          ...this.props.style,
          position: 'relative'
        }}>
        <View 
          ref="hook"
          onAppear={this.appear}
          onDisAppear={this.disAppear}
          style={{
            width: 1,
            height: 1,
            backgroundColor: 'red',
            top: -1,
            position: 'absolute'
          }}></View>
        <View style={{
          position: this.state.fixed || this.props.firstCellInRecyclerView ? 'fixed' : 'relative',
          top: 0,
          zIndex: 99999,
        }}>
          {this.props.children}
        </View>
      </View>);
    }
  }
}

class RecyclerView extends Component {
  static defaultProps = {
    onEndReachedThreshold: DEFAULT_END_REACHED_THRESHOLD,
    endReachedThreshold: DEFAULT_END_REACHED_THRESHOLD,
    scrollEventThrottle: DEFAULT_SCROLL_CALLBACK_THROTTLE,
  };

  static childContextTypes = {
    isInARecyclerView: PropTypes.bool,
  };

  loadmoreretry = 1;

  constructor(props) {
    super(props);
    this.state = {
      loadmoreretry: 0,
    };
  }

  getChildContext() {
    return {
      isInARecyclerView: true
    };
  }
  handleScrollForWeb = (e) => {
    e.nativeEvent = {
      get contentOffset() {
        return {
          x: e.target.scrollLeft,
          y: e.target.scrollTop
        };
      },
      get contentSize() {
        return {
          width: e.target.scrollWidth,
          height: e.target.scrollHeight
        };
      }
    };
    this.props.onScroll && this.props.onScroll(e);

    if (this.props.onEndReached) {
      if (!this.scrollerNode) {
        let body = document.getElementsByTagName('body')[0];
        this.scrollerNode = body;
        this.scrollerNodeSize = body.offsetHeight;
      }

      // NOTE：in iOS7/8 offsetHeight/Width is is inaccurate （ use scrollHeight/Width ）
      let scrollContentSize = this.scrollerNode.scrollHeight;
      let scrollDistance = window.scrollY;
      let isEndReached = scrollContentSize - scrollDistance - this.scrollerNodeSize < this.props.endReachedThreshold;

      let isScrollToEnd = scrollDistance > this.lastScrollDistance;
      let isLoadedMoreContent = scrollContentSize != this.lastScrollContentSize;
      if (isEndReached && isScrollToEnd && isLoadedMoreContent) {
        this.lastScrollContentSize = scrollContentSize;
        this.props.onEndReached(e);
      }

      this.lastScrollDistance = scrollDistance;
    }
  }
  handleScroll = (e) => {
    let {
      scrollEventThrottle,
    } = this.props;
    if (isWeex) {
      e.nativeEvent = {
        contentOffset: {
          // HACK: weex scroll event value is opposite of web
          x: - e.contentOffset.x,
          y: - e.contentOffset.y
        },
        contentSize: e.contentSize ? {
          width: e.contentSize.width,
          height: e.contentSize.height
        } : null
      };
      this.props.onScroll(e);
    } else {
      window.addEventListener('scroll', (e) => {
        if (scrollEventThrottle) {
          let handleScrollForWeb = Throttle(this.handleScrollForWeb, scrollEventThrottle);
          handleScrollForWeb(e);
        }
      });
    }
  }

  resetScroll = () => {
    if (isWeex) {
      this.setState({
        loadmoreretry: this.loadmoreretry++, // for weex 0.9-
      });
      this.refs.list.resetLoadmore && this.refs.list.resetLoadmore(); // for weex 0.9+
    } else {
      this.lastScrollContentSize = 0;
      this.lastScrollDistance = 0;
    }
  }

  scrollTo = (options) => {
    let x = parseInt(options.x);
    let y = parseInt(options.y);
    let animated = options && typeof options.animated !== 'undefined' ? options.animated : true;

    if (isWeex) {
      let dom = __weex_require__('@weex-module/dom');
      let firstNode = findDOMNode(this.refs.firstNodePlaceholder);
      dom.scrollToElement(firstNode.ref, {
        offset: x || y || 0,
        animated
      });
    } else {
      let pixelRatio = document.documentElement.clientWidth / FULL_WIDTH;
      // let scrollView = window;
      let scrollTop = window.scrollY;

      if (animated) {
        let timer = new Timer({
          duration: 400,
          easing: 'easeOutSine',
          onRun: (e) => {
            if (y >= 0) {
              document.documentElement.scrollTop = scrollTop + e.percent * (y * pixelRatio - scrollTop);
            }
          }
        });
        timer.run();
      } else {
        if (y >= 0) {
          document.documentElement.scrollTop = pixelRatio * y;
        }
      }
    }
  }

  componentWillMount() {
    if (isWeb) {
      // body style
      let body = document.getElementsByTagName('body')[0];
      body.style.flex = 1;
      body.style.flexDirection = 'column';
      for (let key in this.props) {
        if (key != 'style' && key != 'children') {
          body.setAttribute(key, this.props[key]);
        }
      }
    }
  }

  render() {
    let props = this.props;
    if (isWeex) {
      let children = props.children;
      if (!Array.isArray(children)) {
        children = [children];
      }

      let cells = children.map((child, index) => {
        if (child) {
          let hasOnRefresh = child.props && typeof child.props.onRefresh == 'function';
          if (props._autoWrapCell && child.type != RefreshControl && child.type != Header && !hasOnRefresh) {
            return <Cell>{child}</Cell>;
          } else {
            return child;
          }
        } else {
          return <Cell />;
        }
      });

      // add firstNodePlaceholder after refreshcontrol
      let addIndex = cells[0].type == Cell || cells[0].type == Header ? 0 : 1;
      cells && cells.length && cells.splice(addIndex, 0, <Cell ref="firstNodePlaceholder" />);

      return (
        <list
          {...props}
          ref="list"
          onLoadmore={props.onEndReached}
          onScroll={props.onScroll ? this.handleScroll : null}
          loadmoreretry={this.state.loadmoreretry}
          loadmoreoffset={props.onEndReachedThreshold}
        >
          {cells}
        </list>
      );
    } else {
      this.handleScroll();
      props.endReachedThreshold = props.onEndReachedThreshold;
      delete props.onEndReachedThreshold;
      let bodyChildren = props.children;
      // first header need auto fixed style
      bodyChildren[0].props.firstCellInRecyclerView = true;
      console.log(bodyChildren);
      return bodyChildren;
    }
  }
}

RecyclerView.Header = Header;
RecyclerView.Cell = Cell;

export default RecyclerView;
