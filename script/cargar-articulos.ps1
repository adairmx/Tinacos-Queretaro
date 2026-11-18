# Publica en lavadotinacos.com los artículos de data\ultracode (Windows PowerShell 5.1).
# Pide la contraseña del panel de administración (no se guarda en ningún lado), entra por /api/admin/login
# y luego crea los nuevos (POST /api/blog) y actualiza los ampliados (PATCH /api/blog/<slug>).
#
# Uso:  powershell -NoProfile -ExecutionPolicy Bypass -File C:\proyectos\Lavadotinacos\script\cargar-articulos.ps1
#       agrega -Probar para sólo revisar los archivos sin publicar nada.
param([switch]$Probar)

$ErrorActionPreference = 'Stop'
$Sitio = 'https://lavadotinacos.com'
$Carpeta = Join-Path $PSScriptRoot '..\data\ultracode'
$Fecha = '18 Nov 2026'
$Autor = 'Equipo Técnico'

# Orden de publicación: el blog muestra primero lo más reciente, así que lo más urgente se publica al final.
# Los que no están en la lista van antes (quedan más abajo); el último de la lista queda hasta arriba.
$Prioridad = @(
  'como-destapar-un-bano-sin-destapador', 'cuanto-cobra-un-plomero-en-mexico',
  'que-flotador-es-mejor-para-tinaco', 'boiler-no-prende-o-se-apaga-solo',
  'se-rompio-un-tubo-en-casa-que-hacer', 'tinaco-tira-agua-por-arriba-o-por-el-respiradero',
  'wc-no-deja-de-tirar-agua-como-arreglarlo', 'como-cerrar-el-agua-de-toda-la-casa'
)

# Artículos publicados que no se tocan, sólo se acomodan en las categorías nuevas.
$Categorias = @{
  'hacia-que-lado-cierra-una-llave-de-agua' = 'Emergencias y fugas'
  'cuanto-cuesta-lavar-un-tinaco-de-hasta-1100-litros-en-mexico-en-2026-precios-por-zona' = 'Precios y contratación'
  'cuanto-cuesta-lavado-de-tinacos-y-cisternas-precios-mexico' = 'Precios y contratación'
  'un-plomero-no-deberia-lavar-tu-tinaco-y-te-explico-por-que' = 'Precios y contratación'
  'sarro-en-tinaco-y-calentador-como-evitar-que-tape-tuberias' = 'Calidad del agua'
  'por-que-sale-agua-amarilla-o-mal-olor-en-la-regadera' = 'Calidad del agua'
  'como-eliminar-lama-verde-verdin-del-tinaco' = 'Tinacos y cisternas'
  'cada-cuanto-tiempo-lavar-tinaco-y-cisterna-cofepris' = 'Tinacos y cisternas'
}

function Enviar($Metodo, $Ruta, $Datos, $Token) {
  $cuerpo = [Text.Encoding]::UTF8.GetBytes(($Datos | ConvertTo-Json -Depth 5 -Compress))
  $encabezados = @{}
  if ($Token) { $encabezados['Authorization'] = "Bearer $Token" }
  Invoke-RestMethod -Method $Metodo -Uri "$Sitio$Ruta" -Body $cuerpo -ContentType 'application/json; charset=utf-8' -Headers $encabezados
}

# 1. Leer y revisar los archivos.
$articulos = @()
foreach ($archivo in Get-ChildItem -Path $Carpeta -Filter '*.json' | Sort-Object Name) {
  $a = Get-Content -Raw -Encoding UTF8 $archivo.FullName | ConvertFrom-Json
  foreach ($clave in 'accion', 'slug', 'title', 'excerpt', 'content', 'category', 'readingTime') {
    if (-not $a.$clave) { throw "A $($archivo.Name) le falta '$clave'" }
  }
  if ($a.accion -eq 'nuevo' -and -not $a.image) { throw "A $($archivo.Name) le falta la imagen" }
  if ($a.accion -eq 'nuevo') {
    $img = Join-Path $PSScriptRoot ("..\client\public" + ($a.image -replace '/', '\'))
    if (-not (Test-Path $img)) { Write-Warning "Falta la portada $($a.image) (se verá la portada de respaldo)" }
  }
  $articulos += $a
}
$articulos = $articulos | Sort-Object @{ Expression = { [array]::IndexOf($Prioridad, $_.slug) } }, slug
Write-Host ("{0} artículos listos: {1} nuevos y {2} para actualizar." -f $articulos.Count,
  ($articulos | Where-Object accion -eq 'nuevo').Count, ($articulos | Where-Object accion -eq 'actualizar').Count)
if ($Probar) { Write-Host 'Modo prueba: no se publicó nada.'; exit 0 }

# 2. Entrar al panel.
$segura = Read-Host 'Contraseña del panel de administración del sitio' -AsSecureString
$clave = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura))
try { $token = (Enviar 'POST' '/api/admin/login' @{ password = $clave } $null).token }
catch { Write-Host 'La contraseña no entró. No se publicó nada.' -ForegroundColor Red; exit 1 }
$clave = $null

# 3. Publicar.
$existentes = @{}
foreach ($p in (Invoke-RestMethod "$Sitio/api/blog?limit=100")) { $existentes[$p.slug] = $true }
$ok = 0; $fallas = @()
foreach ($a in $articulos) {
  $datos = @{ title = $a.title; excerpt = $a.excerpt; content = $a.content; category = $a.category; readingTime = [int]$a.readingTime }
  try {
    if ($a.accion -eq 'nuevo' -and -not $existentes.ContainsKey($a.slug)) {
      $datos.slug = $a.slug; $datos.image = $a.image; $datos.author = $Autor; $datos.date = $Fecha
      Enviar 'POST' '/api/blog' $datos $token | Out-Null
      Write-Host "  + publicado  $($a.slug)" -ForegroundColor Green
    } else {
      if ($a.accion -eq 'nuevo') { $datos.image = $a.image }
      Enviar 'PATCH' "/api/blog/$($a.slug)" $datos $token | Out-Null
      Write-Host "  ~ actualizado $($a.slug)" -ForegroundColor Cyan
    }
    $ok++
  } catch { $fallas += "$($a.slug): $($_.Exception.Message)"; Write-Host "  x falló $($a.slug)" -ForegroundColor Red }
}
foreach ($slug in $Categorias.Keys) {
  try { Enviar 'PATCH' "/api/blog/$slug" @{ category = $Categorias[$slug] } $token | Out-Null }
  catch { $fallas += "${slug} (categoría): $($_.Exception.Message)" }
}

Write-Host ''
Write-Host "Listo: $ok artículos publicados o actualizados." -ForegroundColor Green
if ($fallas.Count) { Write-Host 'Fallaron:' -ForegroundColor Red; $fallas | ForEach-Object { Write-Host "  $_" } }
Read-Host 'Presiona Enter para cerrar'
