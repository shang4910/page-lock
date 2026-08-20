Add-Type -AssemblyName System.Drawing

$sizes = @(16, 32, 48, 128)
$iconsDir = "D:\workspace\self\edge-plugins\page-lock\icons"

# Generate normal (unlocked) icons
foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # Background gradient
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $color1 = [System.Drawing.Color]::FromArgb(102, 126, 234)
    $color2 = [System.Drawing.Color]::FromArgb(118, 75, 162)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, 45)
    $graphics.FillRectangle($bgBrush, 0, 0, $size, $size)

    # Lock body
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [Math]::Max(1, $size * 0.06))
    $bodyX = $size * 0.25
    $bodyY = $size * 0.4
    $bodyW = $size * 0.5
    $bodyH = $size * 0.35
    $graphics.DrawRectangle($pen, $bodyX, $bodyY, $bodyW, $bodyH)

    # Lock shackle
    $arcRect = New-Object System.Drawing.RectangleF($size * 0.3, $size * 0.2, $size * 0.4, $size * 0.4)
    $graphics.DrawArc($pen, $arcRect, 180, 180)

    # Keyhole
    $keyholeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $graphics.FillEllipse($keyholeBrush, $size * 0.45, $size * 0.5, $size * 0.1, $size * 0.1)
    $graphics.DrawLine($pen, $size * 0.5, $size * 0.55, $size * 0.5, $size * 0.65)

    $graphics.Dispose()
    $bitmap.Save("$iconsDir\icon${size}.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    Write-Host "Generated icon${size}.png"
}

# Generate locked icons (green)
foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $color1 = [System.Drawing.Color]::FromArgb(82, 196, 26)
    $color2 = [System.Drawing.Color]::FromArgb(19, 194, 194)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, 45)
    $graphics.FillRectangle($bgBrush, 0, 0, $size, $size)

    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [Math]::Max(1, $size * 0.06))
    $bodyX = $size * 0.25
    $bodyY = $size * 0.4
    $bodyW = $size * 0.5
    $bodyH = $size * 0.35
    $graphics.DrawRectangle($pen, $bodyX, $bodyY, $bodyW, $bodyH)

    $arcRect = New-Object System.Drawing.RectangleF($size * 0.3, $size * 0.2, $size * 0.4, $size * 0.4)
    $graphics.DrawArc($pen, $arcRect, 180, 180)

    $keyholeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $graphics.FillEllipse($keyholeBrush, $size * 0.45, $size * 0.5, $size * 0.1, $size * 0.1)
    $graphics.DrawLine($pen, $size * 0.5, $size * 0.55, $size * 0.5, $size * 0.65)

    $graphics.Dispose()
    $bitmap.Save("$iconsDir\icon${size}-locked.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    Write-Host "Generated icon${size}-locked.png"
}

Write-Host "`nAll icons generated successfully!"
