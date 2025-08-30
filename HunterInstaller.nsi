Unicode true
!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

; Pour trouver nsisunz.dll si tu l’embarques dans le workspace
!addplugindir "${BUILD_ROOT}/Plugins"

!define APP_NAME "HunterEvolution"
!define COMPANY  "HunterEvolution"
!define APP_VERSION "${TAG_NAME}"
!define INSTALL_DIR "$PROGRAMFILES\HunterEvolution"
!define STARTMENU_FOLDER "HunterEvolution"
!define OUT_EXE "${INSTALLER_DIR}/HunterEvolution-${TAG_NAME}.exe"

Var RemoteBaseURL
Var RemoteBaseURL_HTTP
Var StartTarget
Var KeepSaves
Var IsUpgrade
Var hDlg
Var chkKeep

; === chemins de sauvegarde (profil courant) ===
Var UserAppData
Var SaveDir
Var LegacySaveDir
Var SaveBackupDir

Name "${APP_NAME} ${APP_VERSION}"
OutFile "${OUT_EXE}"
InstallDir "${INSTALL_DIR}"
RequestExecutionLevel admin

!define MUI_ABORTWARNING
!define MUI_ICON "${ICO_PATH}"
!define MUI_UNICON "${ICO_PATH}"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
Page custom PageKeepSavesCreate PageKeepSavesLeave
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
  ; On travaille dans le contexte utilisateur pour $APPDATA
  SetShellVarContext current

  StrCpy $IsUpgrade "0"
  StrCpy $KeepSaves "0"

  ; AppData\Roaming de l'utilisateur courant
  StrCpy $UserAppData "$APPDATA"
  StrCpy $SaveDir "$UserAppData\HunterEvolution\save"
  StrCpy $SaveBackupDir "$TEMP\he_save_backup"

  ; URLs de base (HTTPS + fallback HTTP)
  StrCpy $RemoteBaseURL      "https://hunter-evolution-game.com/desktop-assets/${TAG_NAME}"
  StrCpy $RemoteBaseURL_HTTP "http://hunter-evolution-game.com/desktop-assets/${TAG_NAME}"
FunctionEnd

; =========================
; Page "Conserver les sauvegardes ?"
; =========================
Function PageKeepSavesCreate
  ${If} ${FileExists} "$INSTDIR\*.*"
    StrCpy $IsUpgrade "1"
  ${EndIf}

  StrCpy $LegacySaveDir "$INSTDIR\www\save"

  ${If} $IsUpgrade == "1"
    ${IfThen} ${FileExists} "$SaveDir\*.*" ${|} StrCpy $KeepSaves "1" ${|}
    ${IfThen} ${FileExists} "$LegacySaveDir\*.*" ${|} StrCpy $KeepSaves "1" ${|}
    ${If} $KeepSaves == "0"
      Abort
    ${EndIf}

    nsDialogs::Create 1018
    Pop $hDlg
    ${NSD_CreateLabel} 0 0 100% 28u \
      "Installation existante détectée.$\r$\nSouhaitez-vous conserver vos sauvegardes ?"
    Pop $0
    ${NSD_CreateCheckbox} 0 30u 100% 12u "Conserver mes sauvegardes (AppData\Roaming)"
    Pop $chkKeep
    ${If} $KeepSaves == "1"
      ${NSD_Check} $chkKeep
    ${EndIf}
    nsDialogs::Show
    ${NSD_GetState} $chkKeep $KeepSaves
  ${Else}
    Abort
  ${EndIf}
FunctionEnd

Function PageKeepSavesLeave
FunctionEnd

; ============================================================
; --------- UTILITAIRES (download NSISdl + unzip) ------------
; ============================================================

; Télécharge un fichier avec NSISdl.
; in : $0 = URL_HTTPS | $1 = chemin destination | $2 = URL_HTTP (fallback)
; out: $R0 = "success" si OK, sinon message d'erreur
Function DownloadFile
  Exch $2
  Exch
  Exch $1
  Exch
  Exch $0

  ${GetParent} $1 $3
  CreateDirectory "$3"

  DetailPrint "→ URL: $0"
  NSISdl::download "$0" "$1"
  Pop $R0
  DetailPrint "  NSISdl(https): $R0"
  StrCmp $R0 "success" done

  ; Fallback HTTP si fourni
  StrCmp $2 "" done
  DetailPrint "→ Fallback: $2"
  NSISdl::download "$2" "$1"
  Pop $R0
  DetailPrint "  NSISdl(http): $R0"

done:
FunctionEnd

; Décompresse un zip avec nsisunz
; in : $0 = zip path | $1 = dest dir
; out: $R0 = "success" si OK
Function UnzipZip
  Exch $1
  Exch
  Exch $0

  CreateDirectory "$1"
  DetailPrint "→ Unzip: $0 -> $1"
  nsisunz::Unzip "$0" "$1"
  Pop $R0
  DetailPrint "  nsisunz: $R0"
FunctionEnd

