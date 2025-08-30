Unicode true
!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!addplugindir "Plugins/x86-unicode"

!define APP_NAME "HunterEvolution"
!define COMPANY  "HunterEvolution"
!define APP_VERSION "${TAG_NAME}"
!define INSTALL_DIR "$PROGRAMFILES\HunterEvolution"
!define STARTMENU_FOLDER "HunterEvolution"
!define OUT_EXE "${INSTALLER_DIR}/HunterEvolution-${TAG_NAME}.exe"

Var RemoteZipURL
Var StartTarget
Var RAppData
Var SaveDir

Name "${APP_NAME} ${APP_VERSION}"
OutFile "${OUT_EXE}"
InstallDir "${INSTALL_DIR}"
RequestExecutionLevel admin

!define MUI_ABORTWARNING
!define MUI_ICON "${ICO_PATH}"
!define MUI_UNICON "${ICO_PATH}"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Démarrer l'application"
!define MUI_FINISHPAGE_RUN_FUNCTION LaunchApp
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "French"

; =========================
; Init
; =========================
Function .onInit
  SetShellVarContext current
  StrCpy $RAppData "$APPDATA"
  StrCpy $SaveDir "$RAppData\HunterEvolution\save"
  StrCpy $RemoteZipURL "https://hunter-evolution-game.com/desktop-assets/${TAG_NAME}.zip"
FunctionEnd

; =========================
; Télécharger via inetc
; =========================
Function DownloadFile
  Exch $1 ; destination
  Exch
  Exch $0 ; URL

  ${GetParent} $1 $2
  CreateDirectory "$2"
  Delete "$1"

  DetailPrint "→ Téléchargement : $0"
  inetc::get /POPUP "" /RESUME "" /CAPTION "Téléchargement de $0" /NOIEPROXY "$0" "$1"
  Pop $R0
  StrCmp $R0 "OK" done

  MessageBox MB_OK "Erreur lors du téléchargement via HTTPS:$\r$\n$0$\r$\nCode: $R0"
  Abort

done:
FunctionEnd

; =========================
; Décompresser ZIP
; =========================
Function UnzipZip
  Exch $1 ; destination
  Exch
  Exch $0 ; zip path

  CreateDirectory "$1"
  DetailPrint "→ Décompression: $0 → $1"
  nsisunz::Unzip "$0" "$1"
  Pop $R0
  StrCmp $R0 "success" +2
    MessageBox MB_OK "Erreur lors de l’extraction : $R0"
FunctionEnd

; =========================
; Section d’installation
; =========================
Section "Installer"
  ; Nettoyage ancien dossier s’il existe
  ${If} ${FileExists} "$INSTDIR\*.*"
    DetailPrint "→ Installation existante détectée. Nettoyage..."
    RMDir /r "$INSTDIR"
  ${EndIf}

  ; Créer dossier
  CreateDirectory "$INSTDIR"
  SetOutPath "$INSTDIR"

  ; Télécharger et extraire le ZIP complet
  StrCpy $0 "$RemoteZipURL"
  StrCpy $1 "$INSTDIR\payload.zip"
  Push $0
  Push $1
  Call DownloadFile

  Push "$1"
  Push "$INSTDIR"
  Call UnzipZip
  Delete "$1"

  ; Créer raccourcis
  StrCpy $StartTarget "$INSTDIR\Game.exe"
  ${If} ${FileExists} "$INSTDIR\www\icon\icon.ico"
    CreateShortCut "$DESKTOP\HunterEvolution.lnk" "$StartTarget" "" "$INSTDIR\www\icon\icon.ico" 0
    CreateShortCut "$SMPROGRAMS\${STARTMENU_FOLDER}\HunterEvolution.lnk" "$StartTarget" "" "$INSTDIR\www\icon\icon.ico" 0
  ${Else}
    CreateShortCut "$DESKTOP\HunterEvolution.lnk" "$StartTarget"
    CreateShortCut "$SMPROGRAMS\${STARTMENU_FOLDER}\HunterEvolution.lnk" "$StartTarget"
  ${EndIf}

  ; Créer désinstalleur
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateShortCut "$SMPROGRAMS\${STARTMENU_FOLDER}\Désinstaller HunterEvolution.lnk" "$INSTDIR\Uninstall.exe"
SectionEnd

; =========================
; Lancer le jeu
; =========================
Function LaunchApp
  StrCpy $StartTarget "$INSTDIR\Game.exe"
  ExecShell "open" "$StartTarget"
FunctionEnd

; =========================
; Désinstallation
; =========================
Section "Uninstall"
  Delete "$DESKTOP\HunterEvolution.lnk"
  Delete "$SMPROGRAMS\${STARTMENU_FOLDER}\HunterEvolution.lnk"
  Delete "$SMPROGRAMS\${STARTMENU_FOLDER}\Désinstaller HunterEvolution.lnk"
  RMDir "$SMPROGRAMS\${STARTMENU_FOLDER}"
  ; Sauvegardes préservées (AppData)
  RMDir /r "$INSTDIR"
SectionEnd
