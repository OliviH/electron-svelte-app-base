// Modules to control application life and create native browser window
try {
	require('electron-reloader')(module);
} catch (e) { console.error(e) }
const fs = require('fs-extra')
const path = require("path")

const electron = require("electron")
const app = electron.app
const windowStateKeeper = require("electron-window-state")
const eraseall = () => {
	let pathBase = require('electron').app.getPath('userData')
	if (fs.pathExistsSync(path.resolve(pathBase, "desinstall"))) {
		require('rimraf').sync(pathBase)
		app.exit(0)
	}
}
eraseall()

const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const { ipcMain } = require("electron")
let mainWindow

let menu = Menu.buildFromTemplate([
	{
		label: "Programme",
		submenu: [
			{
				label: "Paramètres",
				click: () => {
					mainWindow.webContents.send("params")
				},
				accelerator: "CmdOrCtrl+I",
			},
			{ type: "separator" },
			{
				label: "Redémarrer",
				click: () => {
					Desinstall()
				},
				accelerator: "CmdOrCtrl+I",
			},
			{ type: "separator" },
			{
				label: "Quitter",
				click: () => {
					app.quit();
				},
				accelerator: "CmdOrCtrl+Q",
			},
		],
	},
	/* {
		label: "Fichiers",
		submenu: [
			{
				label: "Sauver vos données",
				click: () => {
					mainWindow.webContents.send("saveDatas");
				},

				accelerator: "CmdOrCtrl+I",
			},
			{
				label: "Importer vos données",
				click: () => {
					mainWindow.webContents.send("importDatas");
				},
			},
			{ type: "separator" },
			{
				label: "Importer un fichier",
				click: () => {
					mainWindow.webContents.send("importFile");
				}
			}
		],
	}, */
	{
		label: "Aide",
		submenu: [
			{
				label: "Open AppData folder",
				click: () => {
					mainWindow.webContents.send("AppData");
				},
			},
			{
				label: "Quitter pour désinstaller",
				click: () => {
					mainWindow.webContents.send("DestroyAll");
				}
			}
		],
	},
])

const Inspect = () => {
	mainWindow.webContents.openDevTools()
}

const createWindow = () => {
	// Create the browser window.
	//console.log(process.platform)
	let mainWindowState = windowStateKeeper({
		defaultWidth: 1000,
		defaultHeight: 800,
	})
	let options = {
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		webPreferences: {
			nodeIntegration: true /* ,
          allowRunningInsecureContent: true */,
			enableRemoteModule: true,
		},
	}
	if (process.platform === "win32") {
		options.icon = path.resolve(__dirname, "../assets/icons/win/icon.ico")
	}
	mainWindow = new BrowserWindow(options)

	Menu.setApplicationMenu(menu)
	mainWindow.webContents.openDevTools()

	// and load the index.html of the app.
	//console.log(path.resolve(__dirname, "../public/index.html"));
	mainWindow.loadURL(`file://${path.join(__dirname, "../public/index.html")}`);

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();
	mainWindow.on("closed", () => (mainWindow = null));

	mainWindowState.manage(mainWindow)
}
app.on("ready", createWindow)

app.on("window-all-closed", function () {
	if (process.platform !== "darwin") app.quit();
});

const Desinstall = () => {
	const { app } = require('electron')
	app.relaunch()
	app.exit(0)
}
ipcMain.on('relaunch-desinstall', (event, arg) => {
	//console.log(arg)
	Desinstall()
})