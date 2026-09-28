# 简易HTTP服务器 - 用于在浏览器中打开V2.1 HTML文件
$root = 'd:\code\xiaoliuren\xiaoliuren-v2.1'
$port = 8765
$prefix = "http://localhost:$port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "服务器已启动: $prefix"
Write-Host "根目录: $root"
Write-Host "按 Ctrl+C 停止..."
Write-Host ""

$mimeType = @{
    '.html' = 'text/html; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.md'   = 'text/plain; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $rawUrl = $req.Url.AbsolutePath
        if ($rawUrl -eq '/' -or $rawUrl -eq '') { $rawUrl = '/小六壬排盘正式版V2.1.html' }
        $relPath = $rawUrl.TrimStart('/')
        $filePath = Join-Path $root $relPath
        # 解码中文文件名
        $filePath = [System.Uri]::UnescapeDataString($filePath)

        Write-Host "[GET] $($req.Url.AbsolutePath) -> $filePath"

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $type = if ($mimeType.ContainsKey($ext)) { $mimeType[$ext] } else { 'application/octet-stream' }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $res.ContentType = $type
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "  -> 200 OK ($($bytes.Length) bytes, $type)"
        } else {
            $res.StatusCode = 404
            $msg = "404 Not Found: $relPath"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "  -> 404 Not Found"
        }
        $res.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "服务器已停止"
}