; Enchaîne download + unzip pour un paquet nommé (data, fonts, ...)
Function DownloadAndExtract
  Exch $0
  StrCpy $1 "$RemoteBaseURL/$0.zip"
  StrCpy $2 "$INSTDIR\$0.zip"
  StrCpy $3 "$INSTDIR\www\$0"
  StrCpy $4 "$RemoteBaseURL_HTTP/$0.zip" ; fallback

  ; Download (https -> http fallback)
  Push $1
  Push $2
  Push $4
  Call DownloadFile
  StrCmp $R0 "success" +3
    MessageBox MB_OK "Erreur téléchargement $0.zip depuis:$\r$\n$1$\r$\n(fallback $4) -> $R0"
    Return

  ; Unzip
  Push $2
  Push $3
  Call UnzipZip
  StrCmp $R0 "success" +3
    MessageBox MB_OK "Erreur extraction $0.zip ($R0)$\r$\nFichier: $2"
    Return

  Delete "$INSTDIR\$0.zip"
FunctionEnd

; ============================================================
; Section d’installation
; ============================================================
Section "Installer"
  SetOutPath "$INSTDIR"

  ; -------- 0) Backup des saves si demandé --------
  StrCpy $LegacySaveDir "$INSTDIR\www\save"
  ${If} $KeepSaves == "1"
    StrCpy $SaveBackupDir "$TEMP\he_save_backup"
    RMDir /r "$SaveBackupDir"
    CreateDirectory "$SaveBackupDir"

    ${If} ${FileExists} "$SaveDir\*.*"
      CreateDirectory "$SaveBackupDir\official"
      CopyFiles /SILENT "$SaveDir\*.*" "$SaveBackupDir\official\"
      DetailPrint "Backup saves (AppData) -> $SaveBackupDir\official"
    ${EndIf}
    ${If} ${FileExists} "$LegacySaveDir\*.*"
      CreateDirectory "$SaveBackupDir\legacy"
      CopyFiles /SILENT "$LegacySaveDir\*.*" "$SaveBackupDir\legacy\"
      DetailPrint "Backup saves (legacy) -> $SaveBackupDir\legacy"
    ${EndIf}
  ${EndIf}

  ; -------- 1) Paquets d’assets --------
  Push "data"
  Call DownloadAndExtract
  Push "fonts"
  Call DownloadAndExtract
  Push "icon"
  Call DownloadAndExtract
  Push "img"
  Call DownloadAndExtract
  Push "audio"
  Call DownloadAndExtract
  Push "movies"
  Call DownloadAndExtract
  Push "js"
  Call DownloadAndExtract

  ; -------- 2) Binaire principal --------
  StrCpy $0 "$RemoteBaseURL/Game.exe"
  StrCpy $1 "$INSTDIR\Game.exe"
  StrCpy $2 "$RemoteBaseURL_HTTP/Game.exe"

  Push $0
  Push $1
  Push $2
  Call DownloadFile
  StrCmp $R0 "success" +2
    MessageBox MB_OK "Erreur téléchargement Game.exe depuis:$\r$\n$0$\r$\n(fallback $2) -> $R0"

  ; -------- 3) Raccourcis --------
  StrCpy $StartTarget "$INSTDIR\Game.exe"
  ${If} ${FileExists} "$INSTDIR\www\icon\icon.ico"
    CreateShortCut "$DESKTOP\HunterEvolution.lnk" "$StartTarget" "" "$INSTDIR\www\icon\icon.ico" 0
    CreateShortCut "$SMPROGRAMS\${STARTMENU_FOLDER}\HunterEvolution.lnk" "$StartTarget" "" "$INSTDIR\www\icon\icon.ico" 0
  ${Else}
    CreateShortCut "$DESKTOP\HunterEvolution.lnk" "$StartTarget"
    CreateShortCut "$SMPROGRAMS\${STARTMENU_FOLDER}\HunterEvolution.lnk" "$StartTarget"
  ${EndIf}

  ; -------- 4) Restauration des saves vers AppData\Roaming --------
  ${If} $KeepSaves == "1"
    CreateDirectory "$SaveDir"
    ${If} ${FileExists} "$SaveBackupDir\official\*.*"
      CopyFiles /SILENT "$SaveBackupDir\official\*.*" "$SaveDir\"
    ${EndIf}
    ${If} ${FileExists} "$SaveBackupDir\legacy\*.*"
      CopyFiles /SILENT "$SaveBackupDir\legacy\*.*" "$SaveDir\"
    ${EndIf}
    RMDir /r "$SaveBackupDir"
    DetailPrint "Saves restaurées vers: $SaveDir"
  ${EndIf}

  ; -------- 5) Désinstalleur --------
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateShortCut "$SMPROGRAMS\${STARTMENU_FOLDER}\Désinstaller HunterEvolution.lnk" "$INSTDIR\Uninstall.exe"
SectionEnd

; =========================
; Lancer l’app
; =========================
Function LaunchApp
  StrCpy $StartTarget "$INSTDIR\Game.exe"
  ExecShell "open" "$StartTarget"
FunctionEnd

; =========================
; Uninstall
; =========================
Section "Uninstall"
  Delete "$DESKTOP\HunterEvolution.lnk"
  Delete "$SMPROGRAMS\${STARTMENU_FOLDER}\HunterEvolution.lnk"
  Delete "$SMPROGRAMS\${STARTMENU_FOLDER}\Désinstaller HunterEvolution.lnk"
  RMDir  "$SMPROGRAMS\${STARTMENU_FOLDER}"
  ; on ne supprime pas $SaveDir (AppData\Roaming)
  RMDir /r "$INSTDIR"
SectionEnd
