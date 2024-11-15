"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const quotefinder_1 = require("./quotefinder");
function findQuoteRange(editor, atPosition) {
    let { document } = editor;
    let { character, position } = (0, quotefinder_1.findPreviousQuote)(document, atPosition);
    if (!character || !position) {
        return null;
    }
    return {
        character,
        start: position,
        end: (0, quotefinder_1.findEndQuote)(document, atPosition, character),
    };
}
/**
 * Converts the quoting style, if any, at the position to backticks.
 *
 * Returns true if the position was within any kind of quotes.
 */
function convertQuotes(editor, edit, atPosition) {
    let { document } = editor;
    let { character, position } = (0, quotefinder_1.findPreviousQuote)(document, atPosition);
    // If we're already in a template string then there is nothing to do.
    if (character == "`") {
        return;
    }
    if (position) {
        edit.replace(new vscode_1.Range(position, position.translate(0, 1)), "`");
        let endQuote = (0, quotefinder_1.findEndQuote)(document, atPosition, character);
        if (endQuote) {
            edit.replace(new vscode_1.Range(endQuote, endQuote.translate(0, 1)), "`");
        }
    }
}
function followsDollar(editor, position) {
    if (position.character == 0) {
        return false;
    }
    let range = new vscode_1.Range(position.translate(0, -1), position);
    let character = editor.document.getText(range);
    return character == "$";
}
async function bracePressed(editor) {
    let ranges = [];
    for (let selection of editor.selections) {
        if (!selection.isEmpty || !followsDollar(editor, selection.active)) {
            return;
        }
        let range = findQuoteRange(editor, selection.active);
        if (!range) {
            return;
        }
        ranges.push(range);
    }
    await editor.edit((edit) => {
        for (let range of ranges) {
            edit.replace(new vscode_1.Range(range.start, range.start.translate(0, 1)), "`");
            if (range.end) {
                edit.replace(new vscode_1.Range(range.end, range.end.translate(0, 1)), "`");
            }
        }
    });
}
async function execCommand(editor, edit, args = undefined) {
    try {
        let fromKeyboard = args ? args.fromKeyboard : false;
        if (!fromKeyboard) {
            for (let selection of editor.selections) {
                convertQuotes(editor, edit, selection.active);
            }
            return;
        }
        await bracePressed(editor);
        // Just simulate the keypress.
        await vscode_1.commands.executeCommand("type", { text: "{" });
    }
    catch (e) {
        console.error(e);
    }
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    context.subscriptions.push(vscode_1.commands.registerTextEditorCommand("backticks.convertQuotes", execCommand));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map