import { render, createElement, useState, useEffect } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';

import styles from './index.css';

export default function TabBar(props) {
  console.log(styles);
  console.log(props);
  const { backgroundColor, items, selectedColor, textColor } = props;

  return (
    <div style={{ ...styles.tabBar, backgroundColor }}>
      {items.map((item, index) => {
        const currentPath = '/';
        const selected = currentPath === item.pagePath;

        const itemTextColor = item.textColor || textColor;
        const itemSelectedColor = item.selectedColor || selectedColor;

        return (
          <View
            key={`tab-${index}`}
            style={styles.tabBarItem}
            onClick={() => {
              history.push(item.pagePath);
            }}>
            <img style={{ ...styles.tabBarItem_img, display: selected && item.activeIcon ? 'block' : 'none' }} src={item.activeIcon} />
            <img style={{ ...styles.tabBarItem_img, display: !selected && item.icon ? 'block' : 'none' }} src={item.icon} />
            <Text style={{ ...styles.tabBarItem_txt, color: selected ? itemSelectedColor : itemTextColor }} > {item.name}</Text>
          </View>
        );
      })}
    </div >
  );
}