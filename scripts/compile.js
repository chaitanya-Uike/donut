import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
import template from "@babel/template";
import fs from "fs";
import path from "path";

const tplCreateElem = template(`_$elem(%%type%%, %%props%%)`);

function transformJSX(node) {
  const type = node.openingElement.name.name;
  const attributes = node.openingElement.attributes ?? [];
  const children = node.children != null ? [...node.children] : [];
  const isIntrinsic = type[0].toLowerCase() === type[0];

  return tplCreateElem({
    type: isIntrinsic ? t.stringLiteral(type) : type,
    props: t.objectExpression([
      ...attributes.map((attribute) => {
        return t.objectProperty(
          t.identifier(attribute.name.name),
          attribute.value.expression ?? attribute.value
        );
      }),
      t.objectProperty(
        t.identifier("children"),
        t.arrayExpression(
          children.reduce((acc, child) => {
            if (child.type === "JSXElement") {
              acc.push(transformJSX(child).expression);
            } else if (child.type === "JSXExpressionContainer") {
              acc.push(t.arrowFunctionExpression([], child.expression));
            } else if (child.type === "JSXText") {
              if (child.value.trim().length) {
                // remvove new line character and space form front
                acc.push(t.stringLiteral(child.value.replace(/^\s+/g, "")));
              }
            }
            return acc;
          }, [])
        )
      ),
    ]),
  });
}

function compile(code) {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });
  traverse(ast, {
    JSXElement: function (path) {
      path.replaceWith(transformJSX(path.node));
    },
  });

  const imports = `import {_$elem} from "../core/dom";
    `;

  return imports + generate(ast).code;
}
function readFiles() {
  return new Promise((resolve) => {
    fs.readdir("./demo", (err, files) => {
      resolve(files);
    });
  });
}

async function start() {
  const files = await readFiles();
  for (const file of files) {
    const code = fs.readFileSync("demo/" + file, "utf8");
    const buildPath = "built/" + file;
    ensureDirectoryExistence(buildPath);
    fs.writeFileSync(buildPath, compile(code));
  }
}

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

start();
