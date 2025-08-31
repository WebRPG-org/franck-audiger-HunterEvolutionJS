Unicode true
!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"

!define APP_NAME "HunterEvolution"
!define COMPANY  "HunterEvolution"
!define APP_VERSION "${TAG_NAME}"
!define INSTALL_DIR "$PROGRAMFILES\HunterEvolution"
!define STARTMENU_FOLDER "HunterEvolution"
!define OUT_EXE "${INSTALLER_DIR}/HunterEvolution-${TAG_NAME}.exe"

Var RemoteArchiveURL
Var StartTarget

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

Function .onInit
  SetShellVarContext current
  StrCpy $RemoteArchiveURL "https://hunter-evolution-game.com/desktop-assets/${TAG_NAME}.7z"
FunctionEnd

Function DownloadFile
  Exch $1
  Exch
  Exch $0

  ${GetParent} $1 $2
  CreateDirectory "$2"
  Delete "$1"

  inetc::get /POPUP "" /RESUME "" /CAPTION "Téléchargement de $0" /NOIEPROXY "$0" "$1"
  Pop $R0
  StrCmp $R0 "OK" done
  MessageBox MB_OK "Erreur téléchargement :$0$\nCode: $R0"
  Abort
done:
FunctionEnd

Function ExtractArchive
  Exch $1 ; Destination
  Exch
  Exch $0 ; Archive path

  Nsis7z::Extract "$0" "$1"
  Pop $R0
  DetailPrint "Résultat extraction : $R0"
FunctionEnd

Section "Installer"
  ${If} ${FileExists} "$INSTDIR\*.*"
    RMDir /r "$INSTDIR"
  ${EndIf}

  CreateDirectory "$INSTDIR"
  SetOutPath "$INSTDIR"

  ; 1. Télécharger l’archive .7z
  StrCpy $0 "$RemoteArchiveURL"
  StrCpy $1 "$INSTDIR\payload.7z"
  Push $0
  Push $1
  Call DownloadFile

  ; 2. Extraction via Nsis7z
  Push "$1"
  Push "$INSTDIR"
  Call ExtractArchive
  Delete "$1"

  ; 3. Raccourcis
  StrCpy $StartTarget "$INSTDIR\Game.exe"
  ${If} ${FileExists} "$INSTDIR\www\icon\icon.ico"
    CreateShortCut "$DESKTOP\HunterEvolution.lnk" "$StartTarget" "" "$INSTDIR\www\icon\icon.ico" 0
    CreateShortCut "$SMPROGRAMS\${STARTMENU_FOLDER}\HunterEvolution.lnk" "$StartTarget" "" "$INSTDIR\www\icon\icon.ico" 0
  ${Else}
    CreateShortCut "$DESKTOP\HunterEvolution.lnk" "$StartTarget"
    CreateShortCut "$SMPROGRAMS\${STARTMENU_FOLDER}\HunterEvolution.lnk" "$StartTarget"
  ${EndIf}

  ; 4. Uninstall
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateShortCut "$SMPROGRAMS\${STARTMENU_FOLDER}\Désinstaller HunterEvolution.lnk" "$INSTDIR\Uninstall.exe"
SectionEnd

Function LaunchApp
  ExecShell "open" "$INSTDIR\Game.exe"
FunctionEnd

Section "Uninstall"
  Delete "$DESKTOP\HunterEvolution.lnk"
  Delete "$SMPROGRAMS\${STARTMENU_FOLDER}\HunterEvolution.lnk"
  Delete "$SMPROGRAMS\${STARTMENU_FOLDER}\Désinstaller HunterEvolution.lnk"
  RMDir "$SMPROGRAMS\${STARTMENU_FOLDER}"
  RMDir /r "$INSTDIR"
SectionEnd