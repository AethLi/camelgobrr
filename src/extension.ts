import * as vscode from "vscode";

type Case =
  | "kebab-case"
  | "CamelCase"
  | "camelCase"
  | "Space Case"
  | "SPACE CASE"
  | "space case"
  | "SNAKE_CASE"
  | "snake_case";

class TempStorage {
  public static plainArray: Array<string>;
  public static cases: Array<Case>;
  public static currentCase: number = 0;
}

function getConfiguration(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("camelgobrr");
}

function getCases(): Array<Case> {
  const cases = getConfiguration().get("cases");
  return <Array<Case>>cases;
}

function splitWords(plain: string): Array<string> {
  const seperatorArray = ["_", "-", " "];
  let seperatedTextArray;
  for (let i = 0; i < seperatorArray.length; i++) {
    if (plain.split(seperatorArray[i]).length > 1) {
      seperatedTextArray = plain.split(seperatorArray[i]);
      break;
    }
  }
  if (!seperatedTextArray) {
    seperatedTextArray = plain.match(
      /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
    );
  }
  if (seperatedTextArray) {
    TempStorage.plainArray = seperatedTextArray.map((a) =>
      a.toLocaleLowerCase()
    );
    return seperatedTextArray;
  } else {
    TempStorage.plainArray = new Array(plain);
    return new Array(plain.toLocaleLowerCase());
  }
}

export function activate(context: vscode.ExtensionContext) {
  TempStorage.cases = getCases();
  context.subscriptions.push(
    vscode.commands.registerCommand("casegobrr.caseChange", () => {
      let editor = vscode.window.activeTextEditor;
      if (editor) {
        let document = editor.document;
        let selection = editor.selection;

        // Get the word within the selection
        let words = document.getText(selection);
        splitWords(words);
        // exit while no cases in settings
        if (!TempStorage.cases) {
          return;
        }
        if (TempStorage.cases.length <= TempStorage.currentCase) {
          TempStorage.currentCase = 0;
        }
        switch (TempStorage.cases[TempStorage.currentCase]) {
          case "kebab-case":
            editor.edit((edit: vscode.TextEditorEdit) => {
              if (editor) {
                edit.replace(selection, TempStorage.plainArray.join("-"));
              }
            });
            break;
          case "CamelCase":
            editor.edit((edit: vscode.TextEditorEdit) => {
              if (editor) {
                edit.replace(
                  selection,
                  TempStorage.plainArray
                    .map((a) => a.replace(a[0], a[0].toUpperCase()))
                    .join("")
                );
              }
            });
            break;
          case "camelCase":
            editor.edit((edit: vscode.TextEditorEdit) => {
              if (editor) {
                let des = TempStorage.plainArray
                  .map((a) => a.replace(a[0], a[0].toUpperCase()))
                  .join("");
                des.replace(des[0], des[0].toLowerCase());
                edit.replace(selection, des);
              }
            });
            break;
          case "Space Case":
            editor.edit((edit: vscode.TextEditorEdit) => {
              if (editor) {
                edit.replace(
                  selection,
                  TempStorage.plainArray
                    .map((a) => a.replace(a[0], a[0].toUpperCase()))
                    .join(" ")
                );
              }
            });
            break;
          case "SPACE CASE":
            editor.edit((edit: vscode.TextEditorEdit) => {
              if (editor) {
                edit.replace(
                  selection,
                  TempStorage.plainArray.map((a) => a.toUpperCase()).join(" ")
                );
              }
            });
            break;
          case "space case":
            editor.edit((edit: vscode.TextEditorEdit) => {
              if (editor) {
                edit.replace(selection, TempStorage.plainArray.join(" "));
              }
            });
            break;
          case "SNAKE_CASE":
            editor.edit((edit: vscode.TextEditorEdit) => {
              if (editor) {
                edit.replace(
                  selection,
                  TempStorage.plainArray.map((a) => a.toUpperCase()).join("_")
                );
              }
            });
            break;
          case "snake_case":
            editor.edit((edit: vscode.TextEditorEdit) => {
              if (editor) {
                edit.replace(selection, TempStorage.plainArray.join("_"));
              }
            });
            break;
          default:
        }
        TempStorage.currentCase++;
      }
    })
  );
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("camelgobrr.cases")) {
        TempStorage.cases = getCases();
        TempStorage.currentCase = 0;
      }
    })
  );
}

export function deactivate() {}
