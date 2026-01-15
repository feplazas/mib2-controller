/**
 * Babel plugin to remove console.log statements in production builds
 * Keeps console.error and console.warn for debugging
 */
module.exports = function ({ types: t }) {
  return {
    name: "remove-console-logs",
    visitor: {
      CallExpression(path) {
        const callee = path.node.callee;
        
        // Check if it's a console.log call
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: "console" }) &&
          t.isIdentifier(callee.property, { name: "log" })
        ) {
          // Remove the console.log statement
          path.remove();
        }
      },
    },
  };
};
