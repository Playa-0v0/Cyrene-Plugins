# 打包脚本（维护者工具）：从 plugins/ 源码目录构建可直接导入的 ZIP 到 zips/
# 用法：在仓库根目录执行  powershell -ExecutionPolicy Bypass -File scripts/build-zips.ps1
# 合并插件 PR 后运行本脚本，并把生成的 ZIP 一并提交，保证 ZIP 与审核过的源码一致

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$pluginsDir = Join-Path $root "plugins"
$zipsDir = Join-Path $root "zips"
New-Item -ItemType Directory -Force $zipsDir | Out-Null

# 清掉旧 ZIP，全部按当前源码重新生成，避免残留过期版本
Get-ChildItem $zipsDir -Filter *.zip -ErrorAction SilentlyContinue | Remove-Item -Force

Get-ChildItem $pluginsDir -Directory | ForEach-Object {
    $pluginDir = $_.FullName
    $manifestPath = Join-Path $pluginDir "manifest.json"
    if (-not (Test-Path $manifestPath)) {
        Write-Warning "跳过 $($_.Name)：缺少 manifest.json"
        return
    }
    $manifest = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($manifest.id -ne $_.Name) {
        throw "$($_.Name)：目录名与 manifest id（$($manifest.id)）不一致，中止打包"
    }
    $zipName = "$($manifest.id)-$($manifest.version).zip"
    $zipPath = Join-Path $zipsDir $zipName
    # ZIP 内保留一层插件目录，与 GitHub「Download ZIP」形态一致，宿主导入逻辑支持
    Compress-Archive -Path $pluginDir -DestinationPath $zipPath -Force
    $size = "{0:N1} kB" -f ((Get-Item $zipPath).Length / 1KB)
    Write-Host "$zipName  ($size)"
}
Write-Host "完成：$( (Get-ChildItem $zipsDir -Filter *.zip).Count ) 个 ZIP 已生成到 zips/"

