const t = require('@babel/types');
const traverse = require('../utils/traverseNodePath');
const getReturnElementPath = require('../utils/getReturnElementPath');
const createJSX = require('../utils/createJSX');
const createBinding = require('../utils/createBinding');

const RENDER_PROPS__FUNC_REG = /^render[A-Z]/;
const isRenderPropsFunction = funcName => RENDER_PROPS__FUNC_REG.test(funcName);
function getFunctionName (node) {
  if (t.isIdentifier(node)) {
    return node.name;
  } else if (t.isMemberExpression(node)) {
    return getFunctionName(node.property);
  }
}

function transformRenderProps(ast) {

  const renderPropsFunctions = [];

  let tempId = 0;
  traverse(ast, {
    CallExpression: {
      enter(path) {
        const { node } = path;

        const funcName = getFunctionName(node.callee);
        // get render props function
        if (isRenderPropsFunction(funcName)) {
          const slotName = funcName.slice(6).toLowerCase()
          path.parentPath.replaceWith(createJSX('slot', {
            name: t.stringLiteral(slotName)
          }));
        }
      }
    },
    // JSXElement: {
    //   exit(path) {
    //     const { node: {
    //       openingElement
    //     } } = path;
    //     if (openingElement) {
    //       if (t.isJSXIdentifier(openingElement.name)
    //         && openingElement.name.name === 'block'
    //         && openingElement.attributes.find(attr => t.isStringLiteral(attr.value) && attr.value.value === '{{$ready}}')
    //       ) {
    //         // Insert template define
    //         path.node.children = [...renderItemList, ...path.node.children];
    //       } else {
    //         path.skip();
    //       }
    //     } else {
    //       path.skip();
    //     }
    //   }
    // }
  });
  return renderPropsFunctions;
}

module.exports = {
  parse(parsed, code, options) {
    transformRenderProps(parsed.templateAST, parsed.renderFunctionPath);
  },

  // For test cases.
  _transformRenderProps: transformRenderProps,
};
