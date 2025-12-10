// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GeneratorPanel } from './GeneratorPanel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "md-to-deploy" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const helloWorld = vscode.commands.registerCommand('md-to-deploy.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from MD to Deploy!');
	});

	const openPanel = vscode.commands.registerCommand('md-to-deploy.openPanel', () => {
		GeneratorPanel.createOrShow(context.extensionUri);
	});

	context.subscriptions.push(helloWorld);
	context.subscriptions.push(openPanel);
}

// This method is called when your extension is deactivated
export function deactivate() {}
